from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from prophet import Prophet
import logging
from datetime import datetime
from fastapi.concurrency import run_in_threadpool

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Microservice IA de Prévision des Stocks",
    description="API FastAPI de prédiction Prophet et d'entraînement pour la gestion des stocks de phosphate.",
    version="1.0"
)

# ─── Schemas ──────────────────────────────────────────────────────────────────

class DataPoint(BaseModel):
    ds: str  # Date format: YYYY-MM-DD
    y: float  # Quantity in tons

class PredictRequest(BaseModel):
    history: List[DataPoint]
    days: Optional[int] = 30
    yearly_seasonality: Optional[bool] = True
    weekly_seasonality: Optional[bool] = True
    confidence_interval: Optional[float] = 0.95

class TrainRequest(BaseModel):
    history: List[DataPoint]
    model_name: Optional[str] = "prophet_default"

# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ai-prediction-service",
        "version": "1.0"
    }

@app.get("/model-info")
def model_info():
    return {
        "model_name": "Prophet (Facebook/Meta Open Source)",
        "framework": "Prophet 1.1.5",
        "python_version": "3.12",
        "seasonalities": {
            "daily": False,
            "weekly": True,
            "yearly": "Auto (active if history >= 365 days)"
        },
        "growth": "linear",
        "fallback_model": "NumPy Linear Regression (polyfit)",
        "training_threshold_days": 10
    }

@app.post("/predict")
async def predict(request: PredictRequest):
    if not request.history:
        raise HTTPException(status_code=400, detail="L'historique des données est requis pour faire des prédictions.")
        
    logger.info(f"Requête de prévision reçue : {len(request.history)} points, horizon: {request.days} jours.")
    
    try:
        # Convert to Pandas DataFrame
        data = [{"ds": p.ds, "y": p.y} for p in request.history]
        df = pd.DataFrame(data)
        df['ds'] = pd.to_datetime(df['ds'])
        df = df.sort_values('ds').reset_index(drop=True)
        
        # Check if history size is enough for Prophet (requires at least 2 points for regression, 10+ recommended)
        if len(df) < 5:
            logger.info("Historique trop court. Utilisation de la régression linéaire NumPy.")
            return generate_linear_fallback(df, request.days)

        # Build Prophet model
        m = Prophet(
            growth='linear',
            yearly_seasonality=request.yearly_seasonality,
            weekly_seasonality=request.weekly_seasonality,
            daily_seasonality=False,
            interval_width=request.confidence_interval
        )
        
        # Offload CPU-bound training to threadpool
        await run_in_threadpool(m.fit, df)
        
        # Future dates generator
        future = m.make_future_dataframe(periods=request.days, freq='D')
        
        # Forecast
        forecast = await run_in_threadpool(m.predict, future)
        
        # Select future results only
        future_forecast = forecast.tail(request.days)
        
        predictions = []
        for _, row in future_forecast.iterrows():
            yhat = max(0.0, float(row['yhat']))
            yhat_lower = max(0.0, float(row['yhat_lower']))
            yhat_upper = max(0.0, float(row['yhat_upper']))
            
            predictions.append({
                "ds": row['ds'].strftime('%Y-%m-%d'),
                "yhat": round(yhat, 2),
                "yhat_lower": round(yhat_lower, 2),
                "yhat_upper": round(yhat_upper, 2)
            })
            
        return {
            "status": "success",
            "model": "prophet",
            "predictions": predictions
        }
        
    except Exception as e:
        logger.error(f"Erreur d'exécution Prophet: {str(e)}. Lancement du fallback linéaire.")
        try:
            return generate_linear_fallback(df, request.days)
        except Exception as fe:
            raise HTTPException(status_code=500, detail=f"Erreur interne de prédiction : {str(fe)}")

@app.post("/train")
async def train(request: TrainRequest):
    if len(request.history) < 10:
        raise HTTPException(
            status_code=400, 
            detail=f"Données insuffisantes pour l'entraînement. Minimum 10 points requis, fournis: {len(request.history)}"
        )
        
    try:
        # Convert to Pandas DataFrame
        data = [{"ds": p.ds, "y": p.y} for p in request.history]
        df = pd.DataFrame(data)
        df['ds'] = pd.to_datetime(df['ds'])
        df = df.sort_values('ds').reset_index(drop=True)
        
        # Fit Prophet model (CPU-bound)
        m = Prophet(growth='linear', yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=False)
        await run_in_threadpool(m.fit, df)
        
        # Calculate training errors for metrics
        forecast = await run_in_threadpool(m.predict, df)
        y_true = df['y'].values
        y_pred = forecast['yhat'].values
        
        # Calculate metrics
        mae = float(np.mean(np.abs(y_true - y_pred)))
        rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
        mape = float(np.mean(np.abs((y_true - y_pred) / np.maximum(y_true, 1.0)))) * 100
        
        return {
            "status": "success",
            "message": "Modèle entraîné avec succès.",
            "metrics": {
                "MAE": round(mae, 2),
                "RMSE": round(rmse, 2),
                "MAPE_percent": round(mape, 2)
            },
            "training_samples": len(df)
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'entraînement: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Échec de l'entraînement : {str(e)}")

# ─── Helper Fallback ──────────────────────────────────────────────────────────

def generate_linear_fallback(df, days):
    x = (df['ds'] - df['ds'].min()).dt.total_seconds().values
    y = df['y'].values
    
    if len(x) > 1:
        slope, intercept = np.polyfit(x, y, 1)
    else:
        slope = 0.0
        intercept = y[0]
        
    last_date = df['ds'].max()
    predictions = []
    
    for i in range(1, days + 1):
        future_date = last_date + pd.Timedelta(days=i)
        future_seconds = (future_date - df['ds'].min()).total_seconds()
        
        yhat = max(0.0, float(slope * future_seconds + intercept))
        margin = max(50.0, yhat * 0.1)
        yhat_lower = max(0.0, yhat - margin)
        yhat_upper = yhat + margin
        
        predictions.append({
            "ds": future_date.strftime('%Y-%m-%d'),
            "yhat": round(yhat, 2),
            "yhat_lower": round(yhat_lower, 2),
            "yhat_upper": round(yhat_upper, 2)
        })
        
    return {
        "status": "success",
        "model": "numpy_linear_regression",
        "predictions": predictions
    }

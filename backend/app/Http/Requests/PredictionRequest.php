<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PredictionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phosphate_type_id' => 'required|exists:phosphate_types,id',
            'days' => 'nullable|integer|min:7|max:365',
            'yearly_seasonality' => 'nullable|boolean',
            'weekly_seasonality' => 'nullable|boolean',
            'confidence_interval' => 'nullable|numeric|min:0.5|max:0.99',
        ];
    }

    public function messages(): array
    {
        return [
            'phosphate_type_id.required' => 'Le type de phosphate est requis pour la prédiction.',
            'phosphate_type_id.exists' => 'Le type de phosphate sélectionné n\'existe pas.',
            'days.integer' => 'L\'horizon de prévision doit être un nombre entier de jours.',
            'days.min' => 'La prévision doit être d\'au moins 7 jours.',
            'days.max' => 'L\'horizon maximal de prévision supporté est de 365 jours.',
        ];
    }
}

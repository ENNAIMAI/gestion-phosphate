import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Dictionnaires de Référence statiques conformes à la nomenclature
const UNITES = [
  { val: 'UL', code: 1 }, { val: 'UL1', code: 2 }, { val: 'UL2', code: 3 },
  { val: 'UL3', code: 4 }, { val: 'US', code: 5 }, { val: 'UC', code: 6 },
  { val: 'UC2', code: 7 }, { val: 'UC3', code: 8 }, { val: 'UC4', code: 9 }
];

const INDEXES = [
  { val: 'NONE', code: 0, desc: 'Aucun index spécifique' },
  { val: 'RC', code: 1, desc: 'Rendement Citrique >= 28%' },
  { val: 'RF', code: 2, desc: 'Rendement Formique >= 45%' },
  { val: 'FMgO', code: 3, desc: 'Faible en MgO <= 0.55%' }
];

const NIVEAUX = [
  { val: 'SA2', code: '1' }, { val: 'SB', code: '2' }, { val: 'C0', code: '3' },
  { val: 'C1EXP', code: '4' }, { val: 'C1NOR', code: '5' }, { val: 'C2INF', code: '6' },
  { val: 'C2SUP', code: '7' }, { val: 'C3INF', code: '8' }, { val: 'CSGLO', code: '9' },
  { val: 'C4', code: 'A' }, { val: 'C4AD', code: 'B' }, { val: 'C2', code: 'C' },
  { val: 'C2 export', code: 'D' }, { val: 'C3 sup', code: 'E' }, { val: 'C5', code: 'F' },
  { val: 'C6', code: 'G' }
];

const ZONES = [
  { val: 'L30', code: '1' }, { val: 'L31', code: '2' }, { val: 'L33', code: '3' }, { val: 'L34', code: '4' },
  { val: 'P1', code: '5' }, { val: 'P2', code: '6' }, { val: 'P3', code: '7' }, { val: 'P4', code: '8' },
  { val: 'R1', code: '9' }, { val: 'R2', code: 'A' }, { val: 'R3', code: 'B' },
  { val: 'B2P1', code: 'C' }, { val: 'B2P2', code: 'D' }, { val: 'B2P3', code: 'E' },
  { val: 'B2P4', code: 'F' }, { val: 'B2P5', code: 'G' }, { val: 'BMS', code: 'H' }
];

const CARREAUX = [
  { val: 'BO', code: 1, label: 'Bo-Ouest' },
  { val: 'MZ', code: 2, label: "M'Zinda" },
  { val: 'BG', code: 3, label: 'BG-Mine-Sud' }
];

const TRAITEMENTS = [
  { val: 'B', code: 1, label: 'Brut' },
  { val: 'L', code: 2, label: 'Lavé' },
  { val: 'F', code: 3, label: 'Flottation' },
  { val: 'LF', code: 4, label: 'Lavé + Flotté' },
  { val: 'S', code: 5, label: 'Séché' },
  { val: 'C', code: 6, label: 'Calciné Export' },
  { val: 'SCAL', code: 7, label: 'Séché à UC' },
  { val: 'K', code: 8, label: 'STOCK' }
];

export default function FormulaireRapportStock() {
  // Form States
  const [quantite, setQuantite] = useState<string>('');
  const [p2o5, setP2o5] = useState<string>('');
  const [bplTeneur, setBplTeneur] = useState<number>(0);
  const [bplClass, setBplClass] = useState<string>('XBT');
  const [remarques, setRemarques] = useState<string>('');

  // Dropdown quality states
  const [uniteIdx, setUniteIdx] = useState<number>(0);
  const [indexIdx, setIndexIdx] = useState<number>(0);
  const [niveauIdx, setNiveauIdx] = useState<number>(0);
  const [zoneIdx, setZoneIdx] = useState<number>(0);
  const [carreauIdx, setCarreauIdx] = useState<number>(0);
  const [trait1Idx, setTrait1Idx] = useState<number>(0);
  const [trait2Idx, setTrait2Idx] = useState<number>(7); // Par défaut: STOCK (K)

  // Status handlers
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'danger' } | null>(null);

  // Règle de conversion & Classification en temps réel
  useEffect(() => {
    const valP2o5 = parseFloat(p2o5);
    if (!isNaN(valP2o5) && valP2o5 > 0) {
      const calcBpl = valP2o5 * 2.1853;
      setBplTeneur(parseFloat(calcBpl.toFixed(2)));

      // Déduction de la classe BPL
      if (calcBpl > 75.0) setBplClass('SHT');
      else if (calcBpl >= 73.0) setBplClass('THT');
      else if (calcBpl >= 71.5) setBplClass('HTN');
      else if (calcBpl >= 69.5) setBplClass('HTM');
      else if (calcBpl >= 68.0) setBplClass('MT');
      else if (calcBpl >= 65.0) setBplClass('BTR');
      else if (calcBpl >= 63.0) setBplClass('BTN');
      else if (calcBpl >= 61.0) setBplClass('BTP');
      else if (calcBpl >= 56.0) setBplClass('TBT');
      else setBplClass('XBT');
    } else {
      setBplTeneur(0);
      setBplClass('XBT');
    }
  }, [p2o5]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const payload = {
      quantite: parseFloat(quantite),
      p2o5: parseFloat(p2o5),
      remarques,
      operateur: 'operateur_test', // JWT session placeholder
      
      unite: UNITES[uniteIdx].val,
      uniteCode: UNITES[uniteIdx].code,
      
      qualityIndex: INDEXES[indexIdx].val,
      indexCode: INDEXES[indexIdx].code,
      
      niveau: NIVEAUX[niveauIdx].val,
      niveauCode: NIVEAUX[niveauIdx].code,
      
      zone: ZONES[zoneIdx].val,
      zoneCode: ZONES[zoneIdx].code,
      
      carreau: CARREAUX[carreauIdx].val,
      carreauCode: CARREAUX[carreauIdx].code,
      
      trait1: TRAITEMENTS[trait1Idx].val,
      trait1Code: TRAITEMENTS[trait1Idx].code,
      
      trait2: TRAITEMENTS[trait2Idx].val,
      trait2Code: TRAITEMENTS[trait2Idx].code
    };

    try {
      const response = await axios.post('/api/reports/stocks', payload);
      if (response.status === 200 || response.status === 201) {
        setMessage({ 
          text: `Rapport enregistré avec succès ! Code composite qualité : ${response.data.data.compositeCode} (${response.data.data.readableQuality})`, 
          type: 'success' 
        });
        setQuantite('');
        setP2o5('');
        setRemarques('');
      }
    } catch (error: any) {
      // INTERCEPTION ET AFFICHAGE DE L'ERREUR HTTP 400 (SourceQualityNotFoundException)
      // Demande explicitement à l'opérateur de réviser sa saisie.
      const errorMsg = error.response?.data?.message || 
                       "Erreur de validation. La combinaison de qualité saisie n'existe pas dans le Master Data.";
      setMessage({ 
        text: `⚠️ Blocage Master Data : ${errorMsg}`, 
        type: 'danger' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getBplBadgeClass = (bplClass: string) => {
    if (['SHT', 'THT', 'HTN', 'HTM'].includes(bplClass)) return 'bg-success';
    if (bplClass === 'MT') return 'bg-primary';
    return 'bg-warning text-dark';
  };

  return (
    <div className="container my-5" style={{ maxWidth: '900px' }}>
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        {/* Header */}
        <div className="bg-success text-white p-4">
          <h2 className="mb-1 font-monospace uppercase tracking-wider">Saisie Journalière des Stocks</h2>
          <p className="mb-0 text-white-50 small">Harmonisation OCP & Validation des Teneurs en Temps Réel</p>
        </div>

        <form onSubmit={handleSubmit} className="card-body p-4 bg-light">
          {message && (
            <div className={`alert alert-${message.type} rounded-3 shadow-sm`} role="alert">
              {message.text}
            </div>
          )}

          {/* Section 1: Données Quantitatives et Chimiques */}
          <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
            <h5 className="text-success border-bottom pb-2 mb-3">🔥 Données Quantitatives & Teneurs</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Quantité de Phosphate (Tonne)</label>
                <input 
                  type="number" 
                  step="0.001" 
                  className="form-control form-control-lg border-2" 
                  value={quantite} 
                  onChange={e => setQuantite(e.target.value)} 
                  placeholder="ex: 12500.500" 
                  required 
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Analyse Chimique (% P₂O₅)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-control form-control-lg border-2" 
                  value={p2o5} 
                  onChange={e => setP2o5(e.target.value)} 
                  placeholder="ex: 32.50" 
                  required 
                />
              </div>
            </div>

            {/* Auto-calculs en temps réel */}
            {bplTeneur > 0 && (
              <div className="row mt-4 p-3 bg-light rounded-3 align-items-center">
                <div className="col-md-6 text-center border-end">
                  <span className="text-muted d-block small">Teneur Estimée</span>
                  <span className="fs-3 fw-bold text-dark">{bplTeneur}% BPL</span>
                </div>
                <div className="col-md-6 text-center">
                  <span className="text-muted d-block small">Classe Déduite</span>
                  <span className={`badge ${getBplBadgeClass(bplClass)} fs-5 py-2 px-3`}>
                    {bplClass}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Référentiel Qualité Source */}
          <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
            <h5 className="text-success border-bottom pb-2 mb-3">🏷️ Codification & Qualité Source</h5>
            
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold">Unité</label>
                <select className="form-select" value={uniteIdx} onChange={e => setUniteIdx(Number(e.target.value))}>
                  {UNITES.map((u, i) => <option key={i} value={i}>{u.val} (Code {u.code})</option>)}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold">Index</label>
                <select className="form-select" value={indexIdx} onChange={e => setIndexIdx(Number(e.target.value))}>
                  {INDEXES.map((idx, i) => <option key={i} value={i}>{idx.val} ({idx.desc})</option>)}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold">Niveau (Couche)</label>
                <select className="form-select" value={niveauIdx} onChange={e => setNiveauIdx(Number(e.target.value))}>
                  {NIVEAUX.map((n, i) => <option key={i} value={i}>{n.val} (Code {n.code})</option>)}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Zone (Panneau/Lot)</label>
                <select className="form-select" value={zoneIdx} onChange={e => setZoneIdx(Number(e.target.value))}>
                  {ZONES.map((z, i) => <option key={i} value={i}>{z.val} (Code {z.code})</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">Carreau (Origine)</label>
                <select className="form-select" value={carreauIdx} onChange={e => setCarreauIdx(Number(e.target.value))}>
                  {CARREAUX.map((c, i) => <option key={i} value={i}>{c.label} ({c.val})</option>)}
                </select>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">1er Traitement</label>
                <select className="form-select" value={trait1Idx} onChange={e => setTrait1Idx(Number(e.target.value))}>
                  {TRAITEMENTS.map((t, i) => <option key={i} value={i}>{t.label} ({t.val})</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold">2nd Traitement</label>
                <select className="form-select" value={trait2Idx} onChange={e => setTrait2Idx(Number(e.target.value))}>
                  {TRAITEMENTS.map((t, i) => <option key={i} value={i}>{t.label} ({t.val})</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Remarques & Soumission */}
          <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
            <label className="form-label fw-bold">Remarques / Informations complétives</label>
            <textarea 
              className="form-control" 
              rows={3} 
              value={remarques} 
              onChange={e => setRemarques(e.target.value)} 
              placeholder="Spécifier les détails du train, conditions de stockage, etc."
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-success btn-lg w-100 py-3 rounded-3 shadow fw-bold transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Soumission du rapport...
              </>
            ) : 'Valider & Enregistrer le Rapport'}
          </button>
        </form>
      </div>
    </div>
  );
}

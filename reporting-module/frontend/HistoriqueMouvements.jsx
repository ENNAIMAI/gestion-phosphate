import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Reference nomenclature arrays (same as form)
const UNITES = [
  { val: 'UL', code: 1 }, { val: 'UL1', code: 2 }, { val: 'UL2', code: 3 },
  { val: 'UL3', code: 4 }, { val: 'US', code: 5 }, { val: 'UC', code: 6 },
  { val: 'UC2', code: 7 }, { val: 'UC3', code: 8 }, { val: 'UC4', code: 9 }
];

const INDEXES = [
  { val: 'NONE', code: 0, desc: 'Aucun' },
  { val: 'RC', code: 1, desc: 'Citrique >= 28%' },
  { val: 'RF', code: 2, desc: 'Formique >= 45%' },
  { val: 'FMgO', code: 3, desc: 'Faible MgO <= 0.55%' }
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

export default function HistoriqueMouvements() {
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ text: string, type: 'success' | 'danger' } | null>(null);

  // Modal deletion state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Modal edit state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Edit form states
  const [quantite, setQuantite] = useState<string>('');
  const [p2o5, setP2o5] = useState<string>('');
  const [rendementCitrique, setRendementCitrique] = useState<string>('');
  const [rendementFormique, setRendementFormique] = useState<string>('');
  const [tauxMgO, setTauxMgO] = useState<string>('');
  const [dateSaisie, setDateSaisie] = useState<string>('');
  const [remarques, setRemarques] = useState<string>('');

  // Dropdown indexes
  const [uniteIdx, setUniteIdx] = useState<number>(0);
  const [niveauIdx, setNiveauIdx] = useState<number>(0);
  const [zoneIdx, setZoneIdx] = useState<number>(0);
  const [carreauIdx, setCarreauIdx] = useState<number>(0);
  const [trait1Idx, setTrait1Idx] = useState<number>(0);
  const [trait2Idx, setTrait2Idx] = useState<number>(0);

  // Computed states for the edit modal
  const [bplTeneur, setBplTeneur] = useState<number>(0);
  const [bplClass, setBplClass] = useState<string>('XBT');

  // Load movements from backend
  const fetchMouvements = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/stocks');
      setMouvements(response.data);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg("Impossible de récupérer l'historique des mouvements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMouvements();
  }, []);

  // Recalculate BPL in real-time inside the edit form modal
  useEffect(() => {
    const valP2o5 = parseFloat(p2o5);
    if (!isNaN(valP2o5) && valP2o5 > 0) {
      const calcBpl = valP2o5 * 2.1853;
      setBplTeneur(parseFloat(calcBpl.toFixed(2)));

      // Determine BPL class
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

  // Handle Delete Confirmation
  const triggerDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/stocks/${deleteId}`);
      setAlertMsg({ text: "Mouvement de stock supprimé avec succès.", type: 'success' });
      setMouvements(prev => prev.filter(m => m.id !== deleteId));
    } catch (err: any) {
      setAlertMsg({ text: "Erreur lors de la suppression.", type: 'danger' });
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // Handle Edit Trigger
  const triggerEdit = (mouvement: any) => {
    setEditId(mouvement.id);
    setQuantite(mouvement.tonnage.toString());
    setP2o5(mouvement.tauxP2O5.toString());
    setRendementCitrique(mouvement.rendementCitrique.toString());
    setRendementFormique(mouvement.rendementFormique.toString());
    setTauxMgO(mouvement.tauxMgO.toString());
    setDateSaisie(mouvement.dateSaisie);
    setRemarques(mouvement.remarques || '');

    // Map fields back to indices
    const uIdx = UNITES.findIndex(u => u.val === mouvement.qualiteSource.unite);
    setUniteIdx(uIdx >= 0 ? uIdx : 0);

    const nIdx = NIVEAUX.findIndex(n => n.val === mouvement.qualiteSource.niveau);
    setNiveauIdx(nIdx >= 0 ? nIdx : 0);

    const zIdx = ZONES.findIndex(z => z.val === mouvement.qualiteSource.zone);
    setZoneIdx(zIdx >= 0 ? zIdx : 0);

    const cIdx = CARREAUX.findIndex(c => c.val === mouvement.qualiteSource.carreau);
    setCarreauIdx(cIdx >= 0 ? cIdx : 0);

    const t1Idx = TRAITEMENTS.findIndex(t => t.val === mouvement.qualiteSource.traitement1);
    setTrait1Idx(t1Idx >= 0 ? t1Idx : 0);

    const t2Idx = TRAITEMENTS.findIndex(t => t.val === mouvement.qualiteSource.traitement2);
    setTrait2Idx(t2Idx >= 0 ? t2Idx : 7);

    setShowEditModal(true);
  };

  const confirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    const payload = {
      tonnage: parseFloat(quantite),
      tauxP2O5: parseFloat(p2o5),
      rendementCitrique: parseFloat(rendementCitrique),
      rendementFormique: parseFloat(rendementFormique),
      tauxMgO: parseFloat(tauxMgO),
      dateSaisie,
      remarques,
      operateur: 'operateur_test',
      
      unite: UNITES[uniteIdx].val,
      uniteCode: UNITES[uniteIdx].code,
      niveauCode: NIVEAUX[niveauIdx].val,
      zoneCode: ZONES[zoneIdx].val,
      carreau: CARREAUX[carreauIdx].val,
      carreauCode: CARREAUX[carreauIdx].code,
      traitement1: TRAITEMENTS[trait1Idx].val,
      traitement1Code: TRAITEMENTS[trait1Idx].code,
      traitement2: TRAITEMENTS[trait2Idx].val,
      traitement2Code: TRAITEMENTS[trait2Idx].code
    };

    try {
      const response = await axios.put(`/api/stocks/${editId}`, payload);
      if (response.status === 200) {
        setAlertMsg({ text: "Mouvement de stock modifié et validé avec succès !", type: 'success' });
        setShowEditModal(false);
        fetchMouvements(); // Reload table
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Erreur de validation Master Data.";
      alert(`⚠️ Blocage de modification : ${errorMsg}`);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get('/api/reports/excel', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-flux-phosphate-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setAlertMsg({ text: "Rapport Excel (.xlsx) téléchargé avec succès !", type: 'success' });
    } catch (err: any) {
      setAlertMsg({ text: "Erreur lors de la génération ou du téléchargement du rapport Excel.", type: 'danger' });
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await axios.get('/api/reports/pdf', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-flux-phosphate-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setAlertMsg({ text: "Rapport PDF (.pdf) téléchargé avec succès !", type: 'success' });
    } catch (err: any) {
      setAlertMsg({ text: "Erreur lors de la génération ou du téléchargement du rapport PDF.", type: 'danger' });
    }
  };

  const handleExportGF = async () => {
    try {
      const response = await axios.post('/api/reports/generate-gf', {}, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modele_rapport_gf_rempli.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setAlertMsg({ text: "Rapport GF (IA) généré avec succès à partir du modèle !", type: 'success' });
    } catch (err: any) {
      setAlertMsg({ text: "Erreur lors de la génération du Rapport GF (IA).", type: 'danger' });
    }
  };

  const getBplBadgeClass = (bClass: string) => {
    if (['SHT', 'THT', 'HTN', 'HTM'].includes(bClass)) return 'bg-success';
    if (bClass === 'MT') return 'bg-primary';
    return 'bg-warning text-dark';
  };

  return (
    <div className="container-fluid my-5 px-4" style={{ maxWidth: '1200px' }}>
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        {/* Header */}
        <div className="bg-dark text-white p-4 d-flex justify-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="mb-1 font-monospace tracking-wider text-uppercase text-emerald-400">Historique des Saisies Production</h2>
            <p className="mb-0 text-white-50 small">Suivi, validation et gestion des écritures de phosphate (Rapport GF)</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-success btn-sm fw-semibold text-white border-success" onClick={handleExportExcel}>
              🟢 Exporter en Excel (.xlsx)
            </button>
            <button className="btn btn-outline-warning btn-sm fw-semibold text-white border-warning" onClick={handleExportGF}>
              🤖 Rapport GF (IA)
            </button>
            <button className="btn btn-outline-danger btn-sm fw-semibold text-white border-danger" onClick={handleExportPdf}>
              🔴 Exporter en PDF (.pdf)
            </button>
            <button className="btn btn-outline-info btn-sm text-white border-info ms-2" onClick={fetchMouvements}>
              🔄 Actualiser
            </button>
          </div>
        </div>

        <div className="card-body p-4 bg-white">
          {alertMsg && (
            <div className={`alert alert-${alertMsg.type} alert-dismissible fade show rounded-3`} role="alert">
              {alertMsg.text}
              <button type="button" className="btn-close" onClick={() => setAlertMsg(null)} aria-label="Close" />
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
              <p className="mt-2 text-muted">Chargement de l'historique des mouvements...</p>
            </div>
          ) : errorMsg ? (
            <div className="alert alert-danger rounded-3">{errorMsg}</div>
          ) : mouvements.length === 0 ? (
            <div className="text-center py-5 text-muted">Aucun mouvement enregistré pour le moment.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Date</th>
                    <th>Unité</th>
                    <th>Code Qualité</th>
                    <th>Classe BPL</th>
                    <th>Tonnage (T)</th>
                    <th>% P₂O₅</th>
                    <th>% BPL</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mouvements.map((mov) => {
                    const bplVal = (mov.tauxP2O5 * 2.1853).toFixed(2);
                    return (
                      <tr key={mov.id}>
                        <td className="fw-bold text-slate-700">{mov.dateSaisie}</td>
                        <td><span className="badge bg-secondary">{mov.qualiteSource.unite}</span></td>
                        <td className="font-monospace text-muted">{mov.qualiteSource.compositeCode}</td>
                        <td>
                          <span className={`badge ${getBplBadgeClass(mov.qualiteSource.bplClass)}`}>
                            {mov.qualiteSource.bplClass}
                          </span>
                        </td>
                        <td className="fw-bold">{parseFloat(mov.tonnage).toLocaleString()}</td>
                        <td className="font-monospace">{mov.tauxP2O5}%</td>
                        <td className="font-monospace fw-bold text-success">{bplVal}%</td>
                        <td className="text-end">
                          <button 
                            className="btn btn-outline-primary btn-sm me-2 fw-semibold"
                            onClick={() => triggerEdit(mov)}
                          >
                            ✏️ Modifier
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm fw-semibold"
                            onClick={() => triggerDelete(mov.id)}
                          >
                            🗑️ Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Suppression (React Custom) ── */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirmer la suppression</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)} />
              </div>
              <div className="modal-body p-4">
                <p className="lead mb-0">Êtes-vous sûr de vouloir supprimer définitivement cette saisie de production ?</p>
                <small className="text-danger">Cette action est irréversible et supprimera le tonnage des stocks.</small>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-light" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                <button type="button" className="btn btn-danger px-4" onClick={confirmDelete}>Oui, supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Modification (React Custom) ── */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <form onSubmit={confirmEdit}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Modifier le Mouvement de Stock</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)} />
                </div>
                <div className="modal-body p-4 bg-light">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Tonnage (Tonne)</label>
                      <input 
                        type="number" 
                        step="0.001" 
                        className="form-control" 
                        value={quantite} 
                        onChange={e => setQuantite(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">% P₂O₅</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-control" 
                        value={p2o5} 
                        onChange={e => setP2o5(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-4 bg-white p-3 rounded shadow-sm align-items-center">
                    <div className="col-md-6 text-center border-end">
                      <span className="text-muted d-block small">BPL Estimé</span>
                      <strong className="fs-4">{bplTeneur}% BPL</strong>
                    </div>
                    <div className="col-md-6 text-center">
                      <span className="text-muted d-block small">Classe Déduite</span>
                      <span className={`badge ${getBplBadgeClass(bplClass)} fs-6 py-2 px-3`}>
                        {bplClass}
                      </span>
                    </div>
                  </div>

                  <div className="card border-0 p-3 mb-4 shadow-sm bg-white">
                    <h6 className="text-primary border-bottom pb-2">Analyses Complètes (Yiels / MgO)</h6>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Rendement Citrique (%)</label>
                        <input type="number" step="0.1" className="form-control form-control-sm" value={rendementCitrique} onChange={e => setRendementCitrique(e.target.value)} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Rendement Formique (%)</label>
                        <input type="number" step="0.1" className="form-control form-control-sm" value={rendementFormique} onChange={e => setRendementFormique(e.target.value)} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Taux MgO (%)</label>
                        <input type="number" step="0.01" className="form-control form-control-sm" value={tauxMgO} onChange={e => setTauxMgO(e.target.value)} required />
                      </div>
                    </div>
                  </div>

                  <div className="card border-0 p-3 shadow-sm bg-white mb-4">
                    <h6 className="text-primary border-bottom pb-2">Localisation & Traçabilité</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Unité</label>
                        <select className="form-select form-select-sm" value={uniteIdx} onChange={e => setUniteIdx(Number(e.target.value))}>
                          {UNITES.map((u, i) => <option key={i} value={i}>{u.val}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Niveau (Couche)</label>
                        <select className="form-select form-select-sm" value={niveauIdx} onChange={e => setNiveauIdx(Number(e.target.value))}>
                          {NIVEAUX.map((n, i) => <option key={i} value={i}>{n.val}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Zone (Panneau)</label>
                        <select className="form-select form-select-sm" value={zoneIdx} onChange={e => setZoneIdx(Number(e.target.value))}>
                          {ZONES.map((z, i) => <option key={i} value={i}>{z.val}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Carreau</label>
                        <select className="form-select form-select-sm" value={carreauIdx} onChange={e => setCarreauIdx(Number(e.target.value))}>
                          {CARREAUX.map((c, i) => <option key={i} value={i}>{c.val}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">1er Traitement</label>
                        <select className="form-select form-select-sm" value={trait1Idx} onChange={e => setTrait1Idx(Number(e.target.value))}>
                          {TRAITEMENTS.map((t, i) => <option key={i} value={i}>{t.val}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">2nd Traitement</label>
                        <select className="form-select form-select-sm" value={trait2Idx} onChange={e => setTrait2Idx(Number(e.target.value))}>
                          {TRAITEMENTS.map((t, i) => <option key={i} value={i}>{t.val}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Date Saisie</label>
                      <input type="date" className="form-control" value={dateSaisie} onChange={e => setDateSaisie(e.target.value)} required />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-bold">Remarques</label>
                      <input type="text" className="form-control" value={remarques} onChange={e => setRemarques(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-light" onClick={() => setShowEditModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary px-4">Sauvegarder les modifications</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

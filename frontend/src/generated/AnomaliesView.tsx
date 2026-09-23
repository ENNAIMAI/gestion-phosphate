import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';

interface Anomaly {
    id: number;
    type: string;
    description: string;
    status: string;
    user: { name: string, role: string };
    site?: { name: string };
    location?: { name: string };
    created_at: string;
}

export function AnomaliesView({ userRole }: { userRole: string }) {
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Anomalie de stock',
        description: '',
        site_id: '',
        location_id: ''
    });

    const isOperator = userRole === 'Opérateur' || userRole === 'OPERATEUR' || userRole === 'Opérateur Terrain';

    useEffect(() => {
        fetchAnomalies();
    }, []);

    const fetchAnomalies = async () => {
        try {
            setLoading(true);
            const res = await api.get('/anomalies');
            setAnomalies(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/anomalies', formData);
            setShowForm(false);
            setFormData({ type: 'Anomalie de stock', description: '', site_id: '', location_id: '' });
            fetchAnomalies();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la création de l'anomalie");
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/anomalies/${id}`, { status });
            fetchAnomalies();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la mise à jour");
        }
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto pr-2 pb-10 gap-6 fade-in">
            <div className="flex items-end justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Signalements Terrain</h1>
                    <p className="text-slate-500 mt-1">Gestion des anomalies et observations sur le terrain.</p>
                </div>
                {isOperator && (
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg shadow flex items-center gap-2 hover:bg-amber-600 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Signaler une anomalie
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-border p-6 animate-fadeIn">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Nouveau signalement</h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type d'anomalie</label>
                                <select 
                                    className="w-full rounded-md border-slate-300 shadow-sm p-2 border"
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                    required
                                >
                                    <option>Anomalie de stock</option>
                                    <option>Problème sur un silo</option>
                                    <option>Différence constatée sur le terrain</option>
                                    <option>Problème qualité BPL</option>
                                    <option>Autre observation</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description détaillée</label>
                            <textarea 
                                className="w-full rounded-md border-slate-300 shadow-sm p-2 border h-32"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                required
                                placeholder="Décrivez l'anomalie constatée..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">Annuler</button>
                            <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium">Soumettre le signalement</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4" style={{ borderRadius: 20 }}>
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Chargement...</div>
                ) : anomalies.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">Aucune anomalie signalée.</div>
                ) : (
                    <div className="overflow-x-auto border border-border" style={{ borderRadius: 16 }}>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-border text-xs font-mono uppercase text-slate-500">
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3">Signaleur</th>
                                    <th className="px-4 py-3">Statut</th>
                                    {!isOperator && <th className="px-4 py-3 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border text-sm">
                                {anomalies.map(a => (
                                    <tr key={a.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{new Date(a.created_at).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-800">{a.type}</td>
                                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={a.description}>{a.description}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{a.user?.name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase">{a.user?.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                a.status === 'NOUVEAU' ? 'bg-red-100 text-red-800' :
                                                a.status === 'EN_COURS' ? 'bg-amber-100 text-amber-800' :
                                                'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        {!isOperator && (
                                            <td className="px-4 py-3 text-right">
                                                <select 
                                                    className="text-xs border rounded p-1 bg-white"
                                                    value={a.status}
                                                    onChange={(e) => handleUpdateStatus(a.id, e.target.value)}
                                                >
                                                    <option value="NOUVEAU">NOUVEAU</option>
                                                    <option value="EN_COURS">EN COURS</option>
                                                    <option value="RESOLU">RÉSOLU</option>
                                                </select>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

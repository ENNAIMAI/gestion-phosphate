import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, ComposedChart, Scatter, ScatterChart, ZAxis, Cell, PieChart, Pie,
  ReferenceLine
} from 'recharts';
import * as Lucide from 'lucide-react';
import { 
  Shield, Database, Settings, Contrast, Mail, Lock, Eye, EyeOff, LayoutDashboard, Layers, Box, AlertTriangle, Activity, FileText, Menu, Search, Filter, RefreshCw, LogOut, Bell, FileDown, Plus, Edit2, Trash2, X, CheckCircle, Clock, Truck, ChevronDown, Download, Users, Sliders
} from 'lucide-react';
import axios from 'axios';
import { format, parseISO, addDays, formatDistanceToNow, isAfter, isBefore, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';


───

export function ProduitsView({ currentUserRole }: { currentUserRole: string }) {
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [alertRules, setAlertRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [showModal, setShowModal] = useState<"add" | "edit" | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [densite, setDensite] = useState("");
  const [description, setDescription] = useState("");
  const [quantite, setQuantite] = useState("");
  const [seuilMin, setSeuilMin] = useState("10000");
  const [locationId, setLocationId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: "success" | "error" } | null>(null);
  const [locations, setLocations] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesRes, stocksRes, locsRes] = await Promise.all([
        api.get("/phosphate-types"),
        api.get("/stocks"),
        api.get("/locations")
      ]);

      if (typesRes.data.status === "success" || typesRes.data.success === true) {
        setTypes(typesRes.data.data || []);
      }
      if (stocksRes.data.success || stocksRes.data.status === "success") {
        setStocks(stocksRes.data.data || []);
      }
      if (locsRes.data.success || locsRes.data.status === "success") {
        setLocations(locsRes.data.data || []);
      }

      // Load alert rules if Admin/Responsable Stock to get thresholds
      if (currentUserRole === "Admin" || currentUserRole === "Responsable Stock") {
        const rulesRes = await api.get("/settings");
        if (rulesRes.data.success || rulesRes.data.status === "success") {
          setAlertRules(rulesRes.data.data.alert_rules || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setShowModal("add");
    setCurrentId(null);
    setCode("");
    setName("");
    setDensite("");
    setDescription("");
    setQuantite("");
    setSeuilMin("10000");
    setLocationId("");
    setMsg(null);
  };

  const handleOpenEdit = (product: any) => {
    setShowModal("edit");
    setCurrentId(product.id);
    setCode(product.code || "");
    setName(product.name || "");
    setDensite(product.densite?.toString() || "");
    setDescription(product.description || "");
    // For edit, we don't modify the stock/location directly from this modal as it gets complex
    setQuantite("");
    setSeuilMin(product.minThreshold?.toString() || "10000");
    setLocationId("");
    setMsg(null);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const executeDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await api.delete(`/phosphate-types/${deleteConfirmId}`);
      if (res.data.success) {
        fetchData();
        setDeleteConfirmId(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression.");
      setDeleteConfirmId(null);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !densite) {
      setMsg({ text: "Veuillez remplir tous les champs obligatoires.", type: "error" });
      return;
    }

    setSubmitting(true);
    setMsg(null);
    try {
      const parsedDensite = parseFloat(densite.toString().replace(",", "."));
      const payload: any = {
        code,
        name,
        densite: parsedDensite,
        description
      };
      if (quantite) payload.quantite = parseFloat(quantite.toString().replace(",", "."));
      if (seuilMin) payload.seuil_min = parseFloat(seuilMin.toString().replace(",", "."));
      if (locationId) payload.location_id = parseInt(locationId, 10);

      const method = showModal === "edit" ? "put" : "post";
      const url = showModal === "edit" ? `/phosphate-types/${currentId}` : "/phosphate-types";
      const res = await api[method](url, payload);

      if (res.data.success || res.data.status === "success") {
        setMsg({ text: showModal === "edit" ? "Produit mis à jour avec succès !" : "Produit créé avec succès !", type: "success" });
        fetchData();
        setTimeout(() => setShowModal(null), 1500);
      }
    } catch (err: any) {
      let errorMsg = "Erreur lors de la création du produit.";
      if (err.response?.data) {
        if (err.response.data.errors) {
          errorMsg = Object.values(err.response.data.errors).flat().join(" ");
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      setMsg({
        text: errorMsg,
        type: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const processedProducts = types.map(t => {
    const matchingStocks = stocks.filter(s => s.phosphate_type_id === t.id);
    const totalQty = matchingStocks.reduce((sum, s) => sum + parseFloat(s.quantite || 0), 0);
    const locations = Array.from(new Set(matchingStocks.map(s => `${s.location?.site?.name || ""} - ${s.location?.name || ""}`)))
      .filter(l => l.trim() !== "-")
      .join(", ") || "Aucun stockage";

    const rule = alertRules.find(r => r.phosphate_type_id === t.id);
    const minThreshold = rule ? parseFloat(rule.seuil_min) : 10000;

    return {
      id: t.id,
      code: t.code,
      name: t.name,
      densite: t.densite,
      description: t.description,
      category: t.code.includes("GYP") ? "Gypseux" : t.code.includes("ENR") ? "Enrichi" : "Brut",
      qty: totalQty,
      minThreshold,
      location: locations,
      updated: t.updated_at ? new Date(t.updated_at).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit' }) + " " + new Date(t.updated_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : "N/A"
    };
  });

  const filtered = processedProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 animate-pulse">
        <span className="animate-spin inline-block w-8 h-8 border-4 border-[#236534] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4 animate-fadeIn" style={{ borderRadius: 20 }}>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Catalogue OCP</span>
          <h2 className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">Gestion des Produits</h2>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Rechercher un produit..." 
            className="border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:border-[#236534] w-64 text-[#233928]"
          />
          {(currentUserRole === "Admin" || currentUserRole === "Responsable Stock") && (
            <button 
              onClick={handleOpenAdd}
              className="bg-[#236534] hover:bg-[#1c522a] text-white text-xs font-mono font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
            >
              + Ajouter un Produit
            </button>
          )}
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F5FAF5] font-mono font-bold text-[10px] uppercase text-slate-500">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3">Seuil Min</th>
              <th className="px-4 py-3">Localisation</th>
              <th className="px-4 py-3">Mise à jour</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-400 font-mono">Aucun produit trouvé</td>
              </tr>
            ) : filtered.map(p => {
              let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
              let label = "Sécurisé";
              if (p.qty <= p.minThreshold) {
                badgeColor = "bg-red-100 text-red-800 border-red-200";
                label = "Rupture";
              } else if (p.qty <= p.minThreshold * 1.3) {
                badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                label = "Critique";
              }
              return (
                <tr key={p.code} className="hover:bg-[#F5FAF5]/30">
                  <td className="px-4 py-3 font-mono font-bold text-[#233928]">{p.code}</td>
                  <td className="px-4 py-3 font-bold text-[#233928]">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3 font-mono font-bold text-[#233928]">{p.qty.toLocaleString()} T</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{p.minThreshold.toLocaleString()} T</td>
                  <td className="px-4 py-3 text-slate-500">{p.location}</td>
                  <td className="px-4 py-3 text-slate-400">{p.updated}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold ${badgeColor}`}>{label}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(currentUserRole === "Admin" || currentUserRole === "Responsable Stock") ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(p)} className="p-1 text-slate-400 hover:text-[#236534] transition-colors cursor-pointer">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteClick(p.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modern Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn">
          <div className="bg-white border border-border shadow-2xl p-6 w-full max-w-md" style={{ borderRadius: 24 }}>
            <div className="flex justify-between items-center pb-3 border-b border-border mb-4">
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold text-[#233928] uppercase tracking-wider">
                {showModal === "add" ? "Ajouter un Nouveau Produit" : "Modifier le Produit"}
              </h3>
              <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-sm font-mono">&times;</button>
            </div>

            {msg && (
              <div className={`p-3 rounded text-[11px] font-mono mb-4 border ${msg.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmitProduct} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Code Produit (ex: P-SHT)</label>
                <input 
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  disabled={showModal === "edit"}
                  placeholder="ex: P-SHT"
                  className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#236534] text-[#233928] ${showModal === 'edit' ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Nom du produit</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: Phosphate Super High Grade"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#236534] text-[#233928]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Densité moyenne (t/m³)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={densite}
                  onChange={e => setDensite(e.target.value)}
                  placeholder="ex: 1.85"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#236534] text-[#233928]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Caractéristiques du produit..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#236534] text-[#233928]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Quantité Initiale (T)</label>
                <input 
                  type="number"
                  value={quantite}
                  onChange={e => setQuantite(e.target.value)}
                  placeholder="ex: 12500"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#236534] text-[#233928]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Seuil Minimum (T)</label>
                  <input 
                    type="number"
                    value={seuilMin}
                    onChange={e => setSeuilMin(e.target.value)}
                    placeholder="ex: 10000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#236534] text-[#233928]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Localisation</label>
                  <select 
                    value={locationId}
                    onChange={e => setLocationId(e.target.value)}
                    disabled={showModal === "edit"}
                    className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-[#236534] text-[#233928] cursor-pointer ${showModal === 'edit' ? 'bg-slate-100 opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <option value="">-- Aucun stockage --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.site?.name} - {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border mt-2">
                <button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold">Annuler</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#236534] hover:bg-[#1c522a] disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm uppercase tracking-wider">
                  {submitting ? "Enregistrement..." : (showModal === "edit" ? "Mettre à jour" : "Créer le produit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Premium Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex justify-center items-center p-4 animate-fadeIn transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-xl border border-red-100 shadow-[0_0_50px_rgba(220,38,38,0.15)] p-8 w-full max-w-sm relative overflow-hidden transform scale-100 transition-transform duration-300" style={{ borderRadius: 28 }}>
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center gap-5 relative z-10">
              <div className="relative flex items-center justify-center w-20 h-20">
                {/* Pinging background ring */}
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                {/* Static inner circle */}
                <div className="relative flex items-center justify-center w-16 h-16 bg-red-50 rounded-full border-4 border-white shadow-sm">
                  <AlertTriangle size={28} className="text-red-500" strokeWidth={2.5} />
                </div>
              </div>
              
              <div className="space-y-2 mt-2">
                <h3 className="font-['Barlow_Condensed'] text-2xl font-extrabold text-[#1a1a1a] uppercase tracking-wide">
                  Confirmer la suppression
                </h3>
                <p className="text-sm font-sans text-slate-500 leading-relaxed px-2">
                  Êtes-vous absolument sûr de vouloir supprimer ce produit ? <br/>
                  <span className="font-medium text-red-500/80">Cette action est définitive.</span>
                </p>
              </div>
              
              <div className="flex justify-center gap-3 w-full mt-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)} 
                  className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-mono rounded-xl transition-all duration-200 cursor-pointer uppercase tracking-widest font-bold border border-slate-200 hover:border-slate-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Annuler
                </button>
                <button 
                  onClick={executeDeleteProduct} 
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-mono font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/30 uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function UtilisateursView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Search & Filters
  const [searchUser, setSearchUser] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [sortByDate, setSortByDate] = useState("newest");

  // Modal State
  const [showUserModal, setShowUserModal] = useState<"add" | "edit" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("Responsable Stock");
  const [userActive, setUserActive] = useState(true);
  const [submittingUser, setSubmittingUser] = useState(false);

  // Password Reset Modal
  const [showResetModal, setShowResetModal] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  // Delete User Confirmation Modal
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/settings");
      if (res.data.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddUser = () => {
    setMessage(null);
    setShowUserModal("add");
    setCurrentUserId(null);
    setUserName("");
    setUserEmail("");
    setUserPassword("");
    setUserRole("Responsable Stock");
    setUserActive(true);
  };

  const handleOpenEditUser = (u: any) => {
    setMessage(null);
    setShowUserModal("edit");
    setCurrentUserId(u.id);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserPassword("");
    setUserRole(u.role);
    setUserActive(u.active);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    setMessage(null);
    try {
      if (showUserModal === "add") {
        const res = await api.post("/settings/users", {
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
          active: userActive
        });
        if (res.data.success) {
          setMessage({ text: "Utilisateur créé avec succès !", type: "success" });
          setShowUserModal(null);
          fetchUsers();
        }
      } else if (showUserModal === "edit" && currentUserId) {
        const res = await api.put(`/settings/users/${currentUserId}`, {
          name: userName,
          email: userEmail,
          role: userRole,
          active: userActive
        });
        if (res.data.success) {
          setMessage({ text: "Utilisateur mis à jour avec succès !", type: "success" });
          setShowUserModal(null);
          fetchUsers();
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Erreur lors de l'enregistrement.", type: "error" });
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeletingUser(true);
    setMessage(null);
    try {
      const res = await api.delete(`/settings/users/${deleteConfirmUser.id}`);
      if (res.data.success) {
        setMessage({ text: "Utilisateur supprimé !", type: "success" });
        setDeleteConfirmUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Erreur de suppression.", type: "error" });
    } finally {
      setDeletingUser(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetModal) return;
    setResettingPassword(true);
    setMessage(null);
    try {
      const res = await api.post(`/settings/users/${showResetModal.id}/reset-password`, {
        password: newPassword
      });
      if (res.data.success) {
        setMessage({ text: "Mot de passe réinitialisé avec succès !", type: "success" });
        setShowResetModal(null);
        setNewPassword("");
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Erreur lors de la réinitialisation.", type: "error" });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleToggleActive = async (u: any) => {
    try {
      const res = await api.put(`/settings/users/${u.id}`, {
        name: u.name,
        email: u.email,
        role: u.role,
        active: !u.active
      });
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Sort logic
  const filteredUsers = users
    .filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchUser.toLowerCase());
      const matchesRole = roleFilter === "Tous" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortByDate === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {message && (
        <div className={`p-4 text-xs font-mono rounded-lg border ${
          message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-5" style={{ borderRadius: 20 }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-450">Équipes OCP</span>
            <h2 className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">Gestion des Utilisateurs</h2>
          </div>
          
          <button
            onClick={handleOpenAddUser}
            className="bg-[#236534] hover:bg-[#1c522a] text-white px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus size={14} /> Ajouter un Utilisateur
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 bg-[#F5FAF5] border border-border" style={{ borderRadius: 16 }}>
          <div className="col-span-2 relative">
            <input
              type="text"
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-9 pr-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
            />
            <Search className="absolute left-3 top-2.5 text-slate-450" size={13} />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534] cursor-pointer font-medium"
            >
              <option value="Tous">Tous les Rôles</option>
              <option value="Admin">Admin</option>
              <option value="Responsable Stock">Responsable Stock</option>
              
            </select>
          </div>

          <div>
            <select
              value={sortByDate}
              onChange={e => setSortByDate(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534] cursor-pointer font-medium"
            >
              <option value="newest">Plus récents d'abord</option>
              <option value="oldest">Plus anciens d'abord</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-border" style={{ borderRadius: 16 }}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F5FAF5] border-b border-border font-mono font-bold text-[10px] uppercase text-slate-500">
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Créé le</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Chargement...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Aucun collaborateur trouvé</td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-[#233928]">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        u.role === "Admin" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                        u.role === "Responsable Stock" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                        "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`px-2.5 py-1 rounded-full text-[8px] font-bold shadow-sm transition-all cursor-pointer ${
                          u.active 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200" 
                            : "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200"
                        }`}
                      >
                        {u.active ? "ACTIF" : "DÉSACTIVÉ"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          title="Modifier"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => setShowResetModal(u)}
                          title="Réinitialiser le mot de passe"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Key size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmUser(u)}
                          title="Supprimer"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6CC] w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-scaleIn" style={{ borderRadius: 24 }}>
            <div className="bg-[#236534] p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">
                  {showUserModal === "add" ? "Ajouter un Collaborateur" : "Modifier le Collaborateur"}
                </h3>
                <p className="text-[10px] font-mono text-emerald-200 mt-0.5">Accréditation et droits OCP</p>
              </div>
              <button onClick={() => setShowUserModal(null)} className="text-white hover:text-emerald-200 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 flex flex-col gap-4" autoComplete="off">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-450 font-bold">Nom Complet</label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  required
                  placeholder="Ex: Youssef El Alami"
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-455 font-bold">Adresse E-mail</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  required
                  placeholder="Ex: y.alami@ocpgroup.ma"
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
                />
              </div>

              {showUserModal === "add" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-455 font-bold">Mot de passe temporaire</label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={e => setUserPassword(e.target.value)}
                    required
                    placeholder="Min 6 caractères..."
                    className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-455 font-bold">Rôle & Habilitations</label>
                <select
                  value={userRole}
                  onChange={e => setUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-[#236534] cursor-pointer font-medium"
                >
                  <option value="Admin">Admin</option>
                  <option value="Responsable Stock">Responsable Stock</option>
                  
                </select>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="userActiveCheckUtilisateurs"
                  checked={userActive}
                  onChange={e => setUserActive(e.target.checked)}
                  className="w-4 h-4 text-[#236534] border-border rounded focus:ring-[#236534]"
                />
                <label htmlFor="userActiveCheckUtilisateurs" className="text-xs font-mono text-slate-600 font-bold cursor-pointer select-none">
                  Compte actif (autoriser la connexion de session)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(null)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-4 py-2 bg-[#236534] hover:bg-[#1c522a] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer uppercase tracking-wider font-bold"
                >
                  {submittingUser ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6CC] w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-scaleIn" style={{ borderRadius: 24 }}>
            <div className="bg-amber-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">Mot de Passe</h3>
                <p className="text-[10px] font-mono text-amber-200 mt-0.5">Réinitialisation pour {showResetModal.name}</p>
              </div>
              <button onClick={() => setShowResetModal(null)} className="text-white hover:text-amber-200 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-455 font-bold">Nouveau Mot de Passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Saisir le nouveau mot de passe..."
                  className="w-full px-3 py-2 border border-border bg-white text-xs rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono rounded-lg transition-colors cursor-pointer uppercase tracking-wider font-bold"
                >
                  {resettingPassword ? "En cours..." : "Modifier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6CC] w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-scaleIn" style={{ borderRadius: 24 }}>
            <div className="bg-red-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wider uppercase">Suppression</h3>
                <p className="text-[10px] font-mono text-red-200 mt-0.5">Confirmer l'action système</p>
              </div>
              <button onClick={() => setDeleteConfirmUser(null)} className="text-white hover:text-red-200 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-slate-655 font-mono leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le collaborateur <strong className="text-[#233928]">{deleteConfirmUser.name}</strong> ? Cette action est irréversible et révoquera toutes ses accréditations.
              </p>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2 border border-border hover:bg-slate-50 text-xs font-mono rounded-lg transition-colors cursor-pointer text-slate-500 uppercase tracking-wider font-bold"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deletingUser}
                  className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-mono rounded-lg transition-colors cursor-pointer uppercase tracking-wider font-bold"
                >
                  {deletingUser ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoriqueView() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "day" | "week" | "month">("all");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/audit-logs?period=${period}`);
        if (res.data?.success || res.data?.status === 'success') {
          setActivities(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [period]);

  const formatModule = (type: string) => {
    if (!type) return "SYSTÈME";
    const parts = type.split("\\");
    const model = parts[parts.length - 1].toUpperCase();
    if (model === "USER") return "UTILISATEUR";
    if (model === "STOCKMOVEMENT") return "MOUVEMENT";
    if (model === "ALERTRULE") return "ALERTE";
    if (model === "DEMANDPREDICTION") return "IA";
    return model;
  };

  return (
    <div className="bg-white border border-border p-6 shadow-sm flex flex-col gap-4 animate-fadeIn" style={{ borderRadius: 20 }}>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Journal d'activité</span>
          <h2 className="font-['Barlow_Condensed'] text-xl font-bold text-[#233928]">Historique des Événements</h2>
        </div>
        <div>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-1.5 border border-border rounded-lg text-xs font-mono bg-[#F8FAF8] text-slate-600 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <option value="all">Tout l'historique</option>
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois-ci</option>
          </select>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F5FAF5] font-mono font-bold text-[10px] uppercase text-slate-500">
              <th className="px-4 py-3">Horodatage</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3 text-right">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-mono">Chargement...</td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-mono">Aucun événement enregistré</td>
              </tr>
            ) : (
              activities.map(act => (
                <tr key={act.id} className="hover:bg-[#F5FAF5]/30">
                  <td className="px-4 py-3 font-mono text-slate-400">{new Date(act.created_at).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3 font-bold text-[#233928]">{act.user?.name || "Système"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded border bg-slate-100 text-slate-700 text-[8px] font-bold font-mono uppercase">
                      {formatModule(act.auditable_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-650">{act.action}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}




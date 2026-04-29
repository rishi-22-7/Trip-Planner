/*
  AdminRecommendations.jsx – Manage travel tip recommendations (Admin only).
  Travel tips that help users on their trips (packing, safety, health, etc.)
  No destination-specific info here — itineraries already handle that.

  State explanation:
  - recommendations: array from server – the live list
  - editingRec: null = creating new | object = updating existing
  - showForm: toggles the Add/Edit inline form
*/
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getRecommendations, createRecommendation, updateRecommendation, deleteRecommendation,
} from '../../services/adminService';

const EMPTY_FORM = { title: '', category: 'General', content: '' };

const CATEGORIES = ['General', 'Packing', 'Safety', 'Health', 'Budget', 'Photography'];

const CATEGORY_COLORS = {
  General:      'bg-slate-100 text-slate-700',
  Packing:      'bg-blue-50 text-blue-700',
  Safety:       'bg-red-50 text-red-700',
  Health:       'bg-green-50 text-green-700',
  Budget:       'bg-amber-50 text-amber-700',
  Photography:  'bg-purple-50 text-purple-700',
};

const AdminRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingRec, setEditingRec] = useState(null);
  const [form, setForm]           = useState({ ...EMPTY_FORM });
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchRecs(); }, []);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const data = await getRecommendations();
      setRecommendations(data.data || []);
    } catch {
      setRecommendations([]);
      toast.error('Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingRec(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEditForm = (rec) => {
    setEditingRec(rec);
    setForm({ title: rec.title || '', category: rec.category || 'General', content: rec.content || '' });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRec(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingRec) {
        const updated = await updateRecommendation(editingRec._id, form);
        setRecommendations((prev) => prev.map((r) => (r._id === editingRec._id ? updated.data : r)));
        toast.success('Tip updated!');
      } else {
        const created = await createRecommendation(form);
        setRecommendations((prev) => [...prev, created.data]);
        toast.success('Tip added!');
      }
      handleCancel();
    } catch {
      toast.error('Failed to save tip.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this travel tip?')) return;
    try {
      await deleteRecommendation(id);
      setRecommendations((prev) => prev.filter((r) => r._id !== id));
      toast.success('Tip deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Travel Tips</h2>
          <p className="text-sm text-slate-500">Curate helpful tips for travellers — packing, safety, health, and more.</p>
        </div>
        {!showForm && (
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Tip
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">
              {editingRec ? 'Edit Travel Tip' : 'New Travel Tip'}
            </h3>
            <button type="button" onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Always carry a power bank"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Content *</label>
              <textarea
                rows={3}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Describe the tip in detail…"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : editingRec ? 'Save Changes' : 'Add Tip'}
            </button>
          </div>
        </form>
      )}

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => <div key={n} className="h-28 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <Lightbulb className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-slate-500 font-medium">No travel tips yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "Add Tip" to create your first travel tip.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div key={rec._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${CATEGORY_COLORS[rec.category] || CATEGORY_COLORS.General}`}>
                    {rec.category}
                  </span>
                  <h4 className="font-semibold text-slate-900 text-sm leading-snug">{rec.title}</h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditForm(rec)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rec._id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{rec.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRecommendations;

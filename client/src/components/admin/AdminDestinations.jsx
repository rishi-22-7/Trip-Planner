/*
  AdminDestinations.jsx – Manage Destinations tab inside the Admin Dashboard.
  Provides full CRUD for destinations plus a "Pre-planned Itinerary" editor.

  State explanation (important for viva):
  - destinations: array fetched from the server – source of truth for the list
  - showAddForm: boolean – controls visibility of the Add/Edit form
  - editingDestination: null = creating new | object = updating existing
    When the user clicks "Edit" on a row, we copy that destination into
    editingDestination and open the form pre-filled with its data.
  - itineraryDays: array of { day, activities[] } objects that represent
    the pre-planned itinerary template admins build alongside a destination.
*/
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllDestinations, createDestination, updateDestination, deleteDestination } from '../../services/destinationService';

// ─── Empty form state (used for "Add" and reset after "Edit") ──────────────
const EMPTY_FORM = {
  destinationName: '',
  description: '',
};

// ─── Itinerary Day Editor ─────────────────────────────────────────────────────
// Manages the per-day activity templates that admins attach to a destination
const ItineraryEditor = ({ itineraryDays, setItineraryDays }) => {
  const addDay = () => {
    const nextDay = itineraryDays.length + 1;
    setItineraryDays([...itineraryDays, { day: nextDay, activities: [''] }]);
  };

  const removeDay = (dayIndex) => {
    setItineraryDays(itineraryDays.filter((_, i) => i !== dayIndex));
  };

  const updateActivity = (dayIndex, actIndex, value) => {
    // Immutably update the activity text at [dayIndex][actIndex]
    const updated = itineraryDays.map((d, di) => {
      if (di !== dayIndex) return d;
      const updatedActivities = d.activities.map((a, ai) => (ai === actIndex ? value : a));
      return { ...d, activities: updatedActivities };
    });
    setItineraryDays(updated);
  };

  const addActivity = (dayIndex) => {
    const updated = itineraryDays.map((d, di) =>
      di === dayIndex ? { ...d, activities: [...d.activities, ''] } : d
    );
    setItineraryDays(updated);
  };

  const removeActivity = (dayIndex, actIndex) => {
    const updated = itineraryDays.map((d, di) =>
      di === dayIndex
        ? { ...d, activities: d.activities.filter((_, ai) => ai !== actIndex) }
        : d
    );
    setItineraryDays(updated);
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700">Pre-planned Itinerary Template</h4>
        <button type="button" onClick={addDay} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Day
        </button>
      </div>

      {itineraryDays.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4">No days added. Click "Add Day" to build an itinerary template.</p>
      )}

      <div className="divide-y divide-slate-100">
        {itineraryDays.map((dayEntry, dayIndex) => (
          <div key={dayIndex} className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600">Day {dayEntry.day}</span>
              <button type="button" onClick={() => removeDay(dayIndex)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 pl-3">
              {dayEntry.activities.map((act, actIndex) => (
                <div key={actIndex} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Activity ${actIndex + 1}`}
                    value={act}
                    onChange={(e) => updateActivity(dayIndex, actIndex, e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => removeActivity(dayIndex, actIndex)} className="text-slate-300 hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addActivity(dayIndex)} className="text-xs text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1 mt-1">
                <Plus className="w-3 h-3" /> Add activity
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Add / Edit Form ──────────────────────────────────────────────────────────
const DestinationForm = ({ editingDestination, onSave, onCancel }) => {
  // If editingDestination is provided, pre-fill the form with its values (Edit mode)
  // Otherwise, start with the empty form (Add mode)
  const [form, setForm] = useState(
    editingDestination
      ? {
          destinationName: editingDestination.destinationName || '',
          description: editingDestination.description || '',
        }
      : { ...EMPTY_FORM }
  );
  const [itineraryDays, setItineraryDays] = useState(
    editingDestination?.itinerary || []
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destinationName.trim()) { toast.error('Destination name is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        itinerary: itineraryDays,
      };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  const isEditMode = !!editingDestination;

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">{isEditMode ? 'Edit Destination' : 'Add New Destination'}</h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Destination Name *</label>
          <input type="text" value={form.destinationName} onChange={(e) => setForm({ ...form, destinationName: e.target.value })} placeholder="e.g. Goa, India" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief overview of the destination" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
      </div>

      {/* Pre-planned Itinerary section */}
      <div className="mb-4">
        <ItineraryEditor itineraryDays={itineraryDays} setItineraryDays={setItineraryDays} />
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Add Destination'}
        </button>
      </div>
    </form>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDestinations = () => {
  const [destinations, setDestinations]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showForm, setShowForm]               = useState(false);
  // editingDestination = null means "Add mode"; set to a destination object for "Edit mode"
  const [editingDestination, setEditingDestination] = useState(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const data = await getAllDestinations();
      setDestinations(data.data || []);
    } catch {
      toast.error('Failed to load destinations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (payload) => {
    try {
      if (editingDestination) {
        // ── UPDATE ──────────────────────────────────────────────────────
        const updated = await updateDestination(editingDestination._id, payload);
        setDestinations((prev) =>
          prev.map((d) => (d._id === editingDestination._id ? updated.data : d))
        );
        toast.success('Destination updated!');
      } else {
        // ── CREATE ──────────────────────────────────────────────────────
        const created = await createDestination(payload);
        setDestinations((prev) => [...prev, created.data]);
        toast.success('Destination added!');
      }
      setShowForm(false);
      setEditingDestination(null);
    } catch {
      toast.error('Failed to save destination.');
    }
  };

  const handleEdit = (dest) => {
    setEditingDestination(dest);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await deleteDestination(id);
      setDestinations((prev) => prev.filter((d) => d._id !== id));
      toast.success('Destination deleted.');
    } catch {
      toast.error('Failed to delete destination.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDestination(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Manage Destinations</h2>
          <p className="text-sm text-slate-500">Add, edit, or remove destinations and their itinerary templates.</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingDestination(null); setShowForm(true); }} className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Destination
          </button>
        )}
      </div>

      {/* Add/Edit form – shown inline above the table */}
      {showForm && (
        <DestinationForm
          editingDestination={editingDestination}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Destinations table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((n) => <div key={n} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Name', 'Description', 'Itinerary', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {destinations.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No destinations yet.</td></tr>
              ) : destinations.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{d.destinationName}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{d.description}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {d.itinerary?.length > 0 ? `${d.itinerary.length} day${d.itinerary.length !== 1 ? 's' : ''}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(d)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(d._id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors font-medium">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDestinations;

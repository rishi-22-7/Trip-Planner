/*
  AdminPlatformContent.jsx – Global platform settings placeholder.
  Displays editable app-wide settings (e.g., site name, support email).
  Connect to a real /api/admin/settings endpoint when the backend is ready.
*/
import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPlatformContent = () => {
  const [settings, setSettings] = useState({
    siteName:      'Trip Planner',
    supportEmail:  'support@tripplanner.com',
    maxTripsPerUser: '10',
    maintenanceMode: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Replace with real API call → api.put('/admin/settings', settings)
    await new Promise((r) => setTimeout(r, 800)); // simulate async
    toast.success('Settings saved (connect to backend to persist).');
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Platform Settings</h2>
        <p className="text-sm text-slate-500">Manage global application configuration.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
            <input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
            <input type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Trips per User</label>
            <input type="number" min="1" value={settings.maxTripsPerUser} onChange={(e) => setSettings({ ...settings, maxTripsPerUser: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-3">
            <input id="maintenance" type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="maintenance" className="text-sm font-medium text-slate-700">Enable Maintenance Mode</label>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <button type="submit" disabled={saving} className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPlatformContent;

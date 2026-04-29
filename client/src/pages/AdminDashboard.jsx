/*
  AdminDashboard.jsx – Main Admin portal page.
  Acts as a tabbed layout container. Each tab renders a self-contained
  sub-component from components/admin/ so this file stays readable.

  Tab → Component mapping:
    destinations  → AdminDestinations   (CRUD + itinerary builder)
    recommendations → AdminRecommendations (CRUD)
    trips         → AdminUserTrips       (read-only monitor)
    reports       → AdminReports         (stats + download)
    settings      → AdminPlatformContent (global config)

  No user-centric tools ("Plan a Trip", etc.) appear here.
  Route guard: AdminRoute in routes.jsx ensures only role === 'admin' can access.
*/
import { useState } from 'react';
import { Globe, Star, Plane, BarChart2, Settings, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import AdminDestinations   from '../components/admin/AdminDestinations';
import AdminRecommendations from '../components/admin/AdminRecommendations';
import AdminUserTrips      from '../components/admin/AdminUserTrips';
import AdminReports        from '../components/admin/AdminReports';
import AdminPlatformContent from '../components/admin/AdminPlatformContent';

// Tab definitions – each maps a key to a label, icon, and the component to render
const TABS = [
  { key: 'destinations',    label: 'Destinations',    icon: Globe,     component: AdminDestinations    },
  { key: 'recommendations', label: 'Recommendations', icon: Star,      component: AdminRecommendations },
  { key: 'trips',           label: 'User Trips',      icon: Plane,     component: AdminUserTrips      },
  { key: 'reports',         label: 'Reports',         icon: BarChart2, component: AdminReports        },
  { key: 'settings',        label: 'Settings',        icon: Settings,  component: AdminPlatformContent },
];

const AdminDashboard = () => {
  // activeTab controls which sub-component is rendered
  const [activeTab, setActiveTab] = useState('destinations');

  // Look up the component for the currently active tab
  const ActiveComponent = TABS.find((t) => t.key === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Manage platform content and monitor activity</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Active tab content – renders the selected sub-component */}
        <div className="bg-gray-50">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

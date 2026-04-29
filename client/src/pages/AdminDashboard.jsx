/*
  AdminDashboard.jsx – Main Admin portal page.
  Tabbed layout; each tab renders a self-contained sub-component.

  Tab → Component mapping:
    destinations    → AdminDestinations   (CRUD + itinerary builder)
    recommendations → AdminRecommendations (Travel tips CRUD)
    trips           → AdminUserTrips       (read-only monitor)
    users           → AdminUsers           (read-only user list, admin excluded)
    reports         → AdminReports         (stats + bar chart)

  Settings tab has been removed (not needed).
  Route guard: AdminRoute in routes.jsx ensures only role === 'admin' can access.
*/
import { useState } from 'react';
import { Globe, Lightbulb, Plane, Users, BarChart2, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import AdminDestinations    from '../components/admin/AdminDestinations';
import AdminRecommendations from '../components/admin/AdminRecommendations';
import AdminUserTrips       from '../components/admin/AdminUserTrips';
import AdminUsers           from '../components/admin/AdminUsers';
import AdminReports         from '../components/admin/AdminReports';

const TABS = [
  { key: 'destinations',    label: 'Destinations',    icon: Globe,       component: AdminDestinations    },
  { key: 'recommendations', label: 'Travel Tips',     icon: Lightbulb,   component: AdminRecommendations },
  { key: 'trips',           label: 'User Trips',      icon: Plane,       component: AdminUserTrips       },
  { key: 'users',           label: 'Users',           icon: Users,       component: AdminUsers           },
  { key: 'reports',         label: 'Reports',         icon: BarChart2,   component: AdminReports         },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('destinations');
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

        {/* Active tab content */}
        <div className="bg-gray-50">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

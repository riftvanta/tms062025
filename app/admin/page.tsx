'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const { user, loading } = useRequireAuth({ requiredRole: 'admin' });
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleInitUsers = async () => {
    try {
      const response = await fetch('/api/auth/init', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Users initialized successfully!\n' + data.results.join('\n'));
      } else {
        alert('Failed to initialize users: ' + data.error);
      }
    } catch (error) {
      console.error('User initialization error:', error);
      alert('Failed to initialize users');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
            <div className="space-y-3">
              <button 
                onClick={handleInitUsers}
                className="btn-primary w-full"
              >
                Initialize Default Users
              </button>
              <button className="btn-secondary w-full" disabled>
                Manage Exchange Offices
              </button>
              <button className="btn-secondary w-full" disabled>
                View User Activity
              </button>
            </div>
          </div>

          {/* Order Management */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Management</h2>
            <div className="space-y-3">
              <button className="btn-secondary w-full" disabled>
                Pending Orders
              </button>
              <button className="btn-secondary w-full" disabled>
                Order History
              </button>
              <button className="btn-secondary w-full" disabled>
                Generate Reports
              </button>
            </div>
          </div>

          {/* Bank Management */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Management</h2>
            <div className="space-y-3">
              <button className="btn-secondary w-full" disabled>
                Platform Banks
              </button>
              <button className="btn-secondary w-full" disabled>
                Bank Assignments
              </button>
              <button className="btn-secondary w-full" disabled>
                Balance Monitoring
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Exchanges:</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Reviews:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Volume:</span>
                <span className="font-medium">0 JOD</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Authentication System</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Firebase Connection</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Order Processing</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="btn-secondary w-full" disabled>
                Export Data
              </button>
              <button className="btn-secondary w-full" disabled>
                System Backup
              </button>
              <button className="btn-secondary w-full" disabled>
                View Logs
              </button>
            </div>
          </div>
        </div>

        {/* Phase Status */}
        <div className="mt-8 card bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Phase 2 Complete</h3>
          <p className="text-green-700 text-sm">
            Authentication system is fully functional. Admin dashboard with role-based access control is ready.
          </p>
          <div className="mt-3 text-xs text-green-600">
            <p>• Username-based authentication ✓</p>
            <p>• Session management with HTTP-only cookies ✓</p>
            <p>• Role-based access control ✓</p>
            <p>• Automatic redirects ✓</p>
          </div>
        </div>
      </main>
    </div>
  );
} 
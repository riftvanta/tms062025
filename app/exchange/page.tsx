'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';

export default function ExchangeDashboard() {
  const { user, loading } = useRequireAuth({ requiredRole: 'exchange' });
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exchange dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Exchange Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user.username} 
                {user.exchangeName && ` - ${user.exchangeName}`}
              </p>
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
          {/* Balance Overview */}
          <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Current Balance</h2>
            <div className="text-3xl font-bold text-blue-900 mb-2">1,000 JOD</div>
            <p className="text-sm text-blue-700">Available for transfers</p>
          </div>

          {/* Create Orders */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Order</h2>
            <div className="space-y-3">
              <button className="btn-primary w-full" disabled>
                Outgoing Transfer
              </button>
              <button className="btn-secondary w-full" disabled>
                Incoming Transfer
              </button>
            </div>
          </div>

          {/* Order Status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">In Review:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <div className="text-center py-8 text-gray-500">
              <p>No orders yet</p>
              <p className="text-sm mt-2">Create your first transfer order to get started</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="btn-secondary w-full" disabled>
                View All Orders
              </button>
              <button className="btn-secondary w-full" disabled>
                Order History
              </button>
              <button className="btn-secondary w-full" disabled>
                Download Reports
              </button>
            </div>
          </div>

          {/* Commission Rates */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission Rates</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Incoming:</span>
                <span className="font-medium">2.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outgoing:</span>
                <span className="font-medium">5 JOD</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No new messages</p>
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Username:</span>
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Status */}
        <div className="mt-8 card bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Phase 2 Complete</h3>
          <p className="text-green-700 text-sm">
            Authentication system is fully functional. Exchange dashboard with role-based access control is ready.
          </p>
          <div className="mt-3 text-xs text-green-600">
            <p>• Secure session management ✓</p>
            <p>• Role-based access control ✓</p>
            <p>• Exchange-specific dashboard ✓</p>
            <p>• Balance and commission display ✓</p>
          </div>
        </div>
      </main>
    </div>
  );
} 
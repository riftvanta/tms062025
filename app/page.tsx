export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TMS
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Transfer Management System
          </p>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Welcome</h2>
            <p className="text-gray-600 mb-6">
              Financial Transfer Management System for secure transactions between our company and exchange office partners.
            </p>
            <div className="space-y-3">
              <button className="btn-primary w-full">
                Admin Login
              </button>
              <button className="btn-secondary w-full">
                Exchange Login
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>Mobile-optimized • Secure • Real-time</p>
        </div>
      </div>
    </div>
  );
} 
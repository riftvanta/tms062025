import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your TMS account
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link href="/" className="text-sm text-primary-600 hover:text-primary-700">
            ← Back to Home
          </Link>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <p>Admin and Exchange Portal Access</p>
          <p className="mt-1">Secure • Mobile-optimized</p>
        </div>
      </div>
    </div>
  );
} 
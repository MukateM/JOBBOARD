import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, LogOut, User, Home, Building, Shield, FileText } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isEmployer, isApplicant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get dashboard link based on role
  const getDashboardRoute = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isEmployer) return '/employer/dashboard';
    if (isApplicant) return '/applications';
    return '/';
  };

  const getDashboardLabel = () => {
    if (isAdmin) return 'Admin Dashboard';
    if (isEmployer) return 'Employer Dashboard';
    if (isApplicant) return 'My Applications';
    return 'Dashboard';
  };

  const getDashboardIcon = () => {
    if (isAdmin) return <Shield className="h-5 w-5" />;
    if (isEmployer) return <Building className="h-5 w-5" />;
    if (isApplicant) return <FileText className="h-5 w-5" />;
    return <Home className="h-5 w-5" />;
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">ZedLink Careers</span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Home link - only show if not on home page */}
                {!isAdmin && (
                  <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                )}
                
                {/* Dashboard link - for each role */}
                <Link 
                  to={getDashboardRoute()} 
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {getDashboardIcon()}
                  <span>{getDashboardLabel()}</span>
                </Link>

                {/* Post Job link - only for employers */}
                {isEmployer && (
                  <Link 
                    to="/employer/post-job" 
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Briefcase className="h-5 w-5" />
                    <span>Post Job</span>
                  </Link>
                )}
                
                {/* User info with role badge */}
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.fullName || user?.email}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    isAdmin ? 'bg-red-100 text-red-800' :
                    isEmployer ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user?.role}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
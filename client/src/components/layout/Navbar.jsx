import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, LogOut, User, Home, Building } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                
                {user.role === 'employer' && (
                  <Link to="/employer/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                    <Building className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                )}
                
                <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600">
                  <User className="h-5 w-5" />
                  <span>{user.fullName}</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
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
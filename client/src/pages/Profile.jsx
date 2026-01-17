import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Globe, 
  Linkedin,
  Save,
  Edit,
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentRole: '',
    company: '',
    linkedinUrl: '',
    portfolioUrl: '',
    bio: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Set initial form data from user
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      currentRole: user.currentRole || '',
      company: user.company || '',
      linkedinUrl: user.linkedinUrl || '',
      portfolioUrl: user.portfolioUrl || '',
      bio: user.bio || ''
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app: await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      
      // Simulate updating user context
      console.log('Profile updated:', formData);
      
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-16 w-16 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{formData.fullName || 'User'}</h2>
                <p className="text-gray-600 mb-2">{formData.currentRole || 'No role specified'}</p>
                <p className="text-gray-500 text-sm mb-4">{formData.company || 'No company specified'}</p>
                
                <div className="flex justify-center space-x-4 mb-6">
                  {formData.linkedinUrl && (
                    <a href={formData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {formData.portfolioUrl && (
                    <a href={formData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center text-gray-600">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="capitalize">{user.role || 'applicant'}</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{formData.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Interviews</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saved Jobs</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-semibold">45</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center px-4 py-2 rounded-lg ${editMode 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {editMode ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        {formData.fullName || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="you@example.com"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {formData.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {formData.phone || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Role
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="currentRole"
                        value={formData.currentRole}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Senior Developer"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                        {formData.currentRole || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Tech Corp Inc."
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {formData.company || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    {editMode ? (
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="https://linkedin.com/in/username"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        {formData.linkedinUrl ? (
                          <a href={formData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View Profile
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio URL
                    </label>
                    {editMode ? (
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        {formData.portfolioUrl ? (
                          <a href={formData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                            Visit Portfolio
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio / Summary
                    </label>
                    {editMode ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                        className="input-field"
                        placeholder="Tell us about yourself, your experience, and your career goals..."
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-lg min-h-[100px]">
                        {formData.bio || 'No bio provided'}
                      </div>
                    )}
                  </div>
                </div>

                {editMode && (
                  <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <p className="text-gray-700 mb-2">Permanently delete your account</p>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
                <button className="mt-4 sm:mt-0 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Delete Account
                </button>
              </div>
              <div className="border-t mt-6 pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div>
                    <p className="text-gray-700 mb-2">Sign out from all devices</p>
                    <p className="text-sm text-gray-500">This will log you out from all active sessions.</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-4 sm:mt-0 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Logout Everywhere
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
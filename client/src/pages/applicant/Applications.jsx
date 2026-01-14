import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search,
  TrendingUp
} from 'lucide-react';
import api from '../../services/api';

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    reviewing: 0,
    shortlisted: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/me');
      
      if (response.data.success) {
        const apps = response.data.applications || [];
        setApplications(apps);
        
        // Calculate stats
        const stats = {
          total: apps.length,
          submitted: apps.filter(app => app.status === 'submitted' || app.status === 'pending').length,
          reviewing: apps.filter(app => app.status === 'reviewing').length,
          shortlisted: apps.filter(app => app.status === 'shortlisted').length,
          rejected: apps.filter(app => app.status === 'rejected').length
        };
        setStats(stats);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-blue-100 text-blue-800',
      submitted: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-green-100 text-green-800'
    };

    const icons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      submitted: <Clock className="h-3 w-3 mr-1" />,
      reviewing: <Eye className="h-3 w-3 mr-1" />,
      shortlisted: <TrendingUp className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
      hired: <CheckCircle className="h-3 w-3 mr-1" />
    };

    const labels = {
      pending: 'Pending',
      submitted: 'Submitted',
      reviewing: 'Reviewing',
      shortlisted: 'Shortlisted',
      rejected: 'Rejected',
      hired: 'Hired'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        {labels[status] || 'Pending'}
      </span>
    );
  };

  const filteredApplications = applications.filter(app => {
    if (filter !== 'all' && app.status !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        app.job_listings?.title?.toLowerCase().includes(searchLower) ||
        app.job_listings?.companies?.name?.toLowerCase().includes(searchLower) ||
        app.job_listings?.location?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    
    try {
      await api.delete(`/applications/${applicationId}`);
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Failed to withdraw application:', err);
      alert('Failed to withdraw application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Applications</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchApplications}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">Track all your job applications in one place</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-4">
            <p className="text-sm text-blue-600">Submitted</p>
            <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-4">
            <p className="text-sm text-yellow-600">Reviewing</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.reviewing}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm p-4">
            <p className="text-sm text-purple-600">Shortlisted</p>
            <p className="text-2xl font-bold text-purple-600">{stats.shortlisted}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-4">
            <p className="text-sm text-red-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by job title, company, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 mr-2">Filter:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Applications</option>
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-6">
                {filter !== 'all' 
                  ? `You have no ${filter} applications.`
                  : 'You haven\'t applied to any jobs yet.'}
              </p>
              <Link
                to="/jobs"
                className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Browse Jobs
              </Link>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start mb-4">
                        {application.job_listings?.companies?.logo_url ? (
                          <img 
                            src={application.job_listings.companies.logo_url} 
                            alt={application.job_listings.companies.name}
                            className="w-12 h-12 rounded-lg mr-4 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                            <Building className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            <Link 
                              to={`/jobs/${application.job_id}`} 
                              className="hover:text-primary-600"
                            >
                              {application.job_listings?.title || 'Job Title'}
                            </Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-gray-600">
                              {application.job_listings?.companies?.name || 'Company'}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {application.job_listings?.location || 'Location'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Dates */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Applied: {new Date(application.submitted_at || application.created_at).toLocaleDateString()}
                        </div>
                        {application.updated_at && application.updated_at !== application.created_at && (
                          <div className="text-sm text-gray-500">
                            Updated: {new Date(application.updated_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
                      <Link
                        to={`/jobs/${application.job_id}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-center text-sm"
                      >
                        View Job
                      </Link>
                      <button 
                        onClick={() => handleWithdraw(application.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {application.cover_letter && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Cover Letter: </span>
                        {application.cover_letter.substring(0, 200)}
                        {application.cover_letter.length > 200 && '...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Application Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Follow Up</h4>
                <p className="text-sm text-blue-700">
                  Consider following up on applications after 7-10 days if you haven't heard back.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Update Your Profile</h4>
                <p className="text-sm text-blue-700">
                  Keep your profile up to date with your latest skills and experience.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Diversify Applications</h4>
                <p className="text-sm text-blue-700">
                  Apply to a mix of job types and companies to increase your chances.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
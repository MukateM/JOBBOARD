import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabase'; // Add this import
import { useAuth } from '../../context/AuthContext'; // Add this import
import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export const EmployerDashboard = () => {
  const { user } = useAuth(); // Get current user
  const [stats, setStats] = useState({
    totalJobs: 0,
    approvedJobs: 0,
    pendingJobs: 0,
    totalApplications: 0
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs created by current employer with their applications
      const { data: jobs, error: jobsError } = await supabase
        .from('job_listings')
        .select(`
          *,
          job_applications (*)
        `)
        .eq('created_by', user.id) // Only get jobs created by this employer
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      setRecentJobs(jobs?.slice(0, 4) || []);
      
      // Check if user has a company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        setNotification('Please set up your company profile first to start posting jobs.');
      }

      // Calculate statistics
      const totalJobs = jobs?.length || 0;
      const approvedJobs = jobs?.filter(j => j.status === 'approved').length || 0;
      const pendingJobs = jobs?.filter(j => j.status === 'pending').length || 0;
      const totalApplications = jobs?.reduce((sum, job) => 
        sum + (job.job_applications?.length || 0), 0
      ) || 0;
      
      setStats({
        totalJobs,
        approvedJobs,
        pendingJobs,
        totalApplications
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800'
    };

    const icons = {
      approved: <CheckCircle className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
      closed: <XCircle className="h-3 w-3 mr-1" />
    };

    const labels = {
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
      closed: 'Closed'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {icons[status] || null}
        {labels[status] || status}
      </span>
    );
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your job postings and applications</p>
            </div>
            <Link
              to="/employer/post-job"
              className="mt-4 md:mt-0 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold"
            >
              Post New Job
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalJobs}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approvedJobs}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">
                {stats.totalJobs > 0 ? Math.round((stats.approvedJobs / stats.totalJobs) * 100) : 0}% of total
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingJobs}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApplications}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Job Postings</h2>
            </div>
          </div>
          
          <div className="p-6">
            {recentJobs.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {notification.includes('company') || notification.includes('Company') 
                    ? "Set Up Your Company First" 
                    : "No Jobs Posted Yet"}
                </h3>

                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {notification || 
                    "You haven't posted any jobs yet. Get started by creating your company profile and posting your first opening."}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {(notification.includes('company') || notification.includes('Company')) && (
                    <Link
                      to="/employer/company-setup"
                      className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                      Register Your Company Now
                    </Link>
                  )}

                  <Link
                    to="/employer/post-job"
                    className={`inline-flex items-center px-8 py-3 font-medium rounded-lg transition ${
                      (notification.includes('company') || notification.includes('Company'))
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                    }`}
                  >
                    Post a Job
                  </Link>
                </div>

                {(notification.includes('company') || notification.includes('Company')) && (
                  <p className="mt-6 text-sm text-gray-500">
                    Registering your company takes less than 2 minutes and unlocks posting jobs & receiving applications.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {job.job_applications?.length || 0} applications
                          </span>
                          <span className="text-sm text-gray-500">{job.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        {job.job_applications?.length > 0 && (
                          <Link 
                            to={`/employer/jobs/${job.id}/applications`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            View Applications
                          </Link>
                        )}
                        <Link 
                          to={`/jobs/${job.id}`}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          View Job →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/employer/post-job"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 text-center transition-colors"
            >
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Post New Job</h3>
              <p className="text-sm text-gray-600">Create a new job listing</p>
            </Link>

            <button
              onClick={fetchDashboardData}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-center transition-colors"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Refresh Data</h3>
              <p className="text-sm text-gray-600">Update dashboard statistics</p>
            </button>

            <Link
              to="/profile"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 text-center transition-colors"
            >
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Company Profile</h3>
              <p className="text-sm text-gray-600">Update your company info</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
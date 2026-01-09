import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export const EmployerDashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    hiredCandidates: 0
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for development
    const mockStats = {
      totalJobs: 12,
      activeJobs: 8,
      totalApplications: 45,
      hiredCandidates: 5
    };

    const mockJobs = [
      { id: 1, title: 'Senior Frontend Developer', applications: 8, views: 124, status: 'active', posted: '2024-01-15' },
      { id: 2, title: 'Backend Engineer', applications: 12, views: 98, status: 'active', posted: '2024-01-10' },
      { id: 3, title: 'UI/UX Designer', applications: 15, views: 156, status: 'active', posted: '2024-01-05' },
      { id: 4, title: 'DevOps Specialist', applications: 6, views: 67, status: 'closed', posted: '2023-12-20' }
    ];

    const mockApplications = [
      { id: 1, name: 'John Doe', job: 'Senior Frontend Developer', status: 'reviewing', date: '2024-01-16', score: 85 },
      { id: 2, name: 'Jane Smith', job: 'Backend Engineer', status: 'shortlisted', date: '2024-01-14', score: 92 },
      { id: 3, name: 'Bob Johnson', job: 'UI/UX Designer', status: 'rejected', date: '2024-01-12', score: 45 },
      { id: 4, name: 'Alice Brown', job: 'DevOps Specialist', status: 'hired', date: '2024-01-10', score: 95 }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setRecentJobs(mockJobs);
      setRecentApplications(mockApplications);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      reviewing: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-green-100 text-green-800'
    };

    const icons = {
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      closed: <XCircle className="h-3 w-3 mr-1" />,
      reviewing: <Clock className="h-3 w-3 mr-1" />,
      shortlisted: <CheckCircle className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
      hired: <CheckCircle className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+2 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeJobs}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">{Math.round((stats.activeJobs / stats.totalJobs) * 100)}% of total</span>
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
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12 this week</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hired Candidates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.hiredCandidates}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">
                {stats.totalApplications > 0 
                  ? Math.round((stats.hiredCandidates / stats.totalApplications) * 100) 
                  : 0}% success rate
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Recent Job Postings</h2>
                <Link to="/employer/jobs" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all →
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {job.applications} applications
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {job.views} views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(job.status)}
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Posted {new Date(job.posted).toLocaleDateString()}
                      </span>
                      <Link 
                        to={`/employer/jobs/${job.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Filter className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{app.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{app.job}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Applied {new Date(app.date).toLocaleDateString()}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            AI Score: {app.score}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(app.status)}
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                        View Profile
                      </button>
                      <button className="flex-1 text-center py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

            <Link
              to="/employer/applications"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-center transition-colors"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Review Applications</h3>
              <p className="text-sm text-gray-600">Manage candidate applications</p>
            </Link>

            <Link
              to="/employer/analytics"
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 text-center transition-colors"
            >
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">View Analytics</h3>
              <p className="text-sm text-gray-600">See performance insights</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
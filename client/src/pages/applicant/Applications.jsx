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

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    reviewing: 0,
    shortlisted: 0,
    rejected: 0
  });

  useEffect(() => {
    // Mock data for development
    const mockApplications = [
      {
        id: 1,
        job: {
          id: 101,
          title: 'Senior Frontend Developer',
          company: 'Tech Innovations Inc.',
          location: 'Remote',
          logo: 'https://via.placeholder.com/50'
        },
        status: 'submitted',
        appliedDate: '2024-01-15',
        lastUpdated: '2024-01-15',
        aiScore: 85,
        notes: 'Strong match based on React experience'
      },
      {
        id: 2,
        job: {
          id: 102,
          title: 'Backend Engineer',
          company: 'Data Systems Corp',
          location: 'New York, NY',
          logo: 'https://via.placeholder.com/50'
        },
        status: 'reviewing',
        appliedDate: '2024-01-12',
        lastUpdated: '2024-01-14',
        aiScore: 92,
        notes: 'Excellent match for Python skills'
      },
      {
        id: 3,
        job: {
          id: 103,
          title: 'UI/UX Designer',
          company: 'Creative Studio',
          location: 'San Francisco, CA',
          logo: 'https://via.placeholder.com/50'
        },
        status: 'shortlisted',
        appliedDate: '2024-01-10',
        lastUpdated: '2024-01-13',
        aiScore: 78,
        notes: 'Portfolio review scheduled'
      },
      {
        id: 4,
        job: {
          id: 104,
          title: 'DevOps Specialist',
          company: 'Cloud Solutions',
          location: 'Remote',
          logo: 'https://via.placeholder.com/50'
        },
        status: 'rejected',
        appliedDate: '2024-01-05',
        lastUpdated: '2024-01-08',
        aiScore: 45,
        notes: 'Insufficient AWS experience'
      },
      {
        id: 5,
        job: {
          id: 105,
          title: 'Product Manager',
          company: 'Growth Tech',
          location: 'Boston, MA',
          logo: 'https://via.placeholder.com/50'
        },
        status: 'submitted',
        appliedDate: '2024-01-18',
        lastUpdated: '2024-01-18',
        aiScore: 67,
        notes: 'Good product management experience'
      }
    ];

    // Calculate stats
    const stats = {
      total: mockApplications.length,
      submitted: mockApplications.filter(app => app.status === 'submitted').length,
      reviewing: mockApplications.filter(app => app.status === 'reviewing').length,
      shortlisted: mockApplications.filter(app => app.status === 'shortlisted').length,
      rejected: mockApplications.filter(app => app.status === 'rejected').length
    };

    setTimeout(() => {
      setApplications(mockApplications);
      setStats(stats);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-green-100 text-green-800'
    };

    const icons = {
      submitted: <Clock className="h-3 w-3 mr-1" />,
      reviewing: <Eye className="h-3 w-3 mr-1" />,
      shortlisted: <TrendingUp className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
      hired: <CheckCircle className="h-3 w-3 mr-1" />
    };

    const labels = {
      submitted: 'Submitted',
      reviewing: 'Reviewing',
      shortlisted: 'Shortlisted',
      rejected: 'Rejected',
      hired: 'Hired'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const filteredApplications = applications.filter(app => {
    if (filter !== 'all' && app.status !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        app.job.title.toLowerCase().includes(searchLower) ||
        app.job.company.toLowerCase().includes(searchLower) ||
        app.job.location.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

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
                  <option value="reviewing">Reviewing</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <button className="flex items-center text-primary-600 hover:text-primary-700">
                <Download className="h-5 w-5 mr-1" />
                <span className="text-sm">Export</span>
              </button>
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
                to="/"
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
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <Building className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            <Link to={`/jobs/${application.job.id}`} className="hover:text-primary-600">
                              {application.job.title}
                            </Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-gray-600">{application.job.company}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {application.job.location}
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
                          Applied: {new Date(application.appliedDate).toLocaleDateString()}
                        </div>
                        {application.status !== 'submitted' && (
                          <div className="text-sm text-gray-500">
                            Updated: {new Date(application.lastUpdated).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* AI Score */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">AI Match Score</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(application.aiScore)}`}>
                            {application.aiScore}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${application.aiScore >= 80 ? 'bg-green-500' : application.aiScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${application.aiScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3">
                      <Link
                        to={`/jobs/${application.job.id}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-center text-sm"
                      >
                        View Job
                      </Link>
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                        View Application
                      </button>
                      <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">
                        Withdraw
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  {application.notes && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes: </span>
                        {application.notes}
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
                <h4 className="font-medium text-blue-900 mb-1">Improve Your Score</h4>
                <p className="text-sm text-blue-700">
                  Add more skills and experience to your profile to increase your AI match scores.
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
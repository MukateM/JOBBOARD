import { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Building, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  Filter,
  BarChart3,
  UserCheck,
  AlertCircle,
  DollarSign
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    pendingApprovals: 0,
    totalApplications: 0,
    platformRevenue: 0
  });

  const [pendingJobs, setPendingJobs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [platformMetrics, setPlatformMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for development
    const mockStats = {
      totalUsers: 1245,
      totalJobs: 356,
      totalCompanies: 189,
      pendingApprovals: 12,
      totalApplications: 2456,
      platformRevenue: 12500
    };

    const mockPendingJobs = [
      { id: 1, title: 'Lead DevOps Engineer', company: 'CloudTech Inc.', submitted: '2024-01-18', user: 'john@cloudtech.com' },
      { id: 2, title: 'Senior Product Designer', company: 'Design Studio', submitted: '2024-01-17', user: 'jane@design.studio' },
      { id: 3, title: 'Data Scientist', company: 'Analytics Pro', submitted: '2024-01-16', user: 'bob@analytics.pro' },
      { id: 4, title: 'Marketing Manager', company: 'Growth Hackers', submitted: '2024-01-15', user: 'alice@growth.hack' }
    ];

    const mockRecentUsers = [
      { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'employer', joined: '2024-01-18', status: 'active' },
      { id: 2, name: 'Sarah Miller', email: 'sarah@example.com', role: 'applicant', joined: '2024-01-17', status: 'active' },
      { id: 3, name: 'Mike Wilson', email: 'mike@example.com', role: 'employer', joined: '2024-01-16', status: 'pending' },
      { id: 4, name: 'Emma Davis', email: 'emma@example.com', role: 'applicant', joined: '2024-01-15', status: 'active' }
    ];

    const mockPlatformMetrics = [
      { label: 'User Growth', value: '24%', change: '+5.2%', trend: 'up' },
      { label: 'Job Posts', value: '356', change: '+12.3%', trend: 'up' },
      { label: 'Applications', value: '2.4k', change: '+18.7%', trend: 'up' },
      { label: 'Conversion Rate', value: '8.2%', change: '-1.1%', trend: 'down' }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setPendingJobs(mockPendingJobs);
      setRecentUsers(mockRecentUsers);
      setPlatformMetrics(mockPlatformMetrics);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };

    const icons = {
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      pending: <AlertCircle className="h-3 w-3 mr-1" />,
      suspended: <XCircle className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      employer: 'bg-blue-100 text-blue-800',
      applicant: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage platform operations and analytics</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+124 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalJobs.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+45 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Companies</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalCompanies.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+23 this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingApprovals}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">Requires attention</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalApplications.toLocaleString()}</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-pink-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+312 this week</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">${stats.platformRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12.5% this month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Approvals */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Pending Job Approvals</h2>
                  <span className="text-sm text-gray-500">{pendingJobs.length} pending</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {pendingJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              Submitted: {new Date(job.submitted).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              By: {job.user}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge('pending')}
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button className="flex-1 text-center py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                          Approve
                        </button>
                        <button className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                          View Details
                        </button>
                        <button className="flex-1 text-center py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Metrics */}
            <div className="bg-white rounded-lg shadow-md mt-8">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Platform Metrics</h2>
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <Download className="h-4 w-4 mr-1" />
                    <span className="text-sm">Export Data</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {platformMetrics.map((metric, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-2">{metric.label}</p>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Recent Activity</h3>
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      View All Activity →
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {['New company registration', 'Premium job posting', 'User reported issue', 'System update completed'].map((activity, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className={`w-2 h-2 rounded-full mr-3 ${index % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        {activity}
                        <span className="ml-auto text-gray-500">Just now</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
                  <button className="text-primary-600 hover:text-primary-700 text-sm">
                    View All →
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(user.joined).toLocaleDateString()}
                        </p>
                        <button className="mt-2 text-primary-600 hover:text-primary-700 text-sm">
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md mt-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">Verify Companies</span>
                    </div>
                    <span className="text-primary-600">→</span>
                  </button>

                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">View Analytics</span>
                    </div>
                    <span className="text-primary-600">→</span>
                  </button>

                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">Monitor System</span>
                    </div>
                    <span className="text-primary-600">→</span>
                  </button>

                  <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors">
                    <div className="flex items-center">
                      <Filter className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">Content Moderation</span>
                    </div>
                    <span className="text-primary-600">→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-md mt-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
                <div className="space-y-4">
                  {[
                    { service: 'API Server', status: 'operational', uptime: '99.9%' },
                    { service: 'Database', status: 'operational', uptime: '99.8%' },
                    { service: 'Email Service', status: 'operational', uptime: '99.7%' },
                    { service: 'File Storage', status: 'degraded', uptime: '95.2%' }
                  ].map((system, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{system.service}</p>
                        <p className="text-sm text-gray-500">Uptime: {system.uptime}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        system.status === 'operational' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {system.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
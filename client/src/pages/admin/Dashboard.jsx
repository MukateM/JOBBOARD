import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export const AdminDashboard = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchPendingJobs();
  }, [filter]);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'pending' 
        ? '/admin/jobs/pending' 
        : `/admin/jobs?status=${filter}`;
      
      const response = await axios.get(`${API_URL}${endpoint}`);
      
      if (response.data.success) {
        setPendingJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    if (!confirm('Are you sure you want to approve this job?')) return;

    try {
      const response = await axios.put(`${API_URL}/admin/jobs/${jobId}/approve`);
      
      if (response.data.success) {
        alert('Job approved successfully!');
        fetchPendingJobs();
      }
    } catch (error) {
      console.error('Failed to approve job:', error);
      alert('Failed to approve job');
    }
  };

  const handleReject = async (jobId) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return; // User clicked cancel

    try {
      const response = await axios.put(`${API_URL}/admin/jobs/${jobId}/reject`, {
        reason
      });
      
      if (response.data.success) {
        alert('Job rejected');
        fetchPendingJobs();
      }
    } catch (error) {
      console.error('Failed to reject job:', error);
      alert('Failed to reject job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage job postings and applications
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending Jobs
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved Jobs
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected Jobs
            </button>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : pendingJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No {filter} jobs
            </h3>
            <p className="text-gray-600">
              There are no jobs with "{filter}" status at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {job.company?.logo_url && (
                        <img
                          src={job.company.logo_url}
                          alt={job.company.name}
                          className="h-16 w-16 object-contain rounded"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {job.company?.name} • {job.location}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{job.job_type}</span>
                          {job.salary_min && job.salary_max && (
                            <span>
                              {job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                            </span>
                          )}
                          <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-gray-700 line-clamp-2">
                      {job.description}
                    </p>
                  </div>

                  {filter === 'pending' && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleApprove(job.id)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(job.id)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                      <a
                        href={`/jobs/${job.id}`}
                        target="_blank"
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    job.status === 'approved' ? 'bg-green-100 text-green-800' :
                    job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    job.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
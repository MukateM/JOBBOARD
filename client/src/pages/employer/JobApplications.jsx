// client/src/pages/employer/JobApplications.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Briefcase,
  Award,
  TrendingUp,
  Target
} from 'lucide-react';
import api from '../../services/api';

export const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      if (response.data.success) {
        setJob(response.data.job);
      }
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/applications/job/${jobId}`);
      
      if (response.data.success) {
        setApplications(response.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err.response?.data?.error || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await api.patch(`/applications/${applicationId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        // Update local state
        setApplications(apps =>
          apps.map(app =>
            app.id === applicationId
              ? { ...app, status: newStatus }
              : app
          )
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update application status');
    }
  };

  // ✨ NEW: Get match score badge with color coding
  const getMatchScoreBadge = (score) => {
    if (score === null || score === undefined) {
      return (
        <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg">
          <Target className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-sm text-gray-600">No Score</span>
        </div>
      );
    }

    let bgColor, textColor, label, ringColor;
    
    if (score >= 80) {
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      label = 'Excellent Match';
      ringColor = 'ring-green-200';
    } else if (score >= 60) {
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-700';
      label = 'Good Match';
      ringColor = 'ring-blue-200';
    } else if (score >= 40) {
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-700';
      label = 'Fair Match';
      ringColor = 'ring-yellow-200';
    } else {
      bgColor = 'bg-orange-50';
      textColor = 'text-orange-700';
      label = 'Weak Match';
      ringColor = 'ring-orange-200';
    }

    return (
      <div className={`flex items-center px-3 py-2 ${bgColor} rounded-lg ring-2 ${ringColor}`}>
        <Target className={`h-4 w-4 mr-2 ${textColor}`} />
        <div className="flex items-center">
          <span className={`text-2xl font-bold ${textColor} mr-2`}>{score}</span>
          <div className="flex flex-col">
            <span className={`text-xs font-medium ${textColor}`}>{label}</span>
            <span className="text-xs text-gray-500">Match Score</span>
          </div>
        </div>
      </div>
    );
  };

  // ✨ NEW: Get progress bar for match score
  const getMatchScoreBar = (score) => {
    if (score === null || score === undefined) return null;

    let barColor;
    if (score >= 80) barColor = 'bg-green-500';
    else if (score >= 60) barColor = 'bg-blue-500';
    else if (score >= 40) barColor = 'bg-yellow-500';
    else barColor = 'bg-orange-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className={`${barColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-green-100 text-green-800'
    };

    const icons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      reviewing: <Eye className="h-3 w-3 mr-1" />,
      shortlisted: <TrendingUp className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
      hired: <CheckCircle className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    hired: applications.filter(a => a.status === 'hired').length
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/employer/dashboard')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
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
          <button
            onClick={() => navigate('/employer/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {job?.title || 'Job Applications'}
              </h1>
              <p className="text-gray-600 mt-2">
                {applications.length} total application{applications.length !== 1 ? 's' : ''} • Sorted by match score
              </p>
            </div>
            <Link
              to={`/jobs/${jobId}`}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <Eye className="h-5 w-5 mr-2" />
              View Job Posting
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-4">
            <p className="text-sm text-blue-600">Pending</p>
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
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
          <div className="bg-green-50 rounded-lg shadow-sm p-4">
            <p className="text-sm text-green-600">Hired</p>
            <p className="text-2xl font-bold text-green-600">{stats.hired}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('reviewing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'reviewing'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reviewing ({stats.reviewing})
            </button>
            <button
              onClick={() => setFilter('shortlisted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'shortlisted'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Shortlisted ({stats.shortlisted})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({stats.rejected})
            </button>
            <button
              onClick={() => setFilter('hired')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'hired'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hired ({stats.hired})
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600">
                {filter !== 'all'
                  ? `No ${filter} applications.`
                  : 'No one has applied to this job yet.'}
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start flex-1">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <User className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.profiles?.full_name || 'Applicant'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-sm text-gray-600 flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {application.profiles?.email || application.email}
                          </span>
                          {application.profiles?.phone && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600 flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {application.profiles.phone}
                              </span>
                            </>
                          )}
                          {application.profiles?.location && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {application.profiles.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* ✨ Match Score & Status - Right Side */}
                    <div className="flex flex-col items-end gap-3 ml-4">
                      {getMatchScoreBadge(application.ai_score)}
                      {getStatusBadge(application.status)}
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(application.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* ✨ Match Score Progress Bar */}
                  {application.ai_score !== null && application.ai_score !== undefined && (
                    <div className="mb-4">
                      {getMatchScoreBar(application.ai_score)}
                    </div>
                  )}

                  {/* Experience & Skills */}
                  {(application.experience_years || application.skills?.length > 0) && (
                    <div className="flex flex-wrap gap-4 mb-4">
                      {application.experience_years && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Award className="h-4 w-4 mr-1" />
                          {application.experience_years} years experience
                        </div>
                      )}
                      {application.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {application.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {application.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{application.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      View Details
                    </button>
                    
                    {application.status === 'pending' && (
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'reviewing')}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                      >
                        Mark as Reviewing
                      </button>
                    )}
                    
                    {(application.status === 'pending' || application.status === 'reviewing') && (
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                      >
                        Shortlist
                      </button>
                    )}
                    
                    {application.status === 'shortlisted' && (
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'hired')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Mark as Hired
                      </button>
                    )}
                    
                    {application.status !== 'rejected' && application.status !== 'hired' && (
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Application Details
                  </h2>
                  {/* ✨ Match Score in Modal */}
                  {getMatchScoreBadge(selectedApplication.ai_score)}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Applicant Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Applicant Information
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Name:</strong> {selectedApplication.profiles?.full_name}
                  </p>
                  <p className="text-gray-700">
                    <strong>Email:</strong> {selectedApplication.profiles?.email || selectedApplication.email}
                  </p>
                  {selectedApplication.profiles?.phone && (
                    <p className="text-gray-700">
                      <strong>Phone:</strong> {selectedApplication.profiles.phone}
                    </p>
                  )}
                  {selectedApplication.experience_years && (
                    <p className="text-gray-700">
                      <strong>Experience:</strong> {selectedApplication.experience_years} years
                    </p>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.cover_letter && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Cover Letter
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedApplication.cover_letter}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedApplication.skills?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {selectedApplication.qualifications?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Qualifications
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedApplication.qualifications.map((qual, idx) => (
                      <li key={idx} className="text-gray-700">{qual}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Links */}
              {(selectedApplication.linkedin_url || selectedApplication.portfolio_url) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Links
                  </h3>
                  <div className="space-y-2">
                    {selectedApplication.linkedin_url && (
                      <a
                        href={selectedApplication.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        LinkedIn Profile
                      </a>
                    )}
                    {selectedApplication.portfolio_url && (
                      <a
                        href={selectedApplication.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Change Status
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'reviewing')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Mark as Reviewing
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'shortlisted')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'hired')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Hire
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
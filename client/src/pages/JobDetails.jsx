import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Globe, 
  CheckCircle,
  Building,
  Calendar,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/jobs/${id}`);
        
        if (response.data.success) {
          setJob(response.data.job);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Failed to fetch job:', err);
        setError(err.response?.data?.error || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/apply/${id}` } });
      return;
    }
    navigate(`/apply/${id}`);
  };

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return 'Negotiable';
    const min = job.salary_min?.toLocaleString();
    const max = job.salary_max?.toLocaleString();
    return `K ${min} - ${max}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Browse Jobs
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
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Jobs
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <Building className="h-5 w-5 mr-2" />
                  <span className="font-medium">{job.companies?.name || 'Company'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{job.location}</span>
                  {job.remote_ok && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Remote
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <button
                onClick={handleApply}
                disabled={applied}
                className={`px-6 py-3 rounded-lg font-semibold ${applied 
                  ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                  : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {applied ? (
                  <span className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Applied
                  </span>
                ) : (
                  'Apply Now'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Overview */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Job Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Job Details</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-medium capitalize">{job.job_type?.replace('-', ' ')}</p>
                  </div>
                </div>

                {(job.salary_min || job.salary_max) && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Salary</p>
                      <p className="font-medium">{formatSalary()}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Experience Level</p>
                    <p className="font-medium capitalize">{job.experience_level}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Posted</p>
                    <p className="font-medium">{formatDate(job.published_at || job.created_at)}</p>
                  </div>
                </div>

                {job.remote_ok && (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Work Type</p>
                      <p className="font-medium">Remote Friendly</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits Card */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Benefits</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Company Card */}
            {job.companies && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">About the Company</h3>
                <div className="flex items-start mb-4">
                  {job.companies.logo_url ? (
                    <img 
                      src={job.companies.logo_url} 
                      alt={job.companies.name}
                      className="w-12 h-12 rounded-lg mr-4 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                      <Building className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{job.companies.name}</h4>
                    {job.companies.description && (
                      <p className="text-sm text-gray-600 mt-1">{job.companies.description}</p>
                    )}
                    {job.companies.website && (
                      <a 
                        href={job.companies.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application CTA */}
        {!applied && (
          <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Apply?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              This is your chance to join an amazing team and advance your career.
            </p>
            <button
              onClick={handleApply}
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Apply Now
            </button>
            <p className="mt-4 text-sm text-primary-100">
              {isAuthenticated ? 'Your profile will be submitted automatically.' : 'You need to sign in to apply.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
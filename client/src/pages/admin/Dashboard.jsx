// client/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Building2, Star, Calendar } from 'lucide-react';
import { supabase } from '../../config/supabase';

export const AdminDashboard = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [pendingPartners, setPendingPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    fetchPendingJobs();
    fetchPendingPartners();
  }, [filter]);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('job_listings')
        .select(`
          *,
          companies (name, logo_url, contact_email)
        `)
        .order('created_at', { ascending: true });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      } else {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPendingJobs(data || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPartners = async () => {
    try {
      setPartnersLoading(true);
      
      const { data, error } = await supabase
        .from('recruitment_partners')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setPendingPartners(data || []);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setPartnersLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    if (!confirm('Are you sure you want to approve this job?')) return;

    try {
      const { error } = await supabase
        .from('job_listings')
        .update({
          status: 'approved',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      alert('Job approved successfully!');
      fetchPendingJobs();
    } catch (error) {
      console.error('Failed to approve job:', error);
      alert('Failed to approve job');
    }
  };

  const handleReject = async (jobId) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return;

    try {
      const { error } = await supabase
        .from('job_listings')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      alert('Job rejected');
      fetchPendingJobs();
    } catch (error) {
      console.error('Failed to reject job:', error);
      alert('Failed to reject job');
    }
  };

  const handleApprovePartner = async (partnerId) => {
    const isFeatured = confirm('Make this a FEATURED listing? (They will be charged ZMW 5,000/month)');
    
    let featuredDuration = null;
    let featured_until = null;
    
    if (isFeatured) {
      const months = prompt('How many months of featured listing?', '1');
      if (!months) return;
      featuredDuration = parseInt(months);
      
      // Calculate featured_until date
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + featuredDuration);
      featured_until = futureDate.toISOString();
    }

    try {
      const { error } = await supabase
        .from('recruitment_partners')
        .update({
          status: 'approved',
          is_featured: isFeatured,
          featured_until: featured_until,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerId);

      if (error) throw error;

      alert(`Partner approved successfully!${isFeatured ? ' (Featured for ' + featuredDuration + ' months)' : ''}`);
      fetchPendingPartners();
    } catch (error) {
      console.error('Failed to approve partner:', error);
      alert('Failed to approve partner');
    }
  };

  const handleRejectPartner = async (partnerId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('recruitment_partners')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerId);

      if (error) throw error;

      alert('Partner application rejected');
      fetchPendingPartners();
    } catch (error) {
      console.error('Failed to reject partner:', error);
      alert('Failed to reject partner');
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
            Manage job postings and recruitment partners
          </p>
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex space-x-4 border-b pb-4">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Job Postings
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors relative ${
                activeTab === 'partners'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Recruitment Partners
              {pendingPartners.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {pendingPartners.length}
                </span>
              )}
            </button>
          </div>

          {/* Sub Tabs (for Jobs) */}
          {activeTab === 'jobs' && (
            <div className="flex space-x-4 mt-4">
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
          )}
        </div>

        {/* Content */}
        {activeTab === 'jobs' ? (
          loading ? (
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
                        {job.companies?.logo_url && (
                          <img
                            src={job.companies.logo_url}
                            alt={job.companies.name}
                            className="h-16 w-16 object-contain rounded"
                          />
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {job.companies?.name} • {job.location}
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
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </div>
                    )}
                  </div>

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
          )
        ) : (
          partnersLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading partners...</p>
            </div>
          ) : pendingPartners.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No pending partner applications
              </h3>
              <p className="text-gray-600">
                All recruitment partner applications have been reviewed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-500"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {partner.logo_url ? (
                          <img
                            src={partner.logo_url}
                            alt={partner.company_name}
                            className="h-16 w-16 object-contain rounded"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-orange-100 rounded flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-orange-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {partner.company_name}
                          </h3>
                          <p className="text-orange-600 font-medium mb-2">
                            {partner.specialty}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <strong>Contact:</strong> {partner.contact_person || 'N/A'}
                            </div>
                            <div>
                              <strong>Email:</strong> {partner.email}
                            </div>
                            <div>
                              <strong>Phone:</strong> {partner.phone}
                            </div>
                            {partner.years_in_business && (
                              <div>
                                <strong>Experience:</strong> {partner.years_in_business} years
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <strong className="text-sm text-gray-700">Description:</strong>
                            <p className="text-gray-700 mt-1">{partner.description}</p>
                          </div>

                          {partner.website_url && (
                            <a
                              href={partner.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-700 text-sm"
                            >
                              Visit Website →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleApprovePartner(partner.id)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectPartner(partner.id)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Applied {new Date(partner.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
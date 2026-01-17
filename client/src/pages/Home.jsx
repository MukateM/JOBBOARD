import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  Users, 
  TrendingUp,
  ArrowRight,
  Star
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useDebounce } from '../hooks/useDebounce';

export const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [recruitmentPartners, setRecruitmentPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedLocation = useDebounce(location, 500);

  useEffect(() => {
    fetchJobs();
  }, [debouncedSearch, debouncedLocation, remoteOnly, currentPage]);

  useEffect(() => {
    fetchRecruitmentPartners();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const limit = 6;
      const offset = (currentPage - 1) * limit;

      let query = supabase
        .from('job_listings')
        .select(`
          *,
          companies (name, logo_url)
        `, { count: 'exact' })
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
      }

      if (debouncedLocation) {
        query = query.ilike('location', `%${debouncedLocation}%`);
      }

      if (remoteOnly) {
        query = query.eq('remote_ok', true);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setJobs(data || []);
      setPagination({
        page: currentPage,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      });
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruitmentPartners = async () => {
    try {
      setPartnersLoading(true);
      
      const { data, error } = await supabase
        .from('recruitment_partners')
        .select('*')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .or(`featured_until.is.null,featured_until.gt.${new Date().toISOString()}`)
        .order('rating', { ascending: false })
        .limit(3);

      if (error) throw error;

      setRecruitmentPartners(data || []);
    } catch (error) {
      console.error('Failed to fetch recruitment partners:', error);
    } finally {
      setPartnersLoading(false);
    }
  };

  const formatSalary = (min, max, currency) => {
    if (!min && !max) return 'Negotiable';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `From ${currency} ${min.toLocaleString()}`;
    return `Up to ${currency} ${max.toLocaleString()}`;
  };

  const stats = [
    { label: "Active Jobs", value: pagination.total || 0, icon: Briefcase },
    { label: "Companies", value: "450+", icon: Building2 },
    { label: "Placements", value: "8.5K+", icon: Users },
    { label: "This Month", value: "350+", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Compact Hero + Search */}
      <div className="bg-gradient-to-br from-green-50 via-white to-orange-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Zambia's Leading Job Platform
              </h1>
              <p className="text-gray-600">
                Connecting skilled professionals with top employers
              </p>
            </div>
            
            {/* Inline Stats */}
            <div className="flex justify-center gap-8 mb-6 text-sm">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-orange-600" />
                    <span className="font-bold text-gray-900">{stat.value}</span>
                    <span className="text-gray-600 hidden sm:inline">{stat.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Compact Search */}
            <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Job title or keyword"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                </div>
                
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                </div>
                
                <button 
                  onClick={fetchJobs}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-md hover:bg-orange-700 font-medium whitespace-nowrap"
                >
                  Search
                </button>
              </div>
              
              <label className="flex items-center cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => {
                    setRemoteOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">Remote only</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Job Listings (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Latest Jobs</h2>
              <span className="text-sm text-gray-600">{pagination.total} positions</span>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-sm text-gray-600 mb-4">Try different keywords</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setLocation('');
                    setRemoteOnly(false);
                  }}
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block bg-white rounded-lg border-2 border-gray-200 hover:border-orange-400 p-5 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {job.title}
                          </h3>
                          <p className="text-gray-600">{job.companies?.name}</p>
                        </div>
                        {job.companies?.logo_url && (
                          <img
                            src={job.companies.logo_url}
                            alt={job.companies.name}
                            className="h-12 w-12 object-contain rounded ml-4"
                          />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}{job.remote_ok && ' • Remote'}
                        </span>
                        <span className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {job.job_type}
                        </span>
                        {(job.salary_min || job.salary_max) && (
                          <span className="text-green-700 font-semibold">
                            {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="mt-6 flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-md border border-gray-300 disabled:opacity-50 text-sm"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm">
                      Page {currentPage} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={currentPage === pagination.pages}
                      className="px-4 py-2 rounded-md border border-gray-300 disabled:opacity-50 text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Link to="/jobs" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                    View All Jobs →
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Right: Recruitment Partners Sidebar (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-orange-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Need Hiring Help?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Work with expert recruiters trusted by top companies
                </p>

                {partnersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recruitmentPartners.length === 0 ? (
                  <div className="bg-white rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600">No featured partners yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recruitmentPartners.map((partner) => (
                      <div key={partner.id} className="bg-white rounded-lg p-4 border border-orange-200">
                        <div className="flex items-start gap-3 mb-3">
                          {partner.logo_url ? (
                            <img 
                              src={partner.logo_url}
                              alt={partner.company_name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-orange-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                              {partner.company_name}
                            </h4>
                            {partner.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-semibold text-gray-700">
                                  {partner.rating}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {partner.specialty}
                        </p>
                        
                        <button className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 text-sm font-medium">
                          Contact
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Link 
                    to="/recruitment-partners"
                    className="text-orange-600 hover:text-orange-700 font-semibold text-sm inline-flex items-center"
                  >
                    View All Partners
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-orange-200">
                  <p className="text-xs text-gray-600 text-center mb-2">
                    Are you a recruitment agency?
                  </p>
                  <Link 
                    to="/list-consultancy"
                    className="block text-center text-orange-600 hover:text-orange-700 font-semibold text-sm"
                  >
                    Get Featured Here →
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to="/register?role=employer"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">Post a Job</span>
                    <ArrowRight className="h-4 w-4 text-gray-600" />
                  </Link>
                  <Link 
                    to="/register?role=applicant"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">Create Profile</span>
                    <ArrowRight className="h-4 w-4 text-gray-600" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
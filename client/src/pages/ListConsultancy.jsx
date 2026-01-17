// client/src/pages/ListConsultancy.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, Globe, MapPin, Users, CheckCircle, Upload } from 'lucide-react';
import { supabase } from '../config/supabase';

export const ListConsultancy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    specialty: '',
    description: '',
    website: '',
    address: '',
    contactPerson: '',
    registrationNumber: '',
    yearsInBusiness: '',
    teamSize: '1-10',
    linkedinUrl: '',
    facebookUrl: '',
    pricingModel: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Log the data being sent for debugging
      console.log('Submitting form data:', formData);
      
      const { data, error } = await supabase
        .from('recruitment_partners')
        .insert([formData]);

      if (data) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      console.error('Submit error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in being featured on ZedLink Careers. Our team will review your application and contact you within 2-3 business days.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to homepage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              List Your Recruitment Agency
            </h1>
            <p className="text-gray-600 mb-4">
              Join Zambia's growing job platform and connect with companies actively looking for recruitment services.
            </p>
            
            {/* Benefits */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Featured Listing Benefits:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Homepage visibility with premium placement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Direct contact from companies seeking recruitment services</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Company logo and ratings displayed</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Dedicated profile page with full business details</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> All applications are reviewed by our team. We'll contact you with pricing details after approval.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                {error}
              </div>
            )}

            {/* Company Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-orange-600" />
                Company Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Elite Recruitment Zambia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Upload your company logo</p>
                    <p className="text-xs text-gray-500">Recommended: 300x300px, PNG or JPG</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-3"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Or you can email your logo to zedlinkcareers@gmail.com after approval
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="PACRA Number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business
                    </label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="200+">200+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty *
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Executive Search, Recruitment, Healthcare Staffing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Tell us about your recruitment services, industries you specialize in, and what makes your agency unique..."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-orange-600" />
                Contact Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Full Name"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="contact@company.co.zm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="+260 XXX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Office location in Lusaka, Ndola, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://www.yourcompany.co.zm"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      name="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-600" />
                Business Details
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Model
                </label>
                <select
                  name="pricingModel"
                  value={formData.pricingModel}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select pricing model</option>
                  <option value="percentage">Percentage of Salary</option>
                  <option value="flat-fee">Flat Fee Per Placement</option>
                  <option value="retainer">Retainer + Success Fee</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-6 border-t">
              <p className="text-sm text-gray-600">
                * Required fields
              </p>
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
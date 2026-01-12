import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X,
  Briefcase
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    remoteOk: false,
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    category: ''
  });

  const [requirements, setRequirements] = useState([]);
  const [responsibilities, setResponsibilities] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [requirementInput, setRequirementInput] = useState('');
  const [responsibilityInput, setResponsibilityInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' }
  ];

  const categories = [
    { value: '', label: 'Select a category' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'design', label: 'Design' },
    { value: 'product', label: 'Product' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'customer-support', label: 'Customer Support' },
    { value: 'operations', label: 'Operations' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    if (responsibilityInput.trim()) {
      setResponsibilities([...responsibilities, responsibilityInput.trim()]);
      setResponsibilityInput('');
    }
  };

  const removeResponsibility = (index) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setBenefits([...benefits, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  const removeBenefit = (index) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        remoteOk: formData.remoteOk,
        requirements: requirements,
        responsibilities: responsibilities,
        benefits: benefits,
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        salaryCurrency: formData.salaryCurrency,
        categoryId: formData.category || null
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/jobs`, jobData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Job posted successfully! It will be reviewed by admin before going live.');
        navigate('/employer/dashboard');
      }
      
    } catch (error) {
      console.error('Failed to post job:', error);
      setError(
        error.response?.data?.error || 
        error.response?.data?.errors?.[0]?.msg ||
        'Failed to post job. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <Briefcase className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
              <p className="text-gray-600">Fill in the details to create your job listing</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., New York, NY or Remote"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="remoteOk"
                    checked={formData.remoteOk}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700">This is a remote position</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Description</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe the role, responsibilities, and what makes this job special..."
                  required
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Requirements</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Requirements
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 5+ years of React experience"
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {requirements.length > 0 && (
                <div className="space-y-2">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                      <span className="text-gray-700">{req}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Responsibilities */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Responsibilities</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Responsibilities
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={responsibilityInput}
                    onChange={(e) => setResponsibilityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Lead frontend architecture decisions"
                  />
                  <button
                    type="button"
                    onClick={addResponsibility}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {responsibilities.length > 0 && (
                <div className="space-y-2">
                  {responsibilities.map((resp, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                      <span className="text-gray-700">{resp}</span>
                      <button
                        type="button"
                        onClick={() => removeResponsibility(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Benefits</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Benefits
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Health insurance, 401k matching"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {benefits.length > 0 && (
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                      <span className="text-gray-700">{benefit}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Salary */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Salary Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="salaryCurrency"
                    value={formData.salaryCurrency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="ZMW">ZMW (K)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 80000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 120000"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Category</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Post Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
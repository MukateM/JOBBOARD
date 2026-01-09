import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Upload, Linkedin, Globe } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const applicationSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  experienceYears: z.number().min(0, 'Experience years must be positive'),
  qualifications: z.array(z.string()).min(1, 'Add at least one qualification'),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
  coverLetter: z.string().min(100, 'Cover letter must be at least 100 characters'),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal(''))
});

export const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qualificationInput, setQualificationInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      email: user?.email || '',
      qualifications: [],
      skills: []
    }
  });

  const qualifications = watch('qualifications') || [];
  const skills = watch('skills') || [];

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs/${id}`);
      if (response.data.success) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const addQualification = () => {
    if (qualificationInput.trim()) {
      const newQualifications = [...qualifications, qualificationInput.trim()];
      setValue('qualifications', newQualifications);
      setQualificationInput('');
    }
  };

  const removeQualification = (index) => {
    const newQualifications = qualifications.filter((_, i) => i !== index);
    setValue('qualifications', newQualifications);
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const newSkills = [...skills, skillInput.trim()];
      setValue('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setValue('skills', newSkills);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError('');
      
      const applicationData = {
        jobId: id,
        ...data,
        experienceYears: Number(data.experienceYears)
      };

      const response = await axios.post(`${API_URL}/applications`, applicationData);
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/applications');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-4">Your application has been successfully submitted.</p>
          <p className="text-gray-500">Redirecting to your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Apply for: {job.title}
          </h1>
          <p className="text-gray-600 mb-4">{job.companies.name} • {job.location}</p>
          <div className="prose max-w-none">
            <p className="text-gray-700">{job.description.substring(0, 200)}...</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Application Form
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <input
                {...register('experienceYears', { valueAsNumber: true })}
                type="number"
                min="0"
                step="1"
                className="input-field"
                placeholder="3"
              />
              {errors.experienceYears && (
                <p className="mt-1 text-sm text-red-600">{errors.experienceYears.message}</p>
              )}
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualifications *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={qualificationInput}
                  onChange={(e) => setQualificationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                  className="input-field"
                  placeholder="e.g., Bachelor's in Computer Science"
                />
                <button
                  type="button"
                  onClick={addQualification}
                  className="btn-secondary whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              
              {qualifications.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {qualifications.map((qual, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                    >
                      {qual}
                      <button
                        type="button"
                        onClick={() => removeQualification(index)}
                        className="hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {errors.qualifications && (
                <p className="mt-1 text-sm text-red-600">{errors.qualifications.message}</p>
              )}
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="input-field"
                  placeholder="e.g., JavaScript, React, Node.js"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-secondary whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {errors.skills && (
                <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
              )}
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Linkedin className="h-4 w-4 inline mr-2" />
                  LinkedIn Profile (Optional)
                </label>
                <input
                  {...register('linkedinUrl')}
                  type="url"
                  className="input-field"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                {errors.linkedinUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.linkedinUrl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-2" />
                  Portfolio URL (Optional)
                </label>
                <input
                  {...register('portfolioUrl')}
                  type="url"
                  className="input-field"
                  placeholder="https://yourportfolio.com"
                />
                {errors.portfolioUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.portfolioUrl.message}</p>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter *
                <span className="text-gray-500 text-sm font-normal ml-2">
                  Tell us why you're the perfect candidate (min. 100 characters)
                </span>
              </label>
              <textarea
                {...register('coverLetter')}
                rows={6}
                className="input-field resize-none"
                placeholder="Write your cover letter here..."
              />
              {errors.coverLetter && (
                <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3 text-lg"
              >
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
              <p className="text-center text-gray-500 text-sm mt-3">
                By submitting, you agree to our terms and confirm the information is accurate.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
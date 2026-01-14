import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Main Pages
import { Home } from './pages/Home';
import { JobDetails } from './pages/JobDetails';
import { ApplyJob } from './pages/ApplyJob';
import { Profile } from './pages/Profile';

// Employer Pages
import { EmployerDashboard } from './pages/employer/Dashboard';
import { PostJob } from './pages/employer/PostJob';
import { CompanySetup } from './pages/employer/CompanySetup';
import { JobApplications } from './pages/employer/JobApplications';

// Applicant Pages
import { MyApplications } from './pages/applicant/Applications';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              
              {/* Protected Applicant Routes */}
              <Route path="/apply/:id" element={
                <ProtectedRoute roles={['applicant']}>
                  <ApplyJob />
                </ProtectedRoute>
              } />
              <Route path="/applications" element={
                <ProtectedRoute roles={['applicant']}>
                  <MyApplications />
                </ProtectedRoute>
              } />
              
              {/* Protected Employer Routes */}
              <Route path="/employer/dashboard" element={
                <ProtectedRoute roles={['employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/employer/company-setup" element={<CompanySetup />} />
              <Route path="/employer/post-job" element={
                <ProtectedRoute roles={['employer']}>
                  <PostJob />
                </ProtectedRoute>
              } />
              <Route path="/employer/jobs/:jobId/applications" element={
                <ProtectedRoute roles={['employer']}>
                  <JobApplications />
                </ProtectedRoute>
              } />
              
              {/* Protected Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Profile Route */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Footer */}
          <footer className="bg-gray-900 text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold">ZedLink Careers</h3>
                  <p className="text-gray-400">Connecting talent with opportunity</p>
                </div>
                <div className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} ZedLink Careers. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
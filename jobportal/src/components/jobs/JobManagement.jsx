import { useState, useEffect } from "react";
import { jobsAPI } from "../../services/api";
import JobForm from "./JobForm";
import ApplicationManagement from "./ApplicationManagement";
import { MdEdit, MdDelete, MdPeople } from 'react-icons/md';
import "./JobManagement.css";

export default function JobManagement({ onBack }) {
  const [showPostForm, setShowPostForm] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplications: 0 });
  const [editingJob, setEditingJob] = useState(null);
  const [viewingApplications, setViewingApplications] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchStats();
    
    // Refresh jobs every 30 seconds to get updated application counts
    const interval = setInterval(() => {
      fetchJobs();
      fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getMyJobs();

      setJobs(response.results || response);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await jobsAPI.getJobStats();
      setStats(response);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowPostForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await jobsAPI.deleteJob(jobId);
        setJobs(jobs.filter(job => job.id !== jobId));
        fetchStats();
      } catch (err) {
        alert('Error deleting job: ' + err.message);
      }
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const formData = new FormData();
      formData.append('is_active', newStatus);
      await jobsAPI.updateJob(jobId, formData);
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, is_active: newStatus } : job
      ));
      fetchStats();
    } catch (err) {
      alert('Error updating job status: ' + err.message);
    }
  };

  const handleJobSubmit = () => {
    setShowPostForm(false);
    setEditingJob(null);
    fetchJobs();
    fetchStats();
  };

  const handleViewApplications = (jobId) => {
    setViewingApplications(jobId);
  };

  const handleBackFromApplications = () => {
    setViewingApplications(null);
  };

  const mapJobType = (backendType) => {
    const typeMap = {
      'fulltime': 'Full time',
      'parttime': 'Part time', 
      'intern': 'Intern'
    };
    return typeMap[backendType] || backendType;
  };

  const mapWorkMode = (backendMode) => {
    const modeMap = {
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'onsite': 'On-site'
    };
    return modeMap[backendMode] || backendMode;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (viewingApplications) {
    return (
      <ApplicationManagement 
        jobId={viewingApplications} 
        onBack={handleBackFromApplications} 
      />
    );
  }

  return (
    <div className="job-management">
      <div className="job-management-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>Job Management</h1>
        <button className="post-job-btn" onClick={() => setShowPostForm(true)}>
          + Post New Job
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-number">{stats.total_jobs || 0}</div>
          <div className="stat-label">TOTAL JOBS POSTED</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.active_jobs || 0}</div>
          <div className="stat-label">ACTIVE JOBS</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.total_applications || 0}</div>
          <div className="stat-label">TOTAL APPLICATIONS</div>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <p>Loading your jobs...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchJobs}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="jobs-section">
          <h2>Your Posted Jobs</h2>
          {jobs.map(job => {
            const jobType = mapJobType(job.job_type);
            const workMode = mapWorkMode(job.work_mode);
            
            return (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-title-section">
                    <h3>{job.title}</h3>
                    <div className="status-toggle">
                      <span className="status-label">{job.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={job.is_active}
                          onChange={() => handleToggleStatus(job.id, job.is_active)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  <div className="job-actions">
                    <button 
                      className="view-applications-btn"
                      onClick={() => handleViewApplications(job.id)}
                    >
                      <MdPeople />
                    </button>
                    <button className="edit-btn" onClick={() => handleEdit(job)}>
                      <MdEdit />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(job.id)}>
                      <MdDelete />
                    </button>
                  </div>
                </div>
                
                <div className="job-details">
                  <div className="job-info">
                    <span className="location">📍 {job.location || 'Not specified'}</span>
                    <span className="experience">💼 {job.experience || 'Any level'}</span>
                    <span className="salary">💰 {job.salary || 'Not specified'}</span>
                    <span className="work-mode">🏠 {workMode}</span>
                    <span className="job-type">⏰ {jobType}</span>
                  </div>
                  <p className="job-description" style={{color: '#666'}}>{job.description}</p>
                  {job.requirments && (
                    <div className="job-requirements">
                      <strong>Requirements:</strong> {job.requirments}
                    </div>
                  )}
                  <div className="job-footer">
                    <span className="posted-date">Posted: {formatDate(job.created_at)}</span>
                    <span className="applications-count">{job.count || 0} applications</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {jobs.length === 0 && (
            <div className="no-jobs">
              <div className="no-jobs-icon">📝</div>
              <h3>No jobs posted yet</h3>
              <p>Start by posting your first job to attract talented candidates.</p>
            </div>
          )}
        </div>
      )}

      {showPostForm && (
        <JobForm 
          job={editingJob}
          onSave={handleJobSubmit}
          onCancel={() => {
            setShowPostForm(false);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
}
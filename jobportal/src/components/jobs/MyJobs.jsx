import { useState, useEffect } from "react";
import { jobsAPI } from "../../services/api";

export default function MyJobs({ onEdit, onDelete }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getMyJobs();
      setJobs(response.results || response);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsAPI.deleteJob(jobId);
        setJobs(prev => prev.filter(job => job.id !== jobId));
      } catch (err) {
        alert('Error deleting job: ' + err.message);
      }
    }
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

  const getStatusBadge = (status) => {
    const statusClass = {
      'active': 'status-active',
      'paused': 'status-paused',
      'closed': 'status-closed'
    };
    return statusClass[status] || 'status-active';
  };

  if (loading) {
    return (
      <div className="my-jobs-container">
        <div className="loading-state">
          <p>Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-jobs-container">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchMyJobs}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-jobs-container">
      <div className="my-jobs-header">
        <h2>My Job Postings</h2>
        <p className="jobs-count">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
      </div>

      <div className="my-jobs-list">
        {jobs.map((job) => {
          const jobType = mapJobType(job.job_type);
          const workMode = mapWorkMode(job.work_mode);
          const publisherName = `${job.publisher?.first_name || ''} ${job.publisher?.last_name || ''}`.trim();
          
          return (
            <div key={job.id} className="my-job-card">
              <div className="job-card-header">
                <div className="job-info">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-company">{publisherName || 'Your Company'}</p>
                  <div className="job-meta">
                    <span className="job-location">📍 {job.location || 'Location not specified'}</span>
                    <span className="job-type">{jobType} • {workMode}</span>
                    <span className="job-posted">Posted: {formatDate(job.created_at)}</span>
                  </div>
                </div>
                <div className="job-actions">
                  <span className={`status-badge ${getStatusBadge(job.is_active ? 'active' : 'inactive')}`}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="action-buttons">
                    <button 
                      className="edit-btn"
                      onClick={() => onEdit(job)}
                      title="Edit Job"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(job.id)}
                      title="Delete Job"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              <div className="job-stats">
                <div className="stat-item">
                  <span className="stat-number">{job.count || 0}</span>
                  <span className="stat-label">Applications</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{job.salary ? '💰' : '-'}</span>
                  <span className="stat-label">Salary</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{job.experience || 'Any'}</span>
                  <span className="stat-label">Experience</span>
                </div>
              </div>

              <p className="job-description">{job.description}</p>

              <div className="job-card-footer">
                <button 
                  className="view-applicants-btn"
                  onClick={() => setSelectedJob(job)}
                >
                  View Applications ({job.count || 0})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {jobs.length === 0 && (
        <div className="no-jobs">
          <div className="no-jobs-icon">📝</div>
          <h3>No jobs posted yet</h3>
          <p>Start by posting your first job to attract talented candidates.</p>
        </div>
      )}
    </div>
  );
}
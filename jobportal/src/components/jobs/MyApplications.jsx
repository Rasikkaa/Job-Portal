import { useState, useEffect } from "react";
import { jobsAPI } from "../../services/api";
import "./JobManagement.css";

export default function MyApplications({ onBack }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getMyApplications();
      setApplications(response.results || response);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => 
    selectedStatus === "all" || app.status === selectedStatus
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'submitted': 'status-submitted',
      'reviewing': 'status-reviewing', 
      'shortlisted': 'status-shortlisted',
      'rejected': 'status-rejected',
      'hired': 'status-hired'
    };
    return statusClasses[status] || 'status-submitted';
  };

  if (loading) {
    return (
      <div className="job-management">
        <div className="loading-state">
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-management">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchApplications}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-management">
      <div className="job-management-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>My Applications</h1>
        <div className="status-filter">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: '#fff'
            }}
          >
            <option value="all">All Applications</option>
            <option value="submitted">Submitted</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      <div className="jobs-section">
        <h2>Your Applications ({filteredApplications.length})</h2>
        {filteredApplications.map(application => (
          <div key={application.id} className="job-card">
            <div className="job-header">
              <div className="job-title-section">
                <h3>{application.job?.title}</h3>
                <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                  {application.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="job-details">
              <div className="job-info">
                <span className="posted-date">Applied: {formatDate(application.applied_at)}</span>
                <span className="company">Company: {application.job?.publisher_name}</span>
              </div>
              <div className="application-content">
                <p><strong>Cover Letter:</strong></p>
                <p className="cover-text">{application.cover_text}</p>
                {application.resume_url && (
                  <div className="resume-section">
                    <a 
                     href={`http://localhost:8000${application.resume_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resume-link"
                    >
                      📄 View Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredApplications.length === 0 && (
          <div className="no-jobs">
            <div className="no-jobs-icon">📋</div>
            <h3>No applications found</h3>
            <p>You haven't applied to any jobs yet or no applications match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
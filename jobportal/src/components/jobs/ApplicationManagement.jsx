import { useState, useEffect } from "react";
import { jobsAPI } from "../../services/api";
import "./JobManagement.css";

export default function ApplicationManagement({ jobId, onBack }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchApplications();
    }
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJobApplications(jobId);
      setApplications(response.results || response);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await jobsAPI.updateApplicationStatus(applicationId, { status });
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      alert('Error updating status: ' + err.message);
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
      <div className="applications-layout">
        <div className="loading-state">
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-layout">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchApplications}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-layout">
      <div className="applications-header">
        <button className="back-btn" onClick={onBack}>← Back to Jobs</button>
        <h2>Job Applications</h2>
      </div>
      
      <div className="applications-content">
        {/* Sidebar - Applications List */}
        <div className="applications-sidebar">
          <div className="applications-list-header">
            <h3>Applications ({filteredApplications.length})</h3>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-filter-select"
            >
              <option value="all">All</option>
              <option value="submitted">Submitted</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>
          
          <div className="applications-list">
            {filteredApplications.map(application => (
              <div 
                key={application.id} 
                className={`application-list-item ${selectedApplication?.id === application.id ? 'selected' : ''}`}
                onClick={() => setSelectedApplication(application)}
              >
                <div className="applicant-summary">
                  <img 
                    src={application.applicant?.profile_image ? 
                      `http://localhost:8000${application.applicant.profile_image}` : 
                      `https://ui-avatars.io/api/?name=${application.applicant?.first_name}+${application.applicant?.last_name}&background=0891b2&color=fff`
                    } 
                    alt="Profile" 
                    className="applicant-avatar-small"
                  />
                  <div className="applicant-info">
                    <h4>{application.applicant?.first_name} {application.applicant?.last_name}</h4>
                    <p className="applicant-email">{application.applicant?.email}</p>
                    <div className="applicant-meta">
                      <span className={`status-badge-small ${getStatusBadgeClass(application.status)}`}>
                        {application.status}
                      </span>
                      <span className="applied-date-small">{formatDate(application.applied_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredApplications.length === 0 && (
              <div className="no-applications">
                <p>No applications found</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Area - Application Details */}
        <div className="applications-main">
          {selectedApplication ? (
            <ApplicationDetail 
              application={selectedApplication} 
              onStatusUpdate={updateApplicationStatus}
            />
          ) : (
            <div className="no-application-selected">
              <h3>Select an application to view details</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Application Detail Component
function ApplicationDetail({ application, onStatusUpdate }) {
  return (
    <div className="application-detail-container">
      <div className="applicant-header">
        <div className="applicant-profile">
          <img 
            src={application.applicant?.profile_image ? 
              `http://localhost:8000${application.applicant.profile_image}` : 
              `https://ui-avatars.io/api/?name=${application.applicant?.first_name}+${application.applicant?.last_name}&background=0891b2&color=fff`
            } 
            alt="Profile" 
            className="applicant-avatar-large"
          />
          <div className="applicant-basic-info">
            <h2>{application.applicant?.first_name} {application.applicant?.last_name}</h2>
            <p className="applicant-email">{application.applicant?.email}</p>
            <p className="applicant-role">{application.applicant?.job_role}</p>
          </div>
        </div>
        <div className="application-status-section">
          <select 
            value={application.status}
            onChange={(e) => onStatusUpdate(application.id, e.target.value)}
            className="status-select-large"
          >
            <option value="submitted">Submitted</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>
      
      <div className="applicant-details-grid">
        <div className="detail-card">
          <h4>Contact Information</h4>
          <p><strong>Phone:</strong> {application.applicant?.phone || 'Not provided'}</p>
          <p><strong>Location:</strong> {application.applicant?.location || 'Not specified'}</p>
          <p><strong>Experience:</strong> {application.applicant?.experience_years || 0} years</p>
        </div>
        
        {application.applicant?.skills && application.applicant.skills.length > 0 && (
          <div className="detail-card">
            <h4>Skills</h4>
            <div className="skills-grid">
              {application.applicant.skills.map((skill, index) => (
                <span key={index} className="skill-badge">{skill}</span>
              ))}
            </div>
          </div>
        )}
        
        {application.applicant?.bio && (
          <div className="detail-card full-width">
            <h4>Bio</h4>
            <p className="bio-content">{application.applicant.bio}</p>
          </div>
        )}
        
        <div className="detail-card full-width">
          <h4>Cover Letter</h4>
          <p className="cover-content">{application.cover_text}</p>
        </div>
        
        {application.resume_url && (
          <div className="detail-card">
            <h4>Resume</h4>
            <a 
              href={`http://localhost:8000${application.resume_url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="resume-download-btn"
            >
              📄 Download Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
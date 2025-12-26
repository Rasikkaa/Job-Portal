import { useState, useEffect } from "react";
import { jobsAPI } from "../../services/api";
import ApplicationForm from "./ApplicationForm";

export default function JobDetail({ job, isEmployee, user }) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationError, setApplicationError] = useState(null);
  const [checkingApplication, setCheckingApplication] = useState(false);

  const getJobTypeBadgeClass = (jobType) => {
    switch (jobType) {
      case "Full time": return "job-type-fulltime";
      case "Part time": return "job-type-parttime";
      case "Intern": return "job-type-intern";
      default: return "job-type-fulltime";
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

  const canApply = () => {
    if (!user) return false;
    
    // Only employees and employers can apply
    if (!['employee', 'employer'].includes(user.job_role)) return false;
    
    // Cannot apply to own job
    if (job?.publisher?.id === user.id) return false;
    
    return true;
  };

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!job || !user || !canApply()) {
        setApplied(false);
        return;
      }

      try {
        setCheckingApplication(true);
        const applications = await jobsAPI.getMyApplications();
        const hasApplied = applications.some(app => app.job.id === job.id);
        setApplied(hasApplied);
      } catch (error) {
        console.error('Error checking application status:', error);
      } finally {
        setCheckingApplication(false);
      }
    };

    checkApplicationStatus();
  }, [job?.id, user?.id]);

  if (!job) {
    return (
      <div className="job-detail-container">
        <div className="no-job-selected">
          <h3>Select a job to view details</h3>
        </div>
      </div>
    );
  }

  const handleApplicationSuccess = () => {
    setApplied(true);
    setShowApplicationForm(false);
    setApplicationError(null);
    // Update job count locally
    if (job) {
      job.count = (job.count || 0) + 1;
    }
  };

  const jobType = mapJobType(job.job_type);
  const workMode = mapWorkMode(job.work_mode);
  const publisherName = `${job.publisher?.first_name || ''} ${job.publisher?.last_name || ''}`.trim();

  return (
    <div className="job-detail-container">
      <div className="job-detail-header">
        <div className="job-title-section">
          <div>
            <h1 className="job-detail-title">{job.title}</h1>
            <p className="job-detail-company">
              <span className="company-icon">🏢</span>
              {job.company_name ||'Company name'}
            </p>
          </div>
          {job.company_name && (
            <p className="job-publisher-info" style={{color: '#666', fontSize: '14px', alignSelf: 'flex-start'}}>
              Posted by: {publisherName}
            </p>
          )}
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-detail-main">
          <div className="job-overview-card">
            <h3>Job Overview</h3>
            <div className="overview-grid">
              <div className="overview-item">
                <span className="overview-label">Job Type</span>
                <span className={`job-type-badge ${getJobTypeBadgeClass(jobType)}`}>
                  {jobType}
                </span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Experience</span>
                <span className="overview-value">{job.experience || 'Not specified'}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Location</span>
                <span className="overview-value">{job.location || 'Not specified'}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Work Mode</span>
                <span className="overview-value">{workMode}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Salary</span>
                <span className="overview-value">{job.salary || 'Not specified'}</span>
              </div>
            </div>
          </div>

         
          <div className="job-section-card">
            <h3>Job Description</h3>
            <p style={{color: '#666', fontSize: '14px', lineHeight: '1.6'}}>{job.description}</p>
          </div>


          {job.requirments && (
            <div className="job-section-card">
              <h3>Requirements</h3>
              <div className="job-requirements">
                <p>{job.requirments}</p>
              </div>
            </div>
          )}
        </div>

        <div className="job-detail-sidebar">
          {canApply() && (
            <div className="apply-card">
              {applicationError && (
                <div className="error-message">
                  {applicationError}
                </div>
              )}
              {checkingApplication ? (
                <button className="apply-btn" disabled>
                  Checking...
                </button>
              ) : applied ? (
                <button className="apply-btn applied" disabled>
                  ✓ Already Applied
                </button>
              ) : (
                <button 
                  className="apply-btn" 
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply Now
                </button>
              )}
            </div>
          )}
          
          {!canApply() && user && (
            <div className="apply-card">
              <div className="cannot-apply">
                {user.job_role === 'company' ? (
                  <p>Companies cannot apply for jobs</p>
                ) : job.publisher?.id === user.id ? (
                  <p>You cannot apply to your own job posting</p>
                ) : (
                  <p>You cannot apply for this job</p>
                )}
              </div>
            </div>
          )}

          <div className="company-info-card">
            <h4>About {job.company_name || publisherName || 'Company'}</h4>
            <div className="company-stats">
              <div className="stat-item">
                <span className="stat-number">{job.count || 0}</span>
                <span className="stat-label">Applications</span>
              </div>
            </div>
          </div>


        </div>
      </div>
      
      {showApplicationForm && (
        <ApplicationForm 
          job={job}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
}
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { jobsAPI } from "../../services/api";
import JobList from "./JobList";
import JobDetail from "./JobDetail";
import JobForm from "./JobForm";
import MyJobs from "./MyJobs";
import JobManagement from "./JobManagement";
import MyApplications from "./MyApplications";
import "./Jobs.css";

const Jobs = forwardRef(({ user }, ref) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [editingJob, setEditingJob] = useState(null);

  const userRole = user?.job_role || user?.role || 'employee';
  const isPublisher = userRole === 'employer' || userRole === 'company';
  const isEmployee = userRole === 'employee';

  const handleJobSelect = async (job) => {
    setSelectedJob(job);
    setViewMode('details');
    
    // Fetch full job details
    try {
      setLoadingJobDetails(true);
      const jobDetails = await jobsAPI.getJobDetail(job.id);
      setSelectedJobDetails(jobDetails);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setSelectedJobDetails(job); // Fallback to list data
    } finally {
      setLoadingJobDetails(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedJob(null);
    setSelectedJobDetails(null);
    setEditingJob(null);
  };

  const handlePostJob = () => {
    setViewMode('form');
    setEditingJob(null);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setViewMode('form');
  };



  const handleJobSubmit = () => {
    setViewMode('management');
    setEditingJob(null);
  };

  const handleViewMyJobs = () => {
    setViewMode('management');
  };

  const handleViewMyApplications = () => {
    setViewMode('applications');
  };

  useImperativeHandle(ref, () => ({
    handleViewMyJobs,
    handleViewMyApplications
  }));

  if (viewMode === 'management') {
    return <JobManagement onBack={handleBackToList} />;
  }

  if (viewMode === 'applications') {
    return <MyApplications onBack={handleBackToList} />;
  }

  if (viewMode === 'form') {
    return (
      <div className="jobs-full-list">
        <JobForm 
          onSubmit={handleJobSubmit}
          onCancel={handleBackToList}
          initialData={editingJob}
        />
      </div>
    );
  }

  if (viewMode === 'myJobs') {
    return (
      <div className="jobs-layout">
        <div className="jobs-header-nav">
          <button className="back-to-list-btn" onClick={handleBackToList}>
            ← Back to Jobs
          </button>
        </div>
        <div className="jobs-content-full">
          <MyJobs 
            onEdit={handleEditJob}
          />
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="jobs-full-list">
        <JobList 
          onJobSelect={handleJobSelect}
          isPublisher={isPublisher}
          isEmployee={isEmployee}
          user={user}
        />
      </div>
    );
  }

  return (
    <div className="jobs-layout">
      <div className="jobs-header-nav">
        <button className="back-to-list-btn" onClick={handleBackToList}>
          ← Back to Jobs
        </button>
        <div className="nav-right">
          {isPublisher && (
            <button className="manage-jobs-btn" onClick={handleViewMyJobs}>
              Manage My Jobs
            </button>
          )}
          {(isEmployee || user?.job_role === 'employer') && (
            <button className="manage-jobs-btn" onClick={handleViewMyApplications}>
              My Applications
            </button>
          )}
        </div>
      </div>
      <div className="jobs-content">
        <div className="jobs-sidebar">
          <JobList 
            onJobSelect={handleJobSelect} 
            selectedJobId={selectedJob?.id}
            isPublisher={isPublisher}
            isEmployee={isEmployee}
            onViewMyJobs={handleViewMyJobs}
            onViewMyApplications={handleViewMyApplications}
            user={user}
          />
        </div>
        <div className="jobs-main">
          {loadingJobDetails ? (
            <div className="loading-job-details">
              <p>Loading job details...</p>
            </div>
          ) : (
            <JobDetail job={selectedJobDetails} isEmployee={isEmployee} user={user} />
          )}
        </div>
      </div>
    </div>
  );
});

export default Jobs;
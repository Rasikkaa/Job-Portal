import { useState, useEffect } from "react";
import { jobsAPI } from "../../services/api";

export default function JobList({ onJobSelect, selectedJobId, isPublisher, isEmployee, user, onViewMyJobs, onViewMyApplications, showNavButtons = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJobs();
      setJobs(response.results || response);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
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

  const filters = ["All", "Full time", "Part time", "Intern"];

  const formatTimeAgo = (hoursAgo) => {
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    const days = Math.floor(hoursAgo / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  const filteredJobs = jobs.filter(job => {
    const jobType = mapJobType(job.job_type);
    const publisherName = `${job.publisher?.first_name || ''} ${job.publisher?.last_name || ''}`.trim();
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         publisherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || jobType === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getJobTypeBadgeClass = (jobType) => {
    switch (jobType) {
      case "Full time": return "job-type-fulltime";
      case "Part time": return "job-type-parttime";
      case "Intern": return "job-type-intern";
      default: return "job-type-fulltime";
    }
  };

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <div className="header-left">
          <h2>Available Jobs</h2>
          <p className="job-count">{filteredJobs.length} results</p>
        </div>
        {showNavButtons && (
          <div className="nav-right">
            {(isPublisher || user?.job_role === 'employer') && (
              <button className="manage-jobs-btn" onClick={onViewMyJobs}>
                Manage My Jobs
              </button>
            )}
            {(isEmployee || user?.job_role === 'employer') && (
              <button className="manage-jobs-btn" onClick={onViewMyApplications}>
                My Applications
              </button>
            )}
          </div>
        )}
      </div>

      <div className="job-list-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search jobs or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          {filters.map(filter => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <p>Loading jobs...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchJobs}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="job-list">
          {filteredJobs.map((job) => {
            const jobType = mapJobType(job.job_type);
            const workMode = mapWorkMode(job.work_mode);
            const publisherName = `${job.publisher?.first_name || ''} ${job.publisher?.last_name || ''}`.trim();
            const timeAgo = new Date(job.created_at);
            const hoursAgo = Math.floor((Date.now() - timeAgo.getTime()) / (1000 * 60 * 60));
            
            return (
              <div 
                key={job.id} 
                className={`job-list-item ${selectedJobId === job.id ? 'selected' : ''}`}
                onClick={() => onJobSelect(job)}
              >
                <div className="job-item-header">
                  <h3 className="job-item-title">{job.title}</h3>
                  <span className={`job-type-badge ${getJobTypeBadgeClass(jobType)}`}>
                    {jobType}
                  </span>
                </div>
                
                <p className="job-item-company">{job.company_name || 'Company name'}</p>
                <p className="job-item-location">📍 {job.location || 'Location not specified'} • {workMode}</p>
                
                <div className="job-item-meta">
                  <span className="job-item-salary">{job.salary || 'Salary not specified'}</span>
                  <span className="job-item-posted">{formatTimeAgo(hoursAgo)}</span>
                </div>
                
                <p className="job-item-description">{job.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && filteredJobs.length === 0 && (
        <div className="no-jobs">
          <div className="no-jobs-icon">🔍</div>
          <h3>No jobs found</h3>
          <p>Try adjusting your search or filters to find more jobs.</p>
        </div>
      )}
    </div>
  );
}
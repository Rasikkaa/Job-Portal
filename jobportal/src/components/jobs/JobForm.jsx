import { useState } from "react";
import { jobsAPI } from "../../services/api";
import "./JobForm.css";

export default function JobForm({ job, onSave, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!job;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.target);
    
    try {
      if (isEdit) {
        await jobsAPI.updateJob(job.id, formData);
      } else {
        await jobsAPI.createJob(formData);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="job-form-modal">
        <div className="job-form-header">
          <h2>{isEdit ? 'Edit Job' : 'Post New Job'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-row">
            <div className="form-group">
              <label>Job Title *</label>
              <input 
                type="text" 
                name="title" 
                defaultValue={job?.title || ''} 
                required 
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div className="form-group">
              <label>Job Type *</label>
              <select name="job_type" defaultValue={job?.job_type || 'fulltime'} required>
                <option value="fulltime">Full time</option>
                <option value="parttime">Part time</option>
                <option value="intern">Intern</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Experience Required</label>
              <input 
                type="text" 
                name="experience" 
                defaultValue={job?.experience || ''} 
                placeholder="e.g. 2-3 years"
              />
            </div>
            <div className="form-group">
              <label>Work Mode *</label>
              <select name="work_mode" defaultValue={job?.work_mode || 'onsite'} required>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text" 
                name="location" 
                defaultValue={job?.location || ''} 
                placeholder="e.g. New York, NY"
              />
            </div>
            <div className="form-group">
              <label>Salary Range</label>
              <input 
                type="text" 
                name="salary" 
                defaultValue={job?.salary || ''} 
                placeholder="e.g. $70,000 - $90,000"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea 
              name="description" 
              defaultValue={job?.description || ''} 
              required 
              rows="3"
              placeholder="Brief description of the job role..."
            />
          </div>

          <div className="form-group">
            <label>Requirements</label>
            <textarea 
              name="requirments" 
              defaultValue={job?.requirments || ''} 
              rows="4"
              placeholder="Skills, qualifications, and experience required..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Job' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
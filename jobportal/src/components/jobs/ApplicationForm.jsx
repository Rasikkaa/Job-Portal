import { useState } from "react";
import { jobsAPI } from "../../services/api";
import "./JobForm.css";

export default function ApplicationForm({ job, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    
    try {
      await jobsAPI.applyJob(job.id, formData);
      onSuccess();
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
          <h2>Apply for {job.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-group">
            <label>Resume *</label>
            <input 
              type="file" 
              name="resume" 
              required 
              accept=".pdf,.doc,.docx"
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: '#fff',
                fontSize: '14px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div className="form-group">
            <label>Cover Letter *</label>
            <textarea 
              name="cover_text" 
              required 
              rows="6"
              placeholder="Tell us why you're interested in this position..."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
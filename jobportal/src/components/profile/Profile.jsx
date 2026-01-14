import { useState } from 'react';
import { authAPI } from '../../services/api';
import './Profile.css';

export default function Profile({ user, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Different form data based on user role
  const [formData, setFormData] = useState(() => {
    if (user?.job_role === 'company') {
      return {
        company_name: user?.company_name || '',
        company_phone: user?.company_phone || '',
        company_website: user?.company_website || '',
        company_address: user?.company_address || '',
        company_description: user?.company_description || '',
        company_logo: null
      };
    } else {
      return {
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || '',
        skills: user?.skills || [],
        experience_years: user?.experience_years || 0,
        company_name: user?.company_name || '',
        profile_image: null
      };
    }
  });
  
  const [skillInput, setSkillInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const fieldName = user?.job_role === 'company' ? 'company_logo' : 'profile_image';
    setFormData(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
  };

  const handleDeleteImage = async () => {
    if (window.confirm('Are you sure you want to delete your profile image?')) {
      setLoading(true);
      try {
        await authAPI.deleteProfileImage();
        alert('Profile image deleted successfully!');
        if (onProfileUpdate) onProfileUpdate();
      } catch (error) {
        console.error('Delete image error:', error);
        alert('Failed to delete profile image');
      } finally {
        setLoading(false);
      }
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      if (user?.job_role === 'company') {
        submitData.append('company_name', formData.company_name);
        submitData.append('company_phone', formData.company_phone);
        submitData.append('company_website', formData.company_website);
        submitData.append('company_address', formData.company_address);
        submitData.append('company_description', formData.company_description);
        if (formData.company_logo) {
          submitData.append('company_logo', formData.company_logo);
        }
      } else {
        submitData.append('phone', formData.phone);
        submitData.append('location', formData.location);
        submitData.append('bio', formData.bio);
        submitData.append('experience_years', formData.experience_years);
        submitData.append('skills', JSON.stringify(formData.skills));
        if (user?.job_role === 'employer') {
          submitData.append('company_name', formData.company_name);
        }
        if (formData.profile_image) {
          submitData.append('profile_image', formData.profile_image);
        }
      }
      
      await authAPI.updateUserProfile(submitData);
      alert('Profile updated successfully!');
      setIsEditing(false);
      if (onProfileUpdate) onProfileUpdate();
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderCompanyForm = () => {
    return (
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Company Logo</label>
          <div className="image-upload-section">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {user?.company_logo && (
              <button type="button" onClick={handleDeleteImage} className="delete-image-btn" disabled={loading}>
                Delete Current Logo
              </button>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Company Name *</label>
          <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Company Phone *</label>
          <input type="tel" name="company_phone" value={formData.company_phone} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Website</label>
          <input type="url" name="company_website" value={formData.company_website} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Address *</label>
          <input type="text" name="company_address" value={formData.company_address} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="company_description" value={formData.company_description} onChange={handleInputChange} rows="4" />
        </div>
        <button type="submit" disabled={loading} className="save-btn">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    );
  };

  const renderUserForm = () => {
    return (
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Profile Image</label>
          <div className="image-upload-section">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {user?.profile_image && (
              <button 
                type="button" 
                onClick={handleDeleteImage} 
                className="delete-image-link"
                disabled={loading}
              >
                ✕ Remove Image
              </button>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" />
        </div>
        <div className="form-group">
          <label>Experience (Years)</label>
          <input type="number" name="experience_years" value={formData.experience_years} onChange={handleInputChange} min="0" max="50" />
        </div>
        {user?.job_role === 'employer' && (
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} />
          </div>
        )}
        <div className="form-group">
          <label>Skills</label>
          <div className="skills-input">
            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <button type="button" onClick={addSkill}>Add</button>
          </div>
          <div className="skills-list">
            {formData.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}<button type="button" onClick={() => removeSkill(skill)}>×</button>
              </span>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="save-btn">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    );
  };

  const renderCompanyDisplay = () => (
    <div className="profile-display">
      <div className="profile-avatar-large">
        {user?.company_logo ? (
          <img src={user.company_logo} alt="Company Logo" />
        ) : (
          <div className="avatar-placeholder">{user?.company_name?.[0] || 'C'}</div>
        )}
      </div>
      <div className="profile-details">
        <h3>{user?.company_name}</h3>
        <p className="email">{user?.email}</p>
        <p className="job-role">Company</p>
        <p><strong>Phone:</strong> {user?.company_phone}</p>
        <p><strong>Address:</strong> {user?.company_address}</p>
        {user?.company_website && <p><strong>Website:</strong> <a href={user.company_website} target="_blank" rel="noopener noreferrer">{user.company_website}</a></p>}
        {user?.company_description && <p><strong>Description:</strong> {user.company_description}</p>}
      </div>
    </div>
  );

  const renderUserDisplay = () => (
    <div className="profile-display">
      <div className="profile-avatar-large">
        {user?.profile_image ? (
          <img src={user.profile_image} alt="Profile" />
        ) : (
          <div className="avatar-placeholder">{user?.first_name?.[0] || 'U'}</div>
        )}
      </div>
      <div className="profile-details">
        <h3>{user?.full_name || `${user?.first_name} ${user?.last_name}`}</h3>
        <p className="email">{user?.email}</p>
        <p className="job-role">{user?.job_role}</p>
        {user?.phone && <p><strong>Phone:</strong> {user.phone}</p>}
        {user?.location && <p><strong>Location:</strong> {user.location}</p>}
        {user?.bio && <p><strong>Bio:</strong> {user.bio}</p>}
        {user?.experience_years !== undefined && <p><strong>Experience:</strong> {user.experience_years} years</p>}
        {user?.job_role === 'employer' && user?.company_name && <p><strong>Company:</strong> {user.company_name}</p>}
        {user?.skills && user.skills.length > 0 && (
          <div className="skills-display">
            <strong>Skills:</strong>
            <div className="skills-list">
              {user.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{user?.job_role === 'company' ? 'Company Profile' : 'Profile'}</h2>
        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        user?.job_role === 'company' ? renderCompanyForm() : renderUserForm()
      ) : (
        user?.job_role === 'company' ? renderCompanyDisplay() : renderUserDisplay()
      )}
    </div>
  );
}
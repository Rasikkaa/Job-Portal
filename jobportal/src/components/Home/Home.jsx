import { useState, useEffect } from "react";
import "./Home.css";
import Header from "./Header";
import ChangePasswordForm from "./ChangePasswordForm";
import Network from "./Network";
import Jobs from "./Jobs";
import Notifications from "./Notifications";
import Posts from "./Posts";
import { authAPI } from "../../services/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authAPI.getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // If token is invalid, redirect to login
        localStorage.clear();
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleChangePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setChangePasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const validateChangePassword = () => {
    const errs = {};
    if (!changePasswordForm.oldPassword) errs.oldPassword = "Current password is required";
    if (changePasswordForm.newPassword.length < 6) errs.newPassword = "Password must be at least 6 characters";
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validateChangePassword()) return;
    
    setChangePasswordLoading(true);
    try {
      await authAPI.changePassword(changePasswordForm.oldPassword, changePasswordForm.newPassword);
      alert("Password changed successfully!");
      setShowChangePassword(false);
      setChangePasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (error) {
      console.error('Change password error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleBackFromChangePassword = () => {
    setShowChangePassword(false);
    setChangePasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setShowPassword(false);
  };

  if (loading) {
    return (
      <div className="home-screen">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
      />
      
      <main className="home-body">
        <div className="home-container">
          <div className="content-area">
            {activeTab === "home" && (
              <div className="home-content">
                <h2>Welcome to Job Portal</h2>
                {user && (
                  <div className="user-welcome">
                    <h3>Hello, {user.first_name} {user.last_name}!</h3>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.job_role}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "network" && <Network />}
            {activeTab === "jobs" && <Jobs />}
            {activeTab === "notifications" && <Notifications />}
            {activeTab === "posts" && <Posts />}
          </div>
        </div>
      </main>
      
      {showChangePassword && (
        <ChangePasswordForm
          oldPassword={changePasswordForm.oldPassword}
          newPassword={changePasswordForm.newPassword}
          confirmPassword={changePasswordForm.confirmPassword}
          errors={errors}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleChange={handleChangePasswordFormChange}
          handleSubmit={handleChangePasswordSubmit}
          onBack={handleBackFromChangePassword}
          loading={changePasswordLoading}
        />
      )}
    </div>
  );
}
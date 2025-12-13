import { useState } from "react";
import "./SignUp.css";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import OTPForm from "./OTPForm";
import ResetPasswordForm from "./ResetPasswordForm";
import { authAPI } from "../../services/api";

export default function SignUp() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOTPValidation, setIsOTPValidation] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [otpSource, setOtpSource] = useState(""); // "forgot" or "signup"
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    job_role: "",
    agree: false,
  });
  
  const [resetForm, setResetForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function validate() {
    const errs = {};
    if (isSignUp && !form.firstName.trim()) errs.firstName = "First name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!isForgotPassword && form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (isSignUp && form.password !== form.confirm) errs.confirm = "Passwords do not match";
    if (isSignUp && !form.job_role) errs.job_role = "Job role is required";
    if (isSignUp && !form.agree) errs.agree = "You must agree to the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }
  
  function validateResetPassword() {
    const errs = {};
    if (resetForm.newPassword.length < 6) errs.newPassword = "Password must be at least 6 characters";
    if (resetForm.newPassword !== resetForm.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      if (isForgotPassword) {
        await authAPI.forgotPasswordRequest(form.email);
        setUserEmail(form.email);
        setOtpSource("forgot");
        setIsOTPValidation(true);
        alert("OTP sent to your email!");
      } else if (isSignUp) {
        const userData = {
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          password: form.password,
          confirm_password: form.confirm,
          job_role: form.job_role
        };
        console.log('Sending registration data:', userData);
        await authAPI.register(userData);
        setUserEmail(form.email);
        setOtpSource("signup");
        setIsOTPValidation(true);
        alert("Registration successful! OTP sent to your email.");
      } else {
        const response = await authAPI.login(form.email, form.password);
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user_email', form.email);
        window.location.href = '/home';
      }
    } catch (error) {
      console.error('API Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleOTPValidate(otpValue) {
    setLoading(true);
    try {
      if (otpSource === "signup") {
        await authAPI.verifyRegistration(userEmail, otpValue);
        alert("Registration completed successfully! You can now login.");
        setIsOTPValidation(false);
        setIsSignUp(false);
      } else if (otpSource === "forgot") {
        const response = await authAPI.forgotPasswordVerify(userEmail, otpValue);
        setResetToken(response.reset_token);
        setIsOTPValidation(false);
        setIsResetPassword(true);
      }
      setOtpSource("");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleBackFromOTP() {
    setIsOTPValidation(false);
    if (otpSource === "signup") {
      // Stay on signup form
    } else {
      // Back to forgot password
    }
    setOtpSource("");
  }
  
  function handleResetPasswordChange(e) {
    const { name, value } = e.target;
    setResetForm(prev => ({ ...prev, [name]: value }));
  }
  
  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!validateResetPassword()) return;
    
    setLoading(true);
    try {
      await authAPI.forgotPasswordReset(resetToken, resetForm.newPassword);
      alert("Password updated successfully! You can now login.");
      setIsResetPassword(false);
      setIsForgotPassword(false);
      setIsSignUp(false);
      setResetForm({ newPassword: "", confirmPassword: "" });
      setResetToken("");
    } catch (error) {
      console.error('Reset password error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-screen">
      {!isForgotPassword && !isOTPValidation && !isResetPassword && (
        <div className="logo-container">
          <h1 className="logo">Logo</h1>
        </div>
      )}
      
      <div className="signup-container">
        <div className="card">
          
          {!isForgotPassword && !isOTPValidation && !isResetPassword && (
            <div className="tab-row">
              <button 
                className={`tab ${!isSignUp ? "active-tab" : ""}`}
                onClick={() => setIsSignUp(false)}
              >
                Login
              </button>
              <button 
                className={`tab ${isSignUp ? "active-tab" : ""}`}
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </div>
          )}

          <div className={`form-container ${isOTPValidation || isForgotPassword || isResetPassword ? "forgot-password-active" : isSignUp ? "signup-active" : "login-active"}`}>
            <h2 className="title">
              {isOTPValidation ? "Enter OTP" : isResetPassword ? "Set New Password" : isForgotPassword ? "Forgot Your Password?" : isSignUp ? "Create an account" : "Welcome Back !"}
            </h2>
            <p className="subtitle">
              {isOTPValidation
                ? "Enter the 6-digit OTP sent to your email address."
                : isResetPassword
                ? "Enter your new password and confirm it to complete the reset process."
                : isForgotPassword
                ? "Enter your email address and we'll send you an OTP to reset your password."
                : isSignUp 
                ? "Build your profile, connect with peers, and discover jobs."
                : "Login in to your account to connect with professionals and explore opportunities."}
            </p>

          {isOTPValidation ? (
            <OTPForm
              onValidate={handleOTPValidate}
              onBackToForgot={handleBackFromOTP}
              otpSource={otpSource}
              userEmail={userEmail}
              onResendOTP={authAPI.resendOTP}
            />
          ) : isResetPassword ? (
            <ResetPasswordForm
              newPassword={resetForm.newPassword}
              confirmPassword={resetForm.confirmPassword}
              errors={errors}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleChange={handleResetPasswordChange}
              handleSubmit={handleResetPasswordSubmit}
              loading={loading}
            />
          ) : isForgotPassword ? (
            <ForgotPasswordForm
              form={form}
              errors={errors}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              onBackToLogin={() => setIsForgotPassword(false)}
              loading={loading}
            />
          ) : isSignUp ? (
            <SignUpForm 
              form={form}
              errors={errors}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          ) : (
            <LoginForm 
              form={form}
              errors={errors}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              onForgotPassword={() => setIsForgotPassword(true)}
              loading={loading}
            />
          )}

          {!isForgotPassword && !isOTPValidation && !isResetPassword && (
            <>
              <div className="or-line">Or {isSignUp ? "Sign Up" : "Login"} With</div>

              <div className="social-row">
                <SocialButton label="Google" kind="google" />
                <SocialButton label="Facebook" kind="facebook" />
                <SocialButton label="Apple ID" kind="apple" />
              </div>
            </>
          )}

          </div>

        </div>

        <div className="illustration-section">
          <img 
            src={isOTPValidation ? "/otp-image.png" : isResetPassword ? "/forgot-image.png" : isForgotPassword ? "/forgot-image.png" : isSignUp ? "/register-image2.jpg" : "/login-image.png"} 
            alt={isOTPValidation ? "OTP Validation Illustration" : isResetPassword ? "Reset Password Illustration" : isForgotPassword ? "Forgot Password Illustration" : isSignUp ? "Sign Up Illustration" : "Login Illustration"} 
            className="illustration-img" 
          />
        </div>
      </div>
    </div>
  );
}

function SocialButton({ label, kind }) {
  const icons = {
    google: (
      <img src="https://www.google.com/favicon.ico" alt="Google" />
    ),
    facebook: (    
       <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"/>
                </svg>    
    ),
    apple: (    
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#000">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    )
  };

  return (
    <button className="social-btn" type="button" aria-label={label}>
      <span className="social-icon">{icons[kind]}</span>
      <span className="social-label">{label}</span>
    </button>
  );
}
import { useState, useEffect } from "react";

export default function OTPForm({ onValidate, onBackToForgot, otpSource, userEmail, onResendOTP }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  function handleChange(index, value) {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isExpired) {
      alert("OTP has expired. Please request a new one.");
      return;
    }
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      onValidate(otpValue);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="otp-container">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="otp-input"
            maxLength="1"
            autoComplete="off"
          />
        ))}
      </div>
      
      <div style={{ textAlign: "center", margin: "15px 0" }}>
        <div style={{ 
          fontSize: "18px", 
          fontWeight: "bold", 
          color: timeLeft <= 60 ? "#ff4444" : "#333",
          marginBottom: "5px"
        }}>
          {isExpired ? "OTP Expired" : formatTime(timeLeft)}
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {isExpired ? "Please request a new OTP" : "Time remaining to enter OTP"}
        </div>
      </div>
      
      <button 
        type="submit" 
        className="primary-btn"
        disabled={isExpired}
        style={{ opacity: isExpired ? 0.5 : 1 }}
      >
        Validate OTP
      </button>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
        <button 
          type="button" 
          className="link" 
          onClick={onBackToForgot}
          style={{ background: "none", border: "none" }}
        >
          {otpSource === "signup" ? "Back to Registration" : "Back to Forgot Password"}
        </button>
        
        <button
          type="button"
          className="link" 
          style={{ 
            background: "none", 
            border: "none", 
            fontSize: "13px",
            opacity: isExpired ? 1 : 0.5,
            cursor: isExpired ? "pointer" : "not-allowed"
          }}
          disabled={!isExpired}
          onClick={async () => {
            if (isExpired && onResendOTP) {
              try {
                await onResendOTP(userEmail);
                setTimeLeft(300);
                setIsExpired(false);
                setOtp(["", "", "", "", "", ""]);
                alert("OTP resent successfully!");
              } catch (error) {
                alert(error.message);
              }
            }
          }}
        >
          Resend OTP
        </button>
      </div>
    </form>
  );
}
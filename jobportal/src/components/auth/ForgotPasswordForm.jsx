export default function ForgotPasswordForm({ form, errors, handleChange, handleSubmit, onBackToLogin, loading }) {
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="label">
        <span className="label-text">Email</span>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className={`input ${errors.email ? "input-error" : ""}`}
          placeholder="name@example.com"
          type="email"
          autoComplete="email"
        />
        {errors.email && <div className="error">{errors.email}</div>}
      </label>

      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? "Sending OTP..." : "Send Email OTP"}
      </button>

      <div style={{ textAlign: 'center' }}>
        <a href="#" className="link" onClick={(e) => { e.preventDefault(); onBackToLogin(); }}>
          Back to Login
        </a>
      </div>
    </form>
  );
}
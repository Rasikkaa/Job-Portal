import { LuEyeClosed } from "react-icons/lu";

export default function LoginForm({ form, errors, showPassword, setShowPassword, handleChange, handleSubmit, onForgotPassword, loading }) {
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="label">
        <span className="label-text">Email</span>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className={`input ${errors.email ? "input-error" : ""}`}
          placeholder="Enter your email"
          type="email"
          autoComplete="email"
        />
        {errors.email && <div className="error">{errors.email}</div>}
      </label>

      <label className="label">
        <span className="label-text">Password</span>
        <div className="input-with-btn">
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            className={`input ${errors.password ? "input-error" : ""}`}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="•••••••"
          />
          <button
            type="button"
            className="show-btn"
            onClick={() => setShowPassword((s) => !s)}
            aria-label="Toggle password"
          >
            {showPassword ? '👁' : <LuEyeClosed />}
          </button>
        </div>
        {errors.password && <div className="error">{errors.password}</div>}
      </label>

      <div className="forgot-password-wrapper">
        <a href="#" className="link" onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>Forgot Password?</a>
      </div>

      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
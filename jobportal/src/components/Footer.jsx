import React from "react";

export default function Footer() {
  return (
    <footer className="lf-root">
      <div className="lf-inner">
        <div className="lf-left">
          <a href="#" className="lf-logo">Logo</a>
        </div>

        <nav className="lf-links" aria-label="Footer links">
          <a href="#">2025</a>
          <a href="#">About</a>
          <a href="#">Accessibility</a>
          <a href="#">Site Agreement</a>
          <a href="#">Privacy policy</a>
          <a href="#">Cookie Policy</a>
          <a href="#">Copyright Policy</a>
          <a href="#">Event Controls</a>
          <a href="#">Community Guidelines</a>
        </nav>

        <div className="lf-right">
          <label className="lf-lang">
            <select defaultValue="en" aria-label="Select language">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="es">Español</option>
            </select>
          </label>
        </div>
      </div>

      <style>{`
        .lf-root {
          width: 100%;
          background: #ffffff; /* pure white */
          display: flex;
          justify-content: center;
          padding: 18px 12px 28px;
          box-sizing: border-box;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          border: none !important;
          outline: none !important;
          box-shadow: none !important; /* no borders, no lines */
        }

        .lf-inner {
          width: 100%;
          max-width: 1200px;
          display: flex;
          align-items: center;
          gap: 16px;
          color: #6b7280; /* muted gray */
          border-radius: 8px;
        }

        .lf-left { flex: 0 0 auto; }

        .lf-logo {
          color: #0b5ed7; /* blue like in design */
          font-weight: 600;
          text-decoration: none;
          padding-left: 6px;
        }

        .lf-links {
          display: flex;
          gap: 18px;
          flex: 1 1 auto;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        .lf-links a {
          color: #6b7280;
          text-decoration: none;
          font-size: 13px;
          padding: 6px 4px;
        }

        .lf-links a:hover { text-decoration: underline; color: #0b5ed7; }

        .lf-right { flex: 0 0 auto; }

        .lf-lang select {
          background: transparent;
          border: none;
          font-size: 13px;
          color: #374151;
          padding: 6px 8px;
          border-radius: 6px;
          outline: 1px solid rgba(15,23,42,0.03);
        }

        /* Small screens: stack and center everything */
        @media (max-width: 700px) {
          .lf-inner { flex-direction: column; gap: 10px; align-items: center; }
          .lf-links { justify-content: center; gap: 12px; }
          .lf-right { order: 3; }
        }

        /* Removed top border entirely for pure white, floating look */
        .lf-root::before {
          content: none;
        }
      `}</style>
    </footer>
  );
}

export default function Header({ activeTab, setActiveTab, onLogout, onChangePassword }) {
  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "network", label: "Network", icon: "👥" },
    { id: "jobs", label: "Jobs", icon: "💼" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "posts", label: "Posts", icon: "📝" }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-logo" onClick={() => setActiveTab("home")} style={{cursor: "pointer"}}>Job Portal</h1>
        </div>

        <nav className="header-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${activeTab === item.id ? "nav-btn-active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-right">
          <button className="action-btn" onClick={onChangePassword}>
            <span className="action-icon">🔑</span>
            <span className="action-label">Change Password</span>
          </button>
          <button className="action-btn logout-btn" onClick={onLogout}>
            <span className="action-icon">🚪</span>
            <span className="action-label">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
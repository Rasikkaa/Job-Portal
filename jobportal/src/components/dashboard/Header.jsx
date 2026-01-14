import { HiHome, HiUsers, HiBriefcase, HiBell, HiDocumentText, HiUser, HiKey, HiLogout } from 'react-icons/hi';

export default function Header({ activeTab, setActiveTab, onLogout, onChangePassword }) {
  const navItems = [
    { id: "home", label: "Home", icon: HiHome },
    { id: "network", label: "Network", icon: HiUsers },
    { id: "jobs", label: "Jobs", icon: HiBriefcase },
    { id: "notifications", label: "Notifications", icon: HiBell },
    { id: "posts", label: "Posts", icon: HiDocumentText }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-container" onClick={() => setActiveTab("home")}>
            <div className="logo-icon">
              <HiBriefcase />
            </div>
            <h1 className="header-logo">Jobo</h1>
          </div>
        </div>

        <nav className="header-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${activeTab === item.id ? "nav-btn-active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-right">
          <button className="nav-btn" onClick={() => setActiveTab("profile")}>
            <HiUser className="nav-icon" />
            <span className="nav-label">Profile</span>
          </button>
          <button className="action-btn" onClick={onChangePassword}>
            <HiKey className="action-icon" />
            <span className="action-label">Change Password</span>
          </button>
          <button className="action-btn logout-btn" onClick={onLogout}>
            <HiLogout className="action-icon" />
            <span className="action-label">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
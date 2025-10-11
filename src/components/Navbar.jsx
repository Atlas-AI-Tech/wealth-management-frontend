import "./Navbar.scss";

const Navbar = () => {
 
  return (
    <nav className="navbar">
      {/* Left Section - Dashboard Info */}
      <div className="navbar__left">
        <h1 className="navbar__title">Customer Insights Dashboard</h1>
        <p className="navbar__subtitle">
          AI-driven summary and recommendation engine for RM-Customer conversations.
        </p>
      </div>

      {/* Right Section - User Info */}
      <div className="navbar__right">
        <div className="navbar__user-info">
          <span className="navbar__user-name">Arjun Mehta</span>
          <span className="navbar__separator">|</span>
          <span className="navbar__rm-info">RM: Priya Nair</span>
        </div>
        <div className="navbar__session-info">
          <span className="navbar__date">Oct 7, 2025</span>
          <span className="navbar__bullet">•</span>
          <span className="navbar__duration">17 min</span>
          <span className="navbar__bullet">•</span>
          <span className="navbar__score-label">Overall Insight Score:</span>
          <span className="navbar__score">82/100</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

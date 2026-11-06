import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Navbar.css"

function NavBar() {
  const navRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (e) => { if (e.key === "Escape") setMenuOpen(false) }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [menuOpen])

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  return (
    <nav className={`navbar${menuOpen ? " menu-open" : ""}`} ref={navRef}>
      {/* Brand */}
      <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
        <div className="navbar-brand-icon" aria-hidden="true">F</div>
        FRAME
      </Link>

      {/* Nav links */}
      <div className={`navbar-links${menuOpen ? " is-open" : ""}`} id="primary-navigation">
        <Link to="/" className={`nav-link${isActive("/") ? " active" : ""}`} onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/discover" className={`nav-link${isActive("/discover") ? " active" : ""}`} onClick={() => setMenuOpen(false)}>Discover</Link>
        <Link to="/watchlist" className={`nav-link${isActive("/watchlist") ? " active" : ""}`} onClick={() => setMenuOpen(false)}>Watchlist</Link>
      </div>

      {/* Mobile toggle */}
      <button
        type="button"
        className="navbar-menu-toggle"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  )
}

export default NavBar
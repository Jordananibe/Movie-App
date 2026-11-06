import { Link } from "react-router-dom"
import "../css/Footer.css"

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link className="footer-brand" to="/">
            <div className="footer-brand-icon" aria-hidden="true">F</div>
            FRAME
          </Link>
        </div>

        <nav className="footer-nav-group" aria-label="Footer navigation">
          <div className="footer-nav-col">
            <span className="footer-nav-heading">Navigate</span>
            <Link to="/">Home</Link>
            <Link to="/discover">Discover</Link>
            <Link to="/watchlist">Watchlist</Link>
            <Link to="/discover">About FRAME</Link>
          </div>
          <div className="footer-nav-col">
            <span className="footer-nav-heading">Data</span>
            <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDB</a>
            <a href="https://developers.themoviedb.org/" target="_blank" rel="noreferrer">API Docs</a>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © {new Date().getFullYear()} FRAME.
        </span>
        <nav className="footer-legal" aria-label="Legal links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Use</a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer

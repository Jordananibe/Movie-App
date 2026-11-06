import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  getSpotlightMovie,
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
} from "../services/api"
import "../css/Home.css"

/* ── Helpers ─────────────────────────────── */
const IMG = "https://image.tmdb.org/t/p/"

const formatRuntime = (min) => {
  if (!min) return null
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h}h ${m}m` : `${m}m`
}

const starIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const genreNames = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
}

/* ── Poster Card ─────────────────────────── */
function PosterCard({ movie, onToggleWatchlist, isInWatchlist }) {
  const year = movie.release_date?.slice(0, 4)
  const genre = genreNames[movie.genre_ids?.[0]] || ""
  const rating = movie.vote_average?.toFixed(1)

  return (
    <div className="poster-card">
      <Link
        to={`/movie/${movie.id}`}
        state={{ movie }}
        className="poster-card-link"
        aria-label={`View details for ${movie.title}`}
      >
        <div className="poster-frame">
          {movie.poster_path
            ? <img src={`${IMG}w342${movie.poster_path}`} alt={movie.title} loading="lazy" />
            : <div className="poster-frame-empty">🎬</div>
          }
          <div className="poster-overlay" aria-hidden="true" />
        </div>
      </Link>
      <div className="poster-meta">
        <span className="poster-title">{movie.title}</span>
        <div className="poster-info-row">
          <span className="poster-year">{year}</span>
          {genre && <><span className="dot" aria-hidden>·</span><span className="poster-genre">{genre}</span></>}
          {rating && (
            <span className="poster-rating" aria-label={`Rating ${rating}`}>
              {starIcon}
              {rating}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Reco Card ───────────────────────────── */
function RecoCard({ movie, reason, onToggleWatchlist, isInWatchlist }) {
  const year = movie.release_date?.slice(0, 4)
  const genre = genreNames[movie.genre_ids?.[0]] || ""
  const rating = movie.vote_average?.toFixed(1)

  return (
    <article className="reco-card">
      <Link
        to={`/movie/${movie.id}`}
        state={{ movie }}
        className="reco-card-link"
        aria-label={`View details for ${movie.title}`}
      >
        <div className="reco-backdrop">
          {movie.backdrop_path
            ? <img src={`${IMG}w780${movie.backdrop_path}`} alt="" loading="lazy" />
            : <div style={{ background: "var(--color-surface-3)", width: "100%", height: "100%" }} />
          }
        </div>
      </Link>
      <button
        className={`reco-add-btn${isInWatchlist ? " active" : ""}`}
        onClick={() => onToggleWatchlist(movie)}
        aria-label={isInWatchlist ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
        aria-pressed={isInWatchlist}
        title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {isInWatchlist ? "✓" : "+"}
      </button>
      <div className="reco-body">
        {reason && (
          <p className="reco-reason" aria-label={`Recommended because: ${reason}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            {reason}
          </p>
        )}
        <h3 className="reco-title">{movie.title}</h3>
        <div className="reco-sub">
          <span>{year}</span>
          {genre && <><span className="dot" aria-hidden>·</span><span>{genre}</span></>}
          {rating && (
            <span className="reco-rating" aria-label={`Rating ${rating}`}>
              {starIcon}
              {rating}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

/* ── Section ─────────────────────────────── */
function MovieSection({ title, subtitle, movies, loading, sectionAction, sectionActionLabel, onToggleWatchlist, isInWatchlist }) {
  const rowRef = useRef(null)

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir * 480, behavior: "smooth" })
  }

  return (
    <section className="home-section" aria-labelledby={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="section-header">
        <div className="section-title-group">
          <h2 className="section-title" id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}>{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {sectionAction && (
            <button className="section-action" onClick={sectionAction}>
              {sectionActionLabel || "View all"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
          <div className="section-nav-btns" aria-label="Scroll controls">
            <button className="section-nav-btn" onClick={() => scroll(-1)} aria-label="Scroll left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button className="section-nav-btn" onClick={() => scroll(1)} aria-label="Scroll right">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="poster-row" aria-label="Loading movies" role="status">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="poster-card" aria-hidden="true">
              <div className="poster-frame skel" />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.4rem" }}>
                <div className="skel" style={{ height: "0.8rem", width: "80%" }} />
                <div className="skel" style={{ height: "0.65rem", width: "50%" }} />
              </div>
            </div>
          ))}
          <span className="visually-hidden">Loading movies…</span>
        </div>
      ) : (
        <div className="poster-row" ref={rowRef}>
          {movies.map((movie) => (
            <PosterCard
              key={movie.id}
              movie={movie}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist(movie.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

/* ── Hero ────────────────────────────────── */
function Hero({ spotlight, loading, onToggleWatchlist, isInWatchlist }) {
  const navigate = useNavigate()

  if (loading || !spotlight) {
    return (
      <div className="hero-skeleton" aria-hidden="true">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "440px" }}>
          <div className="skel" style={{ height: "0.75rem", width: "120px" }} />
          <div className="skel" style={{ height: "3rem", width: "260px" }} />
          <div className="skel" style={{ height: "0.75rem", width: "200px" }} />
          <div className="skel" style={{ height: "0.75rem", width: "100%" }} />
          <div className="skel" style={{ height: "0.75rem", width: "85%" }} />
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <div className="skel" style={{ height: "2.4rem", width: "130px", borderRadius: "8px" }} />
            <div className="skel" style={{ height: "2.4rem", width: "130px", borderRadius: "8px" }} />
          </div>
        </div>
      </div>
    )
  }

  const year = spotlight.release_date?.slice(0, 4)
  const runtime = formatRuntime(spotlight.runtime)
  const rating = spotlight.vote_average?.toFixed(1)
  const genres = spotlight.genres?.slice(0, 2).map((g) => g.name).join(" / ") || ""
  const inWatchlist = isInWatchlist(spotlight.id)

  return (
    <div className="hero">
      <div className="hero-backdrop" aria-hidden="true">
        {spotlight.backdrop_path && (
          <img
            src={`${IMG}original${spotlight.backdrop_path}`}
            alt=""
          />
        )}
      </div>

      <div className="hero-content">
        <h1 className="hero-title">Find <span className="hero-title-accent">Movies</span> Worth Your Time.</h1>
        <p className="hero-subtitle">
          Skip the endless scrolling and discover films you'll actually love. Explore trending releases, uncover hidden gems, and find your next unforgettable watch — all in one place.
        </p>

        <div className="hero-meta">
          {rating && (
            <span className="rating" aria-label={`Rating ${rating}`}>
              {starIcon} {rating}
            </span>
          )}
          {year && <><span className="dot" aria-hidden /><span>{year}</span></>}
          {genres && <><span className="dot" aria-hidden /><span>{genres}</span></>}
          {runtime && <><span className="dot" aria-hidden /><span>{runtime}</span></>}
          {spotlight.adult === false && <span className="hero-badge">PG-13</span>}
        </div>

        {spotlight.overview && (
          <p className="hero-overview">{spotlight.overview}</p>
        )}

        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => navigate("/discover")}
            id="hero-explore-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Explore Movie
          </button>
          <button
            className="btn-secondary"
            onClick={() => onToggleWatchlist(spotlight)}
            aria-pressed={inWatchlist}
            id="hero-watchlist-btn"
          >
            {inWatchlist ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                In Watchlist
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add to Watchlist
              </>
            )}
          </button>
        </div>
      </div>

      <div className="hero-dots" aria-hidden="true">
        <div className="hero-dot active" />
        <div className="hero-dot" />
        <div className="hero-dot" />
      </div>

      {spotlight.credits?.crew && (() => {
        const director = spotlight.credits.crew.find((c) => c.job === "Director")
        return director ? (
          <p className="hero-film-credit" aria-hidden="true">A film by {director.name}</p>
        ) : null
      })()}
    </div>
  )
}

/* ── Home ────────────────────────────────── */
function Home({ watchlist, onToggleWatchlist }) {
  const navigate = useNavigate()

  const [spotlight, setSpotlight] = useState(null)
  const [spotlightLoading, setSpotlightLoading] = useState(true)

  const [trending, setTrending] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(true)

  const [popular, setPopular] = useState([])
  const [popularLoading, setPopularLoading] = useState(true)

  const [topRated, setTopRated] = useState([])
  const [topRatedLoading, setTopRatedLoading] = useState(true)

  const isInWatchlist = useCallback(
    (id) => watchlist.some((m) => m.id === id),
    [watchlist]
  )

  useEffect(() => {
    let cancelled = false

    getSpotlightMovie()
      .then((movie) => { if (!cancelled) setSpotlight(movie) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSpotlightLoading(false) })

    getTrendingMovies("week")
      .then(({ movies }) => { if (!cancelled) setTrending(movies.slice(0, 12)) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setTrendingLoading(false) })

    getPopularMovies()
      .then(({ movies }) => { if (!cancelled) setPopular(movies.slice(0, 12)) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPopularLoading(false) })

    getTopRatedMovies()
      .then(({ movies }) => { if (!cancelled) setTopRated(movies.slice(0, 6)) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setTopRatedLoading(false) })

    return () => { cancelled = true }
  }, [])

  // Pick 3 recommended from top-rated that aren't in trending
  const trendingIds = new Set(trending.map((m) => m.id))
  const recommended = topRated.filter((m) => !trendingIds.has(m.id)).slice(0, 3)

  const recoReasons = [
    "Because you liked Interstellar",
    "More films from Denis Villeneuve",
    "For your love of unforgettable stories",
  ]

  return (
    <div className="home">
      <Hero
        spotlight={spotlight}
        loading={spotlightLoading}
        onToggleWatchlist={onToggleWatchlist}
        isInWatchlist={isInWatchlist}
      />

      <MovieSection
        title="Trending Now"
        subtitle="The films everyone is talking about."
        movies={trending}
        loading={trendingLoading}
        sectionAction={() => navigate("/discover")}
        sectionActionLabel="View all"
        onToggleWatchlist={onToggleWatchlist}
        isInWatchlist={isInWatchlist}
      />

      <MovieSection
        title="Popular This Week"
        subtitle="Great stories. Worth discovering, and rediscovering."
        movies={popular}
        loading={popularLoading}
        sectionAction={() => navigate("/discover")}
        sectionActionLabel="View all"
        onToggleWatchlist={onToggleWatchlist}
        isInWatchlist={isInWatchlist}
      />

      {/* Recommended for you */}
      <section className="home-section" aria-labelledby="section-recommended">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title" id="section-recommended">Recommended For You</h2>
          </div>
          <button className="section-action" onClick={() => navigate("/discover")}>
            Explore your picks
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {topRatedLoading ? (
          <div className="reco-grid" aria-label="Loading recommendations" role="status">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="reco-card" aria-hidden="true">
                <div className="reco-backdrop skel" style={{ aspectRatio: "16/9" }} />
                <div className="reco-body" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div className="skel" style={{ height: "0.7rem", width: "60%" }} />
                  <div className="skel" style={{ height: "1rem", width: "85%" }} />
                  <div className="skel" style={{ height: "0.7rem", width: "45%" }} />
                </div>
              </div>
            ))}
            <span className="visually-hidden">Loading recommendations…</span>
          </div>
        ) : (
          <div className="reco-grid">
            {recommended.map((movie, i) => (
              <RecoCard
                key={movie.id}
                movie={movie}
                reason={recoReasons[i]}
                onToggleWatchlist={onToggleWatchlist}
                isInWatchlist={isInWatchlist}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
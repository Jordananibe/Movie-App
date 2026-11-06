import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import "../css/Watchlist.css"

const IMG = "https://image.tmdb.org/t/p/"

const genreNames = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
}

const starIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

function WatchlistCard({ movie, isWatched, onRemove, onToggleWatched }) {
  const year = movie.release_date?.slice(0, 4)
  const genre = genreNames[movie.genre_ids?.[0]] || ""
  const rating = movie.vote_average?.toFixed(1)

  return (
    <article className="watchlist-card">
      <div className="watchlist-card-poster">
        <Link
          to={`/movie/${movie.id}`}
          state={{ movie }}
          aria-label={`View details for ${movie.title}`}
          tabIndex={-1}
        >
          {movie.poster_path
            ? <img src={`${IMG}w342${movie.poster_path}`} alt={movie.title} loading="lazy" />
            : <span className="watchlist-poster-placeholder" aria-hidden="true">{movie.title}</span>
          }
        </Link>
        <button
          type="button"
          className="watchlist-remove-btn"
          onClick={() => onRemove(movie)}
          aria-label={`Remove ${movie.title} from watchlist`}
          title="Remove from watchlist"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className="watchlist-card-info">
        <Link
          to={`/movie/${movie.id}`}
          state={{ movie }}
          className="watchlist-card-title"
        >
          {movie.title}
        </Link>
        <div className="watchlist-card-meta">
          {year && <span>{year}</span>}
          {genre && <><span className="dot" aria-hidden="true" /><span>{genre}</span></>}
          {rating && (
            <span className="watchlist-card-rating" aria-label={`Rating ${rating}`}>
              {starIcon}
              {rating}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`watchlist-status${isWatched ? " is-watched" : ""}`}
          onClick={() => onToggleWatched(movie.id)}
          aria-pressed={isWatched}
          aria-label={`${isWatched ? "Mark as want to watch" : "Mark as watched"}: ${movie.title}`}
        >
          {isWatched ? (
            <>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
              Watched
            </>
          ) : (
            <>
              <span className="watchlist-status-circle" aria-hidden="true" />
              Want to Watch
            </>
          )}
        </button>
      </div>
    </article>
  )
}

function getMovieGenreNames(movie) {
  const namesFromIds = (movie.genre_ids || []).map((id) => genreNames[id]).filter(Boolean)
  if (namesFromIds.length > 0) return namesFromIds
  return (Array.isArray(movie.genres) ? movie.genres : [])
    .map((genre) => typeof genre === "string" ? genre : genre.name)
    .filter(Boolean)
}

function Watchlist({ watchlist, watchedIds, onToggleWatchlist, onToggleWatched }) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [genreFilter, setGenreFilter] = useState("")
  const [minimumRating, setMinimumRating] = useState("")
  const [releaseYear, setReleaseYear] = useState("")
  const [sortOrder, setSortOrder] = useState("recent")
  const watchedCount = watchlist.filter((movie) => watchedIds.includes(movie.id)).length
  const wantCount = watchlist.length - watchedCount

  const availableGenres = useMemo(
    () => [...new Set(watchlist.flatMap(getMovieGenreNames))].sort((a, b) => a.localeCompare(b)),
    [watchlist]
  )
  const availableYears = useMemo(
    () => [...new Set(watchlist.map((movie) => movie.release_date?.slice(0, 4))
      .filter((year) => /^\d{4}$/.test(year || "")))].sort((a, b) => b.localeCompare(a)),
    [watchlist]
  )
  const hasAdditionalFilters = Boolean(genreFilter || minimumRating || releaseYear)

  const visibleMovies = useMemo(() => {
    const filtered = watchlist.filter((movie) => {
      const isWatched = watchedIds.includes(movie.id)
      if (activeFilter === "watched" && !isWatched) return false
      if (activeFilter === "want" && isWatched) return false
      if (genreFilter && !getMovieGenreNames(movie).includes(genreFilter)) return false
      if (minimumRating && (movie.vote_average == null || movie.vote_average < Number(minimumRating))) return false
      if (releaseYear && movie.release_date?.slice(0, 4) !== releaseYear) return false
      return true
    })

    return [...filtered].sort((a, b) => {
      if (sortOrder === "title") return a.title.localeCompare(b.title)
      if (sortOrder === "rating") return (b.vote_average || 0) - (a.vote_average || 0)
      if (sortOrder === "release") return (b.release_date || "").localeCompare(a.release_date || "")
      return watchlist.indexOf(b) - watchlist.indexOf(a)
    })
  }, [activeFilter, genreFilter, minimumRating, releaseYear, sortOrder, watchedIds, watchlist])

  const filters = [
    { id: "all", label: "All Movies", count: watchlist.length },
    { id: "want", label: "Want to Watch", count: wantCount },
    { id: "watched", label: "Watched", count: watchedCount },
  ]

  return (
    <section className="watchlist">
      <header className="watchlist-header">
        <div>
          <h1>My Watchlist</h1>
          <p>Your next great movie night starts here.</p>
        </div>
        {watchlist.length > 0 && (
          <Link to="/discover" className="watchlist-discover-link">
            Discover more movies
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </Link>
        )}
      </header>

      <div className="watchlist-content">
        <section className="watchlist-stats" aria-label="Watchlist summary">
          <div className="watchlist-stat">
            <span className="watchlist-stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z" /></svg>
            </span>
            <span><strong>{watchlist.length}</strong><small>Total saved movies</small></span>
          </div>
          <div className="watchlist-stat">
            <span className="watchlist-stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
            </span>
            <span><strong>{watchedCount}</strong><small>Movies watched</small></span>
          </div>
          <div className="watchlist-stat">
            <span className="watchlist-stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            </span>
            <span><strong>{wantCount}</strong><small>Movies remaining</small></span>
          </div>
        </section>

        <div className="watchlist-toolbar">
          <div className="watchlist-filters" role="group" aria-label="Filter watchlist">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter.id}
                className={`watchlist-filter${activeFilter === filter.id ? " active" : ""}`}
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={activeFilter === filter.id}
              >
                {filter.label} <span>{filter.count}</span>
              </button>
            ))}
          </div>
          {watchlist.length > 0 && (
            <label className="watchlist-sort">
              <span>Sort by:</span>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                <option value="recent">Recently added</option>
                <option value="title">Title A–Z</option>
                <option value="rating">Highest rated</option>
                <option value="release">Release date</option>
              </select>
            </label>
          )}
        </div>

        {watchlist.length > 0 && (
          <div className="watchlist-filter-controls" role="group" aria-label="Additional watchlist filters">
            <label className="watchlist-filter-select">
              <span>Genre</span>
              <select value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)}>
                <option value="">All genres</option>
                {availableGenres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
              </select>
            </label>
            <label className="watchlist-filter-select">
              <span>Minimum rating</span>
              <select value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)}>
                <option value="">Any rating</option>
                {[5, 6, 7, 8, 9].map((rating) => (
                  <option key={rating} value={rating}>{rating}+ / 10</option>
                ))}
              </select>
            </label>
            <label className="watchlist-filter-select">
              <span>Release year</span>
              <select value={releaseYear} onChange={(event) => setReleaseYear(event.target.value)}>
                <option value="">Any year</option>
                {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
            {hasAdditionalFilters && (
              <button
                type="button"
                className="watchlist-clear-filters"
                onClick={() => {
                  setGenreFilter("")
                  setMinimumRating("")
                  setReleaseYear("")
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {watchlist.length === 0 ? (
          <div className="watchlist-empty">
            <div className="watchlist-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z" />
                <path d="M12 8v6m-3-3h6" />
              </svg>
            </div>
            <h2>Great films are waiting for you.</h2>
            <p>Your watchlist is empty. Discover something you love and save it here for your next movie night.</p>
            <Link to="/discover" className="watchlist-empty-link">
              Discover Movies
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </Link>
            <small>Look for “Add to Watchlist” on any movie.</small>
          </div>
        ) : visibleMovies.length === 0 ? (
          <p className="watchlist-no-results">No movies match these filters.</p>
        ) : (
          <>
            <p className="watchlist-results-count">
              {visibleMovies.length} {visibleMovies.length === 1 ? "movie" : "movies"} in your collection
            </p>
            <div className="watchlist-grid">
              {visibleMovies.map((movie) => (
                <WatchlistCard
                  key={movie.id}
                  movie={movie}
                  isWatched={watchedIds.includes(movie.id)}
                  onRemove={onToggleWatchlist}
                  onToggleWatched={onToggleWatched}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Watchlist

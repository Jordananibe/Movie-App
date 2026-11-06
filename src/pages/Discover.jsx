import { useState, useEffect, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import { getMovieCatalog, searchMovies, getMovieGenres } from "../services/api"
import "../css/Discover.css"

/* ── Constants ───────────────────────────── */
const IMG = "https://image.tmdb.org/t/p/"
const PAGE_SIZE = 20

const SORT_OPTIONS = [
  { value: "popularity.desc",           label: "Popularity" },
  { value: "vote_average.desc",         label: "Rating" },
  { value: "primary_release_date.desc", label: "Release Date" },
]

// Genres displayed as pills (subset shown in the design)
const PILL_GENRE_IDS = [28, 12, 16, 35, 18, 27, 878, 53]

const StarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

/* ── Discover movie card ─────────────────── */
function DiscoverCard({ movie, isInWatchlist, onToggleWatchlist }) {
  const year = movie.release_date?.slice(0, 4)
  const rating = movie.vote_average?.toFixed(1)
  const saved = isInWatchlist(movie.id)

  return (
    <article className="dcard">
      <div className="dcard-poster">
        <Link
          to={`/movie/${movie.id}`}
          state={{ movie }}
          aria-label={`View details for ${movie.title}`}
          tabIndex={0}
        >
          {movie.poster_path
            ? <img src={`${IMG}w342${movie.poster_path}`} alt={movie.title} loading="lazy" />
            : <div className="dcard-poster-empty" aria-hidden="true">🎬</div>
          }
          <div className="dcard-overlay" aria-hidden="true" />
        </Link>

        {/* Saved indicator top-left */}
        {saved && (
          <div className="dcard-saved-dot" aria-hidden="true">
            <CheckIcon />
          </div>
        )}

        {/* Bookmark button top-right */}
        <button
          className={`dcard-bookmark${saved ? " saved" : ""}`}
          onClick={() => onToggleWatchlist(movie)}
          aria-label={saved ? `Remove ${movie.title} from watchlist` : `Save ${movie.title} to watchlist`}
          aria-pressed={saved}
          title={saved ? "Remove from watchlist" : "Save to watchlist"}
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      <div className="dcard-info">
        <Link
          to={`/movie/${movie.id}`}
          state={{ movie }}
          className="dcard-title"
          aria-label={movie.title}
        >
          {movie.title}
        </Link>
        <div className="dcard-meta">
          {year && <span className="dcard-year">{year}</span>}
          {rating && (
            <span className="dcard-rating" aria-label={`Rating ${rating}`}>
              <StarIcon />
              {rating}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

/* ── Skeleton card ───────────────────────── */
function SkeletonCard() {
  return (
    <div className="dcard dcard-skeleton" aria-hidden="true">
      <div className="dcard-poster" />
      <div className="dcard-info">
        <div className="skel-line" style={{ height: "0.8rem", width: "80%" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="skel-line" style={{ height: "0.65rem", width: "38%" }} />
          <div className="skel-line" style={{ height: "0.65rem", width: "28%" }} />
        </div>
      </div>
    </div>
  )
}

/* ── Sort dropdown ───────────────────────── */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const activeLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Popularity"

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div className="discover-sort" ref={ref}>
      <button
        className={`discover-sort-btn${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        id="sort-btn"
      >
        <span className="discover-sort-label">Sort by:</span>
        <span className="discover-sort-value">{activeLabel}</span>
        <span className={`discover-sort-chevron${open ? " open" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="discover-sort-menu" role="listbox" aria-labelledby="sort-btn">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`discover-sort-option${opt.value === value ? " active" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
              {opt.value === value && (
                <span className="discover-sort-check"><CheckIcon /></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Discover page ───────────────────────── */
function Discover({ watchlist, onToggleWatchlist }) {
  const [query, setQuery] = useState("")
  const [activeQuery, setActiveQuery] = useState("")
  const [sort, setSort] = useState("popularity.desc")
  const [activeGenre, setActiveGenre] = useState("") // "" = all
  const [genres, setGenres] = useState([])

  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const searchInputRef = useRef(null)

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // Load genres for pills
  useEffect(() => {
    getMovieGenres()
      .then((all) => setGenres(all.filter((g) => PILL_GENRE_IDS.includes(g.id))))
      .catch(() => {})
  }, [])

  // Load the selected page whenever search, genre, sort, or page changes.
  useEffect(() => {
    let cancelled = false

    const fetch = activeQuery
      ? searchMovies(activeQuery, page)
      : getMovieCatalog({ page, genre: activeGenre, sort })

    fetch
      .then(({ movies: m, totalPages: tp }) => {
        if (cancelled) return
        setMovies(m)
        setTotalPages(tp)
        setTotalResults(tp * PAGE_SIZE)
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [activeQuery, activeGenre, sort, page])

  const pageWindowStart = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => pageWindowStart + index
  )

  const goToPage = (nextPage) => {
    if (nextPage === page) return
    setLoading(true)
    setError(null)
    setMovies([])
    setPage(nextPage)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const nextQuery = query.trim()
    if (nextQuery === activeQuery && page === 1 && activeGenre === "") return
    setLoading(true)
    setError(null)
    setMovies([])
    setPage(1)
    setActiveGenre("")
    setActiveQuery(nextQuery)
  }

  const handleGenreChange = (genre) => {
    if (genre === activeGenre && activeQuery === "") return
    setLoading(true)
    setError(null)
    setMovies([])
    setPage(1)
    setQuery("")
    setActiveQuery("")
    setActiveGenre(genre)
  }

  const handleSortChange = (nextSort) => {
    if (nextSort === sort) return
    setLoading(true)
    setError(null)
    setMovies([])
    setPage(1)
    setSort(nextSort)
  }

  const isInWatchlist = useCallback(
    (id) => watchlist.some((m) => m.id === id),
    [watchlist]
  )

  // TMDB caps at 500 pages * 20 results = 10,000 but shows nicer number
  const displayTotal = totalResults > 10000 ? "10,000+" : totalResults.toLocaleString()

  return (
    <div className="discover">
      {/* Page header */}
      <div className="discover-header">
        <h1>Discover Movies</h1>
        <p>Find your next favourite movie.</p>
      </div>

      {/* Search + Sort row */}
      <div className="discover-controls">
        <form className="discover-search-wrap" onSubmit={handleSearch} role="search">
          <span className="discover-search-icon">
            <SearchIcon />
          </span>
          <input
            ref={searchInputRef}
            type="search"
            className="discover-search-input"
            placeholder="Search movies, directors, actors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search movies"
            id="discover-search"
          />
          <span className="discover-search-kbd" aria-hidden="true">⌘ K</span>
        </form>

        <SortDropdown value={sort} onChange={handleSortChange} />
      </div>

      {/* Genre pills */}
      <div className="discover-genres" role="group" aria-label="Filter by genre">
        <button
          className={`genre-pill${activeGenre === "" ? " active" : ""}`}
          onClick={() => handleGenreChange("")}
          aria-pressed={activeGenre === ""}
        >
          All genres
        </button>
        {genres.map((g) => (
          <button
            key={g.id}
            className={`genre-pill${activeGenre === String(g.id) ? " active" : ""}`}
            onClick={() => handleGenreChange(activeGenre === String(g.id) ? "" : String(g.id))}
            aria-pressed={activeGenre === String(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && !error && (
        <div className="discover-results-meta" aria-live="polite" aria-atomic="true">
          <span className="discover-results-count">{displayTotal} movies</span>
          <span className="discover-results-label">to explore</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p role="alert" style={{ padding: "2rem", color: "var(--color-ink-muted)", textAlign: "center" }}>
          {error}
        </p>
      )}

      {/* Grid */}
      <div className="discover-grid" aria-label="Movie results">
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
          : movies.map((movie) => (
              <DiscoverCard
                key={movie.id}
                movie={movie}
                isInWatchlist={isInWatchlist}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))
        }
      </div>

      {!loading && !error && movies.length === 0 && (
        <p className="discover-empty-state">No movies found in this category.</p>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <nav className="discover-pagination" aria-label="Movie results pages">
          <p className="discover-showing">
            Page {page.toLocaleString()} of {totalPages.toLocaleString()} · {displayTotal} movies
          </p>
          <div className="discover-pagination-controls">
            <button
              type="button"
              className="discover-page-btn discover-page-direction"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </button>
            {pageWindowStart > 1 && (
              <>
                <button type="button" className="discover-page-btn" onClick={() => goToPage(1)} disabled={loading}>1</button>
                {pageWindowStart > 2 && <span className="discover-page-ellipsis" aria-hidden="true">…</span>}
              </>
            )}
            {pageNumbers.map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={`discover-page-btn${pageNumber === page ? " active" : ""}`}
                onClick={() => goToPage(pageNumber)}
                disabled={loading || pageNumber === page}
                aria-label={`Page ${pageNumber}`}
                aria-current={pageNumber === page ? "page" : undefined}
              >
                {pageNumber}
              </button>
            ))}
            {pageWindowStart + pageNumbers.length - 1 < totalPages && (
              <>
                {pageWindowStart + pageNumbers.length < totalPages && (
                  <span className="discover-page-ellipsis" aria-hidden="true">…</span>
                )}
                <button type="button" className="discover-page-btn" onClick={() => goToPage(totalPages)} disabled={loading}>
                  {totalPages.toLocaleString()}
                </button>
              </>
            )}
            <button
              type="button"
              className="discover-page-btn discover-page-direction"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}

export default Discover

import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import gsap from "gsap"
import { getMovieDetails } from "../services/api"
import "../css/MovieDetails.css"

function MovieDetails({ favorites, onToggleFavorite }) {
    const { movieId } = useParams()
    const location = useLocation()
    const detailsRef = useRef(null)
    const returnTo = location.state?.returnTo || "/"
    const [movie, setMovie] = useState(location.state?.movie ?? null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isCurrent = true

        const loadMovieDetails = async () => {
            setMovie(location.state?.movie ?? null)
            setLoading(true)
            setError(null)

            try {
                const details = await getMovieDetails(movieId)
                if (isCurrent) setMovie(details)
            } catch (requestError) {
                if (isCurrent) setError(requestError.message || "Failed to load movie details.")
            } finally {
                if (isCurrent) setLoading(false)
            }
        }

        loadMovieDetails()
        return () => {
            isCurrent = false
        }
    }, [movieId, location.state])

    useEffect(() => {
        if (loading || !detailsRef.current?.querySelector(".movie-details-card")) return

        const media = gsap.matchMedia(detailsRef)
        media.add("(prefers-reduced-motion: no-preference)", () => {
            const timeline = gsap.timeline()
            timeline
                .from(".movie-details-back", {
                    x: -10,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.out",
                })
                .from(".movie-details-poster", {
                    x: -18,
                    opacity: 0,
                    duration: 0.42,
                    ease: "power2.out",
                }, "-=0.08")
                .from(".movie-details-copy > *", {
                    y: 12,
                    opacity: 0,
                    duration: 0.32,
                    stagger: 0.055,
                    ease: "power2.out",
                }, "-=0.2")
        })

        return () => media.revert()
    }, [loading, movie?.id])

    const isFavorite = movie && favorites.some((favorite) => favorite.id === movie.id)
    const trailer = movie?.videos?.results?.find((video) =>
        video.site === "YouTube" && video.type === "Trailer" && video.official && video.key
    ) || movie?.videos?.results?.find((video) =>
        video.site === "YouTube" && video.type === "Trailer" && video.key
    )
    const runtime = movie?.runtime
        ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
        : null

    return <section className="movie-details-page" ref={detailsRef}>
        <Link to={returnTo} className="movie-details-back">← Back to movies</Link>
        {loading && <p className="movie-details-message" role="status">Loading movie details...</p>}
        {error && <p className="movie-details-message" role="alert">{error}</p>}
        {movie && (
            <article className="movie-details-card">
                {movie.backdrop_path && (
                    <div
                        className="movie-details-backdrop"
                        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})` }}
                        aria-hidden="true"
                    />
                )}
                <div className="movie-details-content">
                    <div className="movie-details-poster">
                        {movie.poster_path ? (
                            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={`${movie.title} poster`} />
                        ) : (
                            <div className="movie-details-poster-empty">Poster unavailable</div>
                        )}
                    </div>
                    <div className="movie-details-copy">
                        <p className="movie-details-kicker">
                            {movie.release_date?.slice(0, 4) || "Release date unavailable"}
                            {runtime && ` · ${runtime}`}
                        </p>
                        <h1>{movie.title}</h1>
                        {movie.tagline && <p className="movie-details-tagline">{movie.tagline}</p>}
                        {movie.vote_average > 0 && (
                            <p className="movie-details-rating">★ {Number(movie.vote_average).toFixed(1)} / 10</p>
                        )}
                        <h2>Overview</h2>
                        <p className="movie-details-overview">{movie.overview || "No overview is available for this movie yet."}</p>
                        {movie.genres?.length > 0 && (
                            <p className="movie-details-genres">{movie.genres.map((genre) => genre.name).join(" · ")}</p>
                        )}
                        <div className="movie-details-actions">
                            <button
                                type="button"
                                className="movie-details-favorite"
                                onClick={() => onToggleFavorite(movie)}
                                aria-pressed={Boolean(isFavorite)}
                            >
                                {isFavorite ? "♥ Remove from favorites" : "♡ Add to favorites"}
                            </button>
                            {trailer && (
                                <a
                                    className="movie-details-trailer"
                                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Watch trailer <span aria-hidden="true">↗</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        )}
    </section>
}

export default MovieDetails
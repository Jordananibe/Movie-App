import { useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import gsap from "gsap"
import "../css/MovieCard.css"

function MovieCard({ movie, isFavorite, onToggleFavorite }){
    const location = useLocation()
    const favoriteButtonRef = useRef(null)

    useEffect(() => {
        const media = gsap.matchMedia(favoriteButtonRef)
        media.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.fromTo(favoriteButtonRef.current, {
                scale: 0.72,
            }, {
                scale: 1,
                duration: 0.38,
                ease: "back.out(2.5)",
            })
        })

        return () => media.revert()
    }, [isFavorite])

    return <div className="movie-card">
        <Link
            to={`/movie/${movie.id}`}
            state={{ movie, returnTo: `${location.pathname}${location.search}` }}
            className="movie-card-link"
            aria-label={`View details for ${movie.title}`}
        >
            <div className="movie-poster">
                {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                ) : (
                    <div role="img" aria-label={`Poster unavailable for ${movie.title}`} />
                )}
                <div className="movie-overlay" aria-hidden="true">
                    <span className="movie-overlay-label">View details <span aria-hidden="true">→</span></span>
                </div>
            </div>
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{movie.release_date}</p>
            </div>
        </Link>
        <button
            type="button"
            className={`favorite-btn${isFavorite ? " active" : ""}`}
            ref={favoriteButtonRef}
            onClick={() => onToggleFavorite(movie)}
            aria-label={isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
            aria-pressed={isFavorite}
        >
            {isFavorite ? "♥" : "♡"}
        </button>

    </div>

}
export default MovieCard
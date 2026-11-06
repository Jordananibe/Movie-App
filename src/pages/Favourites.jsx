import "../css/Favorites.css"
import MovieCard from "../components/MovieCard"

function Favorites({ favorites, onToggleFavorite }){
    if (favorites.length === 0) {
        return <div className="favorites-empty">
            <h2>No Favorite Movies Yet</h2>
            <p>Add movies with the heart button and they will appear here.</p>
        </div>
    }

    return <section className="favorites">
        <h2>Favorite Movies</h2>
        <div className="movies-grid">
            {favorites.map(movie => (
                <MovieCard
                    movie={movie}
                    key={movie.id}
                    isFavorite
                    onToggleFavorite={onToggleFavorite}
                />
            ))}
        </div>
    </section>
}
export default Favorites
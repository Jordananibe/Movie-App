const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const fetchTmdb = async (path, params = {}) => {
    if (!API_KEY) {
        throw new Error("Missing VITE_TMDB_API_KEY. Add it to .env.local and restart the dev server.");
    }

    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set("api_key", API_KEY);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.status_message || `TMDB request failed (${response.status}).`);
    }

    return data;
};

const fetchMoviePage = async (path, params = {}) => {
    const data = await fetchTmdb(path, params);
    return {
        movies: Array.isArray(data.results) ? data.results : [],
        totalPages: Math.min(data.total_pages || 1, 500),
    };
};

export const getPopularMovies = (page = 1) => fetchMoviePage("/movie/popular", { page });

export const searchMovies = (query, page = 1) => fetchMoviePage("/search/movie", { query, page });

export const getMovieCatalog = ({ page = 1, query = "", genre = "", year = "", sort = "popularity.desc" }) => {
    // Use /search/movie when there's a text query (discover doesn't support free-text)
    if (query) {
        const params = { query, page };
        if (genre) params.with_genres = genre;
        if (year) params.primary_release_year = year;
        return fetchMoviePage("/search/movie", params);
    }
    const params = { page, sort_by: sort };
    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = year;
    if (sort === "vote_average.desc") params["vote_count.gte"] = 100;
    return fetchMoviePage("/discover/movie", params);
};

export const getMovieGenres = async () => {
    const data = await fetchTmdb("/genre/movie/list");
    return Array.isArray(data.genres) ? data.genres : [];
};

export const getMovieDetails = (movieId) => fetchTmdb(`/movie/${movieId}`, { append_to_response: "videos,credits" });

// Home page sections
export const getTrendingMovies = (timeWindow = "week") =>
    fetchMoviePage(`/trending/movie/${timeWindow}`);

export const getNowPlayingMovies = () =>
    fetchMoviePage("/movie/now_playing");

export const getTopRatedMovies = (page = 1) =>
    fetchMoviePage("/movie/top_rated", { page });

export const getUpcomingMovies = () =>
    fetchMoviePage("/movie/upcoming");

export const getMovieRecommendations = (movieId) =>
    fetchMoviePage(`/movie/${movieId}/recommendations`);

export const getSimilarMovies = (movieId) =>
    fetchMoviePage(`/movie/${movieId}/similar`);

// Spotlight – returns a single featured movie with full details
export const getSpotlightMovie = async () => {
    const { movies } = await fetchMoviePage("/movie/now_playing", { page: 1 });
    const candidates = movies.filter((m) => m.backdrop_path && m.overview);
    const pick = candidates[Math.floor(Math.random() * Math.min(candidates.length, 5))];
    if (!pick) return null;
    return fetchTmdb(`/movie/${pick.id}`, { append_to_response: "videos" });
};

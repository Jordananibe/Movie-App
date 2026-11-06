import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import './css/App.css'
import Home from "./pages/Home"
import Discover from "./pages/Discover"
import Watchlist from "./pages/Watchlist"
import MovieDetails from "./pages/MovieDetails"
import { Routes, Route } from "react-router-dom"
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"


function App() {
  const toastRef = useRef(null)
  const toastTimerRef = useRef(null)
  const [toastMessage, setToastMessage] = useState("")

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("frameWatchlist") || "[]")
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  const [watchedIds, setWatchedIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("frameWatchedMovies") || "[]")
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem("frameWatchlist", JSON.stringify(watchlist))
  }, [watchlist])

  useEffect(() => {
    setWatchedIds((current) => {
      const watchlistIds = new Set(watchlist.map((movie) => movie.id))
      return current.filter((id) => watchlistIds.has(id))
    })
  }, [watchlist])

  useEffect(() => {
    localStorage.setItem("frameWatchedMovies", JSON.stringify(watchedIds))
  }, [watchedIds])

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), [])

  useEffect(() => {
    if (!toastMessage) return

    const media = gsap.matchMedia(toastRef)
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(toastRef.current, { y: 16, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.3, ease: "power2.out",
      })
    })

    return () => media.revert()
  }, [toastMessage])

  const toggleWatchlist = (movie) => {
    const inList = watchlist.some((m) => m.id === movie.id)
    setWatchlist((current) =>
      inList
        ? current.filter((m) => m.id !== movie.id)
        : [...current, movie]
    )
    if (inList) {
      setWatchedIds((current) => current.filter((id) => id !== movie.id))
    }
    setToastMessage(`${movie.title} ${inList ? "removed from" : "added to"} watchlist`)
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToastMessage(""), 2400)
  }

  const toggleWatched = (movieId) => {
    setWatchedIds((current) =>
      current.includes(movieId)
        ? current.filter((id) => id !== movieId)
        : [...current, movieId]
    )
  }

  return (
    <div className="app-shell">
      <NavBar />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Home watchlist={watchlist} onToggleWatchlist={toggleWatchlist} />}
          />
          <Route
            path="/discover"
            element={<Discover watchlist={watchlist} onToggleWatchlist={toggleWatchlist} />}
          />
          <Route
            path="/watchlist"
            element={
              <Watchlist
                watchlist={watchlist}
                watchedIds={watchedIds}
                onToggleWatchlist={toggleWatchlist}
                onToggleWatched={toggleWatched}
              />
            }
          />
          <Route
            path="/movie/:movieId"
            element={<MovieDetails favorites={watchlist} onToggleFavorite={toggleWatchlist} />}
          />
        </Routes>
      </main>

      <Footer />

      {toastMessage && (
        <div className="favorite-toast" role="status" ref={toastRef}>
          <span aria-hidden="true">◎</span>
          {toastMessage}
        </div>
      )}
    </div>
  )
}

export default App
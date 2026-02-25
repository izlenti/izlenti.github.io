import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomDock from './components/BottomDock';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import SearchResults from './pages/SearchResults';
import Watchlist from './pages/Watchlist';
import DetailView from './pages/DetailView';


const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const App = () => {
    // Watchlist state (localStorage)
    const [watchlist, setWatchlist] = useState(() => {
        try {
            const saved = localStorage.getItem('moviq_watchlist');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('moviq_watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    const isInWatchlist = (id) => watchlist.some(item => item.id === id);

    const toggleWatchlist = (movie) => {
        setWatchlist(prev => {
            const exists = prev.find(m => m.id === movie.id);
            if (exists) {
                return prev.filter(m => m.id !== movie.id);
            } else {
                return [...prev, { ...movie, addedAt: Date.now() }];
            }
        });
    };

    return (
        <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] text-slate-100 font-sans selection:bg-cyan-500/30 relative overflow-hidden flex flex-col">
                <Header watchlistCount={watchlist.length} />

                <main className="max-w-6xl mx-auto px-4 py-8 relative z-10 flex-1 w-full">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/category/:id"
                            element={<CategoryPage
                                watchlist={watchlist}
                                toggleWatchlist={toggleWatchlist}
                                isInWatchlist={isInWatchlist}
                            />}
                        />
                        <Route
                            path="/search"
                            element={<SearchResults
                                toggleWatchlist={toggleWatchlist}
                                isInWatchlist={isInWatchlist}
                            />}
                        />
                        <Route
                            path="/watchlist"
                            element={<Watchlist
                                watchlist={watchlist}
                                toggleWatchlist={toggleWatchlist}
                            />}
                        />
                        <Route
                            path="/:type/:id"
                            element={<DetailView
                                toggleWatchlist={toggleWatchlist}
                                isInWatchlist={isInWatchlist}
                            />}
                        />
                    </Routes>
                </main>

                <Footer />
            </div>
        </Router>
    );
};

export default App;

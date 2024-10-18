const API_KEY = 'ddf69887bef48b884e9d1c8c4b9556e8';
const BASE_URL = 'https://api.themoviedb.org/3';
const trendingMoviesContainer = document.getElementById('trending-movies');
const categoryMoviesContainer = document.getElementById('category-movies');
const watchlistMoviesContainer = document.getElementById('watchlist-movies');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const popupContainer = document.getElementById('popup-container');

// Show loading spinner
function showLoadingSpinner() {
    loadingSpinner.style.display = 'block';
}

// Hide loading spinner
function hideLoadingSpinner() {
    loadingSpinner.style.display = 'none';
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Fetch and display trending movies
async function fetchTrendingMovies() {
    showLoadingSpinner();
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        renderMovies(data.results, trendingMoviesContainer);
    } catch (error) {
        showError('Failed to fetch trending movies.');
    } finally {
        hideLoadingSpinner();
    }
}

// Fetch movies by category
async function fetchMoviesByCategory(genre) {
    showLoadingSpinner();
    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genre}&language=en-US`);
        const data = await response.json();
        renderMovies(data.results, categoryMoviesContainer);
    } catch (error) {
        showError('Failed to fetch movies by category.');
    } finally {
        hideLoadingSpinner();
    }
}

// Search for movies
async function searchMovies(query) {
    showLoadingSpinner();
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
        const data = await response.json();
        renderMovies(data.results, trendingMoviesContainer);
    } catch (error) {
        showError('Failed to search movies.');
    } finally {
        hideLoadingSpinner();
    }
}

// Render movie cards in the DOM
function renderMovies(movies, container) {
    container.innerHTML = '';
    if (movies.length === 0) {
        container.innerHTML = '<p>No movies found.</p>';
        return;
    }
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'card';
        movieCard.innerHTML = `
            <div class="img">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            </div>
            <div class="info">
                <h2>${movie.title}</h2>
                <div class="single-info">
                    <span>Rating: ${movie.vote_average}</span>
                    <span class="heart-icon" data-id="${movie.id}">❤️</span>
                </div>
            </div>
        `;
        movieCard.addEventListener('click', () => showMovieDetails(movie.id));
        container.appendChild(movieCard);
    });
}

// Show movie details
async function showMovieDetails(movieId) {
    showLoadingSpinner();
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
        const movie = await response.json();
        renderMovieDetails(movie);
    } catch (error) {
        showError('Failed to fetch movie details.');
    } finally {
        hideLoadingSpinner();
    }
}


// Render movie details in a popup
function renderMovieDetails(movie) {
    const content = `
        <div class="content">
            <div class="left">
                <img class="poster-img" src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <div class="single-info-container">
                    <h1>${movie.title}</h1>
                    <div class="single-info">Rating: ${movie.vote_average}</div>
                    <div class="single-info">Release Date: ${movie.release_date}</div>
                    <div class="single-info">Overview: ${movie.overview}</div>
                    <div class="single-info">
                        <span class="heart-icon" data-id="${movie.id}">❤️</span>
                    </div>
                </div>
            </div>
            <div class="right">
                <h2>Trailers</h2>
                <div class="trailer">
                    <iframe src="https://www.youtube.com/embed/${movie.trailer_key}" frameborder="0" allowfullscreen></iframe>
                </div>
            </div>
        </div>
        <span class="x-icon" id="close-popup">✖️</span>
    `;
    popupContainer.innerHTML = content;
    popupContainer.classList.add('show-popup');

    // Add event listener to close popup
    document.getElementById('close-popup').addEventListener('click', () => {
        popupContainer.classList.remove('show-popup');
    });

    // Add movie to watchlist
    const heartIcon = document.querySelector('.heart-icon[data-id="' + movie.id + '"]');
    heartIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the movie detail view
        addToWatchlist(movie);
    });
}


// Add movie to watchlist
function addToWatchlist(movie) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (!watchlist.find(m => m.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        renderWatchlist();
    }
}

// Remove movie from watchlist
function removeFromWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(movie => movie.id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    renderWatchlist();
}

// Render movies from watchlist
function renderWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlistMoviesContainer.innerHTML = '';
    watchlist.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'card';
        movieCard.innerHTML = `
            <div class="img">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            </div>
            <div class="info">
                <h2>${movie.title}</h2>
                <div class="single-info">
                    <span>Rating: ${movie.vote_average}</span>
                    <span class="remove-icon" data-id="${movie.id}">❌</span>
                </div>
            </div>
        `;
        movieCard.querySelector('.remove-icon').addEventListener('click', () => {
            removeFromWatchlist(movie.id);
        });
        watchlistMoviesContainer.appendChild(movieCard);
    });
}

// Add event listeners for category buttons
document.querySelectorAll('.category-button').forEach(button => {
    button.addEventListener('click', () => {
        const genre = button.getAttribute('data-genre');
        fetchMoviesByCategory(genre);
    });
});

// Add event listener for search button
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchMovies(query);
    }
});

// Initialize app
function init() {
    fetchTrendingMovies();
    renderWatchlist(); // Load watchlist on init
}

init();

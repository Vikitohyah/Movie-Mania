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

async function showMovieDetails(movieId) {
    // Show a loading spinner while fetching data
    showLoadingSpinner();
    
    try {
        // Fetch detailed movie information, including credits and videos
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`);
        const movie = await response.json();

        // Hide the loading spinner once data is fetched
        hideLoadingSpinner();

        // Get the HTML element to display movie details
        const movieDetails = document.getElementById("movieDetails");

        // Clear any existing content
        movieDetails.innerHTML = "";

        // Populate movie details with fetched data
        movieDetails.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h2>${movie.title}</h2>
                    <button id="closePopup">X</button>
                </div>
                <div class="popup-body">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Poster" class="movie-poster">
                    <div class="movie-info">
                        <p><strong>Rating:</strong> ${movie.vote_average} / 10</p>
                        <p><strong>Release Date:</strong> ${movie.release_date}</p>
                        <p><strong>Genres:</strong> ${movie.genres.map(genre => genre.name).join(", ")}</p>
                        <p><strong>Overview:</strong> ${movie.overview}</p>
                        <button id="watchTrailer">Watch Trailer</button>
                    </div>
                </div>
            </div>
        `;

        // Show the popup
        movieDetails.style.display = "flex";

        // Close the popup when the close button is clicked
        document.getElementById("closePopup").addEventListener("click", () => {
            movieDetails.style.display = "none";
        });

        // Open the trailer in a new tab when the trailer button is clicked
        const trailer = movie.videos.results.find(video => video.type === "Trailer");
        if (trailer) {
            document.getElementById("watchTrailer").addEventListener("click", () => {
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
            });
        } else {
            document.getElementById("watchTrailer").style.display = "none"; // Hide button if no trailer
        }

    } catch (error) {
        console.error("Error fetching movie details:", error);
    }

}

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

        // Prevent opening details when the heart icon is clicked
        movieCard.querySelector('.heart-icon').addEventListener('click', (e) => {
            e.stopPropagation();  // Prevents triggering showMovieDetails
            handleHeartIconClick(movie);
        });

        // Add event listener to show movie details when clicking the card (excluding the heart icon)
        movieCard.addEventListener('click', () => showMovieDetails(movie.id));
        container.appendChild(movieCard);
    });
}


  
function handleHeartIconClick(movie) {
    addToWatchlist(movie);
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

const themeToggle = document.getElementById('theme-toggle');

// Listen for changes on the checkbox input
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('light-mode', themeToggle.checked);
    localStorage.setItem('theme', themeToggle.checked ? 'light' : 'dark');
});

// Load theme from localStorage and apply it on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const isLightMode = savedTheme === 'light';
    document.body.classList.toggle('light-mode', isLightMode);
    themeToggle.checked = isLightMode; // Set the switch position based on saved theme
}

loadTheme();


/** const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
}

loadTheme();**/ 

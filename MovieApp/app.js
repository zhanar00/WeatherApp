const apiKey = "5f66b10f0a1210fd6704d13b0df47650";
const baseURL = "https://api.themoviedb.org/3";
const apiURL = `${baseURL}/discover/movie?sort_by=popularity.desc&api_key=${apiKey}`; 
const imgURL = "https://image.tmdb.org/t/p/w500";
const searchURL = `${baseURL}/search/movie?&api_key=${apiKey}`;
let sortBy = "popularity.desc";
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];


const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const suggestionBox = document.getElementById('suggestions');
const sortOptions = document.getElementById("sort-options");
const watchlistSection = document.getElementById("watchlist");
const watchlistMovies = document.getElementById("watchlist-movies");
const viewWatchlistButton = document.getElementById("view-watchlist");

getMovies(`${baseURL}/discover/movie?sort_by=${sortBy}&api_key=${apiKey}`);

function getMovies(url) {
  fetch(url)
  .then((res) => res.json())
  .then((data) => {
    console.log(data.results);
    showMovies(data.results);
  })
}

sortOptions.addEventListener("change", () => {
  sortBy = sortOptions.value;
  const sortedURL = `${baseURL}/discover/movie?sort_by=${sortBy}&api_key=${apiKey}`;
  getMovies(sortedURL); 
});

function showMovies(data) {
  main.innerHTML = '';

  data.forEach(movie => {
    const { id, title, poster_path, vote_average, release_date, overview } = movie;
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie');
    movieElement.innerHTML = `
      <img src="${imgURL + poster_path}" alt="${title}">
      <div class="movie-info">
        <div class="info1">
          <h3>${title}</h3>
          <span class="${getColor(vote_average)}">${roundVote(vote_average)}</span>
        </div>
        <div class="info2">
          <p>Release: ${release_date ? release_date: "N/A"}</p>
        </div>
      </div>
      <button class="add-to-watchlist" onclick="addToWatchlist(${id}, '${title}', '${poster_path}', ${vote_average})">
        Add to Watchlist
      </button>
      <div class="overview">
        <h3>Overview:</h3>
        ${overview}
      </div>
    `;
    main.appendChild(movieElement);
  });
}

function addToWatchlist(id, title, poster_path, vote_average) {
  const movie = { id, title, poster_path, vote_average };
  const exists = watchlist.find(item => item.id === id);

  if (!exists) {
    watchlist.push(movie);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    alert(`${title} added to watchlist!`);
  } else {
    alert(`${title} is already in the watchlist.`);
  }
}

// Функция для отображения Watchlist
function displayWatchlist() {
  watchlistMovies.innerHTML = ''; // Очищаем текущий список перед рендером
  if (watchlist.length === 0) {
    watchlistMovies.innerHTML = "<p>No movies in your watchlist.</p>"; // Сообщение, если список пуст
  }
  watchlist.forEach(movie => {
    const { title, poster_path, vote_average } = movie;
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie');
    movieElement.innerHTML = `
      <img src="${imgURL + poster_path}" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getColor(vote_average)}">${roundVote(vote_average)}</span>
      </div>
    `;
    watchlistMovies.appendChild(movieElement);
  });
  watchlistSection.classList.remove("hidden"); // Показываем секцию с watchlist
}

viewWatchlistButton.addEventListener("click", () => {
  console.log("View Watchlist button clicked"); // Логирование для проверки
  // Проверяем видимость секции
  if (watchlistSection.classList.contains("hidden")) {
      watchlistSection.classList.remove("hidden"); // Показываем секцию
      displayWatchlist(); // Отображаем список
      console.log("Watchlist section shown"); // Логирование для проверки
  } else {
      watchlistSection.classList.add("hidden"); // Скрываем секцию
      console.log("Watchlist section hidden"); // Логирование для проверки
  }
});



function roundVote(vote) {
  return Math.round(vote * 10) / 10;
}


function getColor(vote) {
  if(vote >= 7) {
    return 'green'
  }else if(vote >= 5) {
    return "orange"
  }else {
    return "red"
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value;

  if(searchTerm) {
    getMovies(searchURL + "&query=" + searchTerm);
  }else {
    getMovies(apiURL);
  }
})

search.addEventListener('input', () => {
  const query = search.value;
  if (query.length > 1) {
    fetchSuggestions(query);
  } else {
    suggestionBox.innerHTML = ''; 
  }
});

async function fetchSuggestions(query) {
  try {
    const response = await fetch(`${searchURL}&query=${query}`);
    const data = await response.json();
    showSuggestions(data.results);
  } catch (error) {
    console.log('Error fetching suggestions:', error);
  }
}

function showSuggestions(movies) {
  suggestionBox.innerHTML = ''; 
  movies.forEach(movie => {
    const suggestionItem = document.createElement('div');
    suggestionItem.classList.add('suggestion-item');
    suggestionItem.textContent = movie.title;
    suggestionItem.onclick = () => {
      search.value = movie.title;
      suggestionBox.innerHTML = ''; 
    };
    suggestionBox.appendChild(suggestionItem);
  });
}

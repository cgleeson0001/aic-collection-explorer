// ==============================
// GRAB ELEMENTS FROM THE PAGE
// ==============================

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsGrid = document.getElementById('results-grid');
const errorMessage = document.getElementById('error-message');
const loadingMessage = document.getElementById('loading');
const searchView = document.getElementById('search-view');
const detailView = document.getElementById('detail-view');
const backBtn = document.getElementById('back-btn');
const navTitle = document.getElementById('nav-title');
// Store last search term and results so going back doesn't re-fetch
let lastSearchTerm = '';

// ==============================
// SEARCH BUTTON CLICK EVENT
// ==============================

searchBtn.addEventListener('click', function() {
  const searchTerm = searchInput.value.trim();

 // ERROR CASE 1: user clicked search without typing anything
if (searchTerm === '') {
  showError('Please enter a search term.');
  return;
}

// ERROR CASE 2: user typed only special characters or symbols
const lettersOnly = searchTerm.replace(/[^a-zA-Z0-9 ]/g, '').trim();
if (lettersOnly.length < 3) {
  showError('Please enter a valid search term with at least 3 letters.');
  return;
}

  // If we get here, the search term exists — go fetch artworks
  fetchArtworks(searchTerm);
});

// Also search when user presses Enter key in the input
searchInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// ==============================
// FETCH ARTWORKS FROM THE API
// ==============================

async function fetchArtworks(searchTerm) {

// Show loading, clear old results and errors
showLoading(true);
clearError();
resultsGrid.innerHTML = '';

// Save the current search term so we can show it when user goes back
lastSearchTerm = searchTerm;

  // Build the API URL
    const url = `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&fields=id,title,artist_display,image_id,_score&query[term][is_public_domain]=true&limit=20`;

  try {
    // Send the request to the API
    const response = await fetch(url);
    const data = await response.json();

    // Hide loading now that we have data
    showLoading(false);

    // Filter out low confidence results
    const goodResults = data.data.filter(artwork => artwork._score > 10);

    if (goodResults.length === 0) {
      showError(`No results found for "${searchTerm}". Try a different search term.`);
      return;
    }

    // We have results — build the cards
    displayResults(goodResults);



  } catch (error) {
    // ERROR CASE 3: network error or API is down
    showLoading(false);
    showError('Something went wrong. Please check your internet connection and try again.');
  }
}

// ==============================
// BUILD AND DISPLAY CARDS
// ==============================

function displayResults(artworks) {
  resultsGrid.innerHTML = '';

  artworks.forEach(function(artwork) {

    // Build the image URL using image_id
    // Some artworks have no image — use a placeholder in that case
    let imageHTML = '';
    if (artwork.image_id) {
      const imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`;
      imageHTML = `<img class="card-image" src="${imageUrl}" alt="${artwork.title}" />`;
    } else {
      imageHTML = `<div class="card-image no-image"><p>No image available</p></div>`;
    }

    // Build the full card HTML
    const card = document.createElement('div');
    card.className = 'artwork-card';
    card.dataset.id = artwork.id;
    card.innerHTML = `
      ${imageHTML}
      <div class="card-info">
        <p class="card-title">${artwork.title || 'Untitled'}</p>
        <p class="card-artist">${artwork.artist_display || 'Unknown artist'}</p>
      </div>
    `;

    // Click card to view full detail
    card.addEventListener('click', function() {
      const artworkId = card.dataset.id;
      showDetailView(artworkId);
    });

    // Add the card to the grid
    resultsGrid.appendChild(card);
  });
}

// ==============================
// HELPER FUNCTIONS
// ==============================

function showLoading(isLoading) {
  loadingMessage.style.display = isLoading ? 'block' : 'none';
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.style.display = 'none';
}

// ==============================
// SHOW AND HIDE VIEWS
// ==============================

function showDetailView(artworkId) {
  // Hide search view, show detail view
  searchView.style.display = 'none';
  detailView.style.display = 'block';

  // Fetch the full artwork details
  fetchArtworkDetail(artworkId);
}

function showSearchView() {
  // Hide detail view, show search view
  detailView.style.display = 'none';
  searchView.style.display = 'block';

  // Restore the search term in the input box
  if (lastSearchTerm) {
    searchInput.value = lastSearchTerm;
  }
}

// ==============================
// FETCH SINGLE ARTWORK DETAIL
// ==============================

async function fetchArtworkDetail(artworkId) {
  const detailLoading = document.getElementById('detail-loading');
  const detailError = document.getElementById('detail-error');
  const artworkDetail = document.getElementById('artwork-detail');

  // Show loading, clear old content
  detailLoading.style.display = 'block';
  detailError.style.display = 'none';
  artworkDetail.innerHTML = '';

  // Build the API URL for a single artwork
  const url = `https://api.artic.edu/api/v1/artworks/${artworkId}?fields=id,title,artist_display,date_display,medium_display,dimensions,image_id`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Hide loading
    detailLoading.style.display = 'none';

    // Display the artwork
    displayArtworkDetail(data.data);

  } catch (error) {
    detailLoading.style.display = 'none';
    detailError.textContent = 'Something went wrong loading this artwork. Please go back and try again.';
    detailError.style.display = 'block';
  }
}

// ==============================
// BUILD THE DETAIL PAGE
// ==============================

function displayArtworkDetail(artwork) {
  const artworkDetail = document.getElementById('artwork-detail');

  // Build image or placeholder
  let imageHTML = '';
  if (artwork.image_id) {
    const imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`;
    imageHTML = `<img src="${imageUrl}" alt="${artwork.title}" />`;
  } else {
    imageHTML = `<div class="detail-no-image"><p>No image available for this artwork</p></div>`;
  }

  // Build the full detail HTML
  artworkDetail.innerHTML = `
    ${imageHTML}
    <div class="detail-info">
      <h2>${artwork.title || 'Untitled'}</h2>
      <p><span class="detail-label">Artist: </span>${artwork.artist_display || 'Unknown artist'}</p>
      <p><span class="detail-label">Date: </span>${artwork.date_display || 'Unknown date'}</p>
      <p><span class="detail-label">Medium: </span>${artwork.medium_display || 'Unknown medium'}</p>
      <p><span class="detail-label">Dimensions: </span>${artwork.dimensions || 'Unknown dimensions'}</p>
    </div>
  `;
}

// ==============================
// BACK BUTTON
// ==============================

backBtn.addEventListener('click', function() {
  showSearchView();
});

// NAV TITLE CLICK — always goes back to search view
navTitle.addEventListener('click', function() {
  showSearchView();
});
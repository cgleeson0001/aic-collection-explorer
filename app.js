//grab elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsGrid = document.getElementById('results-grid');
const errorMessage = document.getElementById('error-message');
const loadingMessage = document.getElementById('loading');
const searchView = document.getElementById('search-view');
const detailView = document.getElementById('detail-view');
const backBtn = document.getElementById('back-btn');
const navTitle = document.getElementById('nav-title');

let lastSearchTerm = '';
const FETCH_TIMEOUT = 8000;


//search button
searchBtn.addEventListener('click', function() {
  const searchTerm = searchInput.value.trim();

 //if blank search term
if (searchTerm === '') {
  showError('Please enter a search term.');
  return;
}

//special characters or symbols
const lettersOnly = searchTerm.replace(/[^a-zA-Z0-9 ]/g, '').trim();
if (lettersOnly.length < 3) {
  showError('Please enter a valid search term with at least 3 letters.');
  return;
}

  //fetch artworks
  fetchArtworks(searchTerm);
});

//search when user presses enter key
searchInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// clear error message when user starts typing
searchInput.addEventListener('input', function() {
  clearError();
});

//fetch artwork from api
async function fetchArtworks(searchTerm) {

//show loading and clear old results
showLoading(true);
clearError();
resultsGrid.innerHTML = '';

//save the current search
lastSearchTerm = searchTerm;

  //build api url
    const url = `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}&fields=id,title,artist_display,image_id,_score&query[term][is_public_domain]=true&limit=20`;

  try {
    // send the request to api
    const response = await Promise.race([
  fetch(url),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), FETCH_TIMEOUT)
  )
]);
    const data = await response.json();

    //hide loading now
    showLoading(false);

    //filter out low confidence results
    const goodResults = data.data.filter(artwork => artwork._score > 10);

if (goodResults.length === 0) {
  const resultsCount = document.getElementById('results-count');
  resultsCount.textContent = '';
  resultsGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem;">
      <p style="font-size: 1.5rem; color: #899; margin-bottom: 0.5rem;">No results found for "${searchTerm}"</p>
      <p style="font-size: 1rem; color: #ccc;">Try a different search term like "van gogh", "canvas", or "woodblock"</p>
    </div>
  `;
  showLoading(false);
  return;
}

    //build cards
    displayResults(goodResults);



  } catch (error) {
    //if network error or api down
    showLoading(false);
    showError('Something went wrong. Please check your internet connection and try again.');
  }
}

//build cards
function displayResults(artworks) {
  resultsGrid.innerHTML = '';

  //results count
  const resultsCount = document.getElementById('results-count');
  resultsCount.textContent = `${artworks.length} artworks found`;

  artworks.forEach(function(artwork) {

   
    // use placeholder if artwork has no image
    let imageHTML = '';
    if (artwork.image_id) {
      const imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`;
      imageHTML = `<img class="card-image" src="${imageUrl}" alt="${artwork.title}" />`;
    } else {
      imageHTML = `<div class="card-image no-image"><p>No image available</p></div>`;
    }

    // build full card
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

    // click card to view full detail
    card.addEventListener('click', function() {
      const artworkId = card.dataset.id;
      showDetailView(artworkId);
    });

    // add card to grid
    resultsGrid.appendChild(card);
  });
}

//helper functions
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

//views
function showDetailView(artworkId) {
  // hide search view- show detail view
  searchView.style.display = 'none';
  detailView.style.display = 'block';

  // fetch full artwork details
  fetchArtworkDetail(artworkId);
}

function showSearchView() {
  // hide detail view- show search view
  detailView.style.display = 'none';
  searchView.style.display = 'block';

  // restore previous search term
  if (lastSearchTerm) {
    searchInput.value = lastSearchTerm;
  }
}

//fetch artwork details
async function fetchArtworkDetail(artworkId) {
  const detailLoading = document.getElementById('detail-loading');
  const detailError = document.getElementById('detail-error');
  const artworkDetail = document.getElementById('artwork-detail');

  // show loading- clear old content
  detailLoading.style.display = 'block';
  detailError.style.display = 'none';
  artworkDetail.innerHTML = '';

  //build api url for one artwork
  const url = `https://api.artic.edu/api/v1/artworks/${artworkId}?fields=id,title,artist_display,date_display,medium_display,dimensions,image_id`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // hide loading
    detailLoading.style.display = 'none';

    // display artwork
    displayArtworkDetail(data.data);

  } catch (error) {
    detailLoading.style.display = 'none';
    detailError.textContent = 'Something went wrong loading this artwork. Please go back and try again.';
    detailError.style.display = 'block';
  }
}

//build detail page
function displayArtworkDetail(artwork) {
  const artworkDetail = document.getElementById('artwork-detail');

  //image or placeholder
  let imageHTML = '';
  if (artwork.image_id) {
    const imageUrl = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`;
    imageHTML = `<img src="${imageUrl}" alt="${artwork.title}" />`;
  } else {
    imageHTML = `<div class="detail-no-image"><p>No image available</p></div>`;
  }

  //full detail html
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

//back button
backBtn.addEventListener('click', function() {
  showSearchView();
});

//nav title
navTitle.addEventListener('click', function() {
  showSearchView();
});
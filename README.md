# AIC Collection Explorer

A web application that lets you search and explore artwork from the Art Institute of Chicago's public collection. Browse thousands of paintings, sculptures, and other works of art with detailed information about each piece.

## Live Demo

> Clone the repo and open index.html in your browser to run locally — see How to Run below.

## Features

- Search over 100,000 artworks by keyword, artist, or style
- Browse results in a responsive image grid
- Click any artwork to view full details including image, artist, date, medium, and dimensions
- Navigate back to search results without losing your previous search
- Handles errors including empty searches, no results, and network issues

## API Used

**Art Institute of Chicago API**
- Documentation: https://api.artic.edu/docs
- Base URL: https://api.artic.edu/api/v1
- No API key required
- All artworks displayed are in the public domain

## Endpoints Used

**1. Search Artworks**
GET https://api.artic.edu/api/v1/artworks/search?q={searchTerm}&fields=id,title,artist_display,image_id,_score&query[term][is_public_domain]=true&limit=20
Used to search artworks by keyword and display results in a card grid.

**2. Artwork Detail**
GET https://api.artic.edu/api/v1/artworks/{id}?fields=id,title,artist_display,date_display,medium_display,dimensions,image_id
Used to fetch full details for a single artwork when a card is clicked.

## How to Run

1. Clone this repository:
git clone https://github.com/cgleeson0001/aic-collection-explorer.git

2. Navigate into the project folder:
cd aic-collection-explorer

3. Open index.html in your browser by double clicking it, or use a local server:
npx live-server

No installs or dependencies required — this project uses plain HTML, CSS, and JavaScript.

## Project Structure
aic-collection-explorer/
├── index.html       # Main HTML structure and layout
├── style.css        # All styles and responsive design
├── app.js           # JavaScript — API fetch, DOM manipulation, navigation
└── README.md        # Project documentation

## Error Handling

- Empty search: shows error message
- Special characters or gibberish: blocked with validation
- No results found: shows message with search suggestions
- Missing artwork image: shows placeholder
- Network error or timeout: shows error message
- Missing artwork details: shows fallback text for each field

## Technologies Used

- HTML5
- CSS3 (CSS Grid, Flexbox, responsive design)
- Vanilla JavaScript (Fetch API, async/await, DOM manipulation)
- Art Institute of Chicago public API
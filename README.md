# AIC Collection Explorer

This web app lets one search different art pieces from the Art Institute of Chicago's public collection.

## Live Demo

Clone repo and open index.html in your browser

## Features

- Search over 100,000 art pieces
- Browse results
- Click artwork to see details
- Handles errors

## API Used

**Art Institute of Chicago API**
- Documentation: https://api.artic.edu/docs
- Base URL: https://api.artic.edu/api/v1
- No API key required
- All artworks displayed are in the public domain

## Endpoints Used

**1. Search Artworks**
GET https://api.artic.edu/api/v1/artworks/search?q={searchTerm}&fields=id,title,artist_display,image_id,_score&query[term][is_public_domain]=true&limit=20

**2. Artwork Detail**
GET https://api.artic.edu/api/v1/artworks/{id}?fields=id,title,artist_display,date_display,medium_display,dimensions,image_id


## How to Run

1. Clone this repository:
git clone https://github.com/cgleeson0001/aic-collection-explorer.git

2. Navigate into the project folder:
cd aic-collection-explorer

3. Open index.html in browser by double clicking or use a local server:
npx live-server


## Project Structure
aic-collection-explorer/
index.html       # structure and layout
style.css        # All styles
app.js           # JavaScript — API fetch
README.md        # Project documentation

## Error Handling

- Empty search: shows error message
- Special characters or gibberish: blocked with validation
- No results found: shows message with search suggestions
- Missing artwork image: shows placeholder
- Network error or timeout: shows error message
- Missing artwork details: shows fallback text for each field

## Technologies Used

- HTML
- CSS
- JavaScript
- Art Institute of Chicago public API
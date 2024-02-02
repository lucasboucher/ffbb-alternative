# Quickstart

Download all dependencies with `pip3 install -r requirements.txt`

Launch development mode :

```sh
flask run --debug
```

Launch production mode :

```sh
gunicorn app:app --bind 0.0.0.0:8000
```

🇫🇷 Code's comments and interface only in French for now

## Config

- Set `.env` file with `.env.sample` template
- The scraper will be automatically launched when the project starts, but you can also update the data through the interface

# Technologies & Librairies:

## Scraper

- Python
  - BeautifulSoup
  - Flask

## Interface

- Vanilla JavaScript
  - Chart.js

# Sources

- Documentation BeautifulSoup: https://www.crummy.com/software/BeautifulSoup/bs4/doc/#searching-by-css-class
- Web Scraping Basics: https://towardsdatascience.com/web-scraping-basics-82f8b5acd45c
- Extract JSON from HTML using BeautifulSoup in Python: https://www.geeksforgeeks.org/extract-json-from-html-using-beautifulsoup-in-python/
- How to read JSON files into HTML using JavaScript's fetch (no D3, no jQuery, vanilla JS!): https://www.youtube.com/watch?v=C3dfjyft_m4
- Onefootball design: https://onefootball.com/fr/competition/ligue-1-uber-eats-23/classement
- Iconoir: https://iconoir.com

# TODO

- Time update
  - Sorting charts and all fixtures by date or by matchday (with ./team settings button)
  - Sort automatically next matchday fixtures by date
  - Print 6 last and next fixtures by time (with matchday indicator)
- Championship and pool management
  - Input to set championship
  - Select to set pool
- PR on GitHub
- New server scheduling system (CRON ?)
- Sort an array teams by rank (and not by default) for display ranking
- Beter JS organization (ternary operator, setAttribute(), ...)
- Light theme
- Refresh animation with icon
- Handle proxy error on Scraper
- Loader

## Bugs

- Pool selection
- To validate : add penalty compability

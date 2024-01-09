Overview of this side-project just [here (https://lucasboucher.fr/ffbb)](https://lucasboucher.fr/ffbb/)


# Docs
Firstly, run scraper/main.py to refresh data.

Need to run on a web server for JS Fetch API

Example with Python locally:
```bash
python3 -m http.server
```

# Config
You can modify the configuration file:
- `./scraper/config.py` For the URL of the championship and pool ID

# Technology & Librairies:
- Python (with JSON)
    - BeautifulSoup
    - requests
- Vanilla JavaScript
    - Chart.js
- HTML & CSS :)

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
- PR on GitHub
- Championship and pool management
- Refresh button / New server scheduling system (CRON ?)
- Sort an array teams by rank (and not by default) for display ranking
- Beter JS organization (ternary operator, setAttribute(), modules, ...)
- Light theme
- .ENV

## Bugs
- Calendar title when all matchs are played
- Animation for divided graphs
- Pool selection

# Notes
- re.sub()
- try: except:
- css selectors
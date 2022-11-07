Overview of this side-project just [here (https://lucasboucher.fr/ffbb)](https://lucasboucher.fr/ffbb/)


# Docs
Firstly, run scrapper/main.py to refresh data.

Need to run on a web server for JS Fetch API

Example with Python locally:
```bash
python3 -m http.server
```

# Config
You can modify the configuration file:
- `./scrapper/config.py` For the URL of the championship and pool ID

# Technology & Librairies:
- Python (with JSON)
    - BeautifulSoup
    - requests
- Vanilla JavaScript
    - Chart.js
- HTML & CSS :)

# Sources
- Documentation BeautifulSoup : https://www.crummy.com/software/BeautifulSoup/bs4/doc/#searching-by-css-class
- Web Scraping Basics : https://towardsdatascience.com/web-scraping-basics-82f8b5acd45c 
- Extract JSON from HTML using BeautifulSoup in Python : https://www.geeksforgeeks.org/extract-json-from-html-using-beautifulsoup-in-python/
- How to read JSON files into HTML using JavaScript's fetch (no D3, no jQuery, vanilla JS!) : https://www.youtube.com/watch?v=C3dfjyft_m4 
- Onefootball ranking design : https://onefootball.com/fr/competition/ligue-1-uber-eats-23/classement

# TODO
- Results, stats and calendar on new dedicated team page
- Sorting by date or by matchday
- CASBB shortcut
- Next matchday indicator

## Improvements
- Sort an array teams by rank (and not by default) for display ranking
- New server scheduling system (CRON ?)
- Better CSS and HTML organization (class names, CSS colors variables, ...)

# Colors
- Red : rgb(255, 47, 84)
- Blue : rgb(91, 186, 213)
- Green : rgb(29, 187, 121)
- White : rgb(243, 244, 245)
- Black : rgb(0, 0, 0)
- Dark grey (borders) : rgb(43, 43, 43)
- Dark grey (hover & background) : rgb(26, 26, 26)
- Grey (text) : rgb(184, 184, 184)

# Notes
- re.sub()
- try: except:
- css selectors
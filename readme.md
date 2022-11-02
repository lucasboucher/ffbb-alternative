Overview of this side-project just [here (https://lucasboucher.fr/ffbb)](https://lucasboucher.fr/ffbb/)


# Docs
Firstly, run scrapper/main.py to refresh data.

Need to run on a web server for Fetch API

Example with Python locally:
```bash
python3 -m http.server
```

# Config
You can modify some configuration files:
- `./config.js` For your highlighted team name
- `./scrapper/config.py` For the ID of the league

# Technology & Librairies:
- Python
    - BeautifulSoup
    - requests
- Vanilla JavaScript 
- HTML & CSS

# Sources
- Documentation BeautifulSoup : https://www.crummy.com/software/BeautifulSoup/bs4/doc/#searching-by-css-class
- Web Scraping Basics : https://towardsdatascience.com/web-scraping-basics-82f8b5acd45c 
- Extract JSON from HTML using BeautifulSoup in Python : https://www.geeksforgeeks.org/extract-json-from-html-using-beautifulsoup-in-python/
- How to read JSON files into HTML using JavaScript's fetch (no D3, no jQuery, vanilla JS!) : https://www.youtube.com/watch?v=C3dfjyft_m4 
- Classement Onefootball Classement : https://onefootball.com/fr/competition/ligue-1-uber-eats-23/classement

# Data
- FFBB ranking : https://resultats.ffbb.com/championnat/classements/b5e6211fb466b5e621216574.html
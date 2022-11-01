Technology & Librairies:
- Python
    - BeautifulSoup
    - requests
- JavaScript
    - JSON

Firstly, run scrapper/main.py to refresh data.

Need to run on a web server, with Python:
```bash
python3 -m http.server
```

Need scapper/config.py file with just in:
```python
league_id = "Your league ID"
```

Need config.js file with just in:
```javascript
const team_name_highlighted = "Full team name"
```
Sources
- Documentation BeautifulSoup : https://www.crummy.com/software/BeautifulSoup/bs4/doc/#searching-by-css-class
- Web Scraping Basics : https://towardsdatascience.com/web-scraping-basics-82f8b5acd45c 
- Extract JSON from HTML using BeautifulSoup in Python : https://www.geeksforgeeks.org/extract-json-from-html-using-beautifulsoup-in-python/
- How to read JSON files into HTML using JavaScript's fetch (no D3, no jQuery, vanilla JS!) : https://www.youtube.com/watch?v=C3dfjyft_m4 
- Classement Onefootball Classement : https://onefootball.com/fr/competition/ligue-1-uber-eats-23/classement

Données
- Classement FFBB : https://resultats.ffbb.com/championnat/classements/b5e6211fb466b5e621216574.html

Éléments :
- re.sub()
- try: except:
- css selectors
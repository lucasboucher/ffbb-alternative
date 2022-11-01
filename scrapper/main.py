from bs4 import BeautifulSoup
import requests
import json
import re
from config import league_id
from aiocron import crontab

url = 'https://resultats.ffbb.com/championnat/classements/' + league_id + '.html'
page = requests.get(url)
soup = BeautifulSoup(page.text, "html.parser")
teams = soup.select("table.liste tr")

def getTeams():
    res = []
    for team in teams:
        try:
            team_name = team.find('a').contents[0]

            ffbb_team_link = team.find('a')['href']
            ffbb_team_link = "https://resultats.ffbb.com/championnat" + re.sub('\A\.\.', '',ffbb_team_link)

            all_elements = team.find_all('td')
            
            ranking = all_elements[0].contents[0]
            points = all_elements[2].contents[0]
            games_played = all_elements[3].contents[0]
            won_games = all_elements[4].contents[0]
            lost_games = all_elements[5].contents[0]
            draws = all_elements[6].contents[0]

            data = {'club': team_name, 'lien_ffbb': ffbb_team_link, 'classement': ranking, 'points': points, 'matchs_joues': games_played, 'matchs_gagnes': won_games, 'matchs_perdus': lost_games, 'matchs_nuls': draws}
            res.append(data)
        except:
            continue
    return res

if __name__ == "__main__":
    res = getTeams()
    with open('scrapper/teams.json', 'w', encoding='latin-1') as f:
        json.dump(res, f, indent=4, ensure_ascii=False)
    print("Created JSON file")
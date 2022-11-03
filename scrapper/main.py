#import
from datetime import datetime
from bs4 import BeautifulSoup
import requests
import json
import re
from config import ranking_id, league_id, fixtures_id, team_name_to_highlight

#urls
league_url = 'https://resultats.ffbb.com/championnat/' + league_id + '.html'
ranking_url = 'https://resultats.ffbb.com/championnat/classements/' + league_id + ranking_id + '.html'
fixtures_url = "https://resultats.ffbb.com/championnat/equipe/division/" + league_id + ranking_id + fixtures_id + ".html"

#teams
page = requests.get(ranking_url)
soup = BeautifulSoup(page.text, "html.parser")
teams = soup.select(".liste tr")
teams_data = []

for team in teams:
    team_number = False
    highlighted_team = False

    try:
        team_name = team.find('a').contents[0]
        if (team_name == team_name_to_highlight):
            highlighted_team = True
    
        team_club = re.sub(' - [0-9]', '', team_name)
        team_club = team_club.title()

        team_number_search = re.search(r' - [0-9]', team_name)
        if (team_number_search):
            team_number = team_number_search.group()
            team_number = re.sub('\A - ', '', team_number)

        ffbb_team_link = team.find('a')['href']
        ffbb_team_link = "https://resultats.ffbb.com/championnat" + re.sub('\A\.\.', '',ffbb_team_link)

        all_elements = team.find_all('td')
        ranking = all_elements[0].contents[0]
        points = all_elements[2].contents[0]
        games_played = all_elements[3].contents[0]
        won_games = all_elements[4].contents[0]
        lost_games = all_elements[5].contents[0]
        draws = all_elements[6].contents[0]
        difference = all_elements[17].contents[0]

        team_data = {'highlighted_team': highlighted_team, 'club': team_club, 'equipe': team_number, 'lien_ffbb': ffbb_team_link, 'classement': ranking, 'points': points, 'matchs_joues': games_played, 'matchs_gagnes': won_games, 'matchs_perdus': lost_games, 'matchs_nuls': draws, 'difference': difference}
        teams_data.append(team_data)
    except:
        continue

#league
page = requests.get(league_url)
soup = BeautifulSoup(page.text, "html.parser")

league_name = soup.select("#idTdDivision")
league_name = league_name[0].text

league_committee = soup.select(".cadre a")
league_committee = league_committee[0].text

pool_name = soup.select("#idTdPoule")
pool_name = pool_name[0].text

league_data = {'nom_league': league_name, 'nom_comite': league_committee, 'nom_poule': pool_name}

#stats
page = requests.get(fixtures_url)
soup = BeautifulSoup(page.text, "html.parser")
fixtures = soup.select(".liste tr")
stats_data = []
for fixture in fixtures: 
    all_fixtures = fixture.findAll('td')
    try:
        day_result = all_fixtures[0].contents[0]
        fixture_result = all_fixtures[5].contents[0]
        team_name = all_fixtures[3].contents[0].contents[0]
        if (fixture_result != '-'):
            if (team_name == team_name_to_highlight):
                team_result = re.sub(r" - [0-9]+", "", fixture_result)
                opponent_result = re.sub(r"[0-9]+ - ", "", fixture_result)
            else:
                team_result = re.sub(r"[0-9]+ - ", "", fixture_result)
                opponent_result = re.sub(r" - [0-9]+", "", fixture_result)
            fixture_data = {'jour': day_result, 'paniers_marques': team_result, 'paniers_encaisses': opponent_result}
            stats_data.append(fixture_data)
    except:
        continue

#execution
if __name__ == "__main__":
    with open('scrapper/teams.json', 'w', encoding='latin-1') as f:
        json.dump(teams_data, f, indent=4, ensure_ascii=False)
    with open('scrapper/league.json', 'w', encoding='latin-1') as f:
        json.dump(league_data, f, indent=4, ensure_ascii=False)
    with open('scrapper/stats.json', 'w', encoding='latin-1') as f:
        json.dump(stats_data, f, indent=4, ensure_ascii=False)
    print("Data refreshes on JSON files -", datetime.now().strftime("%H:%M:%S"))
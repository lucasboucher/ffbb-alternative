# Imports
from datetime import datetime
from bs4 import BeautifulSoup
import requests
import json
import re
from config import ranking_id, league_id, fixtures_id, team_name_to_highlight


# URLs

league_url = 'https://resultats.ffbb.com/championnat/' + league_id + '.html'
ranking_url = 'https://resultats.ffbb.com/championnat/classements/' + league_id + ranking_id + '.html'
fixtures_url = 'https://resultats.ffbb.com/championnat/equipe/division/' + league_id + ranking_id + fixtures_id + '.html'

next_matchday = '0' # Impossible de le deviner pour le moment
next_fixtures_url = 'https://resultats.ffbb.com/championnat/rencontres/' + league_id + ranking_id + next_matchday + '.html'


# Fonctions
def get_team_number(team_name):
    team_number_search = re.search(r' - [0-9]', team_name) # Recherche numéro d'équipe
    if (team_number_search): # Si un numéro trouvé on retourne le numéro formatté
        team_number = team_number_search.group() # Récupération du numéro
        team_number = re.sub('\A - ', '', team_number) # Suppression surplus
        return team_number
    else: # Si non on retourne False
        return False

def get_team_club(team_name):
    team_club = re.sub(' - [0-9]', '', team_name) # Suppression numéro d'équipe
    team_club = team_club.title() # Formattage majuscule
    return team_club

def get_all_fixtures(fixtures):
    fixtures_data = []
    for fixture in fixtures:
        all_fixtures = fixture.findAll('td')
        try:
            played_result = False
            matchday_result = all_fixtures[0].contents[0]
            date_result = all_fixtures[1].contents[0]
            hour_result = all_fixtures[2].contents[0]
            home_result = all_fixtures[3].contents[0].contents[0]
            away_result = all_fixtures[4].contents[0].contents[0]
            fixture_result = all_fixtures[5].contents[0]
            if (fixture_result != '-'):
                played_result = True
            if (home_result == team_name_to_highlight):
                team_result = re.sub(r" - [0-9]+", "", fixture_result)
                opponent_result = re.sub(r"[0-9]+ - ", "", fixture_result)
                home_game_result = "oui"
            elif (away_result == team_name_to_highlight):
                team_result = re.sub(r"[0-9]+ - ", "", fixture_result)
                opponent_result = re.sub(r" - [0-9]+", "", fixture_result)
                home_game_result = "non"
            else:
                team_result = re.sub(r"[0-9]+ - ", "", fixture_result)
                opponent_result = re.sub(r" - [0-9]+", "", fixture_result)
                home_game_result = False
            
            home_number_result = get_team_number(home_result)
            away_number_result = get_team_number(away_result)
            home_result = get_team_club(home_result)
            away_result = get_team_club(away_result)

            fixture_data = {'match_maison': home_game_result, 'match_joue': played_result, 'jour': matchday_result, 'heure': hour_result, 'date': date_result, 'equipe_domicile': home_result, 'equipe_domicile_numero': home_number_result, 'equipe_exterieur': away_result, 'equipe_exterieur_numero': away_number_result, 'paniers_marques': team_result, 'paniers_encaisses': opponent_result}
            fixtures_data.append(fixture_data)
        except:
            continue
    return fixtures_data


# Classement
page = requests.get(ranking_url)
soup = BeautifulSoup(page.text, "html.parser")
teams = soup.select(".liste tr")
ranking_data = []

for team in teams:
    highlighted_team = False

    try:
        team_name = team.find('a').contents[0]
        if (team_name == team_name_to_highlight):
            highlighted_team = True
    
        team_club = get_team_club(team_name)
        team_number = get_team_number(team_name)

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
        ranking_data.append(team_data)

    except:
        continue


# Championnat
page = requests.get(league_url)
soup = BeautifulSoup(page.text, "html.parser")

league_name = soup.select("#idTdDivision")
league_name = league_name[0].text

league_committee = soup.select(".cadre a")
league_committee = league_committee[0].text
league_committee = league_committee.title()

pool_name = soup.select("#idTdDivision script")
pool_name = pool_name[0].text
pool_name = re.search("Poule \w+", pool_name)
pool_name = pool_name.group()
pool_name = re.sub("Poule ", "", pool_name)

league_data = {'nom_league': league_name, 'nom_comite': league_committee, 'nom_poule': pool_name}


# Toutes les rencontres
all_fixtures_data = []
all_teams_id = []
page = requests.get(ranking_url)
soup = BeautifulSoup(page.text, "html.parser")
all_fixtures = soup.select(".liste tr")
for fixture in all_fixtures:
    for team_link in fixture.find_all('a', href=True):
        team_link = team_link['href']
        team_link = re.sub('\A\.\./equipe/', '', team_link)
        team_id = re.search('^....', team_link)
        team_id = team_id.group()
        all_teams_id.append(team_id)
for team_id in all_teams_id:
    all_fixtures_team_url = 'https://resultats.ffbb.com/championnat/equipe/division/' + league_id + ranking_id + team_id + '.html'
    page = requests.get(all_fixtures_team_url)
    soup = BeautifulSoup(page.text, "html.parser")
    all_fixtures_team = soup.select(".liste tr")
    all_fixtures_team_data = get_all_fixtures(all_fixtures_team)
    all_fixtures_data.append(all_fixtures_team_data)


# Rencontres
page = requests.get(fixtures_url)
soup = BeautifulSoup(page.text, "html.parser")
fixtures = soup.select(".liste tr")
fixtures_data = get_all_fixtures(fixtures)


# Éxécution
if __name__ == "__main__":
    with open('scrapper/ranking.json', 'w', encoding='latin-1') as f:
        json.dump(ranking_data, f, indent=4, ensure_ascii=False)
    with open('scrapper/all_fixtures.json', 'w', encoding='latin-1') as f:
        json.dump(all_fixtures_data, f, indent=4, ensure_ascii=False)
    with open('scrapper/league.json', 'w', encoding='latin-1') as f:
        json.dump(league_data, f, indent=4, ensure_ascii=False)
    with open('scrapper/fixtures.json', 'w', encoding='latin-1') as f:
        json.dump(fixtures_data, f, indent=4, ensure_ascii=False)
    print("Data refreshes on JSON files -", datetime.now().strftime("%H:%M:%S"))
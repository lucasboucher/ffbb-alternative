
#Imports
from config import championship_url, pool_id
from functions import get_club_id, get_team_club, get_team_link, get_team_squad
from datetime import datetime
from bs4 import BeautifulSoup
import requests
import json
import re

# Message de lancement du scrapper
print(datetime.now().strftime('%H:%M:%S'), '- Recovery of data in progress...')

# Initialisation de la page
page = requests.get(championship_url)
print(championship_url)
soup = BeautifulSoup(page.text, 'html.parser')

# Nom du championnat
print(soup)
championship_name = soup.select('#idTdDivision')
championship_name = championship_name[0].text

# Lien du championnat
championship_link = championship_url

# Comité de championnat
championship_committee = soup.select('.cadre a')
championship_committee = championship_committee[0].text
championship_committee = championship_committee.title()

# Poule du championnat
championship_pool = soup.select('#idTdDivision script')
championship_pool = championship_pool[0].text
championship_pool = re.search(r'Poule \w+', championship_pool)
championship_pool = championship_pool.group()
championship_pool = re.sub(r'Poule ', '', championship_pool)

# Récupération de l'ID du championnat
championship_id = re.sub(r'^https://resultats.ffbb.com/championnat/', '', championship_url)
championship_id = re.sub(r'.html', '', championship_id)

# Équipes du championnat
ranking_url = 'https://resultats.ffbb.com/championnat/classements/' + championship_id + pool_id + '.html'
page = requests.get(ranking_url)
soup = BeautifulSoup(page.text, 'html.parser')
teams = soup.select('.liste tr')
teams_data = []
for team in teams:
    try:
        # Informations de l'équipe
        team_name = team.find('a').contents[0] # Nom de l'équipe
        team_club = get_team_club(team_name) # Nom du club
        squad = get_team_squad(team_name) # Numéro de l'équipe
        team_link = team.find('a')['href'] # Lien partiel du club
        club_id = get_club_id(team_link) # ID du club
        team_link = get_team_link(team_link) # Lien entier du club
        ranking_row = team.find_all('td') # Ligne dans le classement 
        ranking = ranking_row[0].contents[0] # Rang
        points = ranking_row[2].contents[0] # Points
        games_played = ranking_row[3].contents[0] # Matchs joués
        won_games = ranking_row[4].contents[0] # Matchs gagnés
        lost_games = ranking_row[5].contents[0] # Matchs perdus
        baskets_scored = ranking_row[15].contents[0] # Différence de paniers
        baskets_cashed = ranking_row[16].contents[0] # Différence de paniers
        difference = ranking_row[17].contents[0] # Différence de paniers
        # Rencontres de l'équipes
        fixtures_url = 'https://resultats.ffbb.com/championnat/equipe/division/' + championship_id + pool_id + club_id + '.html'
        page = requests.get(fixtures_url)
        soup = BeautifulSoup(page.text, "html.parser")
        fixtures = soup.select(".liste tr")
        fixtures_data = []
        for fixture in fixtures:
            all_fixtures = fixture.findAll('td')
            try:
                matchday = all_fixtures[0].contents[0] # Jour de la rencontre
                date = all_fixtures[1].contents[0] # Date de la rencontre
                hour = all_fixtures[2].contents[0] # Heure de la recontre
                home_team = all_fixtures[3].contents[0].contents[0] # Équipe à domicile
                away_team = all_fixtures[4].contents[0].contents[0] # Équipe à l'extérieur
                home_club = get_team_club(home_team) # Club à domicile
                away_club = get_team_club(away_team) # Club à l'extérieur
                home_squad = get_team_squad(home_team) # Numéro de l'équipe à domicile
                away_squad = get_team_squad(away_team) # Numéro de l'équipe à l'extérieur
                fixture_result = all_fixtures[5].contents[0] # Résultat de la rencontre
                home_team_score = re.sub(r" - [0-9]+", "", fixture_result) # Score de l'équipe à domicile
                away_team_score = re.sub(r"[0-9]+ - ", "", fixture_result) # Score de l'équipe à l'extérieur
                # Détermination si le match est joué
                if (fixture_result != '-'):
                    fixture_played = True
                else:
                    fixture_played = False
                # Détermination si le match est à domicile
                if (team_name == home_team):
                    home_game = True
                else:
                    home_game = False
                fixture_data = {'match_domicile': home_game, 'match_joue': fixture_played, 'jour': matchday, 'heure': hour, 'date': date, 'club_domicile': home_club, 'equipe_domicile_numero': home_squad, 'club_exterieur': away_club, 'equipe_exterieur_numero': away_squad, 'resultat_equipe_domicile': home_team_score, 'resultat_equipe_exterieur': away_team_score}
                fixtures_data.append(fixture_data)
            except:
                continue
        # Formattage et ajout des données de l'équipe
        team_data = {'club': team_club, 'equipe': squad, 'id_club': club_id, 'lien_equipe': team_link, 'classement': ranking, 'points': points, 'matchs_joues': games_played, 'matchs_gagnes': won_games, 'matchs_perdus': lost_games, 'paniers_marques': baskets_scored, 'paniers_encaisses': baskets_cashed, 'difference': difference, 'rencontres': fixtures_data}
        teams_data.append(team_data)
    except:
        continue

# Formattage des données
championship_data = {'nom': championship_name, 'lien_championnat': championship_link, 'comite': championship_committee, 'poule': championship_pool, 'equipes': teams_data}

# Création du fichier JSON
with open('data.json', 'w', encoding='latin-1') as f:
    json.dump(championship_data, f, indent=4, ensure_ascii=False)
print(datetime.now().strftime('%H:%M:%S'), '- Data refreshes on JSON file')
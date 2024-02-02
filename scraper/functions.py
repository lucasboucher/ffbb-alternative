import re

# Obtenir le numéro d'une équipe
def get_team_squad(team_name):
    team_squad_search = re.search(r' - [0-9]', team_name) # Recherche numéro d'équipe
    if (team_squad_search): # Si un numéro trouvé on retourne le numéro formatté
        team_squad = team_squad_search.group() # Récupération du numéro
        team_squad = re.sub(r'\A - ', '', team_squad) # Suppression surplus
        return team_squad
    else: # Si non on retourne False
        return False

# Obtenir le nom du club
def get_team_club(team_name):
    team_club = re.sub(r' - [0-9]', '', team_name) # Suppression numéro d'équipe
    team_club = team_club.title() # Formattage majuscule
    return team_club

# Obtenir le lien d'une équipe
def get_team_link(link):
    team_link = "https://resultats.ffbb.com/championnat" + re.sub(r'\A\.\.', '', link)
    return team_link

# Obtenir l'ID d'une équipe
def get_club_id(link):
    id = re.sub(r'\A\.\./', '', link) # Suppression contenu avant ID
    id = re.sub(r'\Aequipe/', '', id) # Suppression contenu avant ID
    id = re.search(r'^\w+', id) # Recherche ID
    id = id.group() # Récupération de la recherche
    return id
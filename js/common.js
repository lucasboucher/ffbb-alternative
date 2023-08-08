
/**
 * Retoune la <div> s'il y a un numéro d'équipe
 * 
 * @param {string} squad Le numéro d'équipe tel qu'enregistré dans le json
 * @returns Un string à afficher après le nom de l'équipe
 */
function get_div_squad(squad) {
	if (squad === '1') {
		return ''
	}
	else if(squad) {
		return ` - ${squad}`
	} else {
		return ''
	}
}

/**
 * Affiche les rencontres sélectionné sur une classe CSS choisi
 * 
 * @param {array} games Liste des rencontres (objets extraits du json)
 * @param {string} main_class La lcasse html dans laquelle afficher les rencontres
 * @param {string} favorite_club_name Nom du club favori
 * @param {string} page_club_name Nom de la page du club à afficher (doit être vide si aucun club à afficher)
 * @param {boolean} b_indicator_favorite Affichage de l'indicateur de l'équipe favorite
 * @param {boolean} b_indicator_day Affichage de la journée de la rencontre
 */
function display_fixtures(games, main_class, favorite_club_name, page_club_name, b_indicator_favorite=false, b_indicator_day=false) {
	document.getElementById(main_class).innerHTML = ''
	for (g in games) {
		fixture = games[g]
		indicator_team_selected = ''
		home_squad = get_div_squad(fixture.equipe_domicile_numero)
		away_squad = get_div_squad(fixture.equipe_exterieur_numero)
		fixture_color = ''
		indicator_team_selected_class = ''

        if ((true == b_indicator_favorite) &&
            (favorite_club_name != page_club_name) &&
            ((fixture.club_domicile == favorite_club_name) || (fixture.club_exterieur == favorite_club_name))) {
			indicator_team_selected_class = 'fixture-matchday-team-selected'
            fixture_color = 'fixture-selected'
			/* Ne pas avoir un double indicateur si le jour est déjà mis en avant */
			if (false == b_indicator_day) {
				indicator_team_selected = '<div class="fixture-indicator-team-selected"></div>'
			}
		}
        
        if ( page_club_name === '' ) {
            team_to_highlight = favorite_club_name
        }
        else {
            team_to_highlight = page_club_name
        }

		if (fixture.match_joue) {
			home_score = fixture.resultat_equipe_domicile
			away_score = fixture.resultat_equipe_exterieur
			if (team_to_highlight == fixture.club_domicile) {
				if (home_score > away_score) {
					fixture_color = 'fixture-w'
				}
				else {
					fixture_color = 'fixture-l'
				}
			} else if (team_to_highlight == fixture.club_exterieur) {
				if (home_score > away_score) {
					fixture_color = 'fixture-l'
				}
				else {
					fixture_color = 'fixture-w'
				}
			}
			home_score = `<div class="fixture-result">${home_score}</div>`
			away_score = `<div class="fixture-result">${away_score}</div>`
			time = 'Terminé'
		} else {
			home_score = ''
			away_score = ''
			time = fixture.heure
		}

		day_indicator = ''
		if (true == b_indicator_day) {
			day_indicator = `<div class="fixture-matchday ${indicator_team_selected_class}">${fixture.jour}</div>`
		}

		document.getElementById(main_class).innerHTML +=
		`
			<div class="fixture ${fixture_color}">
				${day_indicator}
				<div class="fixture-teams">
					<div class="fixture-team">
						<a class="fixture-team-name" href="../team/?club=${fixture.club_domicile}">
							<div class="fixture-team-club">${fixture.club_domicile}${home_squad}</div>
						</a>
						${home_score}
					</div>
					<div class="fixture-team">
						<a class="fixture-team-name" href="../team/?club=${fixture.club_exterieur}">
							<div class="fixture-team-club">${fixture.club_exterieur}${away_squad}</div>
						</a>
						${away_score}
					</div>
				</div>
				<div class="fixture-date">
					<div class="fixture-day">${fixture.date}</div>
					<div class="fixture-time">${time}</div>
				</div>
				${indicator_team_selected}
			</div>
		`
	}
}
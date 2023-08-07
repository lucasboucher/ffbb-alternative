
// |--------------|
// |   Chart.js   |
// |--------------|

Chart.defaults.font.size = 14
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
Chart.defaults.font.weight = 400
Chart.defaults.font.lineHeight = "1.4em"


// |-----------------|
// |   Championnat   |
// |-----------------|

// TODO charger championnat donné (remove hardcoded path)
fetch('data/data.json')
	.then((response) => response.json())
	.then((data) => {
		// Informations du championnat
		document.getElementsByClassName('header-subtitle')[0].innerHTML = data.comite // Comité du championnat
		document.getElementsByClassName('header-title')[0].innerHTML = data.nom // Nom du championnat
		document.getElementsByClassName('ranking-ffbb')[0].href = data.lien_championnat // Lien du classement FFBB officiel dans le logo FFBB de la tête de classement

		pools = data.poules

		// Chargement de la poule sélectionnée
		selected_pool_name = localStorage.getItem("selected_pool_name")
		if (!selected_pool_name) {
			localStorage.setItem("selected_pool_name", pools[0].poule);
			selected_pool_name = pools[0].poule
		}
		
		// Récupération de la balise de la sélection de poule
		pool_selection = document.getElementById('pool_selection')

		pool_selection_index = 0
		// Affichage des équipes dans la sélection
		for (p in pools) {
			pool_name = pools[p].poule
			selected = ''
			if (pool_name == selected_pool_name) {
				pool_selection_index = p
				selected = 'selected'
			}
			pool_selection.innerHTML += `<option value="${pool_name}" ${selected}>${pool_name}</option>`
		}

		selected_pool = pools[pool_selection_index] // choisir la poule sélectionnée

		// Mise à jour du nom de poule
		document.getElementsByClassName('ranking-pool')[0].innerHTML = selected_pool.poule

		// Toutes les rencontres de la poule
		games = selected_pool.rencontres
		// Toutes les équipes de la pôule
		teams = selected_pool.equipes

		// Équipe sélectionnée
		selected_club_name = localStorage.getItem("selected_club_name")
		if (!selected_club_name) {
			localStorage.setItem("selected_club_name", teams[0].club);
			selected_club_name = teams[0].club
		}

		// Récupération de la balise de la sélection d'équipe
		team_selection = document.getElementById('team_selection')

		team_selection_index = 0
		// Affichage des équipes dans la sélection
		for (t in teams) {
			club_name = teams[t].club
			if (club_name == selected_club_name) {
				selected_team_indicator = '💙 '
				team_selection_index = t
			} else {
				selected_team_indicator = ''
			}
			team_selection.innerHTML += `<option value="${club_name}">${selected_team_indicator}${club_name}</option>`
		}

		// Mettre par défaut l'équipe sélectionnée
		team_selection.selectedIndex = team_selection_index

		// Changement de l'équipe sélectionnée
		team_selection.addEventListener("change", () => reload_new_team(team_selection.value))
		// Changement de la poule sélectionnée
		pool_selection.addEventListener("change", () => reload_new_pool(pool_selection.value))

		// Détermination de la prochaine journée avec des matchs à jouer
		next_matchday = 1
		for (g in games) {
			fixture = games[g]
			next_matchday = fixture.jour
			if (!fixture.match_joue) {
				break
			}
		}

		// Calculer le nombre de journées total
		matchday_counter = 1
		for (g in games) {
			fixture = games[g]
			if (fixture.jour > matchday_counter) {
				matchday_counter = fixture.jour
			}
		}

		// Récupération de la balise de la sélection de la journée
		matchday_selection = document.getElementById('matchday_selection')

		// FIXME: C'est toujours le premier choix qui est sélectionné
		for (let i = 1; i <= matchday_counter; i++) {
			if (i == next_matchday) {
				next_matchday_indicator = '🗓️ '
			} else {
				next_matchday_indicator = ''
			}
			matchday_selection.innerHTML += `<option value="${i}">${next_matchday_indicator}Jour ${i}</option>`
		}
		matchday_selection.innerHTML += `<option value="0">Tous</option>`

		// Mettre par défaut la journée actuelle
		matchday_selection.selectedIndex = next_matchday-1

		// Prochaine journée
		load_and_display_matchday_fixtures(games, next_matchday)

		// Changement de journée
		matchday_selection.addEventListener("change", () => load_and_display_matchday_fixtures(games, matchday_selection.value))

		// Précédent classement : prochaine journée - 2)
		ranking = compute_previous_ranking(teams, games, next_matchday-2)

		// Classement général
		for (t in teams) {
			team = teams[t]
			for (ranking_team in ranking) {
				if (ranking[ranking_team][0] == team.club) {
					former_rank = parseInt(ranking_team) + 1
					current_rank = parseInt(team.classement)
					ranking_team = ranking[ranking_team]
					team_icon_color_green = 'rgb(29, 187, 121)'
					team_icon_color_red = 'rgb(255, 47, 84)'
					team_icon_color_grey = 'rgb(184, 184, 184)'
					if (team.club == selected_club_name) {
						team_icon_color_green = 'rgb(91, 186, 213)'
						team_icon_color_red = 'rgb(91, 186, 213)'
						team_icon_color_grey = 'rgb(91, 186, 213)'
					}
					if (former_rank > current_rank) {
						position_icon = `<svg width="12px" height="12px" viewBox="0 0 12 12"><path d="M1 8l5-5 5 5" stroke="${team_icon_color_green}" stroke-width="2"/></svg>`
					} else if (former_rank < current_rank) {
						position_icon = `<svg width="12px" height="12px" viewBox="0 0 12 12"><path d="M11 4L6 9 1 4" stroke="${team_icon_color_red}" stroke-width="2"/></svg>`
					} else {
						position_icon = `<svg width="8" height="8" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" stroke="${team_icon_color_grey}" stroke-width="16"/></svg>`
					}
				}
			}
			div_squad = get_div_squad(team.equipe) // Récupére la <div> du numéro de l'équipe si elle existe
			document.getElementsByClassName('ranking')[0].innerHTML +=
			`
			<li class="ranking-team">
				<a href="./team/?club=${team.club}">
					<div class="ranking-rank">${team.classement}</div>
					<div class="ranking-icon">${position_icon}</div>
					<div class="ranking-name">
						<div class="ranking-club">${team.club}</div>
						${div_squad}
					</div>
					<div>${team.matchs_joues}</div>
					<div class="hidden-on-mobile">${team.matchs_gagnes}</div>
					<div class="hidden-on-mobile">${team.matchs_perdus}</div>
					<div class="hidden-on-mobile">${team.points_marques}</div>
					<div class="hidden-on-mobile">${team.points_encaisses}</div>
					<div>${team.difference}</div>
					<div class="ranking-points">${team.points}</div>
					<div class="ranking-link hidden-on-mobile">
						<object><a href="${team.lien_equipe}" target="_blank">
							<svg viewBox="0 0 24 24"><path d="M21 3.6v16.8a.6.6 0 01-.6.6H3.6a.6.6 0 01-.6-.6V3.6a.6.6 0 01.6-.6h16.8a.6.6 0 01.6.6z"></path><path d="M15.025 8.025h-4.95m4.95 0v4.95m0-4.95l-3.535 3.536c-2.475 2.475 0 4.95 0 4.95"></path></svg>
						</a></object>
					</div>
				</a>
			</li>
			`
		}
	})


// |---------------|
// |   Fonctions   |
// |---------------|

// Rencontres de la prochaine journée
function load_and_display_matchday_fixtures(games, selected_matchday) {
	next_fixtures = []
	for (g in games) {
		fixture = games[g]
		if (0 == selected_matchday || fixture.jour == selected_matchday) {
			next_fixtures.push(fixture)
		}
	}
	display_fixtures(next_fixtures, 'next_fixtures')
}

function compute_previous_ranking(teams, games, until_matchday) {
	ranking = []
	for (t in teams) {
		team = teams[t]
		club_name = team.club
		// Copier le tableau pour ne pas modifier la liste des rencontres
		filtered_games = filter_games(games.slice(), club_name, true, true)
		team_points = 0
		team_difference = 0
		match_counter = 1

		for (g in filtered_games) {
			if (match_counter > until_matchday) {
				break
			}
			game = filtered_games[g]
			if (game.match_joue) {

				b_is_home_game = club_name == game.club_domicile ? true : false;

				if (b_is_home_game) {
					team_score = game.resultat_equipe_domicile
					opponent_score = game.resultat_equipe_exterieur
				} else {
					team_score = game.resultat_equipe_exterieur
					opponent_score = game.resultat_equipe_domicile
				}
				team_score = parseInt(team_score)
				opponent_score = parseInt(opponent_score)
				if (team_score > opponent_score) {
					team_points += 2
				} else {
					team_points += 1
				}
				team_difference += team_score - opponent_score
				match_counter++
			}
		}
		team_points = team_points * 10000 + team_difference
		ranking.push([club_name, team_points])
	}
	ranking.sort((a, b) => b[1] - a[1])
	return ranking
}

function filter_games(games, keep_team_name, b_keep_home_games, b_keep_away_games) {
	var i = games.length
	while (i--) {
		// Exclure les matchs auxquels l'équipe ne participe pas
		if ( (keep_team_name != games[i].club_domicile) && (keep_team_name != games[i].club_exterieur) ) {
			games.splice(i, 1);
			continue
		}
		// Si demandé, exclure les matchs où l'équipe joue à domicile
		if ( (b_keep_home_games == false) && (keep_team_name == games[i].club_domicile) ) {
			games.splice(i, 1);
			continue
		}
		// Si demandé, exclure les matchs où l'équipe joue à l'extérieur
		if ( (b_keep_away_games == false) && (keep_team_name == games[i].club_exterieur)) {
			games.splice(i, 1);
			continue
		}
	}
	return games
}

// Retoune la <div> s'il y a un numéro d'équipe
function get_div_squad(squad) {
	if(squad) {
		return `<div class="team-number">${squad}</div>`
	} else {
		return ''
	}
}

function reload_new_team(new_team) {
	localStorage.setItem("selected_club_name", new_team);
	location.reload();
}

function reload_new_pool(new_pool) {
	localStorage.setItem("selected_pool_name", new_pool);
	location.reload();
}

// Affiche les rencontres sélectionné sur une classe CSS choisi
function display_fixtures(fixtures_data, main_class) {
	document.getElementById(main_class).innerHTML = ""
	for (fixture in fixtures_data) {
		fixture = fixtures_data[fixture]
		home_squad = get_div_squad(fixture.equipe_domicile_numero)
		away_squad = get_div_squad(fixture.equipe_exterieur_numero)
		indicator_team_selected = ''
		fixture_color = ''
		if (fixture.match_joue) {
			home_score = fixture.resultat_equipe_domicile
			away_score = fixture.resultat_equipe_exterieur
			if (fixture.club_domicile == selected_club_name) {
				if (home_score > away_score) {
					fixture_color = 'fixture-w'
				}
				else {
					fixture_color = 'fixture-l'
				}
				indicator_team_selected = '<div class="fixture-indicator-team-selected"></div>'
			} else if (fixture.club_exterieur == selected_club_name) {
				if (home_score > away_score) {
					fixture_color = 'fixture-l'
				}
				else {
					fixture_color = 'fixture-w'
				}
				indicator_team_selected = '<div class="fixture-indicator-team-selected"></div>'
			}
			home_score = `<div class="fixture-result">${home_score}</div>`
			away_score = `<div class="fixture-result">${away_score}</div>`
			time = 'Terminé'
		} else {
			home_score = ''
			away_score = ''
			time = fixture.heure
			if (fixture.club_domicile == selected_club_name || fixture.club_exterieur == selected_club_name) {
				indicator_team_selected = '<div class="fixture-indicator-team-selected"></div>'
			}
		}
		document.getElementById(main_class).innerHTML +=
		`
			<div class="fixture ${fixture_color}">
				<div class="fixture-teams">
					<div class="fixture-team">
						<a class="fixture-team-name" href="./team/?club=${fixture.club_domicile}">
							<div class="fixture-team-club">${fixture.club_domicile}</div>
							${home_squad}
						</a>
						${home_score}
					</div>
					<div class="fixture-team">
						<a class="fixture-team-name" href="./team/?club=${fixture.club_exterieur}">
							<div class="fixture-team-club">${fixture.club_exterieur}</div>
							${away_squad}
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


// |-----------|
// |   Modal   |
// |-----------|

var modal = document.getElementById("modal");
var button = document.getElementById("modal-button");
var modal_close = document.getElementsByClassName("modal-close")[0];

button.onclick = function() {
  modal.style.display = "block";
}

modal_close.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
	modal.style.display = "none";
  }
}

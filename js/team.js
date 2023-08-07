selected_club_name = localStorage.getItem("selected_club_name")
selected_pool_name = localStorage.getItem("selected_pool_name")

// |--------------|
// |   Chart.js   |
// |--------------|

Chart.defaults.font.size = 14
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
Chart.defaults.font.weight = 400
Chart.defaults.font.lineHeight = "1.4em"


// |------------|
// |   Équipe   |
// |------------|

// TODO charger championnat donné (remove hardcoded path)
fetch('../data/data.json')
	.then((response) => response.json())
	.then((data) => {
		// Chargement de la poule sélectionnée
		pool_selection_index = 0
		for (pool in data.poules) {
			pool_name = data.poules[pool].poule
			if (pool_name == selected_pool_name) {
				pool_selection_index = pool
			}
		}
		selected_pool = data.poules[pool_selection_index] // choisir la poule sélectionné

		// Recherche de l'équipe sélectionné
		page_club_name = window.location.search
		page_club_name = new URLSearchParams(page_club_name).get('club')
		if (!page_club_name) {
			page_club_name = selected_club_name
		}

		// Informations du championnat
		document.getElementsByClassName('header-subtitle')[0].innerHTML = data.nom // Nom du championnat
		document.getElementsByClassName('header-title')[0].innerHTML = page_club_name // Nom du de l'équipe sélectionné

		// Toutes les rencontres de la poule
		games = selected_pool.rencontres

		// Retirer les matchs à ne pas afficher
		keep_home_games = !document.getElementById("exterieur").checked
		keep_away_games = !document.getElementById("domicile").checked
		games = filter_games(games, page_club_name, keep_home_games, keep_away_games)

		previous_fixtures = []
		next_fixtures = []
		for (g in games) {
			if (games[g].match_joue == true) {
				previous_fixtures.push(games[g])
			}
			else {
				next_fixtures.push(games[g])
			}
		}
		// Afficher les résultats d'une équipe
		display_fixtures(previous_fixtures, 'results_fixtures')
		// Afficher le calendrier d'une équipe
		display_fixtures(next_fixtures, 'calendar_fixtures')
		
		// Récupérer l'équipe
		for (equipe in selected_pool.equipes) {
			if ( selected_pool.equipes[equipe].club ==  page_club_name ) {
				team = selected_pool.equipes[equipe]
				break
			}
		}

		// Récupérer les statistiques
		stat_data = gather_stat_data(team)

		// Afficher les statistiques
		display_stats(stat_data)
		
		// Réupération des données pour les graphiques
		matchday_data = []
		points_scored_data = []
		points_cashed_data = []
		opponents_teams_data = []
		for (g in games) {
			if (games[g].match_joue == true) {
				matchday_data.push(games[g].jour)
				home_squad = get_div_squad(games[g].equipe_domicile_numero)
				away_squad = get_div_squad(games[g].equipe_exterieur_numero)

				b_is_home_game = page_club_name == games[g].club_domicile ? true : false;
				
				if (true == b_is_home_game) {
					points_scored_data.push(games[g].resultat_equipe_domicile)
					points_cashed_data.push(games[g].resultat_equipe_exterieur)
					opponents_teams_data.push(games[g].club_exterieur + away_squad)
				} else {
					points_scored_data.push(games[g].resultat_equipe_exterieur)
					points_cashed_data.push(games[g].resultat_equipe_domicile)
					opponents_teams_data.push(games[g].club_domicile + home_squad)
				}
			}
		}

		// Affichage des graphiques des points
		display_charts(matchday_data, points_scored_data, points_cashed_data, opponents_teams_data)

		// Changement de mode des graphiques
		document.getElementById("divide").addEventListener("click", () => display_charts(matchday_data, points_scored_data, points_cashed_data, opponents_teams_data))
		document.getElementById("combine").addEventListener("click", () => display_charts(matchday_data, points_scored_data, points_cashed_data, opponents_teams_data))

		document.getElementById("tous").addEventListener("click", () => location.reload())
		document.getElementById("domicile").addEventListener("click", () => location.reload())
		document.getElementById("exterieur").addEventListener("click", () => location.reload())
	})


// |---------------|
// |   Fonctions   |
// |---------------|

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

function gather_stat_data(team) {
	stat_data = {
		'de différence': team.difference,
		'points marqués': team.points_marques,
		'points encaissés': team.points_encaisses,
		'de différence en moyenne': (team.difference / team.matchs_joues).toFixed(2),
		'points marqués en moyenne': (team.points_marques / team.matchs_joues).toFixed(2),
		'points encaissés en moyenne': (team.points_encaisses / team.matchs_joues).toFixed(2)
	}
	return stat_data
}

function display_stats(stat_data) {
	for (stat in stat_data) {
		if (stat == 'points marqués' || stat == 'points marqués en moyenne') {
			stat_trend_icon = '<svg viewBox="0 0 24 24"><path class="stat-trend-up" d="M16 20v-8m0 0l3 3m-3-3l-3 3M4 14l8-8 3 3 5-5"></path></svg>'
		} else if (stat == 'points encaissés' || stat == 'points encaissés en moyenne') {
			stat_trend_icon = '<svg viewBox="0 0 24 24"><path class="stat-trend-down" d="M4 10l8 8 3-3 5 5M16 4v8m0 0l3-3m-3 3l-3-3"></path></svg>'
		} else {
			stat_trend_icon = '<svg viewBox="0 0 24 24"><path d="M9 21h6m-6 0v-5m0 5H3.6a.6.6 0 01-.6-.6v-3.8a.6.6 0 01.6-.6H9m6 5V9m0 12h5.4a.6.6 0 00.6-.6V3.6a.6.6 0 00-.6-.6h-4.8a.6.6 0 00-.6.6V9m0 0H9.6a.6.6 0 00-.6.6V16"></path></svg>'
		}
		document.getElementsByClassName('stats')[0].innerHTML +=
		`
			<div class="stat">
			<div class="stat-trend">${stat_trend_icon}</div>
			<div class="stat-infos">
				<div class="stat-figure">${stat_data[stat]}</div>
				<div>${stat}</div>
			</div>
			</div>
		`
	}
}

// Retoune la <div> s'il y a un numéro d'équipe
function get_div_squad(squad) {
	if(squad) {
		return `<div class="team-number">${squad}</div>`
	} else {
		return ''
	}
}

// Affiche les rencontres sélectionné sur une classe CSS choisi
function display_fixtures(fixtures_data, main_class) {
	document.getElementById(main_class).innerHTML = ''
	for (fixture in fixtures_data) {
		fixture = fixtures_data[fixture]
		played = fixture.match_joue
		indicator_team_selected_class = ''
		fixture_color = ''
		if (played) {
			home_score = fixture.resultat_equipe_domicile
			away_score = fixture.resultat_equipe_exterieur

			// Choisir une classe en fonction du résultat (victoire / défaite)
			b_is_home_game = (page_club_name == fixture.club_domicile) ? true : false;
			if (b_is_home_game) {
				if (home_score > away_score) {
					fixture_color = 'fixture-w'
				}
				else {
					fixture_color = 'fixture-l'
				}
			} else if (fixture.club_exterieur == page_club_name) {
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
		if (page_club_name != selected_club_name && (fixture.club_domicile == selected_club_name || fixture.club_exterieur == selected_club_name)) {
			indicator_team_selected_class = ' fixture-matchday-team-selected'
		}
		home_squad = get_div_squad(fixture.equipe_domicile_numero)
		away_squad = get_div_squad(fixture.equipe_exterieur_numero)
		document.getElementById(main_class).innerHTML +=
		`
			<div class="fixture ${fixture_color}">
				<div class="fixture-matchday${indicator_team_selected_class}">${fixture.jour}</div>
				<div class="fixture-teams">
					<div class="fixture-team">
						<a class="fixture-team-name" href="../team/?club=${fixture.club_domicile}">
							<div class="fixture-team-club">${fixture.club_domicile}</div>
							${home_squad}
						</a>
						${home_score}
					</div>
					<div class="fixture-team">
						<a class="fixture-team-name" href="../team/?club=${fixture.club_exterieur}">
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
			</div>
		`
	}
}

// Obtenir la configuration d'un graphique
function get_chart_config(data_chart, title, opponents_teams) {
	config = {
		type: 'line',
		data: data_chart,
		options: {
			interaction: {
				intersect: false,
				mode: 'index'
			},
			maintainAspectRatio: false,
			plugins: {
				title: {
					display: true,
					text: title,
					font: {
						weight: 600
					}
				},
				legend: {
					display: false
				},
				tooltip: {
					backgroundColor: 'rgba(43, 43, 43, 0.8)',
					titleFont: {
						weight: 500
					},
					footerFont: {
						weight: 700
					},
					callbacks: {
						title: (tooltipItems) => {
							tooltipItems.forEach(function(tooltipItem) {
								index = tooltipItem.dataIndex.toString()
							})
							return opponents_teams[index]
						},
						label: () => {''},
						footer: (tooltipItems) => {
							let points = []
							tooltipItems.forEach(function(tooltipItem) {
								points.push(tooltipItem.parsed.y)
							})
							if (points[1]) {
								gap = points[0] - points[1]
							} else {
								gap = points[0]
							}     
							return gap
						}
					}
				}
			},
			scales: {
				x: {
					grid: {
						color: "rgb(26, 26, 26)",
						drawTicks: false,
					}
				},
				y: {
					suggestedMax: 160,
					min: 0,
					ticks: {
						maxTicksLimit: 9
					},
					grid: {
						titleFont: {
							weight: 600
						},
						color: "rgb(26, 26, 26)",
						drawTicks: false,
					}
				}
			}
		}
	}
	return config
}

// Afficher les graphiques
function display_charts(day_data, points_scored_data, points_cashed_data, opponents_teams) {
	if (document.getElementById('divide').checked) {
		document.getElementsByClassName('charts')[0].innerHTML = 
		`
			<div class="chart">
				<canvas id="points_scored"></canvas>
			</div>
			<div class="chart">
				<canvas id="points_cashed"></canvas>
			</div>
		`
		const ctx1 = document.getElementById('points_scored')
		const ctx2 = document.getElementById('points_cashed')
		const data_chart1 = {
			labels: day_data,
			datasets: [{
				data: points_scored_data,
				backgroundColor: 'rgba(29, 187, 121, 0.2)',
				borderColor: 'rgb(29, 187, 121)',
				borderWidth: 1,
				fill: true,
				pointRadius: 6
			}]
		}     
		const data_chart2 = {
			labels: day_data,
			datasets: [{
				data: points_cashed_data,
				backgroundColor: 'rgba(255, 47, 84, 0.2)',
				borderColor: 'rgb(255, 47, 84)',
				borderWidth: 1,
				fill: true,
				pointRadius: 6
			}]
		}
		config1 = get_chart_config(data_chart1, "Points marqués", opponents_teams)
		config2 = get_chart_config(data_chart2, "Points encaissés", opponents_teams)
		new Chart(ctx1, config1)
		new Chart(ctx2, config2)
	} else if (document.getElementById('combine').checked) {
		document.getElementsByClassName('charts')[0].innerHTML =
		`
			<div class="chart">
				<canvas id="points"></canvas>
			</div>
		`
		const ctx = document.getElementById('points')
		const data_chart = {
			labels: day_data,
			datasets: [    
				{
					data: points_scored_data,
					backgroundColor: 'rgba(29, 187, 121, 0.2)',
					borderColor: 'rgb(29, 187, 121)',
					borderWidth: 1,
					pointRadius: 3
				},
				{
					data: points_cashed_data,
					backgroundColor: 'rgba(255, 47, 84, 0.2)',
					borderColor: 'rgb(255, 47, 84)',
					borderWidth: 1,
					fill: {target: '0', above: 'rgba(255, 47, 84, 0.2)', below: 'rgba(29, 187, 121, 0.2)'},
					pointRadius: 3
				}
			]
		}
		config = get_chart_config(data_chart, "Différence de points", opponents_teams)
		new Chart(ctx, config)
	}
}

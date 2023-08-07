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
		// Informations du championnat
		document.getElementsByClassName('header-subtitle')[0].innerHTML = data.nom // Nom du championnat

		// Chargement de la poule sélectionnée
		selected_pool_name = localStorage.getItem("selected_pool_name")
		if (!selected_pool_name) {
			localStorage.setItem("selected_pool_name", pools[0].poule);
			selected_pool_name = pools[0].poule
		}

		selected_pool = data.poules[0] // choisir une poule par défaut
		for (p in data.poules) {
			pool_name = data.poules[p].poule
			if (pool_name == selected_pool_name) {
				selected_pool = data.poules[p] // choisir la poule sélectionnée
			}
		}

		// Toutes les rencontres de la poule
		games = selected_pool.rencontres
		// Toutes les équipes de la poule
		teams = selected_pool.equipes

		selected_club_name = localStorage.getItem("selected_club_name")
		// Recherche de l'équipe à afficher
		page_club_name = window.location.search
		page_club_name = new URLSearchParams(page_club_name).get('club')
		if (!page_club_name) {
			page_club_name = selected_club_name
		}

		document.getElementsByClassName('header-title')[0].innerHTML = page_club_name // Nom de l'équipe sélectionnée

		// Retirer les matchs à ne pas afficher
		keep_home_games = !document.getElementById("exterieur").checked
		keep_away_games = !document.getElementById("domicile").checked
		filtered_games = filter_games(games, page_club_name, keep_home_games, keep_away_games)

		previous_fixtures = []
		next_fixtures = []
		for (g in filtered_games) {
			if (filtered_games[g].match_joue == true) {
				previous_fixtures.push(filtered_games[g])
			}
			else {
				next_fixtures.push(filtered_games[g])
			}
		}
		// Afficher les résultats d'une équipe
		display_fixtures(previous_fixtures, 'results_fixtures', selected_club_name, page_club_name, true, true)
		// Afficher le calendrier d'une équipe
		display_fixtures(next_fixtures, 'calendar_fixtures', selected_club_name, page_club_name, true, true)
		
		// Récupérer l'équipe
		for (equipe in selected_pool.equipes) {
			if ( selected_pool.equipes[equipe].club ==  page_club_name ) {
				team = selected_pool.equipes[equipe]
				break
			}
		}

		// Récupérer les statistiques
		stats_data = compute_stats(team.club, filtered_games)

		// Afficher les statistiques
		display_stats(stats_data)
		
		// Réupération des données pour les graphiques
		matchday_data = []
		points_scored_data = []
		points_cashed_data = []
		opponents_teams_data = []
		for (g in filtered_games) {
			if (filtered_games[g].match_joue == true) {
				matchday_data.push(filtered_games[g].jour)
				home_squad = get_div_squad(filtered_games[g].equipe_domicile_numero)
				away_squad = get_div_squad(filtered_games[g].equipe_exterieur_numero)

				b_is_home_game = page_club_name == filtered_games[g].club_domicile ? true : false;
				
				if (true == b_is_home_game) {
					points_scored_data.push(filtered_games[g].resultat_equipe_domicile)
					points_cashed_data.push(filtered_games[g].resultat_equipe_exterieur)
					opponents_teams_data.push(filtered_games[g].club_exterieur + away_squad)
				} else {
					points_scored_data.push(filtered_games[g].resultat_equipe_exterieur)
					points_cashed_data.push(filtered_games[g].resultat_equipe_domicile)
					opponents_teams_data.push(filtered_games[g].club_domicile + home_squad)
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

function compute_stats(club_name, games) {
	stats_data = {
		'points de différence': 0,
		'points marqués': 0,
		'points encaissés': 0,
		'points de différence en moyenne': 0,
		'points marqués en moyenne': 0,
		'points encaissés en moyenne': 0,
	}
	nb_game_played = 0
	for (g in games) {
		fixture = games[g]
		if ( true == fixture.match_joue )
		{
			nb_game_played++
			if ( club_name == fixture.club_domicile ) {
				stats_data['points marqués'] += fixture.resultat_equipe_domicile
				stats_data['points encaissés'] += fixture.resultat_equipe_exterieur
				stats_data['points de différence'] += (fixture.resultat_equipe_domicile - fixture.resultat_equipe_exterieur)
			}
			else if ( club_name == fixture.club_exterieur ) {
				stats_data['points marqués'] += fixture.resultat_equipe_exterieur
				stats_data['points encaissés'] += fixture.resultat_equipe_domicile
				stats_data['points de différence'] += (fixture.resultat_equipe_exterieur - fixture.resultat_equipe_domicile)
			}
		}
	}

	if ( 0 < nb_game_played ) {
		stats_data['points marqués en moyenne'] = (stats_data['points marqués'] / nb_game_played).toFixed(2)
		stats_data['points encaissés en moyenne'] = (stats_data['points encaissés'] / nb_game_played).toFixed(2)
		stats_data['points de différence en moyenne'] = (stats_data['points de différence'] / nb_game_played).toFixed(2)
	}

	return stats_data
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

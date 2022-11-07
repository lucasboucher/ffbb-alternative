// |----------------|
// |   Temporaire   |
// |----------------|

selected_club_name = 'Cheminots Amiens Sud B.B.'


// |--------------|
// |   Chart.js   |
// |--------------|

Chart.defaults.font.size = 14
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
Chart.defaults.font.weight = 400
Chart.defaults.font.lineHeight = "1.4em"


// |------------------|
// |   Récupération   |
// |------------------|

fetch('scrapper/data.json')
    .then((response) => response.json())
    .then((data) => {

        teams = data.equipes // Toutes les équipes

        // Informations du championnat
        document.getElementsByClassName('league-name')[0].innerHTML = data.nom // Nom du championnat
        document.getElementsByClassName('committee-name')[0].innerHTML = data.comite // Comité du championnat
        document.getElementsByClassName('pool-name')[0].innerHTML += ` ${data.poule}` // Poule du championnat

        // Afficher le nombre de journées total
        matchday_counter = data.equipes[0].rencontres.length
        for (let i = 1; i <= matchday_counter; i++) {
            document.getElementById('matchday_selection').innerHTML += `<option value="${i}">Jour ${i}</option>`
        }

        // Détermination de la journée actuelle
        for (team in teams) {
            fixtures = teams[team].rencontres
            for (fixture in fixtures) {
                fixture = fixtures[fixture]
                next_matchday = fixture.jour
                if (!fixture.match_joue) {
                    break
                }
            }
        }
        document.getElementById('matchday_selection').selectedIndex = next_matchday - 1

        // Prochaine journée
        load_matchday_fixtures(next_matchday)

        // Changement de journée
        document.getElementById("matchday_selection").addEventListener("change", () => load_matchday_fixtures(document.getElementById("matchday_selection").value))

        // Précédent classement
        ranking = []
        for (team in teams) {
            team = teams[team]
            club_id = team.club
            fixtures = team.rencontres
            team_points = 0
            team_difference = 0
            match_counter = 1
            for (fixture in fixtures) {
                if (match_counter > next_matchday-2) {
                    break
                }
                fixture = fixtures[fixture]
                if (fixture.match_joue) {
                    if (fixture.match_domicile) {
                        team_score = fixture.resultat_equipe_domicile
                        opponent_score = fixture.resultat_equipe_exterieur
                    } else {
                        team_score = fixture.resultat_equipe_exterieur
                        opponent_score = fixture.resultat_equipe_domicile
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
            ranking.push([club_id, team_points])
        }
        ranking.sort((a, b) => b[1] - a[1])

        // Classement générale
        for(team in teams) {
            for (ranking_team in ranking) {
                if (ranking[ranking_team][0] == teams[team].club) {
                    former_rank = parseInt(ranking_team) + 1
                    current_rank = parseInt(teams[team].classement)
                    ranking_team = ranking[ranking_team]
                    team_icon_color_green = 'rgb(29, 187, 121)'
                    team_icon_color_red = 'rgb(255, 47, 84)'
                    team_icon_color_grey = 'rgb(184, 184, 184)'
                    if (teams[team].club == selected_club_name) {
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
            div_squad = get_div_squad(teams[team].equipe) // Récupére la <div> du numéro de l'équipe si elle existe
            document.getElementsByClassName('ranking')[0].innerHTML +=
            `
            <li class="team">
                <a href="${teams[team].lien_equipe}" target="_blank">
                    <div class="rank">${teams[team].classement}</div>
                    <div class="team-icon">${position_icon}</div>
                    <div class="team-name">
                        <div class="team-club">${teams[team].club}</div>
                        ${div_squad}
                    </div>
                    <div>${teams[team].matchs_joues}</div>
                    <div class="hide-mobile">${teams[team].matchs_gagnes}</div>
                    <div class="hide-mobile">${teams[team].matchs_perdus}</div>
                    <div class="hide-mobile">${teams[team].matchs_nuls}</div>
                    <div>${teams[team].difference}</div>
                    <div class="points">${teams[team].points}</div>  
                </a>
            </li>
            `
        }

        // Rencontres de la prochaine journée
        function load_matchday_fixtures(selected_matchday) {
            next_fixtures = []
            double_fixture_checking = []
            for (team in teams) {
                fixtures = teams[team].rencontres
                for (fixture in fixtures) {
                    fixture = fixtures[fixture]
                    if (fixture.jour == selected_matchday && !double_fixture_checking.includes(fixture.club_domicile)) {
                        next_fixtures.push(fixture)
                        double_fixture_checking.push(fixture.club_domicile)
                    }
                }
            }
            display_fixtures(next_fixtures, 'next_fixtures')
        }

        // Afficher toutes les rencontres d'une équipe
        for (team in teams) {
            club_name = teams[team].club
            if (club_name == selected_club_name) {
                team_fixtures = teams[team].rencontres
                display_fixtures(team_fixtures, 'all_fixtures')
            }
        }
        
        // Réupération des données pour les graphiques
        matchday_data = []
        baskets_scored_data = []
        baskets_cashed_data = []
        opponents_teams_data = []
        for (team in teams) {
            club_name = teams[team].club
            if (club_name == selected_club_name) {
                fixtures = teams[team].rencontres
                for (fixture in fixtures) {
                    fixture = fixtures[fixture]
                    if (fixture.match_joue == true) {
                        matchday_data.push(fixture.jour)
                        home_squad = ''
                        away_squad = ''
                        if (fixture.equipe_domicile_numero) {
                            home_squad = ' - ' + fixture.equipe_domicile_numero
                        }
                        if (fixture.equipe_exterieur_numero) {
                            away_squad = ' - ' + fixture.equipe_exterieur_numero
                        }     
                        if (fixture.match_domicile) {
                            baskets_scored_data.push(fixture.resultat_equipe_domicile)
                            baskets_cashed_data.push(fixture.resultat_equipe_exterieur)
                            opponents_teams_data.push(fixture.club_exterieur + away_squad)
                        } else {
                            baskets_scored_data.push(fixture.resultat_equipe_exterieur)
                            baskets_cashed_data.push(fixture.resultat_equipe_domicile)
                            opponents_teams_data.push(fixture.club_domicile + home_squad)
                        }
                    }
                }
            }
        }

        // Affichage des graphiques des paniers
        display_charts(matchday_data, baskets_scored_data, baskets_cashed_data, opponents_teams_data)

        // Changement de mode des graphiques
        document.getElementById("divide").addEventListener("click", () => display_charts(matchday_data, baskets_scored_data, baskets_cashed_data, opponents_teams_data))
        document.getElementById("combine").addEventListener("click", () => display_charts(matchday_data, baskets_scored_data, baskets_cashed_data, opponents_teams_data))

    })


// |---------------|
// |   Fonctions   |
// |---------------|

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
    document.getElementById(main_class).innerHTML = ""
    for (fixture in fixtures_data) {
        fixture = fixtures_data[fixture]
        played = fixture.match_joue
        if (played) {
            home_score = fixture.resultat_equipe_domicile
            away_score = fixture.resultat_equipe_exterieur
            selected_team_status = fixture.match_domicile
            selected_team_class_if_home = ''
            selected_team_class_if_away = ''  
            if (fixture.club_domicile == selected_club_name) {
                selected_team_class_if_home = ' fixture-result-team-selected'
            } else if (fixture.club_exterieur == selected_club_name) {
                selected_team_class_if_away = ' fixture-result-team-selected'
            }
            home_score = `<div class="fixture-result${selected_team_class_if_home}">${home_score}</div>`
            away_score = `<div class="fixture-result${selected_team_class_if_away}">${away_score}</div>`
            time = 'Terminé'
        } else {
            home_score = ''
            away_score = ''
            time = fixture.heure
        }
        home_squad = get_div_squad(fixture.equipe_domicile_numero)
        away_squad = get_div_squad(fixture.equipe_exterieur_numero)
        document.getElementById(main_class).innerHTML +=
        `
            <div class="fixture">
                <div class="fixture-teams">
                    <div class="fixture-team">
                        <div class="fixture-team-name">
                            <div class="fixture-team-club">${fixture.club_domicile}</div>
                            ${home_squad}
                        </div>
                        ${home_score}
                    </div>
                    <div class="fixture-team">
                        <div class="fixture-team-name">
                            <div class="fixture-team-club">${fixture.club_exterieur}</div>
                            ${away_squad}
                        </div>
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
                            let gap = 0
                            tooltipItems.forEach(function(tooltipItem) {
                                gap = tooltipItem.parsed.y - gap
                            })
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
function display_charts(day_data, baskets_scored_data, baskets_cashed_data, opponents_teams) {
    if (document.getElementById('divide').checked) {
        document.getElementsByClassName('stats')[0].innerHTML = 
        `
            <div class="chart">
                <canvas id="baskets_scored"></canvas>
            </div>
            <div class="chart">
                <canvas id="baskets_cashed"></canvas>
            </div>
        `
        const ctx1 = document.getElementById('baskets_scored')
        const ctx2 = document.getElementById('baskets_cashed')
        const data_chart1 = {
            labels: day_data,
            datasets: [{
                data: baskets_scored_data,
                backgroundColor: 'rgba(99, 255, 143, 0.2)',
                borderColor: 'rgb(99, 255, 143)',
                borderWidth: 1,
                fill: true,
                pointRadius: 6
            }]
        }     
        const data_chart2 = {
            labels: day_data,
            datasets: [{
                data: baskets_cashed_data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 1,
                fill: true,
                pointRadius: 6
            }]
        }
        config1 = get_chart_config(data_chart1, "Paniers marqués", opponents_teams)
        config2 = get_chart_config(data_chart2, "Paniers encaissés", opponents_teams)
        new Chart(ctx1, config1)
        new Chart(ctx2, config2)
    } else if (document.getElementById('combine').checked) {
        document.getElementsByClassName('stats')[0].innerHTML =
        `
            <div class="chart">
                <canvas id="baskets"></canvas>
            </div>
        `
        const ctx = document.getElementById('baskets')
        const data_chart = {
            labels: day_data,
            datasets: [{
                data: baskets_cashed_data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 1
            },
            {
                data: baskets_scored_data,
                backgroundColor: 'rgba(99, 255, 143, 0.2)',
                borderColor: 'rgb(99, 255, 143)',
                borderWidth: 1,
                fill: {target: '0', above: 'rgba(99, 255, 143, 0.2)', below: 'rgba(255, 99, 132, 0.2)'}
            }
        ]
        }
        config = get_chart_config(data_chart, "Écarts de points", opponents_teams)
        new Chart(ctx, config)
    }
}
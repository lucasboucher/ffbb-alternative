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

fetch('../scrapper/data.json')
    .then((response) => response.json())
    .then((data) => {

        teams = data.equipes // Toutes les équipes

        // Recherche de l'équipe sélectionné
        selected_club_name = window.location.search
        selected_club_name = new URLSearchParams(selected_club_name).get('club')
        if (!selected_club_name) {
            selected_club_name = teams[0].club
        }

        // Informations du championnat
        document.getElementsByClassName('header-subtitle')[0].innerHTML = data.nom // Nom du championnat
        document.getElementsByClassName('header-title')[0].innerHTML = selected_club_name // Nom du de l'équipe sélectionné

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
                            let baskets = []
                            tooltipItems.forEach(function(tooltipItem) {
                                baskets.push(tooltipItem.parsed.y)
                            })
                            if (baskets[1]) {
                                gap = baskets[0] - baskets[1]
                            } else {
                                gap = baskets[0]
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
                data: baskets_cashed_data,
                backgroundColor: 'rgba(255, 47, 84, 0.2)',
                borderColor: 'rgb(255, 47, 84)',
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
            datasets: [    
                {
                    data: baskets_scored_data,
                    backgroundColor: 'rgba(29, 187, 121, 0.2)',
                    borderColor: 'rgb(29, 187, 121)',
                    borderWidth: 1,
                    pointRadius: 3
                },
                {
                    data: baskets_cashed_data,
                    backgroundColor: 'rgba(255, 47, 84, 0.2)',
                    borderColor: 'rgb(255, 47, 84)',
                    borderWidth: 1,
                    fill: {target: '0', above: 'rgba(255, 47, 84, 0.2)', below: 'rgba(29, 187, 121, 0.2)'},
                    pointRadius: 3
                }
            ]
        }
        config = get_chart_config(data_chart, "Écarts de paniers", opponents_teams)
        new Chart(ctx, config)
    }
}
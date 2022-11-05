//ranking
fetch('scrapper/ranking.json')
    .then((response) => response.json())
    .then((data) => {

        for(team in data) {

            highlighted_path = ""
            if (data[team].highlighted_team) {
                highlighted_path = '_highlighted'
            }

            team_number = display_team_number(data[team].equipe)

            document.getElementsByClassName('ranking')[0].innerHTML +=
            `
            <li class="team">
                <a href="${data[team].lien_ffbb}" target="_blank">
                    <div class="rank">${data[team].classement}</div>
                    <img class="team-icon" src="assets/team_icon${highlighted_path}.svg">
                    <div class="team-name">
                        <div class="team-club">${data[team].club}</div>
                        ${team_number}
                    </div>
                    <div>${data[team].matchs_joues}</div>
                    <div class="hide-mobile">${data[team].matchs_gagnes}</div>
                    <div class="hide-mobile">${data[team].matchs_perdus}</div>
                    <div class="hide-mobile">${data[team].matchs_nuls}</div>
                    <div>${data[team].difference}</div>
                    <div class="points">${data[team].points}</div>  
                </a>
            </li>
            `
        }
    })

//league
fetch('scrapper/league.json')
    .then((response) => response.json())
    .then((data) => {

        document.getElementsByClassName('league-name')[0].innerHTML = data.nom_league
        document.getElementsByClassName('committee-name')[0].innerHTML = data.nom_comite
        document.getElementsByClassName('pool-name')[0].innerHTML += ` ${data.nom_poule}`

})

fetch('scrapper/fixtures.json')
    .then((response) => response.json())
    .then((data) => {


        //toutes les rencontres
        display_fixtures(data, 'all_fixtures')


        //statistiques
        day_data = []
        baskets_scored_data = []
        baskets_cashed_data = []
        teams_name = []

        for (fixture in data) {

            home_team_number = ""
            away_team_number = ""

            if (data[fixture].equipe_domicile_numero) {
                home_team_number = " - " + data[fixture].equipe_domicile_numero
            }
            if (data[fixture].equipe_exterieur_numero) {
                away_team_number = " - " + data[fixture].equipe_exterieur_numero
            }

            if (data[fixture].match_joue == true) {
                day_data.push(data[fixture].jour)
                baskets_scored_data.push(data[fixture].paniers_marques)
                baskets_cashed_data.push(data[fixture].paniers_encaisses)
                if (data[fixture].match_maison == "oui") {
                    teams_name.push(data[fixture].equipe_exterieur + away_team_number)
                } else if (data[fixture].match_maison == "non") {
                    teams_name.push(data[fixture].equipe_domicile + home_team_number)
                }
            }
        }

        Chart.defaults.font.size = 14
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
        Chart.defaults.font.weight = 400
        Chart.defaults.font.lineHeight = "1.4em"
        
        function load_stats() {
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
                
                config1 = get_chart_config(data_chart1, "Paniers marqués", teams_name)
                config2 = get_chart_config(data_chart2, "Paniers encaissés", teams_name)
    
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
    
                config = get_chart_config(data_chart, "Écarts de points", teams_name )
    
                new Chart(ctx, config)
            }
        }

        load_stats()

        document.getElementById("divide").addEventListener("click", load_stats)
        document.getElementById("combine").addEventListener("click", load_stats)
    })


// Prochaines rencontres
fetch('scrapper/all_fixtures.json')
    .then((response) => response.json())
    .then((data) => {

        matchday_counter = data[0].length
        for (i = 1; i <= matchday_counter; i++) {
            document.getElementById('matchday_selection').innerHTML += `<option value="${i}">Jour ${i}</option>`
        }
        
        selected_matchday = document.getElementById('matchday_selection').value
        
        function load_matchday_fixtures(selected_matchday) {
            all_next_fixtures = []
            fixture_checker = []
            for (all_fixtures_team in data) {
                all_fixtures_team = data[all_fixtures_team]
                for (fixture in all_fixtures_team) {
                    fixture = all_fixtures_team[fixture]
                    if (fixture.jour == selected_matchday && !fixture_checker.includes(fixture.equipe_domicile)) {
                        all_next_fixtures.push(fixture)
                        fixture_checker.push(fixture.equipe_domicile)
                    }
                }
            }
            display_fixtures(all_next_fixtures, 'next_fixtures')
        }

        load_matchday_fixtures(selected_matchday)

        document.getElementById("matchday_selection").addEventListener("change", function() { load_matchday_fixtures(this.value) })

})


// Fonctions
function get_chart_config(data_chart, title, teams_name ) {
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
                            return teams_name[index]
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

function display_team_number(team_squad) {
    if(team_squad) {
        return `<div class="team-number">${team_squad}</div>`
    } else {
        return ''
    }
}

function display_fixtures(fixtures_data, main_class) {

    document.getElementById(main_class).innerHTML = ""

    for (fixture in fixtures_data) {
   
        if (fixtures_data[fixture].match_joue) {
            if (fixtures_data[fixture].match_maison == "oui") {
                home_result = `<div class="fixture-result fixture-result-highlighted">${fixtures_data[fixture].paniers_marques}</div>`
                away_result = `<div class="fixture-result">${fixtures_data[fixture].paniers_encaisses}</div>`
            } else if (fixtures_data[fixture].match_maison == "non") {
                home_result = `<div class="fixture-result">${fixtures_data[fixture].paniers_encaisses}</div>`
                away_result = `<div class="fixture-result fixture-result-highlighted">${fixtures_data[fixture].paniers_marques}</div>`
            } else {
                home_result = `<div class="fixture-result">${fixtures_data[fixture].paniers_encaisses}</div>`
                away_result = `<div class="fixture-result">${fixtures_data[fixture].paniers_marques}</div>`
            }
            time = 'Terminé'
        } else {
            home_result = ''
            away_result = ''
            time = fixtures_data[fixture].heure
        }

        home_team_number = display_team_number(fixtures_data[fixture].equipe_domicile_numero)
        away_team_number = display_team_number(fixtures_data[fixture].equipe_exterieur_numero)

        document.getElementById(main_class).innerHTML +=
        `
            <div class="fixture">
                <div class="fixture-teams">
                    <div class="fixture-team">
                        <div class="fixture-team-name">
                            <div class="fixture-team-club">${fixtures_data[fixture].equipe_domicile}</div>
                            ${home_team_number}
                        </div>
                        ${home_result}
                    </div>
                    <div class="fixture-team">
                        <div class="fixture-team-name">
                            <div class="fixture-team-club">${fixtures_data[fixture].equipe_exterieur}</div>
                            ${away_team_number}
                        </div>
                        ${away_result}
                    </div>
                </div>
                <div class="fixture-date">
                    <div class="fixture-day">${fixtures_data[fixture].date}</div>
                    <div class="fixture-time">${time}</div>
                </div>
            </div>
        `
    }
}
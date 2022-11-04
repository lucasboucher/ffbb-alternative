//teams
fetch('scrapper/teams.json')
    .then((response) => response.json())
    .then((data) => {

        for(team in data) {

            highlighted_path = ""
            if (data[team].highlighted_team) {
                highlighted_path = '_highlighted'
            }

            team_number = ""
            if(data[team].equipe) {
                team_number = ` <div class="team_number">${data[team].equipe}</div>`
            }

            document.getElementsByClassName('ranking')[0].innerHTML +=
            `
            <li class="team">
                <a href="${data[team].lien_ffbb}" target="_blank">
                    <div class="rank">${data[team].classement}</div>
                    <img class="team_icon" src="assets/team_icon${highlighted_path}.svg">
                    <div class="team_name">
                        <div class="team_club">${data[team].club}</div>
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

        document.getElementsByClassName('league_name')[0].innerHTML = data.nom_league
        document.getElementsByClassName('committee_name')[0].innerHTML = data.nom_comite
        document.getElementsByClassName('pool_name')[0].innerHTML += ` ${data.nom_poule}`

})

//stats
fetch('scrapper/stats.json')
    .then((response) => response.json())
    .then((data) => {

        for (fixture in data) {


            
            
            
            if (data[fixture].joue) {
                
                if (data[fixture].match_maison) {
                    result_home = `<div class="fixture-result fixture-result-highlighted">${data[fixture].paniers_marques}</div>`
                    result_away = `<div class="fixture-result">${data[fixture].paniers_encaisses}</div>`
                } else {
                    result_home = `<div class="fixture-result">${data[fixture].paniers_encaisses}</div>`
                    result_away = `<div class="fixture-result fixture-result-highlighted">${data[fixture].paniers_marques}</div>`
                }
                time = 'Terminé'
            } else {
                result_home = ''
                result_away = ''
                time = data[fixture].heure
            }

            document.getElementsByClassName('fixtures')[0].innerHTML +=
            `
                <div class="fixture">
                    <div class="fixture-teams">
                        <div class="fixture-team">
                            <div class="fixture-team-name">${data[fixture].equipe_domicile}</div>${result_home}
                        </div>
                        <div class="fixture-team">
                            <div class="fixture-team-name">${data[fixture].equipe_exterieur}</div>${result_away}
                        </div>
                    </div>
                    <div class="fixture-date">
                        <div class="fixture-day">${data[fixture].date}</div>
                        <div class="fixture-time">${time}</div>
                    </div>
                </div>
            `
        }


        day_data = []
        baskets_scored_data = []
        baskets_cashed_data = []

        for (fixture in data) {
            if (data[fixture].joue == true) {
                day_data.push(data[fixture].jour);
                baskets_scored_data.push(data[fixture].paniers_marques);
                baskets_cashed_data.push(data[fixture].paniers_encaisses);
            }      
        }

        Chart.defaults.font.size = 14;
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
        Chart.defaults.font.weight = 400;
        Chart.defaults.font.lineHeight = "1.4em"
        
        function myFunction() {
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
                        fill: true
                    }]
                };
                
                const data_chart2 = {
                    labels: day_data,
                    datasets: [{
                        data: baskets_cashed_data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1,
                        fill: true
                    }]
                };
                
                config1 = getChartConfig(data_chart1, "Paniers marqués")
                config2 = getChartConfig(data_chart2, "Paniers encaissés")
    
                new Chart(ctx1, config1)
                new Chart(ctx2, config2)
    
            } else if (document.getElementById('combine').checked) {
                document.getElementsByClassName('stats')[0].innerHTML =
                `
                    <div class="chart">
                        <canvas id="baskets"></canvas>
                    </div>
                `
                const ctx = document.getElementById('baskets');
    
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
                        borderWidth: 1
                    }
                ]
                }
    
                config = getChartConfig(data_chart, "Écarts de points")
    
                new Chart(ctx, config)
            }
        }

        myFunction()

        document.getElementById("divide").addEventListener("click", myFunction);
        document.getElementById("combine").addEventListener("click", myFunction);
    })

//fonctions
function getChartConfig(data_chart, title) {
    config = {
        type: 'line',
        data: data_chart,
        options: {
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
                        color: "rgb(26, 26, 26)",
                        drawTicks: false,
                    }
                }
            }
        }
    }
    return config
}
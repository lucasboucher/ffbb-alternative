fetch('scrapper/teams.json')
    .then((response) => response.json())
    .then((data) => {

        i = 0
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

            i++
        }
    })


fetch('scrapper/league.json')
    .then((response) => response.json())
    .then((data) => {

        document.getElementsByClassName('league_name')[0].innerHTML = data.nom_league

})

fetch('scrapper/stats.json')
    .then((response) => response.json())
    .then((data) => {

        day_data = []
        baskets_scored_data = []
        baskets_cashed_data = []

        for (fixture in data) {
            day_data.push(data[fixture].jour);
            baskets_scored_data.push(data[fixture].paniers_marques);
            baskets_cashed_data.push(data[fixture].paniers_encaisses);
        }

        const ctx1 = document.getElementById('baskets_scored');
        const ctx2 = document.getElementById('baskets_cashed');

        const data_chart1 = {
            labels: day_data,
            datasets: [{
                data: baskets_scored_data,
                backgroundColor: 'rgba(99, 255, 143, 0.2)',
                borderColor: "rgb(99, 255, 143)",
                borderWidth: 1,
                fill: true
            }]
        };
        
        const data_chart2 = {
            labels: day_data,
            datasets: [{
                data: baskets_cashed_data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 1,
                fill: true
            }]
        };    

        function getChartConfig(data_chart, title) {
            config = {
                type: 'line',
                data: data_chart,
                options: {
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
                            suggestedMax: 200,
                            min: 0,
                            ticks: {
                                maxTicksLimit: 10
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

        config1 = getChartConfig(data_chart1, "Paniers marqués")
        config2 = getChartConfig(data_chart2, "Paniers encaissés")

        Chart.defaults.font.size = 14;
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
        Chart.defaults.font.weight = 400;
        Chart.defaults.font.lineHeight = "1.4em"

        new Chart(ctx1, config1)
        new Chart(ctx2, config2)

    })
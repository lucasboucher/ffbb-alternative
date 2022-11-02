fetch('scrapper/teams.json')
  .then((response) => response.json())
  .then((data) => {

    i = 0
    for(team in data) {

        highlighted_path = ""
        if (data[team].club == team_name_to_highlight) {
            highlighted_path = '_highlighted'
        }

        if_first = ""
        if (i == 0) {
            if_first += " first"
        }

        team_number = ""
        if(!data[team].equipe == false) {
            team_number = ` <div class="team_number">${data[team].equipe}</div>`
        }

        document.querySelector('ul').innerHTML +=
        `
        <li class="team${if_first}">
            <a href="${data[team].lien_ffbb}" target="_blank">
                <div class="rank">${data[team].classement}</div>
                <img class="team_icon" src="assets/team_icon${highlighted_path}.svg">
                <div class="team_name">
                    <div class="team_club">${data[team].club}</div>
                    ${team_number}
                </div>
                <div>${data[team].matchs_joues}</div>
                <div>${data[team].matchs_gagnes}</div>
                <div>${data[team].matchs_perdus}</div>
                <div>${data[team].matchs_nuls}</div>
                <div>${data[team].difference}</div>
                <div class="points">${data[team].points}</div>  
            </a>
        </li>
        `

        i++
    }
});
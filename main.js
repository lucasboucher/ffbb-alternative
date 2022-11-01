fetch('scrapper/teams.json')
  .then((response) => response.json())
  .then((data) => {
    var i = 0
    for(team in data) {
        team_class = "team "
        team_number_class = undefined
        if (data[team].club == team_name_highlighted) {
            team_class += "highlighted "
        }
        if (i == 0) {
            team_class += "first "
        }
        if(data[team].equipe == false) {
            team_number_class = "no_team_number"
        }

        document.querySelector('ul').innerHTML +=
        `
        <a href="${data[team].lien_ffbb}" target="_blank">
            <li class="${team_class}">
                <div class="rank">${data[team].classement}</div>
                <div class="club">
                    <div class="team_name">${data[team].club}</div>
                    <div class="team_number ${team_number_class}">${data[team].equipe}</div>
                </div>
                <div>${data[team].matchs_joues}</div>
                <div>${data[team].matchs_gagnes}</div>
                <div>${data[team].matchs_perdus}</div>
                <div>${data[team].matchs_nuls}</div>
                <div>${data[team].difference}</div>
                <div>${data[team].points}</div>
            </li>
        </a>
        `
        i++
        console.log(team_class)
    }
});
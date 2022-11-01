fetch("scrapper/teams.json")
    .then((response) => response.json())
    .then((data) => {
        for(team in data) {
            if (data[team].club == team_name_highlighted) {
                document.querySelector('#classement').innerHTML +=
                `
                    <tr class="highlighted">
                        <td>` + data[team].classement + `</td>
                        <td><a href="` + data[team].lien_ffbb + `">` + data[team].club + `</a></td>
                        <td>` + data[team].points + `</td>
                        <td>` + data[team].matchs_joues + `</td>
                        <td>` + data[team].matchs_gagnes + `</td>
                        <td>` + data[team].matchs_perdus + `</td>
                        <td>` + data[team].matchs_nuls + `</td>
                    </tr>
                `
            } else {
                document.querySelector('#classement').innerHTML +=
                `
                    <tr>
                        <td>` + data[team].classement + `</td>
                        <td><a href="` + data[team].lien_ffbb + `">` + data[team].club + `</a></td>
                        <td>` + data[team].points + `</td>
                        <td>` + data[team].matchs_joues + `</td>
                        <td>` + data[team].matchs_gagnes + `</td>
                        <td>` + data[team].matchs_perdus + `</td>
                        <td>` + data[team].matchs_nuls + `</td>
                    </tr>
                `
            }
        }
});
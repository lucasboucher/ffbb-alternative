fetch("scrapper/teams.json")
    .then((response) => response.json())
    .then((data) => {
        for(team in data) {
            if (data[team].club == "CHEMINOTS AMIENS SUD B.B. - 1") {
                document.querySelector('#classement').innerHTML +=
                `
                    <tr class="papa">
                        <td>` + data[team].classement + `</td>
                        <td>` + data[team].club + `</td>
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
                        <td>` + data[team].club + `</td>
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
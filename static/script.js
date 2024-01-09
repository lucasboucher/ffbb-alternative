
// |--------------|
// |   Chart.js   |
// |--------------|

Chart.defaults.font.size = 14
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
Chart.defaults.font.weight = 400
Chart.defaults.font.lineHeight = "1.4em"


// |-----------------|
// |   Championnat   |
// |-----------------|

fetch('static/data.json')
    .then((response) => response.json())
    .then((data) => {

        teams = data.equipes // Toutes les équipes

        // Informations du championnat
        document.getElementsByClassName('header-subtitle')[0].innerHTML = data.comite // Comité du championnat
        document.getElementsByClassName('header-title')[0].innerHTML = data.nom // Nom du championnat
        document.getElementsByClassName('ranking-pool')[0].innerHTML += ` ${data.poule}` // Poule du championnat
        document.getElementsByClassName('ranking-ffbb')[0].href = data.lien_championnat // Lien du classement FFBB officiel dans le logo FFBB de la tête de classement

        // Équipe sélectionné
        selected_club_name = localStorage.getItem("selected_club_name")
        if (!selected_club_name) {
            localStorage.setItem("selected_club_name", teams[0].club);
            selected_club_name = teams[0].club
        }

        // Récupération de la balise de la sélection d'équipe
        team_selection = document.getElementById('team_selection')

        // Affichage des équipes dans la sélection
        for (team in teams) {
            club_name = teams[team].club
            if (club_name == selected_club_name) {
                selected_team_indicator = '💙 '
                team_selection_index = team
            } else {
                selected_team_indicator = ''
            }
            team_selection.innerHTML += `<option value="${club_name}">${selected_team_indicator}${club_name}</option>`
        }

        // Mettre par défaut l'équipe sélectionnée
        team_selection.selectedIndex = team_selection_index

        // Changement de l'équipe sélectionnée
        team_selection.addEventListener("change", () => reload_new_team(team_selection.value))

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

        // Récupération de la balise de la sélection de la journée
        matchday_selection = document.getElementById('matchday_selection')

        // Afficher le nombre de journées total
        matchday_counter = data.equipes[0].rencontres.length
        for (let i = 1; i <= matchday_counter; i++) {
            if (i == next_matchday) {
                next_matchday_indicator = '🗓️ '
            } else {
                next_matchday_indicator = ''
            }
            matchday_selection.innerHTML += `<option value="${i}">${next_matchday_indicator}Jour ${i}</option>`
        }

        // Mettre par défaut la journée actuelle
        matchday_selection.selectedIndex = next_matchday-1

        // Prochaine journée
        load_matchday_fixtures(next_matchday)

        // Changement de journée
        matchday_selection.addEventListener("change", () => load_matchday_fixtures(matchday_selection.value))

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
            <li class="ranking-team">
                <a href="./team?club=${teams[team].club}">
                    <div class="ranking-rank">${teams[team].classement}</div>
                    <div class="ranking-icon">${position_icon}</div>
                    <div class="ranking-name">
                        <div class="ranking-club">${teams[team].club}</div>
                        ${div_squad}
                    </div>
                    <div>${teams[team].matchs_joues}</div>
                    <div class="hidden-on-mobile">${teams[team].matchs_gagnes}</div>
                    <div class="hidden-on-mobile">${teams[team].matchs_perdus}</div>
                    <div class="hidden-on-mobile">${teams[team].paniers_marques}</div>
                    <div class="hidden-on-mobile">${teams[team].paniers_encaisses}</div>
                    <div>${teams[team].difference}</div>
                    <div class="ranking-points">${teams[team].points}</div>
                    <div class="ranking-link hidden-on-mobile">
                        <object><a href="${teams[team].lien_equipe}" target="_blank">
                            <svg viewBox="0 0 24 24"><path d="M21 3.6v16.8a.6.6 0 01-.6.6H3.6a.6.6 0 01-.6-.6V3.6a.6.6 0 01.6-.6h16.8a.6.6 0 01.6.6z"></path><path d="M15.025 8.025h-4.95m4.95 0v4.95m0-4.95l-3.535 3.536c-2.475 2.475 0 4.95 0 4.95"></path></svg>
                        </a></object>
                    </div>
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

function reload_new_team(new_team) {
    localStorage.setItem("selected_club_name", new_team);
    location.reload();
}

// Affiche les rencontres sélectionné sur une classe CSS choisi
function display_fixtures(fixtures_data, main_class) {
    document.getElementById(main_class).innerHTML = ""
    for (fixture in fixtures_data) {
        fixture = fixtures_data[fixture]
        home_squad = get_div_squad(fixture.equipe_domicile_numero)
        away_squad = get_div_squad(fixture.equipe_exterieur_numero)
        indicator_team_selected = ''
        if (fixture.match_joue) {
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
            if (fixture.club_domicile == selected_club_name || fixture.club_exterieur == selected_club_name) {
                indicator_team_selected = '<div class="fixture-indicator-team-selected"></div>'
            }
        }
        document.getElementById(main_class).innerHTML +=
        `
            <div class="fixture">
                <div class="fixture-teams">
                    <div class="fixture-team">
                        <a class="fixture-team-name" href="./team?club=${fixture.club_domicile}">
                            <div class="fixture-team-club">${fixture.club_domicile}</div>
                            ${home_squad}
                        </a>
                        ${home_score}
                    </div>
                    <div class="fixture-team">
                        <a class="fixture-team-name" href="./team?club=${fixture.club_exterieur}">
                            <div class="fixture-team-club">${fixture.club_exterieur}</div>
                            ${away_squad}
                        </a>
                        ${away_score}
                    </div>
                </div>
                <div class="fixture-date">
                    <div class="fixture-day">${fixture.date}</div>
                    <div class="fixture-time">${time}</div>
                </div>
                ${indicator_team_selected}
            </div>
        `
    }
}


// |-----------|
// |   Modal   |
// |-----------|

var modal = document.getElementById("modal");
var button = document.getElementById("modal-button");
var modal_close = document.getElementsByClassName("modal-close")[0];

button.onclick = function() {
  modal.style.display = "block";
}

modal_close.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


// |------------|
// |   Autres   |
// |------------|

// Actualisation automatique de l'année du copyright
const current_date = new Date();
const current_year = current_date.getFullYear();
document.getElementsByClassName('current-year')[0].innerHTML = current_year;
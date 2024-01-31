import { get_div_squad, reload_new_team } from "./functions.js";
import { API_DOMAIN_NAME } from "./config.js";

// Récupération des données pour le classement
fetch(`http://${API_DOMAIN_NAME}:8001/data`)
  .then((response) => response.json())
  .then((data) => {
    const teams = data.equipes; // Toutes les équipes

    // Informations du championnat
    document.getElementsByClassName("header-subtitle")[0].innerHTML = data.comite; // Comité du championnat
    document.getElementsByClassName("header-title")[0].innerHTML = data.nom; // Nom du championnat
    document.getElementsByClassName("ranking-pool")[0].innerHTML += ` ${data.poule}`; // Poule du championnat
    document.getElementsByClassName("ranking-ffbb")[0].href = data.lien_championnat; // Lien du classement FFBB officiel dans le logo FFBB de la tête de classement

    // Équipe sélectionné
    const selected_club_name = localStorage.getItem("selected_club_name");
    if (!selected_club_name) {
      localStorage.setItem("selected_club_name", teams[0].club);
      selected_club_name = teams[0].club;
    }

    // Récupération de la balise de la sélection d'équipe
    const team_selection = document.getElementById("team_selection");

    // Affichage des équipes dans la sélection
    let selected_team_indicator;
    let team_selection_index;
    for (const team in teams) {
      const club_name = teams[team].club;
      if (club_name == selected_club_name) {
        selected_team_indicator = "💙 ";
        team_selection_index = team;
      } else {
        selected_team_indicator = "";
      }
      team_selection.innerHTML += `<option value="${club_name}">${selected_team_indicator}${club_name}</option>`;
    }

    // Mettre par défaut l'équipe sélectionnée
    team_selection.selectedIndex = team_selection_index;

    // Changement de l'équipe sélectionnée
    team_selection.addEventListener("change", () => reload_new_team(team_selection.value));

    // Détermination de la journée actuelle
    for (const team in teams) {
      const fixtures = teams[team].rencontres;
      for (let fixture in fixtures) {
        fixture = fixtures[fixture];
        var next_matchday = fixture.jour;
        if (!fixture.match_joue) {
          break;
        }
      }
    }

    // Récupération de la balise de la sélection de la journée
    const matchday_selection = document.getElementById("matchday_selection");

    // Afficher le nombre de journées total
    const matchday_counter = data.equipes[0].rencontres.length;
    let next_matchday_indicator;
    for (let i = 1; i <= matchday_counter; i++) {
      if (i == next_matchday) {
        next_matchday_indicator = "🗓️ ";
      } else {
        next_matchday_indicator = "";
      }
      matchday_selection.innerHTML += `<option value="${i}">${next_matchday_indicator}Jour ${i}</option>`;
    }

    // Mettre par défaut la journée actuelle
    matchday_selection.selectedIndex = next_matchday - 1;

    // Prochaine journée
    load_matchday_fixtures(next_matchday, teams, selected_club_name);

    // Changement de journée
    matchday_selection.addEventListener("change", () =>
      load_matchday_fixtures(matchday_selection.value, teams, selected_club_name)
    );

    // Précédent classement
    const ranking = [];
    for (let team in teams) {
      team = teams[team];
      const club_id = team.club;
      const fixtures = team.rencontres;
      let team_points = 0;
      let team_difference = 0;
      let match_counter = 1;
      for (let fixture in fixtures) {
        if (match_counter > next_matchday - 2) {
          break;
        }
        fixture = fixtures[fixture];
        if (fixture.match_joue) {
          let team_score;
          let opponent_score;
          if (fixture.match_domicile) {
            team_score = fixture.resultat_equipe_domicile;
            opponent_score = fixture.resultat_equipe_exterieur;
          } else {
            team_score = fixture.resultat_equipe_exterieur;
            opponent_score = fixture.resultat_equipe_domicile;
          }
          team_score = parseInt(team_score);
          opponent_score = parseInt(opponent_score);
          if (team_score > opponent_score) {
            team_points += 2;
          } else {
            team_points += 1;
          }
          team_difference += team_score - opponent_score;
          match_counter++;
        }
      }
      team_points = team_points * 10000 + team_difference;
      ranking.push([club_id, team_points]);
    }
    ranking.sort((a, b) => b[1] - a[1]);

    // Classement générale
    for (const team in teams) {
      for (let ranking_team in ranking) {
        if (ranking[ranking_team][0] == teams[team].club) {
          const former_rank = parseInt(ranking_team) + 1;
          const current_rank = parseInt(teams[team].classement);
          ranking_team = ranking[ranking_team];
          let team_icon_color_green = "rgb(29, 187, 121)";
          let team_icon_color_red = "rgb(255, 47, 84)";
          let team_icon_color_grey = "rgb(184, 184, 184)";
          if (teams[team].club == selected_club_name) {
            team_icon_color_green = "rgb(91, 186, 213)";
            team_icon_color_red = "rgb(91, 186, 213)";
            team_icon_color_grey = "rgb(91, 186, 213)";
          }
          var position_icon;
          if (former_rank > current_rank) {
            position_icon = `<svg width="12px" height="12px" viewBox="0 0 12 12"><path d="M1 8l5-5 5 5" stroke="${team_icon_color_green}" stroke-width="2"/></svg>`;
          } else if (former_rank < current_rank) {
            position_icon = `<svg width="12px" height="12px" viewBox="0 0 12 12"><path d="M11 4L6 9 1 4" stroke="${team_icon_color_red}" stroke-width="2"/></svg>`;
          } else {
            position_icon = `<svg width="8" height="8" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" stroke="${team_icon_color_grey}" stroke-width="16"/></svg>`;
          }
        }
      }
      const div_squad = get_div_squad(teams[team].equipe); // Récupére la <div> du numéro de l'équipe si elle existe
      document.getElementsByClassName("ranking")[0].innerHTML += `
            <li class="ranking-team">
                <a href="/team?club=${teams[team].club}">
                    <div class="ranking-rank">${teams[team].classement}</div>
                    <div class="ranking-icon">${position_icon}</div>
                    <div class="ranking-name">
                        <div class="ranking-club">${teams[team].club}</div>
                        ${div_squad}
                    </div>
                    <div>${teams[team].matchs_joues}</div>
                    <div class="hidden-on-mobile">${teams[team].matchs_gagnes}</div>
                    <div class="hidden-on-mobile">${teams[team].matchs_perdus}</div>
                    <div class="hidden-on-mobile">${teams[team].points_marques}</div>
                    <div class="hidden-on-mobile">${teams[team].points_encaisses}</div>
                    <div>${teams[team].difference}</div>
                    <div class="ranking-points">${teams[team].points}</div>
                    <div class="ranking-link hidden-on-mobile">
                        <object><a href="${teams[team].lien_equipe}" target="_blank">
                            <svg viewBox="0 0 24 24"><path d="M21 3.6v16.8a.6.6 0 01-.6.6H3.6a.6.6 0 01-.6-.6V3.6a.6.6 0 01.6-.6h16.8a.6.6 0 01.6.6z"></path><path d="M15.025 8.025h-4.95m4.95 0v4.95m0-4.95l-3.535 3.536c-2.475 2.475 0 4.95 0 4.95"></path></svg>
                        </a></object>
                    </div>
                </a>
            </li>
            `;
    }
  });

// Bouton pour rafraîchir les données
document.getElementById("refresh_data_btn").addEventListener("click", async function () {
  const response = await fetch(`http://${API_DOMAIN_NAME}:8001/scrape`);

  if (!response.ok) {
    alert("Les données n'ont pas pu être transmises à l'application.");
  }

  location.reload();
});

// Affiche les rencontres sélectionné sur une classe CSS choisi
function display_fixtures(fixtures_data, main_class, selected_club_name) {
  document.getElementById(main_class).innerHTML = "";
  for (let fixture in fixtures_data) {
    fixture = fixtures_data[fixture];
    const home_squad = get_div_squad(fixture.equipe_domicile_numero);
    const away_squad = get_div_squad(fixture.equipe_exterieur_numero);
    let indicator_team_selected = "";
    let home_score;
    let away_score;
    let time;
    if (fixture.match_joue) {
      home_score = fixture.resultat_equipe_domicile;
      away_score = fixture.resultat_equipe_exterieur;
      // selected_team_status = fixture.match_domicile;
      let selected_team_class_if_home = "";
      let selected_team_class_if_away = "";
      if (fixture.club_domicile == selected_club_name) {
        selected_team_class_if_home = " fixture-result-team-selected";
      } else if (fixture.club_exterieur == selected_club_name) {
        selected_team_class_if_away = " fixture-result-team-selected";
      }
      home_score = `<div class="fixture-result${selected_team_class_if_home}">${home_score}</div>`;
      away_score = `<div class="fixture-result${selected_team_class_if_away}">${away_score}</div>`;
      time = "Terminé";
    } else {
      home_score = "";
      away_score = "";
      time = fixture.heure;
      if (
        fixture.club_domicile == selected_club_name ||
        fixture.club_exterieur == selected_club_name
      ) {
        indicator_team_selected = '<div class="fixture-indicator-team-selected"></div>';
      }
    }
    document.getElementById(main_class).innerHTML += `
          <div class="fixture">
              <div class="fixture-teams">
                  <div class="fixture-team">
                      <a class="fixture-team-name" href="./team/?club=${fixture.club_domicile}">
                          <div class="fixture-team-club">${fixture.club_domicile}</div>
                          ${home_squad}
                      </a>
                      ${home_score}
                  </div>
                  <div class="fixture-team">
                      <a class="fixture-team-name" href="./team/?club=${fixture.club_exterieur}">
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
      `;
  }
}

// Rencontres de la prochaine journée
export function load_matchday_fixtures(selected_matchday, teams, selected_club_name) {
  const next_fixtures = [];
  const double_fixture_checking = [];
  for (const team in teams) {
    const fixtures = teams[team].rencontres;
    for (let fixture in fixtures) {
      fixture = fixtures[fixture];
      if (
        fixture.jour == selected_matchday &&
        !double_fixture_checking.includes(fixture.club_domicile)
      ) {
        next_fixtures.push(fixture);
        double_fixture_checking.push(fixture.club_domicile);
      }
    }
  }
  display_fixtures(next_fixtures, "next_fixtures", selected_club_name);
}

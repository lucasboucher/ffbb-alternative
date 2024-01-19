import { get_div_squad } from "./functions.js";

// Recherche du club préféré
const selected_club_name = localStorage.getItem("selected_club_name");

// Configuration de Chart.js
Chart.defaults.font.size = 14;
Chart.defaults.font.family =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
Chart.defaults.font.weight = 400;
Chart.defaults.font.lineHeight = "1.4em";

// Récupération des données pour l'équipe
fetch("http://127.0.0.1:5000/data")
  .then((response) => response.json())
  .then((data) => {
    const teams = data.equipes; // Toutes les équipes

    // Recherche de l'équipe sélectionné
    let page_club_name = window.location.search;
    page_club_name = new URLSearchParams(page_club_name).get("club");
    if (!page_club_name) {
      page_club_name = selected_club_name;
    }

    // Informations du championnat
    document.getElementsByClassName("header-subtitle")[0].innerHTML = data.nom; // Nom du championnat
    document.getElementsByClassName("header-title")[0].innerHTML = page_club_name; // Nom du de l'équipe sélectionné

    // Afficher les résultats d'une équipe
    for (const team in teams) {
      const club_name = teams[team].club;
      if (club_name == page_club_name) {
        const team_fixtures = teams[team].rencontres;
        const previous_fixtures = [];
        for (const fixture in team_fixtures) {
          if (team_fixtures[fixture].match_joue) {
            previous_fixtures.push(team_fixtures[fixture]);
          }
        }
        display_fixtures(previous_fixtures, "results_fixtures", page_club_name);
        break;
      }
    }

    // Afficher le calendrier d'une équipe
    for (const team in teams) {
      const club_name = teams[team].club;
      if (club_name == page_club_name) {
        const team_fixtures = teams[team].rencontres;
        const next_fixtures = [];
        for (const fixture in team_fixtures) {
          if (!team_fixtures[fixture].match_joue) {
            next_fixtures.push(team_fixtures[fixture]);
          }
        }
        display_fixtures(next_fixtures, "calendar_fixtures", page_club_name);
        break;
      }
    }

    // Récupérer les statistiques
    for (let team in teams) {
      team = teams[team];
      if (team.club == page_club_name) {
        var stat_data = {
          "de différence": team.difference,
          "points marqués": team.points_marques,
          "points encaissés": team.points_encaisses,
          "de différence en moyenne": (team.difference / team.matchs_joues).toFixed(2),
          "points marqués en moyenne": (team.points_marques / team.matchs_joues).toFixed(2),
          "points encaissés en moyenne": (team.points_encaisses / team.matchs_joues).toFixed(2),
        };
        break;
      }
    }

    // Afficher les statistiques
    for (const stat in stat_data) {
      let stat_trend_icon;
      if (stat == "points marqués" || stat == "points marqués en moyenne") {
        stat_trend_icon =
          '<svg viewBox="0 0 24 24"><path class="stat-trend-up" d="M16 20v-8m0 0l3 3m-3-3l-3 3M4 14l8-8 3 3 5-5"></path></svg>';
      } else if (stat == "points encaissés" || stat == "points encaissés en moyenne") {
        stat_trend_icon =
          '<svg viewBox="0 0 24 24"><path class="stat-trend-down" d="M4 10l8 8 3-3 5 5M16 4v8m0 0l3-3m-3 3l-3-3"></path></svg>';
      } else {
        stat_trend_icon =
          '<svg viewBox="0 0 24 24"><path d="M9 21h6m-6 0v-5m0 5H3.6a.6.6 0 01-.6-.6v-3.8a.6.6 0 01.6-.6H9m6 5V9m0 12h5.4a.6.6 0 00.6-.6V3.6a.6.6 0 00-.6-.6h-4.8a.6.6 0 00-.6.6V9m0 0H9.6a.6.6 0 00-.6.6V16"></path></svg>';
      }
      document.getElementsByClassName("stats")[0].innerHTML += `
                <div class="stat">
                <div class="stat-trend">${stat_trend_icon}</div>
                <div class="stat-infos">
                    <div class="stat-figure">${stat_data[stat]}</div>
                    <div>${stat}</div>
                </div>
                </div>
            `;
    }

    // Réupération des données pour les graphiques
    const matchday_data = [];
    const points_scored_data = [];
    const points_cashed_data = [];
    const opponents_teams_data = [];
    for (const team in teams) {
      const club_name = teams[team].club;
      if (club_name == page_club_name) {
        const fixtures = teams[team].rencontres;
        for (let fixture in fixtures) {
          fixture = fixtures[fixture];
          if (fixture.match_joue == true) {
            matchday_data.push(fixture.jour);
            let home_squad = "";
            let away_squad = "";
            if (fixture.equipe_domicile_numero) {
              home_squad = " - " + fixture.equipe_domicile_numero;
            }
            if (fixture.equipe_exterieur_numero) {
              away_squad = " - " + fixture.equipe_exterieur_numero;
            }
            if (fixture.match_domicile) {
              points_scored_data.push(fixture.resultat_equipe_domicile);
              points_cashed_data.push(fixture.resultat_equipe_exterieur);
              opponents_teams_data.push(fixture.club_exterieur + away_squad);
            } else {
              points_scored_data.push(fixture.resultat_equipe_exterieur);
              points_cashed_data.push(fixture.resultat_equipe_domicile);
              opponents_teams_data.push(fixture.club_domicile + home_squad);
            }
          }
        }
      }
    }

    // Affichage des graphiques des points
    display_charts(matchday_data, points_scored_data, points_cashed_data, opponents_teams_data);

    // Changement de mode des graphiques
    document
      .getElementById("divide")
      .addEventListener("click", () =>
        display_charts(matchday_data, points_scored_data, points_cashed_data, opponents_teams_data)
      );
    document
      .getElementById("combine")
      .addEventListener("click", () =>
        display_charts(matchday_data, points_scored_data, points_cashed_data, opponents_teams_data)
      );
  });

// Obtenir la configuration d'un graphique
function get_chart_config(data_chart, title, opponents_teams) {
  const config = {
    type: "line",
    data: data_chart,
    options: {
      interaction: {
        intersect: false,
        mode: "index",
      },
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            weight: 600,
          },
        },
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(43, 43, 43, 0.8)",
          titleFont: {
            weight: 500,
          },
          footerFont: {
            weight: 700,
          },
          callbacks: {
            title: (tooltipItems) => {
              let index;
              tooltipItems.forEach(function (tooltipItem) {
                index = tooltipItem.dataIndex.toString();
              });
              return opponents_teams[index];
            },
            label: () => {
              "";
            },
            footer: (tooltipItems) => {
              const points = [];
              tooltipItems.forEach(function (tooltipItem) {
                points.push(tooltipItem.parsed.y);
              });
              let gap;
              if (points[1]) {
                gap = points[0] - points[1];
              } else {
                gap = points[0];
              }
              return gap;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgb(26, 26, 26)",
            drawTicks: false,
          },
        },
        y: {
          suggestedMax: 160,
          min: 0,
          ticks: {
            maxTicksLimit: 9,
          },
          grid: {
            titleFont: {
              weight: 600,
            },
            color: "rgb(26, 26, 26)",
            drawTicks: false,
          },
        },
      },
    },
  };
  return config;
}

// Afficher les graphiques
function display_charts(day_data, points_scored_data, points_cashed_data, opponents_teams) {
  if (document.getElementById("divide").checked) {
    document.getElementsByClassName("charts")[0].innerHTML = `
            <div class="chart">
                <canvas id="points_scored"></canvas>
            </div>
            <div class="chart">
                <canvas id="points_cashed"></canvas>
            </div>
        `;
    const ctx1 = document.getElementById("points_scored");
    const ctx2 = document.getElementById("points_cashed");
    const data_chart1 = {
      labels: day_data,
      datasets: [
        {
          data: points_scored_data,
          backgroundColor: "rgba(29, 187, 121, 0.2)",
          borderColor: "rgb(29, 187, 121)",
          borderWidth: 1,
          fill: true,
          pointRadius: 6,
        },
      ],
    };
    const data_chart2 = {
      labels: day_data,
      datasets: [
        {
          data: points_cashed_data,
          backgroundColor: "rgba(255, 47, 84, 0.2)",
          borderColor: "rgb(255, 47, 84)",
          borderWidth: 1,
          fill: true,
          pointRadius: 6,
        },
      ],
    };
    const config1 = get_chart_config(data_chart1, "Points marqués", opponents_teams);
    const config2 = get_chart_config(data_chart2, "Points encaissés", opponents_teams);
    new Chart(ctx1, config1);
    new Chart(ctx2, config2);
  } else if (document.getElementById("combine").checked) {
    document.getElementsByClassName("charts")[0].innerHTML = `
            <div class="chart">
                <canvas id="points"></canvas>
            </div>
        `;
    const ctx = document.getElementById("points");
    const data_chart = {
      labels: day_data,
      datasets: [
        {
          data: points_scored_data,
          backgroundColor: "rgba(29, 187, 121, 0.2)",
          borderColor: "rgb(29, 187, 121)",
          borderWidth: 1,
          pointRadius: 3,
        },
        {
          data: points_cashed_data,
          backgroundColor: "rgba(255, 47, 84, 0.2)",
          borderColor: "rgb(255, 47, 84)",
          borderWidth: 1,
          fill: { target: "0", above: "rgba(255, 47, 84, 0.2)", below: "rgba(29, 187, 121, 0.2)" },
          pointRadius: 3,
        },
      ],
    };
    const config = get_chart_config(data_chart, "Différence de points", opponents_teams);
    new Chart(ctx, config);
  }
}

// Affiche les rencontres sélectionné sur une classe CSS choisi
function display_fixtures(fixtures_data, main_class, page_club_name) {
  document.getElementById(main_class).innerHTML = "";
  for (let fixture in fixtures_data) {
    fixture = fixtures_data[fixture];
    const played = fixture.match_joue;
    let indicator_team_selected_class = "";
    let home_score;
    let away_score;
    let time;
    if (played) {
      home_score = fixture.resultat_equipe_domicile;
      away_score = fixture.resultat_equipe_exterieur;
      // selected_team_status = fixture.match_domicile;
      let selected_team_class_if_home = "";
      let selected_team_class_if_away = "";
      if (fixture.club_domicile == page_club_name) {
        selected_team_class_if_home = " fixture-result-team-selected";
      } else if (fixture.club_exterieur == page_club_name) {
        selected_team_class_if_away = " fixture-result-team-selected";
      }
      home_score = `<div class="fixture-result${selected_team_class_if_home}">${home_score}</div>`;
      away_score = `<div class="fixture-result${selected_team_class_if_away}">${away_score}</div>`;
      time = "Terminé";
    } else {
      home_score = "";
      away_score = "";
      time = fixture.heure;
    }
    if (
      page_club_name != selected_club_name &&
      (fixture.club_domicile == selected_club_name || fixture.club_exterieur == selected_club_name)
    ) {
      indicator_team_selected_class = " fixture-matchday-team-selected";
    }
    const home_squad = get_div_squad(fixture.equipe_domicile_numero);
    const away_squad = get_div_squad(fixture.equipe_exterieur_numero);
    document.getElementById(main_class).innerHTML += `
          <div class="fixture">
              <div class="fixture-matchday${indicator_team_selected_class}">${fixture.jour}</div>
              <div class="fixture-teams">
                  <div class="fixture-team">
                      <a class="fixture-team-name" href="../team/?club=${fixture.club_domicile}">
                          <div class="fixture-team-club">${fixture.club_domicile}</div>
                          ${home_squad}
                      </a>
                      ${home_score}
                  </div>
                  <div class="fixture-team">
                      <a class="fixture-team-name" href="../team/?club=${fixture.club_exterieur}">
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
          </div>
      `;
  }
}

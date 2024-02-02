fetch("/data")
  .then((response) => response.json())
  .then((data) => {
    const teams = data.equipes; // Toutes les équipes

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

    // Affichage journée
    document.getElementsByClassName("ranking-pool")[0].innerHTML += ` ${next_matchday - 2}`;

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

    // Affichage du classement précédent
    for (const team in ranking) {
      document.getElementById("former_ranking").innerHTML += `
            <li class="ranking-team">
                <a href="#">
                    <div class="ranking-rank">${parseInt(team) + 1}</div>
                    <div class="ranking-icon">
                        <svg width="8" height="8" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" stroke="rgb(184, 184, 184)" stroke-width="16"/></svg>
                    </div>
                    <div class="ranking-name">
                        <div class="ranking-club">${ranking[team][0]}</div>
                    </div>
                    <div class="hidden-on-mobile"></div>
                    <div class="hidden-on-mobile"></div>
                    <div class="hidden-on-mobile"></div>
                    <div class="hidden-on-mobile"></div>
                    <div class="hidden-on-mobile"></div>
                    <div></div>
                    <div></div>
                    <div class="ranking-points">${ranking[team][1]}</div>  
                </a>
            </li>
            `;
    }
  });

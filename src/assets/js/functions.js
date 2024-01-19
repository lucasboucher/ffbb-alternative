// Retoune la <div> s'il y a un numéro d'équipe
export function get_div_squad(squad) {
  if (squad) {
    return `<div class="team-number">${squad}</div>`;
  } else {
    return "";
  }
}

// Change l'équipe favorite et rafraîchie la page
export function reload_new_team(new_team) {
  localStorage.setItem("selected_club_name", new_team);
  location.reload();
}

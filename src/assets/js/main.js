// Actualisation automatique de l'année du copyright
const current_date = new Date();
const current_year = current_date.getFullYear();
document.getElementsByClassName("current-year")[0].innerHTML = current_year;

var modal = document.getElementById("modal");
var button = document.getElementById("modal_button");
var modal_close = document.getElementsByClassName("modal-close")[0];

button.onclick = function () {
  modal.style.display = "block";
};

modal_close.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

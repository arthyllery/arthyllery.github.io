/* MiApp Venezuela – script.js */
(function () {
  "use strict";

  // Año dinámico en el footer
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Manejo del formulario de contacto
  var form = document.getElementById("contactForm");
  var feedback = document.getElementById("formFeedback");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nombre = form.querySelector("#nombre").value.trim();
      var email = form.querySelector("#email").value.trim();
      var mensaje = form.querySelector("#mensaje").value.trim();

      feedback.classList.remove("success");

      if (!nombre || !email || !mensaje) {
        feedback.textContent = "Por favor completa todos los campos.";
        return;
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        feedback.textContent = "El correo electrónico no es válido.";
        return;
      }

      feedback.textContent = "¡Mensaje enviado! Te contactaremos pronto.";
      feedback.classList.add("success");
      form.reset();
    });
  }

  var inputNombre = document.getElementById("nombre");

  if (inputNombre) {
    inputNombre.addEventListener("input", function () {
      var valor = inputNombre.value.toLowerCase();

      valor = valor.split(" ").map(function(p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
      }).join(" ");

      inputNombre.value = valor;
    });
  }

  var inputMensaje = document.getElementById("mensaje");

  if (inputMensaje) {
    inputMensaje.addEventListener("input", function () {
      var valor = inputMensaje.value.toLowerCase();

      if (valor.length > 0) {
        valor = valor.charAt(0).toUpperCase() + valor.slice(1);
      }

      inputMensaje.value = valor;
    });
  }

  // Scroll suave en navegación (fallback)
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (ev) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (target) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();

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

    var btn = form.querySelector("button[type='submit']");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nombre = form.querySelector("#nombre").value.trim();
      var email = form.querySelector("#email").value.trim();
      var mensaje = form.querySelector("#mensaje").value.trim();

      feedback.classList.remove("success");

      if (nombre.length < 3) {
      feedback.textContent = "El nombre es muy corto.";
      return;
      }

      if (mensaje.length < 5) {
        feedback.textContent = "El mensaje es muy corto.";
        return;
      }

      if (!nombre || !email || !mensaje) {
        feedback.textContent = "Por favor completa todos los campos.";
        return;
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        feedback.textContent = "El correo electrónico no es válido.";
        return;
      }

      btn.classList.add("btn-loading");
      btn.textContent = "Enviando...";
      btn.disabled = true;

      emailjs.send("service_m13t7ci", "template_hnhgtmi", {
        nombre: nombre,
        email: email,
        mensaje: mensaje
      })
      .then(function () {
        feedback.textContent = "¡Mensaje enviado correctamente!";
        feedback.classList.add("success");
        form.reset();
      })
  .catch(function () {
    feedback.textContent = "Error al enviar. Intenta de nuevo.";
  })
  .finally(function () {
    btn.classList.remove("btn-loading");
    btn.textContent = "ENVIAR COMENTARIOS";
    btn.disabled = false;
  });
});

function soloLetras(valor) {
  return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
}

function limpiarMensaje(valor) {
  return valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
}

var inputNombre = document.getElementById("nombre");

if (inputNombre) {
  inputNombre.addEventListener("input", function () {
    let valor = inputNombre.value;

    valor = soloLetras(valor);

    valor = valor
      .toLowerCase()
      .split(" ")
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

    inputNombre.value = valor;
  });
}

var inputMensaje = document.getElementById("mensaje");

if (inputMensaje) {
  inputMensaje.addEventListener("input", function () {
    let valor = inputMensaje.value;

    valor = limpiarMensaje(valor);

    if (valor.length > 0) {
      valor = valor.charAt(0).toUpperCase() + valor.slice(1);
    }

    inputMensaje.value = valor;
  });
}


  document.getElementById("instaBtn").onclick = function(e){
  e.preventDefault();
  window.location = "instagram://user?username=arthyllery";
  setTimeout(() => {
    window.location = "https://www.instagram.com/arthyllery/";
  }, 1500);
  };

  document.getElementById("threadsBtn").onclick = function(e){
    e.preventDefault();
    window.location = "threads://user?username=arthyllery";
    setTimeout(() => {
      window.location = "https://www.threads.net/@arthyllery";
    }, 1500);
  };

  const el = document.querySelector('.hero-text');

  function fitText() {
    let maxSize = 55;
    let minSize = 20;

    el.style.fontSize = maxSize + 'px';

    while (el.scrollWidth > el.clientWidth && maxSize > minSize) {
      maxSize--;
      el.style.fontSize = maxSize + 'px';
    }
  }

  window.addEventListener('load', fitText);
  window.addEventListener('resize', fitText);

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

  }
})();
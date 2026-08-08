(function () {
  "use strict";

  var cfg = window.PRESTART_CONFIG || {};
  var RATE_KEY = "prestart_form_last_send";
  var CONSENT_KEY = "prestart_analytics_consent";

  function soloLetras(valor) {
    return String(valor).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  }

  function limpiarMensaje(valor) {
    return String(valor).replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?¿¡\-]/g, "");
  }

  function formatNombre(valor) {
    return soloLetras(valor)
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map(function (p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
      })
      .join(" ");
  }

  function isRateLimited() {
    try {
      var last = Number(localStorage.getItem(RATE_KEY) || 0);
      var windowMs = (cfg.rateLimitMs != null) ? cfg.rateLimitMs : 60000;
      return last && Date.now() - last < windowMs;
    } catch (e) {
      return false;
    }
  }

  function markSent() {
    try {
      localStorage.setItem(RATE_KEY, String(Date.now()));
    } catch (e) { /* ignore */ }
  }

  function loadAnalytics() {
    if (window.__prestartGaLoaded) return;
    window.__prestartGaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", "G-JVYCHC8SY2", { anonymize_ip: true });

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=G-JVYCHC8SY2";
    document.head.appendChild(s);
  }

  function initConsent() {
    var banner = document.getElementById("cookieConsent");
    if (!banner) return;

    var stored = null;
    try {
      stored = localStorage.getItem(CONSENT_KEY);
    } catch (e) { /* ignore */ }

    if (stored === "accepted") {
      loadAnalytics();
      banner.hidden = true;
      return;
    }
    if (stored === "rejected") {
      banner.hidden = true;
      return;
    }

    banner.hidden = false;

    var acceptBtn = document.getElementById("cookieAccept");
    var rejectBtn = document.getElementById("cookieReject");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        try { localStorage.setItem(CONSENT_KEY, "accepted"); } catch (e) { /* ignore */ }
        loadAnalytics();
        banner.hidden = true;
      });
    }
    if (rejectBtn) {
      rejectBtn.addEventListener("click", function () {
        try { localStorage.setItem(CONSENT_KEY, "rejected"); } catch (e) { /* ignore */ }
        banner.hidden = true;
      });
    }
  }

  function initRecaptcha() {
    var key = cfg.recaptchaSiteKey;
    var host = document.getElementById("recaptchaHost");
    if (!key || !host) {
      if (host) host.hidden = true;
      return;
    }
    host.hidden = false;
    window.__prestartOnRecaptchaLoad = function () {
      if (!window.grecaptcha || host.dataset.rendered === "1") return;
      window.grecaptcha.render(host, { sitekey: key });
      host.dataset.rendered = "1";
    };
    var s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?onload=__prestartOnRecaptchaLoad&render=explicit";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }

  function getRecaptchaToken() {
    if (!cfg.recaptchaSiteKey || !window.grecaptcha) return "";
    try {
      return window.grecaptcha.getResponse() || "";
    } catch (e) {
      return "";
    }
  }

  function resetRecaptcha() {
    if (!cfg.recaptchaSiteKey || !window.grecaptcha) return;
    try { window.grecaptcha.reset(); } catch (e) { /* ignore */ }
  }

  function initForm() {
    var form = document.getElementById("contactForm");
    var feedback = document.getElementById("formFeedback");
    if (!form || !feedback) return;

    var btn = form.querySelector("button[type='submit']");
    var inputNombre = document.getElementById("nombre");
    var inputMensaje = document.getElementById("mensaje");
    var honeypot = document.getElementById("website");

    if (inputNombre) {
      inputNombre.addEventListener("input", function () {
        inputNombre.value = formatNombre(inputNombre.value);
      });
    }

    if (inputMensaje) {
      inputMensaje.addEventListener("input", function () {
        var valor = limpiarMensaje(inputMensaje.value);
        if (valor.length > 0) {
          valor = valor.charAt(0).toUpperCase() + valor.slice(1);
        }
        inputMensaje.value = valor;
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      feedback.classList.remove("success");
      feedback.textContent = "";

      // Honeypot: bots that fill hidden fields get a fake success
      if (honeypot && honeypot.value) {
        feedback.textContent = "¡Mensaje enviado correctamente!";
        feedback.classList.add("success");
        form.reset();
        return;
      }

      if (isRateLimited()) {
        feedback.textContent = "Espera un minuto antes de enviar otro mensaje.";
        return;
      }

      var nombre = formatNombre((form.querySelector("#nombre") || {}).value || "");
      var email = String((form.querySelector("#email") || {}).value || "").trim().toLowerCase();
      var mensaje = limpiarMensaje((form.querySelector("#mensaje") || {}).value || "").trim();
      var privacy = form.querySelector("#privacyConsent");

      if (inputNombre) inputNombre.value = nombre;
      if (inputMensaje) inputMensaje.value = mensaje;

      if (!nombre || nombre.length < 3) {
        feedback.textContent = "El nombre es muy corto.";
        return;
      }
      if (nombre.length > 60) {
        feedback.textContent = "El nombre es demasiado largo.";
        return;
      }
      if (!email) {
        feedback.textContent = "Por favor completa todos los campos.";
        return;
      }
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email) || email.length > 100) {
        feedback.textContent = "El correo electrónico no es válido.";
        return;
      }
      if (!mensaje || mensaje.length < 5) {
        feedback.textContent = "El mensaje es muy corto.";
        return;
      }
      if (mensaje.length > 500) {
        feedback.textContent = "El mensaje es demasiado largo (máx. 500).";
        return;
      }
      if (privacy && !privacy.checked) {
        feedback.textContent = "Debes aceptar el aviso de privacidad.";
        return;
      }

      if (cfg.recaptchaSiteKey) {
        var token = getRecaptchaToken();
        if (!token) {
          feedback.textContent = "Completa el CAPTCHA antes de enviar.";
          return;
        }
      }

      if (!window.emailjs || !cfg.emailjs) {
        feedback.textContent = "El formulario no está disponible ahora.";
        return;
      }

      btn.classList.add("btn-loading");
      btn.textContent = "Enviando...";
      btn.disabled = true;

      var params = {
        nombre: nombre,
        email: email,
        mensaje: mensaje
      };
      if (cfg.recaptchaSiteKey) {
        params["g-recaptcha-response"] = getRecaptchaToken();
      }

      window.emailjs
        .send(cfg.emailjs.serviceId, cfg.emailjs.templateId, params)
        .then(function () {
          markSent();
          feedback.textContent = "¡Mensaje enviado correctamente!";
          feedback.classList.add("success");
          form.reset();
          resetRecaptcha();
        })
        .catch(function () {
          feedback.textContent = "Error al enviar. Intenta de nuevo.";
          resetRecaptcha();
        })
        .finally(function () {
          btn.classList.remove("btn-loading");
          btn.textContent = "ENVIAR COMENTARIOS";
          btn.disabled = false;
        });
    });
  }

  function initSocialDeepLinks() {
    var insta = document.getElementById("instaBtn");
    var threads = document.getElementById("threadsBtn");

    if (insta) {
      insta.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = "instagram://user?username=arthyllery";
        setTimeout(function () {
          window.location.href = "https://www.instagram.com/arthyllery/";
        }, 1500);
      });
    }

    if (threads) {
      threads.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = "threads://user?username=arthyllery";
        setTimeout(function () {
          window.location.href = "https://www.threads.com/@arthyllery";
        }, 1500);
      });
    }
  }

  function initFitText() {
    var el = document.querySelector(".hero-text");
    if (!el) return;

    function fitText() {
      var maxSize = 55;
      var minSize = 20;
      el.style.fontSize = maxSize + "px";
      while (el.scrollWidth > el.clientWidth && maxSize > minSize) {
        maxSize--;
        el.style.fontSize = maxSize + "px";
      }
    }

    window.addEventListener("load", fitText);
    window.addEventListener("resize", fitText);
    fitText();
  }

  function initSmoothScroll() {
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

  function applyApkInfo(info) {
    if (!info || !info.url) return;

    cfg.apk = cfg.apk || {};
    cfg.apk.url = info.url;
    cfg.apk.version = info.version || cfg.apk.version;
    cfg.apk.sha256 = info.sha256 || "";
    cfg.apk.releaseUrl = info.releaseUrl || cfg.apk.releaseUrl;

    document.querySelectorAll("[data-apk-download]").forEach(function (el) {
      el.setAttribute("href", info.url);
    });

    var versionEl = document.getElementById("apkVersion");
    if (versionEl && info.version) {
      versionEl.textContent = info.version;
    }
  }

  function extractSha256(text) {
    if (!text) return "";
    var match = String(text).match(/\b[a-fA-F0-9]{64}\b/);
    return match ? match[0].toLowerCase() : "";
  }

  function pickApkAsset(assets, preferredName) {
    if (!assets || !assets.length) return null;
    var apkAssets = assets.filter(function (a) {
      return a && a.name && /\.apk$/i.test(a.name);
    });
    if (!apkAssets.length) return null;
    if (preferredName) {
      var preferred = apkAssets.find(function (a) {
        return a.name.toLowerCase() === String(preferredName).toLowerCase();
      });
      if (preferred) return preferred;
    }
    return apkAssets[0];
  }

  function pickShaAsset(assets, apkName) {
    if (!assets || !assets.length) return null;
    var lowerApk = apkName ? String(apkName).toLowerCase() : "";
    return assets.find(function (a) {
      if (!a || !a.name) return false;
      var n = a.name.toLowerCase();
      if (lowerApk && n === lowerApk + ".sha256") return true;
      if (n.endsWith(".sha256")) return true;
      if (n === "sha256sums" || n === "sha256sums.txt" || n === "checksums.txt") return true;
      return false;
    }) || null;
  }

  function initApkTrust() {
    if (cfg.apk) {
      applyApkInfo(cfg.apk);
    }

    resolveLatestRelease().then(function (info) {
      if (info) applyApkInfo(info);
    });
  }

  function resolveLatestRelease() {
    var gh = cfg.github || {};
    if (!gh.owner || !gh.repo || !window.fetch) {
      return Promise.resolve(null);
    }

    var cacheKey = "prestart_latest_release_v1";
    try {
      var cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
      if (cached && cached.expires > Date.now() && cached.info && cached.info.url) {
        return Promise.resolve(cached.info);
      }
    } catch (e) { /* ignore */ }

    var apiUrl =
      "https://api.github.com/repos/" +
      encodeURIComponent(gh.owner) +
      "/" +
      encodeURIComponent(gh.repo) +
      "/releases/latest";

    return fetch(apiUrl, {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API " + res.status);
        return res.json();
      })
      .then(function (data) {
        var apkAsset = pickApkAsset(data.assets, gh.preferredApkName);
        if (!apkAsset) throw new Error("No APK in latest release");

        var version = (data.tag_name || data.name || "latest").replace(/^v/i, "v");
        if (version.charAt(0) !== "v" && /^\d/.test(version)) {
          version = "v" + version;
        }

        var info = {
          version: version,
          url: apkAsset.browser_download_url,
          releaseUrl: data.html_url,
          sha256: extractSha256(data.body || "")
        };

        var shaAsset = pickShaAsset(data.assets, apkAsset.name);
        if (!shaAsset || info.sha256) {
          return info;
        }

        return fetch(shaAsset.browser_download_url)
          .then(function (r) {
            if (!r.ok) return info;
            return r.text().then(function (text) {
              info.sha256 = extractSha256(text);
              return info;
            });
          })
          .catch(function () {
            return info;
          });
      })
      .then(function (info) {
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ expires: Date.now() + 60 * 60 * 1000, info: info })
          );
        } catch (e) { /* ignore */ }
        return info;
      })
      .catch(function () {
        return null;
      });
  }

  function initEmailJs() {
    if (!window.emailjs || !cfg.emailjs || !cfg.emailjs.publicKey) return;
    window.emailjs.init(cfg.emailjs.publicKey);
  }

  initConsent();
  initEmailJs();
  initRecaptcha();
  initForm();
  initSocialDeepLinks();
  initFitText();
  initSmoothScroll();
  initApkTrust();
})();

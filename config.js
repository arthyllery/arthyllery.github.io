/**
 * Configuración pública del sitio.
 *
 * EmailJS (dashboard):
 * 1. Restrict Allowed Origins a tu dominio (ej. https://arthyllery.github.io)
 * 2. En la plantilla → Settings → Enable reCAPTCHA V2
 * 3. Pega ahí el Secret Key de reCAPTCHA (nunca en este archivo)
 *
 * Releases: la web pregunta a GitHub el último release del repo.
 * Tip: sube el APK siempre como "app-release.apk" (o deja que el script
 * elija el primer .apk del release). Opcional: adjunta un archivo
 * "app-release.apk.sha256" con el hash para mostrarlo en la página.
 */
window.PRESTART_CONFIG = {
  emailjs: {
    publicKey: "Mo5mdNAPA2z3udcOv",
    serviceId: "service_m13t7ci",
    templateId: "template_hnhgtmi"
  },
  recaptchaSiteKey: "6LdjTXstAAAAAHzATEgwG1Jrgfy1ndzoF-ka6IBD",
  rateLimitMs: 60000,
  github: {
    owner: "arthyllery",
    repo: "pre-start",
    // Preferido si hay varios .apk en el release
    preferredApkName: "app-release.apk"
  },
  // Fallback si la API de GitHub falla (usa /latest/download/)
  apk: {
    version: "latest",
    url: "https://github.com/arthyllery/pre-start/releases/latest/download/app-release.apk",
    sha256: "",
    releaseUrl: "https://github.com/arthyllery/pre-start/releases/latest"
  }
};

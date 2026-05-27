(function (global) {
  const STORAGE_KEYS = ["emailRegistroVendedor", "usuario_email", "userEmail"];

  function normalizar(correo) {
    return (correo || "").trim().toLowerCase();
  }

  function guardar(email) {
    if (!email) return "";
    STORAGE_KEYS.forEach((key) => localStorage.setItem(key, email));
    try {
      sessionStorage.setItem("emailRegistroVendedor", email);
    } catch (_) {}
    return email;
  }

  function leerCookie() {
    const match = document.cookie.match(/(?:^|;\s*)agro_email=([^;]*)/);
    if (!match) return "";
    try {
      return normalizar(decodeURIComponent(match[1]));
    } catch (_) {
      return normalizar(match[1]);
    }
  }

  function sincronizarEmail(correo) {
    return guardar(normalizar(correo));
  }

  function obtenerEmailProceso() {
    const params = new URLSearchParams(window.location.search);
    const desdeUrl = normalizar(params.get("email"));
    if (desdeUrl) return guardar(desdeUrl);

    const desdeCookie = leerCookie();
    if (desdeCookie) return guardar(desdeCookie);

    for (const key of STORAGE_KEYS) {
      const valor = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (valor) return guardar(normalizar(valor));
    }

    return "";
  }

  function urlConEmail(rutaBase) {
    const email = obtenerEmailProceso();
    if (!email) return rutaBase;
    const separador = rutaBase.includes("?") ? "&" : "?";
    return `${rutaBase}${separador}email=${encodeURIComponent(email)}`;
  }

  global.AgroEmail = {
    sincronizarEmail,
    obtenerEmailProceso,
    urlConEmail,
  };
})(window);

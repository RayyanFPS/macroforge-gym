(function () {
  const SESSION_KEY = "macroforge_session_v1";

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }

  window.MacroForgeAuth = {
    configured: true,
    client: null,
    get user() {
      return getSession();
    },
    async init() {
      return getSession();
    },
    async signOut() {
      localStorage.removeItem(SESSION_KEY);
      window.location.href = "auth.html";
    }
  };

  window.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname;
    const isApp = path.endsWith("index.html") || path === "/" || path.endsWith("/");
    const user = await window.MacroForgeAuth.init();

    if (isApp && !user) {
      window.location.href = "auth.html";
      return;
    }

    const accountButton = document.getElementById("accountButton");
    if (accountButton) {
      accountButton.textContent = user ? `@${user.username}` : "Log in";
      accountButton.onclick = () => {
        document.getElementById("settingsBtn")?.click();
      };
    }

    const signOutButton = document.getElementById("signOutButton");
    if (signOutButton) {
      signOutButton.onclick = () => window.MacroForgeAuth.signOut();
    }
  });
})();

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 30_000;

const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");

const DEMO_USER = "admin2026";
const DEMO_PASSWORD = "ClaveSegura!2026";

const state = {
  failedAttempts: 0,
  lockedUntil: 0,
};

function sanitizeInput(value) {
  return value.trim().replace(/[<>"'`]/g, "");
}

function timingSafeCompare(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.classList.remove("error", "success");
  if (type) statusEl.classList.add(type);
}

function getRemainingLockMs() {
  return Math.max(0, state.lockedUntil - Date.now());
}

function updateLockStateUI() {
  const remaining = getRemainingLockMs();
  if (remaining > 0) {
    const secs = Math.ceil(remaining / 1000);
    showStatus(`Cuenta bloqueada temporalmente. Intenta en ${secs}s.`, "error");
    submitBtn.disabled = true;
    return;
  }

  submitBtn.disabled = false;
}

function validateFieldRules(username, password) {
  const usernameRegex = /^[A-Za-z0-9._-]{4,32}$/;
  if (!usernameRegex.test(username)) {
    return "Usuario invalido. Revisa el formato permitido.";
  }

  if (password.length < 8 || password.length > 64) {
    return "Contrasena invalida. Debe tener entre 8 y 64 caracteres.";
  }

  return "";
}

function lockTemporarily() {
  state.lockedUntil = Date.now() + LOCK_TIME_MS;
  updateLockStateUI();
}

function resetSecurityState() {
  state.failedAttempts = 0;
  state.lockedUntil = 0;
}

togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePasswordBtn.textContent = isPassword ? "Ocultar" : "Mostrar";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  updateLockStateUI();
  if (submitBtn.disabled) {
    return;
  }

  const username = sanitizeInput(usernameInput.value);
  const password = sanitizeInput(passwordInput.value);

  const validationMessage = validateFieldRules(username, password);
  if (validationMessage) {
    showStatus(validationMessage, "error");
    return;
  }

  const userOk = timingSafeCompare(username, DEMO_USER);
  const passOk = timingSafeCompare(password, DEMO_PASSWORD);

  if (userOk && passOk) {
    resetSecurityState();
    showStatus("Inicio de sesion correcto. Redirigiendo...", "success");

    // Simula una redireccion segura despues de autenticar.
    setTimeout(() => {
      showStatus("Sesion activa. Bienvenido al panel.", "success");
    }, 900);

    form.reset();
    passwordInput.type = "password";
    togglePasswordBtn.textContent = "Mostrar";
    return;
  }

  state.failedAttempts += 1;
  const attemptsLeft = MAX_ATTEMPTS - state.failedAttempts;

  if (attemptsLeft <= 0) {
    state.failedAttempts = 0;
    lockTemporarily();
    return;
  }

  showStatus(`Credenciales incorrectas. Intentos restantes: ${attemptsLeft}.`, "error");
});

setInterval(updateLockStateUI, 300);
updateLockStateUI();

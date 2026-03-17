async function loginToGoogleIfNeeded(page) {

  const email = process.env.MEET_EMAIL;
  const password = process.env.MEET_PASSWORD;

  if (!email || !password) {
    console.log("MEET_EMAIL o MEET_PASSWORD no definidos en .env, se intentará entrar sin login.");
    return;
  }

  // Esperar a ver si aparece el campo de email (pantalla de login)
  const emailInput = page.locator('input[type="email"], input[name="identifier"]');

  try {
    await emailInput.waitFor({ state: "visible", timeout: 60000 });
    await emailInput.fill(email);

    const nextButtonEmail = page
      .locator("button")
      .filter({ hasText: /next|siguiente/i });

    await nextButtonEmail.waitFor({ state: "visible", timeout: 30000 });
    await nextButtonEmail.click();
  } catch {
    console.log("No apareció pantalla de email de Google, probablemente ya hay sesión iniciada.");
    return;
  }

  // Pantalla de password
  const passwordInput = page.locator('input[type="password"]');

  try {
    await passwordInput.waitFor({ state: "visible", timeout: 60000 });
    await passwordInput.fill(password);

    const nextButtonPassword = page
      .locator("button")
      .filter({ hasText: /next|siguiente/i });

    await nextButtonPassword.waitFor({ state: "visible", timeout: 30000 });
    await nextButtonPassword.click();
  } catch {
    console.log("No se pudo completar la pantalla de password de Google.");
  }
}

async function joinMeet(page) {

  // Dar tiempo a que cargue el sitio de Google / Meet
  await page.waitForTimeout(5000);

  // Intentar login si aparece la pantalla de Google
  await loginToGoogleIfNeeded(page);

  // Una vez dentro de Meet, esperar a que cargue el lobby de la reunión
  const nameInput = page.locator('input[aria-label*="name"], input[placeholder*="name"], input[type="text"]');

  try {
    await nameInput.waitFor({ state: "visible", timeout: 60000 });
    await nameInput.fill("Zion Bot");
  } catch {
    console.log("No se encontró campo de nombre en Meet (posible sesión autenticada).");
  }

  const joinButton = page.locator("button").filter({ hasText: /join|unirse|entrar/i });

  try {
    await joinButton.waitFor({ state: "visible", timeout: 60000 });
    await joinButton.click();
  } catch {
    console.log("No se encontró botón de unirse en Meet.");
  }

  console.log("Entrando a reunión de Meet (intento de join ejecutado).");
}

module.exports = { joinMeet };
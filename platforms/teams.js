async function joinTeams(page) {

  // Dar tiempo inicial para que cargue, pero sin depender solo de timeouts fijos
  await page.waitForTimeout(5000);

  const continueBtn = page.locator("button").filter({ hasText: /continue|Continuar|usar este navegador/i });

  try {
    await continueBtn.waitFor({ state: "visible", timeout: 60000 });
    await continueBtn.click();
  } catch {
    console.log("No se encontró botón de continuar en Teams (posible cambio de UI o ya se saltó esta pantalla).");
  }

  // Intentar localizar el input de nombre con un timeout largo por internet lento
  const nameInput = page.locator('input[aria-label*="name"], input[placeholder*="name"], input[type="text"]');

  try {
    await nameInput.waitFor({ state: "visible", timeout: 60000 });
    await nameInput.fill("Zion Bot");
  } catch {
    console.log("No se encontró campo de nombre en Teams (puede que ya haya sesión iniciada).");
  }

  const joinButton = page.locator("button").filter({ hasText: /join|unirse|entrar/i });

  try {
    await joinButton.waitFor({ state: "visible", timeout: 60000 });
    await joinButton.click();
  } catch {
    console.log("No se encontró botón de unirse en Teams.");
  }

  console.log("Entrando a reunión de Teams (intento de join ejecutado).");
}

module.exports = { joinTeams };
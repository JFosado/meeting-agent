async function joinTeams(page) {

  await page.waitForTimeout(5000);

  const continueBtn = page.locator("button").filter({ hasText: /continue/i });

  if (await continueBtn.isVisible()) {
    await continueBtn.click();
  }

  await page.waitForTimeout(3000);

  const nameInput = page.locator("input");

  if (await nameInput.isVisible()) {
    await nameInput.fill("Zion Bot");
  }

  const joinButton = page.locator("button").filter({ hasText: /join/i });

  if (await joinButton.isVisible()) {
    await joinButton.click();
  }

  console.log("Entrando a reunión de Teams");
}

module.exports = { joinTeams };
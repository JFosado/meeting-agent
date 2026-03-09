async function joinMeet(page) {

  await page.waitForTimeout(5000);

  const nameInput = page.locator("input");

  if (await nameInput.isVisible()) {
    await nameInput.fill("Zion Bot");
  }

  const joinButton = page.locator("button").filter({ hasText: /join/i });

  if (await joinButton.isVisible()) {
    await joinButton.click();
  }

  console.log("Entrando a reunión de Meet");
}

module.exports = { joinMeet };
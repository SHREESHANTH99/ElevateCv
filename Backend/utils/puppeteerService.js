const puppeteer = require("puppeteer");

let browserInstance = null;
let launchPromise = null;

async function getBrowser() {
  if (browserInstance) {
    try {
      // Quick check to ensure the connection is alive
      const isConnected = browserInstance.isConnected();
      if (isConnected) return browserInstance;
    } catch (e) {
      console.warn("[PUPPETEER] Warm browser disconnected. Relaunching...");
      browserInstance = null;
    }
  }

  // Prevent multiple concurrent launch requests
  if (launchPromise) {
    return launchPromise;
  }

  console.log("[PUPPETEER] Booting new warm browser instance...");
  launchPromise = puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--run-all-compositor-stages-before-draw",
      "--memory-pressure-off",
    ],
    timeout: 30000,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  }).then(browser => {
    browserInstance = browser;
    launchPromise = null;
    
    browserInstance.on("disconnected", () => {
      console.warn("[PUPPETEER] Browser disconnected unexpectedly.");
      browserInstance = null;
    });

    return browserInstance;
  }).catch(err => {
    launchPromise = null;
    throw err;
  });

  return launchPromise;
}

async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

module.exports = { getBrowser, closeBrowser };

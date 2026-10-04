const puppeteer = require("puppeteer");

const MAX_WORKERS = 3;
const freeWorkers = [];
const busyWorkers = new Set();
const taskQueue = [];

async function launchWorker() {
  console.log(`[PUPPETEER] Booting new worker... (Total: ${busyWorkers.size + freeWorkers.length + 1})`);
  return puppeteer.launch({
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
  });
}

async function acquireBrowser() {
  if (freeWorkers.length > 0) {
    const worker = freeWorkers.pop();
    busyWorkers.add(worker);
    return worker;
  }

  if (busyWorkers.size < MAX_WORKERS) {
    const worker = await launchWorker();
    
    worker.on("disconnected", () => {
      console.warn("[PUPPETEER] Worker disconnected unexpectedly.");
      busyWorkers.delete(worker);
      const index = freeWorkers.indexOf(worker);
      if (index > -1) freeWorkers.splice(index, 1);
    });

    busyWorkers.add(worker);
    return worker;
  }

  // Queue the task
  return new Promise((resolve) => {
    taskQueue.push(resolve);
  });
}

async function releaseBrowser(worker) {
  if (!worker) return;

  if (busyWorkers.has(worker)) {
    busyWorkers.delete(worker);
    
    // Quick health check
    if (worker.isConnected()) {
      freeWorkers.push(worker);
    } else {
      console.warn("[PUPPETEER] Releasing disconnected worker.");
    }
  }

  // Process next in queue
  if (taskQueue.length > 0 && freeWorkers.length > 0) {
    const resolve = taskQueue.shift();
    const nextWorker = freeWorkers.pop();
    busyWorkers.add(nextWorker);
    resolve(nextWorker);
  } else if (taskQueue.length > 0 && busyWorkers.size < MAX_WORKERS) {
    const resolve = taskQueue.shift();
    const nextWorker = await launchWorker();
    busyWorkers.add(nextWorker);
    resolve(nextWorker);
  }
}

async function closeBrowser() {
  // Graceful shutdown
  const allWorkers = [...freeWorkers, ...busyWorkers];
  freeWorkers.length = 0;
  busyWorkers.clear();
  taskQueue.length = 0;
  
  await Promise.all(allWorkers.map(w => w.close().catch(() => {})));
}

module.exports = { 
  getBrowser: acquireBrowser, // For backward compatibility
  acquireBrowser, 
  releaseBrowser, 
  closeBrowser 
};

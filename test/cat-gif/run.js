const path = require("path");

const LocalWebServer = require("local-web-server");
const puppeteer = require("puppeteer");

const port = 9000;
const ws = LocalWebServer.create({port, directory: __dirname,});

const finish = () => {
  let r = {};
  r.promise = new Promise((finish, error) => {
    r.finish = finish;
    r.error = error;
  });
  return r;
};

(async () => {
  const browser = await puppeteer.launch({
    //headless: false, appMode: true, devtools: true,
    //args: ["--disable-web-security"],
  });
  try {
    const page = await browser.newPage();
    page.on("error", err => console.error(err));
    page.on("pageerror", err => console.error(err));
    page.on("console", msg => {
      const {url, lineNumber, columnNumber} = msg.location();
      const fmt = `[${url} ${lineNumber}:${columnNumber}]: ${msg.text()}`;
      if (msg.type() === "assert") console.assert(false, fmt);
      else console[msg.type()](fmt);
    });
    const finished = finish();
    await page.exposeFunction("finish", finished.finish);
    await page.goto(`http://localhost:${port}`, {waitUntil: "networkidle0"});
    setTimeout(finished.error, 15000, `timeout: ${15000}ms`);
    await finished.promise;
  } finally {
    await browser.close();
    ws.server.close();
  }
})().catch(console.error);
import electron from "electron";
import puppeteer from "puppeteer-core";

export async function getUrlList(url: string) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const browser = await puppeteer.launch({
    headless: true,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    executablePath: electron,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: ["networkidle0"] });
  const url_list = await page.$$eval("a", async (els) => {
    const res = [];
    els.forEach((e) => {
      res.push(e.href);
    });
    return res;
  });
  await browser.close();
  return url_list;
}

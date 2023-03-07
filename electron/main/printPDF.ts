import puppeteer from "puppeteer";

import { getChromePath } from "./tools";
export function sleep() {
  return new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
}
export async function printPDF(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: getChromePath(),
    defaultViewport: { width: 595 * 2, height: 842 * 2 },
  });
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: ["networkidle0"],
  });
  await sleep();
  const title = await page.title();
  const pdf = await page.pdf({ format: "A4" });
  const img = await page.screenshot();
  await browser.close();
  return { title, pdf, img };
}

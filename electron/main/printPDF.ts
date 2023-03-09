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
    defaultViewport: { width: 1920, height: 1080 },
  });
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: ["networkidle0"],
  });
  await sleep();
  const title = await page.title();
  const pdf = await page.pdf({
    format: "tabloid",
    printBackground: true,
  });
  const img = await page.screenshot();
  await browser.close();
  return { title, pdf, img };
}

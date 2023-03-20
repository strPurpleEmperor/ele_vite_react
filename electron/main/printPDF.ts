import puppeteer from "puppeteer";

import { getChromePath } from "./tools";
export function sleep() {
  return new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
}
// 210mm×297mm
// 420mm×594mm
// 820mm×1198mm
// 1640mm×2396mm
export async function printPDF(url: string) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: getChromePath(),
      defaultViewport: { width: 820, height: 1198 },
    });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: ["networkidle2"],
    });
    await sleep();
    const title = await page.title();
    const pdf: Uint8Array = await page.pdf({
      printBackground: true,
      format: "tabloid",
    });
    const img = await page.screenshot();
    await browser.close();
    return { title, pdf, img, status: 1, url };
  } catch (e) {
    console.log(e);
    return { status: 0, url, title: "" };
  }
}

/**
 * 控制页面自动滚动
 * */
export function autoScroll(page) {
  return page.evaluate(() => {
    return new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      // 每200毫秒让页面下滑100像素的距离
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

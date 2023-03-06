import puppeteer from 'puppeteer';
export function sleep() {
  return new Promise(resolve => {
    setTimeout(resolve,3000)
  })
}
/**
 *
 * @param {string[]}url_list
 * @returns {Promise<*[]>}
 */
export async function printPDF(url_list) {
  const pdf_list = []
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let i = 0
  while (i < url_list.length){
    const url = url_list[i]
    await page.goto(url, {waitUntil: 'load'});
    await sleep()
    const title = await page.title()
    const pdf = await page.pdf({ format: 'A4' });
    pdf_list.push({title,pdf})
    i++
  }
  await browser.close();
  return pdf_list;
}
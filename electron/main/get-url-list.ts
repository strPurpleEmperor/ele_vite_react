import puppeteer from "puppeteer";
import {sleep} from "./printPDF";
import {getChromePath} from "./tools";

export async function  getUrlList(url:string) {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: getChromePath()
    });
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: ['networkidle0']});
    const url_list = await page.$$eval('a', async els => {
        const res = []
        els.forEach(e => {
            res.push(e.href)
        })
        return res
    })
    console.log(url_list)
    await browser.close();
    return url_list
}
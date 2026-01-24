import * as cheerio from 'cheerio';
import axios, {} from 'axios';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();
const maxCrawlLength = +(process.env.MAXCRAWL || 20);
export async function crawlPages(targetUrl, emails = []) {
    let urlsToVisit = [targetUrl];
    let result = [...emails];
    let crawledCount = 0;
    while (urlsToVisit.length > 0 && crawledCount <= maxCrawlLength) {
        const currentUrl = urlsToVisit.shift();
        crawledCount++;
        try {
            const response = await axios.get(currentUrl);
            const cheerioApi = cheerio.load(response.data);
            cheerioApi('a[href]').each((_, element) => {
                let url = cheerioApi(element).attr('href') ?? "";
                if (!url)
                    return;
                if (!url.startsWith('http')) {
                    url = new URL(url, targetUrl).href;
                }
                if (url.startsWith(targetUrl) && !urlsToVisit.includes(url)) {
                    urlsToVisit.push(url);
                }
            });
            const mailtoLinks = [];
            cheerioApi('a[href^="mailto:"]').each((_, el) => {
                const href = cheerioApi(el).attr("href") ?? "";
                const email = href.replace("mailto:", "").split("?")[0] ?? "";
                mailtoLinks.push(email);
            });
            const text = cheerioApi("body").text();
            const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
            const textEmails = text.match(emailRegex) || [];
            result = [...new Set([...mailtoLinks, ...textEmails, ...result])];
        }
        catch (error) {
            console.error(`Error fetching ${currentUrl}: ${error.message}`);
        }
    }
    return result;
}
//# sourceMappingURL=crawler.js.map
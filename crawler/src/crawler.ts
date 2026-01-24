import * as cheerio from 'cheerio';
import axios, { type AxiosResponse } from 'axios';
import fs from 'fs';
import dotenv from "dotenv";

dotenv.config();

const maxCrawlLength: number = +(process.env.MAXCRAWL || 20);


export async function crawlPages(targetUrl: string, emails: string[]= []) {
    let urlsToVisit: string[] = [targetUrl];


    let result : string[]= [...emails];
    let crawledCount: number = 0;

    while (urlsToVisit.length > 0 && crawledCount <= maxCrawlLength) {
        const currentUrl: string = urlsToVisit.shift()!;
        crawledCount++;

        try {
        const response: AxiosResponse<any, any, {}>= await axios.get(currentUrl);
        const cheerioApi: cheerio.CheerioAPI = cheerio.load(response.data);

        cheerioApi('a[href]').each((_, element: any) => {
        let url: string = cheerioApi(element).attr('href') ?? "";
        if (!url) return;

        if (!url.startsWith('http')) {
          url = new URL(url, targetUrl).href;
        }

        if (url.startsWith(targetUrl) && !urlsToVisit.includes(url)) {
          urlsToVisit.push(url);
        }
    });
    const mailtoLinks: string[] = [];
    cheerioApi('a[href^="mailto:"]').each((_, el) => {
        const href: string = cheerioApi(el).attr("href") ?? "";
        const email: string = href.replace("mailto:", "").split("?")[0] ?? "";
        mailtoLinks.push(email);
    });
    const text = cheerioApi("body").text();
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
    const textEmails = text.match(emailRegex) || [];
    
    result = [...new Set([...mailtoLinks, ...textEmails, ...result])];
    } catch (error: any) {
      console.error(`Error fetching ${currentUrl}: ${error.message}`);
    }
  }
  return result;
}

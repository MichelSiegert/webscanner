import lighthouse, { RunnerResult } from 'lighthouse';
import Requirement from '../types/Requirement.js';
import puppeteer, { Page } from 'puppeteer';
import RequirementStatus from '../types/RequirementStatus.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger.js';

class LighthouseRequirement implements Requirement {
    name: string = "BestPracticeChecks";
    url: string;
    succeed: RequirementStatus;
    timestamp: number;

    constructor(url: string, public id: string) {
        this.url = url;
        this.succeed = RequirementStatus.PENDING;
        this.timestamp = Date.now();
    }

    async evaluate(page: Page): Promise<RequirementStatus> {
        this.timestamp = Date.now();

        logger.info("starting lighthouse...");
        const score: number = await this.runLighthouse(this.url);
        page.close();
        this.succeed = score > 80? RequirementStatus.SUCCESS: RequirementStatus.FAILED;
        return this.succeed;
    }

    private async runLighthouse(url: string) {

        const browser = await puppeteer.launch({ headless: true });
        const port = (new URL(browser.wsEndpoint())).port;
        
          const options: any = {
                logLevel: 'info',
                output: 'json',
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
                port: port,
          };

          const runnerResult: RunnerResult = (await lighthouse(url, options))!;
          if (!runnerResult || !runnerResult.lhr) {
            console.error("Lighthouse failed to produce a result object.");
            return 0; 
        }

        if (!runnerResult.lhr.categories) {
            console.error("Lighthouse ran, but categories are missing. Check for page errors.");
            return 0;
        }

          const reportObject: any = runnerResult?.lhr;

        const performanceScore = reportObject.categories?.performance?.score;
        const accessibilityScore = reportObject.categories?.accessibility?.score;
        const bestPracticesScore = reportObject.categories?.['best-practices']?.score;
        const seoScore = reportObject.categories?.seo?.score;

        const summary = {
            performance: (performanceScore ?? 0) * 100,
            accessibility: (accessibilityScore ?? 0) * 100,
            bestPractices: (bestPracticesScore ?? 0) * 100,
            seo: (seoScore ?? 0) * 100,
        };
        try{
            const lighthouse = {
                id: uuidv4(),
                company_id: this.id,
                timestamp: Math.floor(Date.now() / 1000),
                performance:summary.performance,
                accessibility: summary.accessibility,
                best_practices: summary.bestPractices,
                seo: summary.seo
            }
            await fetch("http://webscanner-orm:2000/lighthouse/",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(lighthouse)
        });

        } catch(e: any){
            logger.error("Failing to save Lighthouse data to db. "+ e.message);
        }
          
          await browser.close();
          logger.info("Lighthose requirement check finished for url "+ this.url)
          return (reportObject?.categories?.performance?.score ?? 0 ) * 100;
    }
}

export default LighthouseRequirement;

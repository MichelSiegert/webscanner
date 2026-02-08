import lighthouse, { RunnerResult } from 'lighthouse';
import Requirement from '../types/Requirement.js';
import puppeteer, { Page } from 'puppeteer';
import RequirementStatus from '../types/RequirementStatus.js';

class LighthouseRequirement implements Requirement {
    name: string = "";
    url: string;
    succeed: RequirementStatus;
    timestamp: number;

    constructor(url: string, public id: string) {
        this.url = url;
        this.succeed = RequirementStatus.PENDING;
        this.timestamp = Date.now();
    }

    async evaluate(page: Page): Promise<RequirementStatus> {
        const score: number = await this.runLighthouse(this.url);
        page.close();
        return score > 80? RequirementStatus.SUCCESS: RequirementStatus.FAILED;
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
          
          await browser.close();
          return (reportObject?.categories?.performance?.score ?? 0 ) * 100;
    }
}

export default LighthouseRequirement;

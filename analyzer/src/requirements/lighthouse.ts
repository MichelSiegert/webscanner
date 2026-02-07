import lighthouse from 'lighthouse';
import { writeFileSync } from 'fs';
import Requirement from '../types/Requirement.js';
import puppeteer, { Page } from 'puppeteer';
import RequirementStatus from '../types/RequirementStatus.js';

class LighthouseRequirement implements Requirement {
    name: string = "";
    url: string;
    succeed: RequirementStatus;
    timestamp: number;

    constructor(url: string) {
        this.url = url;
        this.succeed = RequirementStatus.PENDING;
        this.timestamp = Date.now();
    }

    async evaluate(page: Page): Promise<RequirementStatus> {
        const score: number = await this.runLighthouse(this.url);
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

          const runnerResult = await lighthouse(url, options);
          const reportJson: string = runnerResult?.report.toString() ?? "";
          const reportObject: any = runnerResult?.lhr;
          if (reportJson) {
                writeFileSync('lighthouse-report.json', reportJson);
                console.log('Report saved to lighthouse-report.json');

          }
          console.log(reportObject);
          console.log(`Performance score: ${reportObject?.categories.performance.score * 100}`);
          await browser.close();
          return (reportObject?.categories?.performance?.score ?? 0 ) * 100;
    }
}

export default LighthouseRequirement;

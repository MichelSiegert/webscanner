import Requirement from "./types/Requirement.js";
import ImpressumRequirement from "./requirements/impressum.js";
import RequirementStatus from "./types/RequirementStatus.js";
import puppeteer from "puppeteer";
import LighthouseRequirement from "./requirements/lighthouse.js";
class WebReport {
    requirements: Requirement[] = [];
    
    constructor(public url: string, public id: string, public timestamp = Date.now()){
        this.requirements.push(new ImpressumRequirement(this.url));
        this.requirements.push(new LighthouseRequirement(this.url, this.url));
    }

    async executeReport(): Promise<void> {

        const browser = await puppeteer.launch({args: ['--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--headless',
            '--no-zygote',
            '--incognito'
        ]});

        for ( const requirement of this.requirements) {
            const page = await browser.newPage();
            page.setUserAgent({userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3803.0 Safari/537.36"});
            await requirement.evaluate(page)
        }
    }

    didFail(): boolean{
        return !this.requirements.some((e: Requirement)=>e.succeed === RequirementStatus.FAILED)
    }
}

export default WebReport;

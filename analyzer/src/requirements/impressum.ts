import { Page } from "puppeteer";
import Requirement from "../types/Requirement.js";
import RequirementStatus from "../types/RequirementStatus.js";
import logger from "../logger.js";

class ImpressumRequirement implements Requirement {
    name: string = "ImpressumCheck";
    url: string;
    succeed: RequirementStatus;
    timestamp: number;

    constructor(url: string) {
        this.url = url;
        this.succeed = RequirementStatus.PENDING;
        this.timestamp = Date.now();
    }

    async evaluate(page: Page): Promise<RequirementStatus> {
        try {
            logger.info(`Starting Impressum check: ${this.url}`);

            await page.goto(this.url, { waitUntil: 'networkidle2', timeout: 30000 });

            const hasImpressum = await page.evaluate(() => {
                const bodyText = document.body.innerText;
                const keywords = ['impressum', 'legal notice', 'legal disclosure'];
                const links = Array.from(document.querySelectorAll('a'));

                const hasLink: boolean =  links.some(a => {
                    const text = (a.textContent || "").toLowerCase();
                    const href = (a.getAttribute('href') || "").toLowerCase();
                    const aria = (a.getAttribute('aria-label') || "").toLowerCase();
                    
                    return keywords.some(k => 
                        text.includes(k) || href.includes(k) || aria.includes(k)
                    );
                });

                if(hasLink) return true;
                
                const vatRegex = /USt-IdNr|VAT ID|Registergericht/i;
                const footerHeaders = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, b, strong'));
                const hasLegalHeader = footerHeaders.some((h: any) => keywords.some((k: any) => h.innerText.toLowerCase().includes(k)));

                return hasLegalHeader || vatRegex.test(bodyText)

            });

            if(hasImpressum)  {
                logger.info(`Impressum found for URL: ${this.url}`);
                this.succeed = RequirementStatus.SUCCESS;
                return RequirementStatus.SUCCESS;
            }

            logger.warn(`No Impressum found for URL: ${this.url}`);
            this.succeed = RequirementStatus.FAILED;
            return RequirementStatus.FAILED;

        } catch (error: any) {
            logger.error(`Error during Impressum check for ${this.url}: ${error.message}`);
            this.succeed = RequirementStatus.FAILED;
            return RequirementStatus.FAILED;
        }
    }
}

export default ImpressumRequirement;
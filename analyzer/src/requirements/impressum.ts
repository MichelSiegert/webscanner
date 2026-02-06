import { StatusCodes } from "http-status-codes";
import ImpressumStatus from "../hasImpressum.js";
import Requirement from "../Requirement.js";
import RequirementStatus from "../RequirementStatus.js";
import logger from "../logger.js";
import { Page } from "puppeteer";

class ImpressumRequirement implements Requirement{
    name: string;
    url: string;
    succeed: RequirementStatus;
    timestamp: number;

    constructor(url: string){
        this.name = "ImpressumCheck";
        this.url = url;
        this.succeed = RequirementStatus.PENDING;
        this.timestamp = Date.now();
    }

    async evalutate(page: Page): Promise<RequirementStatus> {
    try{
        logger.info(`starting Impressum check for URL: ${this.url}`);
        await page.goto(this.url);
        const impressumLink :string = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            const target = links.find(a => 
                a.innerText.toLowerCase().includes('impressum') || 
                a.href.toLowerCase().includes('impressum')
            );
            return target ? target.href : "";
        });

        if(impressumLink) {
            logger.warn(`No Impressum found for URL: ${this.url}`);
            return RequirementStatus.FAILED;
        }

        logger.info(`Finished impressum check for URL: ${this.url}`);
        return RequirementStatus.SUCCESS;

    } catch(e:any) {
        logger.error(`Failed impressum check for URL: ${this.url}`);
        return RequirementStatus.FAILED;
        }    
    }
}

export default ImpressumRequirement;
import express, { Request, Response } from "express"
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import puppeteer from "puppeteer";
import ImpressumStatus from "./hasImpressum.js";
import 'dotenv/config'
import logger from "./logger.js";

const app = express()
const PORT: Number = +(process.env.PORT ?? 3000);

app.get('/', async (req: Request, res: Response) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    const url: string = (req.query?.url ?? "") as string;
    if(!url){
        logger.warn(`request had no URL.`);
        res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
        return;
    }

    try{
        await page.goto(url);
        const impressumLink :string = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            const target = links.find(a => 
                a.innerText.toLowerCase().includes('impressum') || 
                a.href.toLowerCase().includes('impressum')
            );
            return target ? target.href : "";
        });
        logger.info(`Finished analyzing request for URL ${url}`);
        res.status(StatusCodes.OK).json({
            status : impressumLink ? ImpressumStatus.FOUND: ImpressumStatus.NOT_FOUND,
            url: impressumLink
        });
    } catch(e:any) {
        logger.error(`an error occured while scanning the page. error: ${e.message}`);
    }
});

app.get("/healz", (_: any, res: Response)=>{
    res.status(StatusCodes.OK).send(ReasonPhrases.OK);
});

app.listen(PORT, () => {
  logger.info(`Example app listening on port ${PORT}`)
});

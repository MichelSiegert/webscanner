import express, { Request, Response } from "express"
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import 'dotenv/config'
import logger from "./logger.js";
import WebReport from "./WebReport.js";

const app = express()
const PORT: Number = +(process.env.PORT ?? 3000);

app.get('/', async (req: Request, res: Response) => {
    const url: string = (req.query?.url ?? "") as string;
    const id: string = (req.query?.id ?? "") as string;
    if(!url){
        logger.warn(`request had no URL.`);
        res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
        return;
    }
    
    if(!id){
        logger.warn(`request had no ID.`);
        res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
        return;
    }
    
    try {
        const report: WebReport = new WebReport(url, id);
        await report.executeReport();
        res.status(StatusCodes.OK).json(JSON.stringify(report));
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

import express, { type Request, type Response } from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors"; 
import { crawlPages} from "./crawler.js";
import logger from "./logger.js";



dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.GOOGLE_API_KEY;
const CSE_ID = process.env.GOOGLE_CSE_ID;

app.get("/healz", (_, res: Response)=> {
  logger.info("Healz completed successfully")
  res.json({status: 200})
});

app.get("/search", async (req: Request, res: Response) => {
  const { company, city } = req.query;
  logger.info("Search request received", { company, city });

  if (!company) {
    logger.warn("Search attempted without company name");
    return res.status(400).json({ error: "Missing company or city parameter" });
  }

  const query = `${company} ${city}`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data:any = await response.json()

    if (!data.items || data.items.length === 0) {
      logger.info("No Google Search results found", { query });
      return res.json({ message: "No results found" });
    }

    const websites = data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));

    const emailArrays = await Promise.all(
      websites.map(async (e: any) => await crawlPages(e.link, []))
    );

    const allEmails = emailArrays.flat(Infinity);

    const uniqueEmails = [...new Set(allEmails)];

    logger.info("Crawl completed successfully", {
      emailCount: uniqueEmails.length,
      company 
    });

    res.json({ websites, "emails": uniqueEmails });

  } catch (err: any) {
    logger.error("Search/Crawl failed", { error: err.message, stack: err.stack });
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

app.listen(PORT, () => {
  logger.info(`Server running`, { port: PORT, url: `http://localhost:${PORT}` });
});

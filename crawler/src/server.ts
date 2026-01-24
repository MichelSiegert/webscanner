import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors"; 
import { crawlPages} from "./crawler.js";


interface GoogleSearchItem {
    title: string;
    link: string;
    snippet: string;
}

interface GoogleSearchResponse {
    items?: GoogleSearchItem[];
}


dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.GOOGLE_API_KEY;
const CSE_ID = process.env.GOOGLE_CSE_ID;

app.get("/healz", (req,res)=> {res.json({status: 200})});

app.get("/search", async (req, res) => {
  const { company, city } = req.query;

  if (!company) {
    return res.status(400).json({ error: "Missing company or city parameter" });
  }

  const query = `${company} ${city}`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data: GoogleSearchResponse = await response.json() as GoogleSearchResponse;;

    if (!data.items || data.items.length === 0) {
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

    res.json({ 
      websites, 
      "emails": uniqueEmails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
  console.log("done!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

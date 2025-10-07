import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors"; 


dotenv.config();

const app = express();
app.use(cors());

const PORT = 3000;

const API_KEY = process.env.GOOGLE_API_KEY;
const CSE_ID = process.env.GOOGLE_CSE_ID;

app.get("/search", async (req, res) => {
  const { company, city } = req.query;

  if (!company) {
    return res.status(400).json({ error: "Missing company or city parameter" });
  }

  const query = `${company} ${city}`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.json({ message: "No results found" });
    }

    const results = data.items.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

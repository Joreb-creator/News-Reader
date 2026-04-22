const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5177;
const API_KEY = process.env.GNEWS_API_KEY;

console.log("Key loaded:", !!API_KEY);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/news/all", async (req, res) => {
  const { page = 1, search, categories } = req.query;

  if (!API_KEY) {
    return res.status(500).json({ error: "Missing GNEWS_API_KEY" });
  }

  const query =
    typeof search === "string" && search.trim()
      ? search.trim()
      : categories || "technology";

  const url =
    `https://gnews.io/api/v4/search` +
    `?q=${encodeURIComponent(query)}` +
    `&lang=en` +
    `&max=3` +
    `&page=${Number(page) || 1}` +
    `&apikey=${encodeURIComponent(API_KEY)}`;

  console.log("Proxy URL:", url.replace(API_KEY, "[HIDDEN]"));

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.errors?.[0] ||
        data?.message ||
        "Failed to fetch news";

      if (
        response.status === 429 ||
        String(message).toLowerCase().includes("too many requests")
      ) {
        return res.status(429).json({
          error: "Daily request limit reached. Please wait a bit and try again later.",
        });
      }

      if (response.status === 401 || response.status === 403) {
        return res.status(response.status).json({
          error: "The news API authentication failed.",
        });
      }

      return res.status(response.status).json({ error: message });
    }

    res.json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
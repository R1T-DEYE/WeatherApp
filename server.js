import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { pool, initDb } from "./db.js"; // <-- use the db


dotenv.config();
const app = express();
const apiKey = process.env.WEATHER_API_KEY;
const CACHE_TTL_MIN = 20;

// serve your frontend files (optional)
app.use(express.static(".")); 

// ensure tables exist before serving
await initDb();



app.get("/weather", async (req, res) => {
  const city = (req.query.city || "").trim();
  if (!city) return res.status(400).json({ error: "City required" });

  try {
    // 1) Try cache first
    const [rows] = await pool.query(
      `SELECT data_json, fetched_at
         FROM weather_cache
        WHERE city = ?
        ORDER BY fetched_at DESC
        LIMIT 1`,
      [city]
    );

    if (rows.length) {
      const { data_json, fetched_at } = rows[0];
      const ageMin = (Date.now() - new Date(fetched_at).getTime()) / 60000;
      if (ageMin < CACHE_TTL_MIN) {
        // log search (non-blocking)
        pool.query(`INSERT INTO searches(city, ip) VALUES(?, ?)`, [city, req.ip]).catch(()=>{});
        return res.json({ source: "cache", ...data_json });
      }
    }

    // 2) Fetch live from OpenWeather
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    if (!r.ok) return res.status(r.status).json({ error: "OpenWeather error" });

    const data = await r.json();

    // 3) Save to cache + log search
    await pool.query(
      `INSERT INTO weather_cache(city, data_json, fetched_at)
       VALUES(?, ?, NOW())`,
      [city, JSON.stringify(data)]
    );
    pool.query(`INSERT INTO searches(city, ip) VALUES(?, ?)`, [city, req.ip]).catch(()=>{});

    res.json({ source: "live", ...data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`✅ listening on ${port}`));
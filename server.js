"use strict";

const PORT = process.env.PORT || 8080;

import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/messages", (req, res) => {
  res.sendFile("messages.html", { root: "." });
});

app.get("*", (req, res) => {
  // Try it...
  res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

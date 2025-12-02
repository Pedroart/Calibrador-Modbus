import express from "express";
import path from "path";
import apiRouter from "../api/index.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  // UI
  app.use(express.static("public"));

  // API
  app.use("/api", apiRouter);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`HTTP Server running on port ${PORT}`)
  );

  return app;
}


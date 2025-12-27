#!/usr/bin/env node
import Pastel from "pastel";

const app = new Pastel({
  importMeta: import.meta,
  name: "skilluse",
  version: "0.1.0",
  description: "CLI tool for managing and installing AI Coding Agent Skills",
});

await app.run();

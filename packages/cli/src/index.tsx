#!/usr/bin/env node
import Pastel from "pastel";
import pkg from "../package.json" with { type: "json" };

const app = new Pastel({
	importMeta: import.meta,
	name: "skilluse",
	version: pkg.version,
	description: pkg.description,
});

await app.run();

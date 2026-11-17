import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";

import type { Fleet } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const FLEET_FILE = path.join(DATA_DIR, "fleet.json");

const EMPTY_FLEET: Fleet = {
  vehicles: []
};
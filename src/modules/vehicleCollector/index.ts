
import type { FastifyPluginAsync } from "fastify";

import {
  getLatestData,
  getCollectorStatus,
  startVehicleCollector
} from "./collector.js";
import vehicleFeed from "../vehicleFeed/index.js";
import tempCpTracker from "../tempCpTracker/index.js";

const vehicleCollectorRoutes: FastifyPluginAsync = async (fastify) => {

  fastify.get("/", async (_request, reply) => {
    const data = getLatestData();

    if (!data) {
      return reply.code(503).send({
        error: "No collector data available"
      });
    }

    return data;
  });

  fastify.get("/status", async () => {
    return getCollectorStatus();
  });

};

let stopCollector: (() => void) | null = null;

export default {
  ROUTES: vehicleCollectorRoutes,

  start: () => {
    console.log("[vehicleCollector] Starting collector...");

    stopCollector = startVehicleCollector((data) => {
      vehicleFeed.ON_DATA(data.data);
      tempCpTracker.ON_DATA(data.data);
    });
  },

  stop: () => {
    console.log("[vehicleCollector] Stopping collector...");

    stopCollector?.();
    stopCollector = null;
  },

  cleanup: () => {
    vehicleFeed.cleanup();
  }
};
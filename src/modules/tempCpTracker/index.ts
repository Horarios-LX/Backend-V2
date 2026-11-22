
import type { FastifyPluginAsync } from "fastify";
import { TMLApiVehicle } from "../../types/Vehicle";

import { WEBHOOK_URL } from "../../../config/cp.json"

// vehicles to track
const VEHICLES_TO_TRACK: Record<string, string> = {
    "19206": "OEI 07:51 / ATM 08:05",
    "16410": "ATT 08:26 / ETC 08:37",
    "16504": "ATT 08:05 <CHEGADA>",
    "39108": "Caxias 23:23 > C. Sodré (TESTE)",
    "18530": "L. Sintra (TESTE)"
}

let resultsSent: string[] = []

const vehicleFeedData = (data: TMLApiVehicle[]) => {
    if(data.find(z => VEHICLES_TO_TRACK[z.vehicle_id.split("]")[1] ])) {
        data.filter(z => VEHICLES_TO_TRACK[z.vehicle_id.split("]")[1] ]).forEach(async vec => {
            if(resultsSent.includes(vec.trip_id || "")) return;
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: `${VEHICLES_TO_TRACK[vec.vehicle_id.split("]")[1]]} (\`${vec.vehicle_id.split("]")[1]}\`) encontra-se a circular`
                })
            });
            resultsSent.push(vec.trip_id || "")
            if (!response.ok) {
                console.log(`Webhook failed: ${response.status}`);
            }
        })
    }
};

export default {
    ON_DATA: vehicleFeedData,

    start: () => {
        console.log("[tempCpTracker] Starting feed...");
    },

    stop: () => {
        //console.log("[vehicleCollector] Stopping collector...");
    },

    cleanup: () => {
        resultsSent = []
    }
};
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cron from "node-cron";

// import modules
import vehicleCollector from "./modules/vehicleCollector/index";
import vehicleFeed from './modules/vehicleFeed';


const app = Fastify({ logger: false });

// Start server
const start = async () => {
    await app.register(websocket);

    app.get('/', async () => {
        return {
            status: 'ok',
            message: 'HorariosLX - v2.0.0'
        };
    });

    app.register(vehicleCollector.ROUTES, {
        prefix: "/vehicles"
    });

    app.register(vehicleFeed.ROUTES, {
        prefix: "/vehicles"
    });

    vehicleCollector.start();

    // stop modules
    app.addHook("onClose", async () => {
        vehicleCollector.stop();
    });

    cron.schedule("0 4 * * *", () => {
        console.log("Performing daily cleanup...");
        vehicleCollector.cleanup();
        
        console.log("Cleanup complete!");
    }, {
        timezone: "Europe/Lisbon"
    });

    try {
        await app.listen({
            port: Number(process.env.PORT ?? 10000),
            host: '0.0.0.0'
        });
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

start();
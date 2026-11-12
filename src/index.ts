import Fastify from 'fastify';

const app = Fastify({
    logger: false
});

app.get('/', async () => {
    return {
        status: 'ok',
        message: 'HorariosLX - v2.0.0'
    };
});


// Start server
const start = async () => {
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
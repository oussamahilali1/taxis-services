import { app } from './app.js';
import { config } from './lib/config.js';
import { prisma } from './lib/prisma.js';
import { startMaintenanceLoop } from './services/maintenance.service.js';

const server = app.listen(config.port, () => {
  console.log(`Taxis Services backend listening on http://localhost:${config.port}`);
});

startMaintenanceLoop();

async function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(async () => {
    await prisma.$disconnect();
    process.exit(1);
  }, 10000).unref();
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}

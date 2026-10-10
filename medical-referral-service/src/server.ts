import { app } from './app';
import { pool } from './config/database';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`Medical Referral Service escuchando en el puerto ${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} recibido. Cerrando conexiones...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));


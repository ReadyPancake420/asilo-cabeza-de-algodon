import { app } from './app';
import { checkDatabase } from './config/database';
import { env } from './config/env';

async function start(): Promise<void> {
  await checkDatabase();
  app.listen(env.PORT, () => {
    console.log(`Administration service listening on port ${env.PORT}`);
  });
}

start().catch((error) => {
  console.error('Administration service could not start', error);
  process.exit(1);
});

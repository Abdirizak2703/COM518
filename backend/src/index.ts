import { createApp } from './app';
import { env } from './types/env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`PlacesToStay API listening on port ${env.port}`);
});

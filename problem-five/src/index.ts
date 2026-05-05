import 'reflect-metadata';

import { createApp } from './app';
import { config } from './config/env';
import './db';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}/docs`);
});

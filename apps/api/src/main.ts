import {NestFactory} from "@nestjs/core";
import {ValidationPipe} from "@nestjs/common";
import {Redis} from "ioredis";

import {AppModule} from "@modules/app";
import {clusterize} from "@lib/cluster";
import {WebSocketAdapter} from "@lib/ws";
import {REDIS_PROVIDER_TOKEN} from "@lib/redis";
import {session} from "@lib/session";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: process.env.CLIENT_ORIGIN,
    },
  });

  const redis = app.get<Redis>(REDIS_PROVIDER_TOKEN);

  app.use(session(redis));
  app.useWebSocketAdapter(new WebSocketAdapter(app, true));
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}

clusterize(bootstrap);

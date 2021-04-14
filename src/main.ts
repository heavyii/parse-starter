import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const getConfig = require('./config/config');
import session from './session.middleware';

const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');

// var RedisCacheAdapter = require('parse-server').RedisCacheAdapter;
// var redisOptions = { url: '192.168.14.49', db: 7 }
// var redisCache = new RedisCacheAdapter(redisOptions);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = getConfig(app);

  // Serve the Parse API on the /parse URL prefix
  const api = new ParseServer(config.parse);
  ParseServer.createLiveQueryServer(app.getHttpServer());

  app.use('/parse', session(api), api);

  if (config.dashboard) {
    const dashboard = new ParseDashboard(config.dashboard);
    app.use('/dashboard', dashboard);
  }

  await app.listen(1337, () => {
    // ParseServer.createLiveQueryServer(app.getHttpServer());
  });
}
bootstrap();

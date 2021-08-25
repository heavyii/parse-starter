import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

const debug = require('debug')('data-server:main');

import { ConfigModule, ConfigService } from '@nestjs/config';
import { ParseServerModule } from '@app/parse-server';

// read env file
import fs = require('fs');
const envFilePath = process.env.NEST_JS_ENV || '.env';
let ignoreEnvFile = false;
try {
  fs.statSync(envFilePath).isFile;
} catch(err) {
  ignoreEnvFile = true;
}

@Module({
  imports: [
    /**
     * 环境变量配置文件 NEST_JS_ENV, 默认值'.env'
     */
    ConfigModule.forRoot({ isGlobal: true, cache: true, envFilePath, ignoreEnvFile }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ':'
    }),
    ParseServerModule.forRoot({})
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  constructor() {

  }
  onModuleInit() {
  }
}

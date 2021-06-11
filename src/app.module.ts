import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
const debug = require('debug')('data-server:main');

import { ConfigModule, ConfigService } from '@nestjs/config';
const envFilePath = process.env.NEST_JS_ENV || '.env.local';
@Module({
  imports: [
    /**
     * 环境变量配置文件 NEST_JS_ENV, 默认值'.env.local'
     */
    ConfigModule.forRoot({ isGlobal: true, cache: true, envFilePath }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ':'
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  constructor(
    private configService: ConfigService) {

  }
  onModuleInit() {
    this.logger.log('load env from ' + envFilePath);
    debug('APP_ID', this.configService.get('APP_ID'))
  }
}

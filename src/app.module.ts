import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule} from 'nestjs-redis'

const debug = require('debug')('data-server:main');

import { ConfigModule, ConfigService } from '@nestjs/config';
import { ParseServerModule } from '@app/parse-server';
import { AppRedisService } from './app-redis.service';
const envFilePath = process.env.NEST_JS_ENV || '.env.local';
@Module({
  imports: [
    /**
     * 环境变量配置文件 NEST_JS_ENV, 默认值'.env'
     */
    ConfigModule.forRoot({ isGlobal: true, cache: true, envFilePath }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ':'
    }),
    ParseServerModule.forRoot({}),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        configService.get('xxx');
          return [{
            // name: 'default',
            host: '192.168.14.7',
            port: 6379,
            db: 4,
            password: 'seeklane1559'
          }]
        },
        inject:[ConfigService]
    })
  ],
  controllers: [AppController],
  providers: [AppService, AppRedisService],
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

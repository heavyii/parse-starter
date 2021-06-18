import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';

const debug = require('debug')('data-server:AppRedisService');
@Injectable()
export class AppRedisService {

  constructor(private readonly redisService: RedisService) {
    // let ioredis: Redis = this.redisService.getClient();
    
    // ioredis.info('server').then(value => {
    //   debug('redis', value.split('\n')[1])
    // }).catch(err => {
    //   debug('redis error', err)
    // });
  }

  onApplicationBootstrap() {
  }

}

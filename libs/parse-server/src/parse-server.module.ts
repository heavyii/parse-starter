import { DynamicModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PARSE_SERVER_OPTION_PROVIDER } from './parse-server.constants';
import { ParseServerExplorer } from './parse-server.explorer';
import { ParseServerService } from './parse-server.service';
const debug = require('debug')('data-server:ParseServerModule');
@Module({
  imports: [DiscoveryModule],
  providers: [ParseServerService, ParseServerExplorer],
  exports: [ParseServerService, ParseServerExplorer],
})
export class ParseServerModule {

  constructor(private readonly configService: ConfigService,
    private readonly parseServerService: ParseServerService) {
  }

  configure(consumer: MiddlewareConsumer) {
    
    const SERVER_URL = this.configService.get<string>('SERVER_URL');
    let { pathname } = new URL(SERVER_URL);
    consumer
      .apply(this.parseServerService.getParseServer())
      .forRoutes(pathname);

      debug('configure MiddlewareConsumer path: ', pathname)
  }

  public static forRoot(options: any): DynamicModule {
    return {
      module: ParseServerModule,
      providers: [
        {
          provide: PARSE_SERVER_OPTION_PROVIDER,
          useValue: options,
        },
        ParseServerExplorer,
        ParseServerService,
      ],
      exports: [],
    };
  }
}

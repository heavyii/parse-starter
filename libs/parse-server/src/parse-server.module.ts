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
    const { mountPath, graphQLPath, mountGraphQL } = this.parseServerService.getConfig();

    consumer
      .apply(this.parseServerService.getParseServer().app)
      .forRoutes(mountPath);

      debug('MiddlewareConsumer ParseServer: ', mountPath);

      if (mountGraphQL) {
        debug('MiddlewareConsumer parseGraphQLServer: ', graphQLPath);
        consumer
          .apply(this.parseServerService.parseGraphQLServer.app)
          .forRoutes(graphQLPath);
      }
      
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

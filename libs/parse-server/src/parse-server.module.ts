import { DynamicModule, MiddlewareConsumer, Module, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ParseServerModule.name);
  constructor(private readonly configService: ConfigService,
    private readonly parseServerService: ParseServerService) {
  }

  configure(consumer: MiddlewareConsumer) {
    const { mountPath, graphQLPath, mountGraphQL } = this.parseServerService.getConfig();

    this.logger.log('parse-server path: ' + mountPath);
    consumer
      .apply(this.parseServerService.getParseServer().app)
      .forRoutes(mountPath);

      if (Reflect.has(this.parseServerService.parseGraphQLServer || {}, 'app')) {
        this.logger.log( 'parse-GraphQLServer path: ' + graphQLPath );
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

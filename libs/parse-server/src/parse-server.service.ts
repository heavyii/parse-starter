import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
const ParseServer = require('parse-server').ParseServer;

const debug = require('debug')('data-server:ParseServerService');

@Injectable()
export class ParseServerService {
    private readonly logger = new Logger(ParseServerService.name);
    private parseServer: any;

    constructor(private readonly configService: ConfigService,
        private adapterHost: HttpAdapterHost) {
        debug('setup ParseServer')
        this.parseServer = new ParseServer(this.getConfig());        
    }

    onModuleInit() {
        this.logger.log('createLiveQueryServer')
        ParseServer.createLiveQueryServer(this.adapterHost.httpAdapter.getHttpServer());
    }

    /**
     * 
     * @returns ParseServer instance
     */
    getParseServer() {
        return this.parseServer;
    }

    getConfig() {

        let config = {
            databaseURI: this.configService.get<string>('DATABAS_URI'), // process.env.databaseURI || 'postgres://postgres:dlrc1234@localhost:5432/mapserver?stringtype=unspecified', // Connection string for your MongoDB database
          //   cloud: './cloud/main.js', // Path to your Cloud Code
            appId: this.configService.get<string>('APP_ID'),
            masterKey: this.configService.get<string>('MASTER_KEY'), // Keep this key secret!
            readOnlyMasterKey: this.configService.get<string>('READ_ONLY_MASTER_KEY'),
            serverURL: this.configService.get<string>('SERVER_URL'),
            publicServerURL: this.configService.get<string>('PARSE_PUBLIC_SERVER_URL'),
            // cacheAdapter: redisCache,
            logLevel: this.configService.get<string>('LOG_LEVEL'),
    
            liveQuery: {
                classNames: this.configService.get<string>('LIVE_QUERY_CLASS_NAMES', '').split(',').filter(x => x),
            },
    
            debug: true, // this.configService.get<String>('NEST_JS_ENV') === 'local',
        };

        debug('load ParseServer config', config);
        this.logger.log('appId: ' + config.appId, 'ParseServer');
        this.logger.log('publicServerURL: ' + config.publicServerURL, 'ParseServer');
        return config;
    }
}

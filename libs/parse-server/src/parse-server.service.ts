import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
// const corsMiddleware =  require('cors');
const { default: ParseServer, ParseGraphQLServer, InMemoryCacheAdapter, logger } = require('parse-server');
const { ParseServerOptions, LiveQueryOptions } = require('parse-server/lib/Options/Definitions');
import { WinstonLoggerAdapter } from 'parse-server/lib/Adapters/Logger/WinstonLoggerAdapter';
import { ParseServerOptionsInterface } from '.';
const express = require('express');

const debug = require('debug')('data-server:ParseServerService');

@Injectable()
export class ParseServerService {
    private readonly logger = new Logger(ParseServerService.name);
    public readonly parseServer: any;
    private readonly parseOptions: ParseServerOptionsInterface;
    public readonly parseGraphQLServer: any;
    public readonly expressApp;
    constructor(private readonly configService: ConfigService,
        private adapterHost: HttpAdapterHost) {
        const parseOptions = this.parseOptions = this.getConfig();
        const options = this.parseOptions;
        // this.logger.debug(this.parseOptions, 'ParseServer Options');

        const parseServer = this.parseServer = new ParseServer(options);
    
        if (options.mountGraphQL === true) {
            const parseGraphQLServer = this.parseGraphQLServer = new ParseGraphQLServer(parseServer, {
              graphQLPath: '*'
            });
            const app = new express();
            parseGraphQLServer.applyGraphQL(app);
            parseGraphQLServer.app = app;
            // this.logger.log(options.graphQLPath, 'parseGraphQLServer');
        }
    }

    // onModuleInit() {
    onApplicationBootstrap() {
        this.startQueryServer();
    }

    startQueryServer() {
        let parseOptions = this.getConfig();
        if (parseOptions.liveQuery !== undefined && Array.isArray(parseOptions.liveQuery.classNames) && parseOptions.liveQuery.classNames.length > 0) {
            this.logger.log('Parse-LiveQueryServer live classes: ' + parseOptions.liveQuery.classNames.join(','));
            ParseServer.createLiveQueryServer(this.adapterHost.httpAdapter.getHttpServer(), this.parseOptions.liveQuery);
        } else {
            this.logger.log('Parse-LiveQueryServer: 不启用liveq query');
        }
    }

    /**
     * 
     * @returns ParseServer instance
     */
    getParseServer() {
        return this.parseServer;
    }

    getConfig(): ParseServerOptionsInterface {
        if (this.parseOptions) {
            return this.parseOptions;
        }

        const config: any = this.getParseOptionFromEnv();
        // Reflect.set(config, 'loggerAdapter', this.getLoggerAdapter());

        // 设置默认日志
        if (!Reflect.has(config, 'loggerAdapter')) {
            let PARSE_SERVER_LOGGER_ADAPTER = {
                "module": "parse-server/lib/Adapters/Logger/WinstonLoggerAdapter",
                "options": {
                    "logsFolder": "./logs",
                    "jsonLogs": true,
                    "logLevel": "debug",
                    "silent": false,
                    "maxLogFiles": 10
                }
            };
            Reflect.set(config, 'loggerAdapter', PARSE_SERVER_LOGGER_ADAPTER)
        }

        // 设置默认缓存
        if (!Reflect.has(config, 'cacheAdapter')) {
            let PARSE_SERVER_CACHE_ADAPTER = {
                "module": "parse-server/lib/Adapters/Cache/InMemoryCacheAdapter",
                "options": {
                    "ttl": 5000,
                    "maxSize": 10000
                }
            };
            Reflect.set(config, 'cacheAdapter', PARSE_SERVER_CACHE_ADAPTER)
        }

        config.serverStartComplete = (err) => {
            if (err) {
                this.logger.error(err, 'ParseServer serverStartComplete');
            } else {
                this.logger.log('ready', 'ParseServer serverStartComplete');
            }
        }

        return config;
    }

    private getParseOptionFromEnv() {
        let getOptionFromDefinitions = (Definitions: typeof ParseServerOptions | typeof  LiveQueryOptions) => {
            let options = {};
            Object.keys(Definitions).forEach(key => {
                let { env, action } = Reflect.get(Definitions, key);
                
                let value = this.configService.get(env);
                
                if (value !== undefined) {
                    // debug('Definitions', env, value);
                    Reflect.set(options, key, typeof action === 'function' ? action(value) : value);
                }
            });
            return options;
        }

        const liveQuery = getOptionFromDefinitions(LiveQueryOptions);
        const parseOptions = getOptionFromDefinitions(ParseServerOptions);
        Reflect.set(parseOptions, 'liveQuery', liveQuery);
        
        debug('parseOptions', parseOptions);

        return parseOptions;
    }
}

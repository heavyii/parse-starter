import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
const { ParseServer, RedisCacheAdapter, InMemoryCacheAdapter, logger } = require('parse-server');
const { ParseServerOptions, LiveQueryOptions } = require('parse-server/lib/Options/Definitions');
import { WinstonLoggerAdapter } from 'parse-server/lib/Adapters/Logger/WinstonLoggerAdapter';

const cyclist = require('cyclist');
const debug = require('debug')('data-server:ParseServerService');

@Injectable()
export class ParseServerService {
    private readonly logger = new Logger(ParseServerService.name);
    private readonly parseServer: any;
    private readonly parseOptions: any;
    constructor(private readonly configService: ConfigService,
        private adapterHost: HttpAdapterHost) {
        this.parseOptions = this.getConfig();
        this.parseServer = new ParseServer(this.parseOptions);
    }

    onModuleInit() {
        let parseOptions = this.getConfig();
        if (parseOptions.liveQuery !== undefined && Array.isArray(parseOptions.liveQuery.classNames) && parseOptions.liveQuery.classNames.length > 0) {
            this.logger.log(parseOptions.liveQuery.classNames, 'createLiveQueryServer');
            ParseServer.createLiveQueryServer(this.adapterHost.httpAdapter.getHttpServer(), this.parseOptions.liveQuery);
        } else {
            this.logger.log('不启用liveq query', 'createLiveQueryServer');
        }
        
    }

    /**
     * 
     * @returns ParseServer instance
     */
    getParseServer() {
        return this.parseServer;
    }

    getLoggerAdapter() {
        let bufferListIdx = 0;
        const bufferList = cyclist(100)
        return {
            log() {
                let jlog = {
                    level: arguments[0],
                    message: Array.from(arguments).map(x => `${x}`).join(' '),
                    timestamp: new Date().toISOString()
                }
                bufferList.put(bufferListIdx++, jlog);
                console.log.apply(console, arguments)
            },

            query() {
                let logdata = [];
                let idx = bufferListIdx;
                for( let i = 1; i < 100; i++) {
                    let d = bufferList.get(idx - i);
                    if (!d) {
                        break;
                    }
                    logdata.push(d);
                }
                return Promise.resolve(logdata);
            }
        }
        const options = {
            logsFolder: './logs2021',
            jsonLogs: false,
            verbose: true,
            silent: false
          };

        return new WinstonLoggerAdapter(options);
    }

    getConfig() {
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

        this.logger.debug(config, 'ParseServer Options');
        return config;
    }

    private getParseOptionFromEnv() {
        let getOptionFromDefinitions = (Definitions: typeof ParseServerOptions | typeof  LiveQueryOptions) => {
            let options = {};
            Object.keys(Definitions).forEach(key => {
                let { env, action } = Reflect.get(Definitions, key);
                
                let value = this.configService.get(env);
                debug('Definitions', env, value);
                if (value !== undefined) {
                    Reflect.set(options, key, typeof action === 'function' ? action(value) : value);
                }
            });
            return options;
        }

        const liveQuery = getOptionFromDefinitions(LiveQueryOptions);
        const parseOptions = getOptionFromDefinitions(ParseServerOptions);
        Reflect.set(parseOptions, 'liveQuery', liveQuery);
        
        this.logger.debug(parseOptions, 'parseOptions');

        return parseOptions;
    }
}

module.exports = function getConfig() {
    let config = {};

    config.parse = {
        databaseURI: 'postgres://postgres:dlrc1234@localhost:5432/mapserver?stringtype=unspecified', // Connection string for your MongoDB database
      //   cloud: './cloud/main.js', // Path to your Cloud Code
        appId: 'mapserver',
        masterKey: '758c8b295d8d3b378d7520307073b37', // Keep this key secret!
        readOnlyMasterKey: 'ba97bec4203073b378d758c8b295d17a',
        fileKey: 'optionalFileKey',
        serverURL: 'http://localhost:1337/parse', // Don't forget to change to https if needed
        // cacheAdapter: redisCache,
        logLevel: 'debug',

        liveQuery: {
            classNames: ['GameScore']
        }
    };

    config.dashboard = { 
        apps: [
            {
                "serverURL": config.parse.serverURL,
                "appId": config.parse.appId,
                "masterKey": config.parse.masterKey,
                "appName": config.parse.appId
            }
        ], 
        users: [
        {
            "user": 'admin',
            "pass": 'admin123'
        }
    ]};

    // config.redisOptions = { url: '192.168.14.49', port: 6379, password: undefined  };
    
    return config;
}
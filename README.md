# data-server服务
## Description

data-server服务

#### 技术选型

* nest
* parse-server
* redis
* mongodb/postgre

## 约定

```
const debug = require('debug')('data-server:main');
```


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## dashboard

```
npm install -g parse-dashboard
parse-dashboard --dev --appId yourAppId --masterKey yourMasterKey --serverURL "https://example.com/parse" --appName optionalName
```

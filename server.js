const http = require('http');
const express = require('express');
const { ParseServer } = require('parse-server');
const ParseDashboard = require('parse-dashboard');
const { nullParser } = require('./cloud/utils');

const masterKey = process.env.PARSE_SERVER_MASTER_KEY;
const appId = process.env.APP_ID;
const mongoDSN = process.env.MONGO_DSN;
const redisDSN = process.env.REDIS_DSN;
const port = process.env.PORT || 4040;
const serverURL = process.env.CORE_URL || `http://localhost:${port}/parse`;
const logsFolder = nullParser(process.env.PARSE_SERVER_LOGS_FOLDER);
const defaultDashboardUser = process.env.PARSE_SERVER_DASHBOARD_USER;
const defaultDashboardPass = process.env.PARSE_SERVER_DASHBOARD_PASS;

const api = new ParseServer({
  databaseURI: mongoDSN, // Connection string for your MongoDB database
  cloud: './cloud/main.js', // Absolute path to your Cloud Code
  allowClientClassCreation: false,
  appId,
  masterKey, // Keep this key secret!
  logsFolder,
  verbose: false,
  silent: false,
  enableAnonymousUsers: false,
  // fileKey: 'optionalFileKey',
  // mountGraphQL: true,
  // mountPlayground: true,
  // graphQLPath: '/graphql',
  // playgroundPath: '/playground',
  serverURL, // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['DeviceMessage', 'Sensor'],
    redisURL: redisDSN,
  },
  protectedFields: {
    Device: {
      '*': ['key'],
      // "role:moderator": ["sin"],
      // "role:admin": []
    },
  },
});

const dashboard = new ParseDashboard(
  {
    apps: [
      {
        appName: 'Sensbox Api',
        serverURL,
        // graphQLServerURL: "http://localhost:4040/parse/graphql",
        appId,
        masterKey,
      },
    ],
    users: [
      {
        user: defaultDashboardUser,
        pass: defaultDashboardPass,
      },
    ],
    useEncryptedPasswords: true,
  },
  { allowInsecureHTTP: Boolean(process.env.ALLOW_INSECURE_HTTP) || false },
);

const app = express();

const overrideParseServerHeaders = (req, res, next) => {
  const oldJson = res.json;
  res.json = (...args) => {
    res.removeHeader('x-powered-by');
    // do anything you wanna do with response before Parse Server calls .json
    oldJson.apply(res, args);
  };
  next();
};

// make the Parse Server available at /parse
app.use('/parse', overrideParseServerHeaders, api);

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

const httpServer = http.createServer(app);

// eslint-disable-next-line no-console
httpServer.listen(port, () => console.log(`Server running on ${serverURL}`));
ParseServer.createLiveQueryServer(httpServer, {});

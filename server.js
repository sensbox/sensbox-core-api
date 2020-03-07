const http = require('http');
const express = require('express');
const { ParseServer } = require('parse-server');
const ParseDashboard = require('parse-dashboard');
const ParseServerOptions = require('./config');

const { masterKey, appId, liveQuery, serverURL, port } = ParseServerOptions;
const defaultDashboardUser = process.env.PARSE_SERVER_DASHBOARD_USER;
const defaultDashboardPass = process.env.PARSE_SERVER_DASHBOARD_PASS;

const api = new ParseServer(ParseServerOptions);
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
ParseServer.createLiveQueryServer(httpServer, {
  redisURL: liveQuery.redisURL,
  classNames: ['DeviceMessage', 'Sensor'],
});

const http = require('http');
const express = require('express');
const { ParseServer } = require('parse-server');
const ParseServerOptions = require('./testServerConfig');

const { port, serverURL, databaseURI } = ParseServerOptions;
const api = new ParseServer(ParseServerOptions);

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

const httpServer = http.createServer(app);
// eslint-disable-next-line no-console
httpServer.listen(port, () =>
  console.log(`Test Server running on ==> ${serverURL} \nMongo Db running on ==> ${databaseURI}`),
);

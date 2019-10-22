var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');

const masterKey = process.env.MASTER_KEY;
const appId = process.env.APP_ID;
const mongoDSN = process.env.MONGO_DSN;
const redisDSN = process.env.REDIS_DSN;
const port = process.env.PORT;
const serverURL = `http://localhost:${port}/parse`;

var api = new ParseServer({
  databaseURI: mongoDSN, // Connection string for your MongoDB database
  cloud: './cloud/main.js', // Absolute path to your Cloud Code
  allowClientClassCreation: false,
  appId,
  masterKey, // Keep this key secret!
  logsFolder: null,
  verbose: false,
  silent: false,
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
      "*": ["key"],
      // "role:moderator": ["sin"],
      // "role:admin": []
    }
  }
});

var options = { allowInsecureHTTP: Boolean(process.env.ALLOW_INSECURE_HTTP) || false };

var dashboard = new ParseDashboard({
	apps: [
    {
      appName: "Sensbox Api",
      serverURL,
      // graphQLServerURL: "http://localhost:4040/parse/graphql",
      appId,
      masterKey
    }
  ],
  users: [
    {
      user:"admin",
      pass:"$2y$12$s4PzoNQ/l02aUppmPsEyyuJOtgyEDHw86/nQxhAGD5Xkd2BSSlSO6"
    }
  ],
  useEncryptedPasswords: true
}, options);

var app = express();


// make the Parse Server available at /parse
app.use('/parse', api);
// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

const httpServer = require('http').createServer(app);
httpServer.listen(port, () => console.log(`Server running on ${serverURL}`));
ParseServer.createLiveQueryServer(httpServer, { });

const { nullParser } = require('../../cloud/utils');

const port = 4444;
const serverURL = `http://localhost:${port}/parse`;

module.exports = {
  port,
  serverURL, // Don't forget to change to https if needed
  databaseURI: process.env.MONGO_DSN, // Connection string for your MongoDB database
  appId: 'appId',
  masterKey: 'masterKey', // Keep this key secret!
  logsFolder: nullParser(process.env.PARSE_SERVER_LOGS_FOLDER),
  cloud: './cloud/main.js', // Absolute path to your Cloud Code
  allowClientClassCreation: false,
  enableSingleSchemaCache: true,
  verbose: false,
  silent: true,
  enableAnonymousUsers: false,
  // fileKey: 'optionalFileKey',
  // mountGraphQL: true,
  // mountPlayground: true,
  // graphQLPath: '/graphql',
  // playgroundPath: '/playground',
  liveQuery: {
    classNames: ['DeviceMessage', 'Sensor'],
  },
  protectedFields: {
    Device: {
      '*': ['key'],
      // "role:moderator": ["sin"],
      // "role:admin": []
    },
  },
};

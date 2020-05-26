import { nullParser } from './cloud/utils';
import SimpleSendGridAdapter from './adapters/SendGridAdapter';

const port = process.env.PORT || 4444;
const serverURL = process.env.CORE_URL || `http://localhost:${port}/parse`;
const publicServerURL = process.env.PUBLIC_SERVER_URL || serverURL;

export default {
  port,
  serverURL, // Don't forget to change to https if needed
  publicServerURL,
  databaseURI: process.env.MONGO_DSN, // Connection string for your MongoDB database
  appId: process.env.APP_ID,
  masterKey: process.env.PARSE_SERVER_MASTER_KEY, // Keep this key secret!
  readOnlyMasterKey: process.env.READ_ONLY_MASTER_KEY,
  logsFolder: nullParser(process.env.PARSE_SERVER_LOGS_FOLDER),
  cloud: `${__dirname}/cloud/`, // Absolute path to your Cloud Code
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
    redisURL: process.env.REDIS_DSN,
  },
  protectedFields: {
    Device: {
      '*': ['key'],
      // "role:moderator": ["sin"],
      // "role:admin": []
    },
  },
  appName: process.env.APP_NAME || 'sensbox',
  emailAdapter: SimpleSendGridAdapter({
    apiKey: process.env.SENDGRID_API_KEY || 'sendgridkey',
    fromAddress: process.env.NOTIFICATION_EMAIL_ADDRESS || 'notifications@sensbox.net',
  }),
  verifyUserEmails: process.env.VERIFY_USER_EMAILS || false,
  emailVerifyTokenValidityDuration: 21600,
  preventLoginWithUnverifiedEmail: process.env.PREVENT_LOGIN_WITH_UNVERIFIED_EMAIL || false,
};

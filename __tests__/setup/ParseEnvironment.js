const NodeEnvironment = require('jest-environment-node');
const {
  MongoStorageAdapter,
} = require('parse-server/lib/Adapters/Storage/Mongo/MongoStorageAdapter');

const Parse = require('parse/node');
const { appId, masterKey, serverURL, databaseURI } = require('./testServerConfig');

Parse.initialize(appId, null, masterKey);
Parse.serverURL = serverURL;
console.log(`Trying to connect to ${serverURL}`);

const setup = require('./setup');
const teardown = require('./teardown');

const createTestConnection = async () => {
  const mongoStorageAdapter = new MongoStorageAdapter({
    uri: databaseURI,
  });
  await mongoStorageAdapter.connect();
  return mongoStorageAdapter;
};

class ParseEnvironment extends NodeEnvironment {
  constructor(config, context) {
    // console.log('environment');
    super(config, context);
    this.mongoStorageAdapter = null;
  }

  async setup() {
    await super.setup();
    this.mongoStorageAdapter = await createTestConnection();
    const testUser = await setup(Parse);
    this.global.Parse = Parse;
    this.global.testUser = testUser;
    // eslint-disable-next-line no-underscore-dangle
    this.global.__TEST_ENVIRONMENT__ = { database: this.mongoStorageAdapter.database };
  }

  async teardown() {
    await teardown(Parse, this.global.testUser, this.mongoStorageAdapter);
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = ParseEnvironment;

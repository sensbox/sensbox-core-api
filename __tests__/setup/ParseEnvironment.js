const NodeEnvironment = require('jest-environment-node');
const Parse = require('parse/node');
const { appId, masterKey, serverURL } = require('./testServerConfig');

Parse.initialize(appId, null, masterKey);
Parse.serverURL = serverURL;

const setup = require('./setup');
const teardown = require('./teardown');

class ParseEnvironment extends NodeEnvironment {
  constructor(config, context) {
    console.log('environment');
    super(config, context);
  }

  async setup() {
    await super.setup();
    const testUser = await setup(Parse);
    this.global.Parse = Parse;
    this.global.testUser = testUser;
  }

  async teardown() {
    await teardown(Parse, this.global.testUser);
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = ParseEnvironment;

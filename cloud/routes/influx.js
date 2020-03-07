const { InfluxController } = require('../controllers');

module.exports = {
  metricsStoreFetch: {
    action: InfluxController.fetch,
    secure: true,
  },
  metricsStoreFetchSeries: {
    action: InfluxController.fetchSeries,
    secure: true,
  },
};

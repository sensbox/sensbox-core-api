const { InfluxController } = require('../controllers');

const definitions: Sensbox.RouteDefinitions = {
  metricsStoreFetch: {
    action: InfluxController.fetch,
    secure: true,
  },
  metricsStoreFetchSeries: {
    action: InfluxController.fetchSeries,
    secure: true,
  },
};

export default definitions;

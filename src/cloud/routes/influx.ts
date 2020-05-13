import { InfluxController } from '../controllers';

const definitions: Sensbox.RouteDefinitions = {
  metricsStoreFetchRaw: {
    action: InfluxController.fetchRaw,
    secure: true,
  },
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

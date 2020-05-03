const { InfluxService } = require('../services');

const fetch = async (request: Parse.Cloud.FunctionRequest) => {
  const { params } = request;
  return InfluxService.fetch(params);
};

const fetchSeries = async (request: Parse.Cloud.FunctionRequest) => {
  const { series } = request.params;
  return InfluxService.fetchSeries(series);
};

export default {
  fetch,
  fetchSeries,
};

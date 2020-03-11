const { InfluxService } = require('../services');

const fetch = async (request) => {
  const { params } = request;
  return InfluxService.fetch(params);
};

const fetchSeries = async (request) => {
  const { series } = request.params;
  return InfluxService.fetchSeries(series);
};

module.exports = {
  fetch,
  fetchSeries,
};

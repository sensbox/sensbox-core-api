import { InfluxService } from '../services';

const fetchRaw = async (request: Parse.Cloud.FunctionRequest) => {
  const { params } = <{ params: Sensbox.InfluxQueryParams }>request;
  return InfluxService.fetchRaw(params);
};

const fetch = async (request: Parse.Cloud.FunctionRequest) => {
  const { params } = <{ params: Sensbox.InfluxQueryParams }>request;
  return InfluxService.fetch(params);
};

const fetchSeries = async (request: Parse.Cloud.FunctionRequest) => {
  const { series } = request.params;
  return InfluxService.fetchSeries(series);
};

export default {
  fetch,
  fetchRaw,
  fetchSeries,
};

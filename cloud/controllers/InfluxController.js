const { Parse } = global;
const { Expression } = require('influx');

const fetch = async (request) => {
  const e = new Expression();
  const { InfluxDB } = Parse.Integrations;
  // eslint-disable-next-line object-curly-newline
  const {
    uuid,
    metrics,
    to = new Date(),
    resolution = 100,
    fill = 'null',
    aggregation = 'mean',
    queryIdentifier,
  } = request.params;

  let { from } = request.params;

  if (!from) {
    from = new Date();
    from.setDate(from.getDate() - 7);
  }

  if (Array.isArray(uuid)) {
    uuid.forEach((i) => e.tag('host').equals.value(i).and);
  } else {
    // eslint-disable-next-line no-unused-expressions
    e.tag('host').equals.value(uuid).and;
  }

  e.field('time')
    .gte.value(from.toISOString())
    .and.field('time')
    .lte.value(to.toISOString());

  const where = e.toString();

  const range = Math.round((to.getTime() - from.getTime()) / resolution);
  const groupTime = range <= 250 ? 250 : range;
  const groupBy = [`time(${groupTime}ms)`, '*'].join(',');

  const results = await InfluxDB.query(
    `
    select ${aggregation}(value) as value
    FROM ${metrics.join(',')}
    WHERE ${where}
    GROUP BY ${groupBy}
    fill(${fill})
    ORDER BY time desc
  ;`,
    {
      precision: 'ms',
    },
  );

  const groupedResults = results.groups();
  return queryIdentifier !== undefined && groupedResults.length
    ? [{ id: queryIdentifier, ...groupedResults[0] }]
    : groupedResults;
};

/**
 * Fetch and reduce for dashboard consuption
 * @param {Request} request Parse Request
 *
 * Series: Array of Objects like this:
 * {
 *   devices: Array<String>,
 *   sensor: String,
 *   aggregation: String
 * }
 */
const fetchSeries = async (request) => {
  const { series } = request.params;
  if (!Array.isArray(series)) {
    throw new Parse.Error(
      Parse.Error.INVALID_QUERY,
      'series params needs to be an array of type { devices: Array<String>, sensor: String, aggregation: String}',
    );
  }

  const promises = series.map((serie) => {
    const { id, devices, sensor, aggregation } = serie;
    const params = {
      queryIdentifier: id,
      uuid: devices,
      metrics: [sensor],
      aggregation,
    };
    return fetch({ ...request, params });
  });

  const results = await Promise.all(promises);

  // influx results are returned at the same order as were requested,
  // if a serie has no data then an empty array will be returned
  const data = results.map((res) => (res.length ? res[0] : []));
  return data;
};

module.exports = {
  fetch,
  fetchSeries,
};

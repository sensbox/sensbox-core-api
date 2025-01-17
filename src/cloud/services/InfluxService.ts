import { Expression } from 'influx';

const fetchRaw = async (params: Sensbox.InfluxQueryParams) => {
  const e = new Expression();
  // @ts-ignore
  const { InfluxDB } = Parse.Integrations;
  const { uuid, metrics, from: fromParam, to = new Date() } = params;

  let from = fromParam;
  if (!from) {
    from = new Date();
    from.setDate(from.getDate() - 7);
  }

  if (Array.isArray(uuid)) {
    uuid.forEach((i) => e.tag('host').equals.value(i).and);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    e.tag('host').equals.value(uuid).and;
  }

  e.field('time')
    .gte.value(from.toISOString())
    .and.field('time')
    .lte.value(to.toISOString());

  const where = e.toString();

  const results = await InfluxDB.query(
    `
    select value
    FROM ${metrics.join(',')}
    WHERE ${where}
    ORDER BY time desc
  ;`,
    {
      precision: 'ms',
    },
  );

  return results;
};

const fetch = async (params: Sensbox.InfluxQueryParams) => {
  const e = new Expression();
  // @ts-ignore
  const { InfluxDB } = Parse.Integrations;
  const {
    uuid,
    metrics,
    from: fromParam,
    to = new Date(),
    resolution = 100,
    fill = 'null',
    aggregation = 'mean',
    queryIdentifier,
  } = params;

  let from = fromParam;
  if (!from) {
    from = new Date();
    from.setDate(from.getDate() - 7);
  }

  if (Array.isArray(uuid)) {
    uuid.forEach((i) => e.tag('host').equals.value(i).and);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
 * @param {Object} series
 *
 * Series: Array of Objects like this:
 * {
 *   devices: Array<String>,
 *   sensor: String,
 *   aggregation: String
 * }
 */
const fetchSeries = async (series: []) => {
  if (!Array.isArray(series)) {
    throw new Parse.Error(
      Parse.Error.INVALID_QUERY,
      'series params needs to be an array of type { devices: Array<String>, ' +
        'sensor: String, aggregation: String}',
    );
  }

  const promises = series.map((serie) => {
    // eslint-disable-next-line object-curly-newline
    const { id, devices, sensor, aggregation } = serie;
    const params: Sensbox.InfluxQueryParams = {
      queryIdentifier: id,
      uuid: devices,
      metrics: [sensor],
      aggregation,
    };
    return fetch(params);
  });

  const results = await Promise.all(promises);

  // influx results are returned at the same order as were requested,
  // if a serie has no data then an empty array will be returned
  const data = results.map((res) => (res.length ? res[0] : []));
  return data;
};

export default {
  fetch,
  fetchRaw,
  fetchSeries,
};

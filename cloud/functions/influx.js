const { Parse } = global;
const { Expression } = require('influx');

const fetch = async (request) => {
  const e = new Expression();
  const { InfluxDB } = Parse.Integrations;
  const {
    uuid,
    metrics,
    to = new Date(),
    resolution = 100,
    fill = 'null',
  } = request.params;

  let { from } = request.params;

  if (!from) {
    from = new Date();
    from.setDate(from.getDate() - 7);
  }

  const where = e
    .tag('host').equals.value(uuid)
    .and
    .field('time').gte.value(from.toISOString())
    .and
    .field('time').lte.value(to.toISOString())
    .toString();

  // console.log(where);

  const range = Math.round((to.getTime() - from.getTime()) / resolution);
  const groupTime = range <= 250 ? 250 : range;
  const groupBy = [`time(${groupTime}ms)`, '*'].join(',');

  const results = await InfluxDB.query(`
    select mean(value) as value
    FROM ${metrics.join(',')}
    WHERE ${where}
    GROUP BY ${groupBy}
    fill(${fill})
    ORDER BY time desc
  ;`, {
    precision: 'ms',
  });

  return results.groups();
};

module.exports = {
  fetch,
};

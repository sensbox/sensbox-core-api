const { Parse, testUser } = global;
const { Sensor: SensorCloudFunctions } = require('../cloud/functions');

describe('Sensors Cloud Functions', () => {
  test('findSensorsByDevices should return sensors without intersection', async () => {
    const Device = Parse.Object.extend('Device');
    const device = new Device();
    device.set('uuid', 'test');
    const Sensor = Parse.Object.extend('Sensor');
    const sensor1 = new Sensor();
    sensor1.set('device', device);
    sensor1.set('name', 'sensor1');
    const sensor2 = new Sensor();
    sensor2.set('device', device);
    sensor2.set('name', 'sensor2');
    const sensor3 = new Sensor();
    sensor3.set('device', device);
    sensor3.set('name', 'sensor3');

    try {
      await Promise.all([
        device.save(null, { sessionToken: testUser.getSessionToken() }),
        sensor1.save(null, { sessionToken: testUser.getSessionToken() }),
        sensor2.save(null, { sessionToken: testUser.getSessionToken() }),
        sensor3.save(null, { sessionToken: testUser.getSessionToken() }),
      ]);

      const arrSensors = [sensor1, sensor2, sensor3];
      const params = {
        devices: [{ objectId: device._getId() }],
      };
      const { results } = await SensorCloudFunctions.findSensorsByDevices({
        user: testUser,
        params,
      });
      expect(results).toHaveLength(3);
      expect(results.map((s) => s.objectId)).toStrictEqual(arrSensors.map((s) => s._getId()));
    } finally {
      await Promise.all([
        device.destroy({ sessionToken: testUser.getSessionToken() }),
        sensor1.destroy({ sessionToken: testUser.getSessionToken() }),
        sensor2.destroy({ sessionToken: testUser.getSessionToken() }),
        sensor3.destroy({ sessionToken: testUser.getSessionToken() }),
      ]);
    }
  });

  test('findSensorsByDevices should return sensors with intersection', async () => {
    const Device = Parse.Object.extend('Device');
    const device = new Device();
    device.set('uuid', 'device');
    const Sensor = Parse.Object.extend('Sensor');
    const sensor1 = new Sensor();
    const sensor2 = new Sensor();
    const sensor3 = new Sensor();
    sensor1.set('device', device);
    sensor1.set('name', 'cpu');
    sensor2.set('device', device);
    sensor2.set('name', 'usagemem');
    sensor3.set('device', device);
    sensor3.set('name', 'battery');

    const device2 = new Device();
    device2.set('uuid', 'device2');
    const sensor4 = new Sensor();
    sensor4.set('device', device2);
    sensor4.set('name', 'cpu');

    try {
      await Promise.all([
        device.save(null, { sessionToken: testUser.getSessionToken() }),
        device2.save(null, { sessionToken: testUser.getSessionToken() }),
        sensor1.save(null, { sessionToken: testUser.getSessionToken() }),
        sensor2.save(null, { sessionToken: testUser.getSessionToken() }),
        sensor3.save(null, { sessionToken: testUser.getSessionToken() }),
        sensor4.save(null, { sessionToken: testUser.getSessionToken() }),
      ]);

      const params = {
        devices: [{ objectId: device._getId() }, { objectId: device2._getId() }],
      };
      const { results } = await SensorCloudFunctions.findSensorsByDevices({
        user: testUser,
        params,
      });
      expect(results).toHaveLength(1);
      expect(results).toEqual([{ objectId: 'mix', name: 'cpu' }]);
    } finally {
      await Promise.all([
        device.destroy({ sessionToken: testUser.getSessionToken() }),
        device2.destroy({ sessionToken: testUser.getSessionToken() }),
        sensor1.destroy({ sessionToken: testUser.getSessionToken() }),
        sensor2.destroy({ sessionToken: testUser.getSessionToken() }),
        sensor3.destroy({ sessionToken: testUser.getSessionToken() }),
        sensor4.destroy({ sessionToken: testUser.getSessionToken() }),
      ]);
    }
  });
});

const Utils = require('../cloud/utils');

describe('Utils', () => {
  describe('general utils', () => {
    test('array intersection should pass', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [4, 5, 6, 7];
      const arr3 = [4, 3];
      expect(Utils.getArraysIntersection(arr1, arr2, arr3)).toEqual([4]);
    });

    test('array intersection should return empty array', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [4, 5, 6, 7];
      const arr3 = [10, 12];
      expect(Utils.getArraysIntersection(arr1, arr2, arr3)).toEqual([]);
      expect(Utils.getArraysIntersection(arr1)).toEqual([]);
    });

    test('array intersection should throw an expection', () => {
      expect(() => Utils.getArraysIntersection()).toThrow(
        /^getArraysIntersection cannot be called with no arguments$/,
      );
    });

    test('null parser should return null type', () => {
      let input = 'null';
      expect(Utils.nullParser(input)).toEqual(null);
      input = null;
      expect(Utils.nullParser(input)).toEqual(null);
    });

    test('null parser should return input type', async () => {
      let input = 1;
      expect(Utils.nullParser(input)).toEqual(1);
      input = 'text';
      expect(Utils.nullParser(input)).toEqual('text');
      input = true;
      expect(Utils.nullParser(input)).toEqual(true);
    });
  });

  describe('core utils', () => {
    // test('test for describe inner 2', () => {
    //   expect(false).toEqual(false);
    // });
  });
});

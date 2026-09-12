import { createJsonReceiver, createJsonSlices, combineJsonSlices } from '../src/';
import { describe, expect, it } from 'vitest';

describe('createJsonSlices', () => {
  it('basic', async () => {
    const slices = createJsonSlices({ a: 1, b: 2, c: 3, d: 4, e: 5 }, 2);
    expect(slices).toEqual([
      { dataRange: [0, 2], contentLength: 31, contentData: '{"' },
      { dataRange: [2, 4], contentLength: 31, contentData: 'a"' },
      { dataRange: [4, 6], contentLength: 31, contentData: ':1' },
      { dataRange: [6, 8], contentLength: 31, contentData: ',"' },
      { dataRange: [8, 10], contentLength: 31, contentData: 'b"' },
      { dataRange: [10, 12], contentLength: 31, contentData: ':2' },
      { dataRange: [12, 14], contentLength: 31, contentData: ',"' },
      { dataRange: [14, 16], contentLength: 31, contentData: 'c"' },
      { dataRange: [16, 18], contentLength: 31, contentData: ':3' },
      { dataRange: [18, 20], contentLength: 31, contentData: ',"' },
      { dataRange: [20, 22], contentLength: 31, contentData: 'd"' },
      { dataRange: [22, 24], contentLength: 31, contentData: ':4' },
      { dataRange: [24, 26], contentLength: 31, contentData: ',"' },
      { dataRange: [26, 28], contentLength: 31, contentData: 'e"' },
      { dataRange: [28, 30], contentLength: 31, contentData: ':5' },
      { dataRange: [30, 31], contentLength: 31, contentData: '}' },
    ]);

    const json = combineJsonSlices(slices);
    expect(json).toEqual('{"a":1,"b":2,"c":3,"d":4,"e":5}');

    const receiver = createJsonReceiver((error, json) => {
      expect(error).toBeNull();
      expect(json).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5 });
    });

    slices.forEach(slice => receiver.push(slice));
  });

  it('empty object', async () => {
    const slices = createJsonSlices({}, 2);
    expect(slices).toEqual([{ dataRange: [0, 2], contentLength: 2, contentData: '{}' }]);

    const receiver = createJsonReceiver((error, json) => {
      expect(error).toBeNull();
      expect(json).toEqual({});
    });
  });

  it('empty string', async () => {
    const slices = createJsonSlices('', 2);
    expect(slices).toEqual([{ dataRange: [0, 2], contentLength: 2, contentData: '""' }]);

    const receiver = createJsonReceiver((error, json) => {
      expect(error).toBeNull();
      expect(json).toEqual("");
    });
    slices.forEach(slice => receiver.push(slice));
  });

  it('slice size larger than JSON length', async () => {
    const slices = createJsonSlices({ a: 1 }, 100);
    expect(slices).toEqual([{ dataRange: [0, 7], contentLength: 7, contentData: '{"a":1}' }]);

    const receiver = createJsonReceiver((error, json) => {
      expect(error).toBeNull();
      expect(json).toEqual({ a: 1 });
    });
    slices.forEach(slice => receiver.push(slice));
  });

  it('non-stringifiable object', async () => {
    const circularObj: any = {};
    circularObj.circularRef = circularObj;
    expect(() => createJsonSlices(circularObj, 2)).toThrow();
  });
});

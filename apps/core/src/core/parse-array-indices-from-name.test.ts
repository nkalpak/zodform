import { parseArrayIndicesFromName } from './parse-array-indices-from-name';

describe('parseArrayIndicesFromName', function () {
  test('single index in the name', function () {
    const actual = parseArrayIndicesFromName('foo[0]');

    expect(actual).toEqual({ foo: 0 });
  });

  test('multiple indices in the name', function () {
    const actual = parseArrayIndicesFromName('foo[0].bar[1]');

    expect(actual).toEqual({ foo: 0, bar: 1 });
  });

  test('no indices in the name', function () {
    const actual = parseArrayIndicesFromName('foo');

    expect(actual).toEqual({});
  });
});

import { describe, expect, test } from 'vitest';
import { componentNameDeserialize, componentNameSerialize } from './component-name-deserialize';

describe('componentNameDeserialize', () => {
  test('should return the name', () => {
    expect(componentNameDeserialize('name')).toEqual(['name']);
    expect(componentNameDeserialize('a.b.c')).toEqual(['a', 'b', 'c']);
    expect(componentNameDeserialize('a[0].b[1].c')).toEqual(['a', 0, 'b', 1, 'c']);
    expect(componentNameDeserialize('a[0][1]')).toEqual(['a', 0, 1]);
  });
});

describe('componentNameSerialize', function () {
  test('should serialize an object inside an array', function () {
    expect(componentNameSerialize(['a', 0, 'b'])).toEqual('a[0].b');
  });
});

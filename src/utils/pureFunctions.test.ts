import { classNameGenerator, sanitizeNumberInput } from 'utils/pureFunctions';

describe('convert input to number', () => {
  test('variations', () => {
    expect(sanitizeNumberInput('1abc')).toBe('1');
    expect(sanitizeNumberInput('abc1')).toBe('1');
    expect(sanitizeNumberInput('a123')).toBe('123');
    expect(sanitizeNumberInput('123a')).toBe('123');
    expect(sanitizeNumberInput('123......4')).toBe('123.4');
    expect(sanitizeNumberInput('a123....abc..4..abc5')).toBe('123.45');
  });
});

describe('filter classNames by bools', () => {
  test('variations', () => {
    expect(
      classNameGenerator({
        'bg-error': true,
        'ml-10': true,
        'px-10': false,
      })
    ).toBe('bg-error ml-10');
    expect(
      classNameGenerator({
        'bg-error': false,
        'bg-success': true,
        'bg-white': false,
      })
    ).toBe('bg-success');
    expect(
      classNameGenerator({
        'bg-error': true,
        'bg-success': false,
        'bg-white': false,
      })
    ).toBe('bg-error');
  });
});

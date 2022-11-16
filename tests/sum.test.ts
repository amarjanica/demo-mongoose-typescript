import { sum } from '@models/sum';

test('sums 2 numbers', () => {
  expect(sum(1, 1)).toBe(2);
});

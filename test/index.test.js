//Test file for index.js

var Finance = require('../index.js');

var finance = new Finance();

test("Calculate PV of (5.25%, 5, 6000, 0, 0)", () => {
  expect(finance.PV(.0525, 5, 6000)).toBeCloseTo(-25798.316343571, 8);
});

test("Calculate PV of (6.88%, 10, 150000, 10000, 0)", () => {
  expect(finance.PV(0.0688, 10, 150000, 10000)).toBeCloseTo(-1064546.969721610, 8);
});

test("Calculate PV of (.006875, 60, 3250, 0, 1)", () => {
  expect(finance.PV(0.006875, 60, 3250, 0, 1)).toBeCloseTo(-160438.486624723, 8);
});

test("Calculate PV of (.009166667, 180, 525, 50, 0)", () => {
  expect(finance.PV(.11/12, 180, 525, 50)).toBeCloseTo(-46200.1919210731, 8);
});

test("Calculate PV of (0.010625, 8, 32.5, 0, 1)", () => {
  expect(finance.PV(0.010625, 8, 32.5, 0, 1)).toBeCloseTo(-250.631442440053, 8);
});

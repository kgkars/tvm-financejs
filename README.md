[![npm version](https://badge.fury.io/js/tvm-financejs.svg)](https://badge.fury.io/js/tvm-financejs)     [![Build Status](https://travis-ci.com/kgkars/tvm-financejs.svg?branch=master)](https://travis-ci.com/kgkars/tvm-financejs)     [![Coverage Status](https://coveralls.io/repos/github/kgkars/tvm-financejs/badge.svg?branch=master)](https://coveralls.io/github/kgkars/tvm-financejs?branch=master)

# tvm-financejs
A library of common financial functions to be used in time value of money calculations.

## Introduction
This library is a set of common finance formulas used in time value of money calculations.  The formulas are designed to have the same input style as Microsoft Excel's finance formula of the same name, and should provide substantially the same return values. (Unit tests all pass to the 8th decimal place).

### Backstory
This library came about as I was building a small prototype application that required some simple financial calculations for loan payments, rate, and present value. I was very familiar with the formulas and their uses in Excel (as was my target audience), and looked online for a JavaScript library that had a similar formula structure for the formulas I needed. Essam Al Joubori's great [finance.js](http://financejs.org/) had most of the formulas I needed and in a great integration format, but was missing the critical RATE formula. After a long search and testing of several examples of RATE formulas in other libraries that kept providing inconsistent results compared to Excel, I found examples of Microsoft's [source code for Excel in VBA format](https://github.com/microsoft/referencesource/blob/master/Microsoft.VisualBasic/runtime/msvbalib/Financial.vb). The RATE formula in this document needed a couple tweaks, but performed with great precision compared to Excel.

## Installation

`npm install tvm-financejs --save`

## Example Usage

```
var Finance = require("tvm-financejs");

var finance = new Finance();

// To calculate a payment:
Math.round(finance.PMT(.0525, 5, -10000) * 100) / 100;
// Returns 2325.73
```

To see these formulas in use, please visit [tvm-calculator](https://kgkars.github.io/tvm-calculator/#/).

## Available Functions

### General Notes

- Just like Excel, I do not add rounding to the outputs. In many cases, you may want to use these formulas in combination with each other, in which case a rounded output will degrade the accuracy of the final values.
- Inputs in '[ ]' are optional for the formula.
- PV is typically represented as a negative value in the inputs/outputs.
- Rate must be represented in equivalent format to the periods. (e.g. if the APR is 5% but the periods are monthly, you need to divide the rate by 12).

### Input Variables

Variable | Description
--- | ---
**pv** | present value
**fv** | future value
**pmt** | payment
**nper** | total number of periods
**per** | a specific period, used in IPMT & PPMT
**rate** | rate for the period(s)
**type** | when payments are due (0 for end of period/arrears, and 1 for beginning of period/advance)
**guess** | a guess at the rate, optional value for the RATE formula
**values** | a set of periodic cash flows

### Present Value

`finance.PV(rate, nper, pmt, [fv], [type]);`

Returns the present value of an investment, or the total amount that a series of future payments is worth now.

### Future Value

`finance.FV(rate, nper, pmt, pv, [type]);`

Returns the future value of an investment based on periodic, equal, payments and a constant interest rate.

### Payment

`finance.PMT(rate, nper, pv, [fv], [type]);`

Calculates the payment for a loan based on a constant stream of equal payments and a constant interest rate.

### Interest Payment

`finance.IPMT(rate, per, nper, pv, [fv], [type]);`

Returns the calculated interest portion of a payment for a specific period based on a constant stream of equal payments and a constant interest rate.

### Principal Payment

`finance.PPMT(rate, per, nper, pv, [fv\], [type]);`

Returns the calculated principal portion of a payment for a specific period based on a constant stream of equal payments and a constant interest rate.

### Rate

`finance.RATE(nper, pmt, pv, [fv], [type], [guess]);`

Returns the interest rate per period for a loan or investment.

### Net Present Value

`finance.NPV(rate, value1, [value2], ... [valueN]);`

Returns the net present value of an investment based on a constant rate of return and a series of future payments/investments (as negative values) and income/return (as positive values).

### Internal Rate of Return

`finance.IRR(values, [guess]);`

Returns the internal rate of return for a series of cash flows.

A couple of items to note about this formula:
- The variable values must be input as an array.
- There must be at least one negative and one positive value as part of the cash flow.
- Cash flows are assumed to be due in the same order they are arranged in the Array.

Example usage:

```
returnIRR() {
  const values = [-1500, 500, 500, 500, 500];
  return Math.round(finance.IRR(values) * 100 ) / 100 * 100;
}
// returns 12.59
```

## Contributing

Feel free to contribute and add more formulas to the library. Please try to add comments explaining the math behind the functions as they are added, and ensure unit tests are added/updated appropriately. The library is set up to use Jest for unit testing.

## Testing

Each finance formula has a single test comprised of a number of sub-tests. (I wanted to run hundreds of tests but didn't want to scroll through that many results!). The tests are designed to either:
- Match the equivalent Excel formula to 8 decimal places; or
- Trigger a specific error message.
Test scenarios comprise a variety of terms, periods, types, and inputs.

To run the test suites:
`npm test`

The Excel version is **Microsoft Excel for Office 365 MSO(16.0.12527.20260) 32-bit**.

## To Do

As time permits, I will look to expand the finance formulas included in here.  I would also like to build and link to a small finance calculator application based on the formulas in order to demonstrate how they can be used and leveraged in real applications.

One other item I might get to is the creation of a modified input version. While I love the Excel formulas, most of the time I find myself having to remember to make my positive loan value amount negative for the PV input, or divide my annual rate by the right method to match my periods. I may create a version which allows for positive PV input/outputs and has a period type input which will transform the rate automatically.
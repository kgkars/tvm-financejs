// # tvm-financejs
//
// --------------------------------------------------------------------
// ## Variables:
//
// pv = present value
// fv = future value
// pmt = regular payment (must be equal in total value for all periods)
// nper = number of periods
// per = specific period
// rate = interest rate per the period
// type = when payments are due
//        0 = end of period (default)
//        1 = beginning of period
// guess = in the rate function, an estimate of the rate.  Guesses
//         typically improve the accuracy of the rate calculation.
//
// ---------------------------------------------------------------------
//

//Initialize a Finance Class
var Finance = function() {};

// --------------------------------------------------------------------
// Calculates the present value based on rate, payment,
// and number of periods.  Future value and type
// (0 as in arrears, 1 as in advance) are optional fields.
//
// ## Math:
//
//          -fv + pmt*(1_rate*type) / ( (1+rate)^nper-1) / rate
//    pv = ------------------------------------------------------
//                         (1 + rate) ^ nper
//
// If rate equals zero, there is no time value of money
// Calculations needed, and the function returns:
//
//    pv = -fv - pmt * nper
//
// Returns a number.
// --------------------------------------------------------------------
//
Finance.prototype.PV = function (rate, nper, pmt, fv, type) {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;

  if (rate === 0) {
    return -pmt * nper - fv;
  } else {
    
    var tempVar = type !== 0 ? 1 + rate : 1;
    var tempVar2 = 1 + rate;
    var tempVar3 = Math.pow(tempVar2, nper);

    return -(fv + pmt * tempVar * ((tempVar3 - 1) / rate)) / tempVar3;
  }
};

// --------------------------------------------------------------------
// Calculates the number of periods based on rate, payment,
// present value (as a negative).  Future value and type
// (0 as in arrears, 1 as in advance) are optional fields.
//
// ## Math:
//
//                       -fv + pmt*(1_rate*type) / rate
//     (1+rate)^nper = ----------------------------------
//                        pv + pmt*(1+rate*type) / rate
//
// This output is then used in the log function.
//
// If rate equals zero, there is no time value of money
// Calculations needed, and the function returns:
//
//     nper = (-fv - pv) / pmt
//
// Returns either a number or error message (as string).
// --------------------------------------------------------------------
//
Finance.prototype.NPER = function (rate, pmt, pv, fv, type) {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;

  if (rate === 0) {
    if (pmt === 0) {
      return "Error - Payment cannot be 0";
    } else {
      return -(pv + fv) / pmt;
    }
  } else {
    var tempVar = type !== 0 ? pmt * (1 + rate) / rate : pmt / rate;
  }

  var tempVarFV = -fv + tempVar;
  var tempVarPV = pv + tempVar;

  // Test to ensure values fit within log() function
  if (tempVarFV < 0 && tempVarPV < 0) {
    tempVarFV = tempVarFV * -1;
    tempVarPV = tempVarPV * -1;
  } else if (tempVarFV <=0 || tempVarPV <= 0) {
    return "Error - Cannot Calculate NPER";
  }

  var tempVar2 = rate + 1;

  return (Math.log(tempVarFV) - Math.log(tempVarPV)) / Math.log(tempVar2);
};

// --------------------------------------------------------------------
// Calculates the value of the payment based on rate, periods,
// present value (as a negative).  Future value and type
// (0 as in arrears, 1 as in advance) are optional fields.
//
// ## Math:
//
//                                          (1+rate)^nper - 1
//  pv * (1+rate)^nper + pmt*(1+rate*type)*------------------ + fv = 0
//                                                rate
// If rate equals zero:
// pv + pmt*nper + fv = 0
//
//           (-fv - pv*(1+rate)^nper) * rate
//  pmt = ---------------------------------------
//         (1+rate*type) * ( (1+rate)^nper - 1 )
//
// If rate equals zero::
//
//  pmt = (-fv - pv) / nper
//
// Returns a number.
// --------------------------------------------------------------------
//
Finance.prototype.PMT = function (rate, nper, pv, fv, type) {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;
  
  if (rate === 0) {
    return (-fv - pv) / nper;
  } else {

    var tempVar = type !== 0 ? 1 + rate : 1;
    var tempVar2 = rate + 1;
    var tempVar3 = Math.pow(tempVar2, nper);

    return ((-fv - pv * tempVar3) / (tempVar * (tempVar3 - 1))) * rate;
  }
};

// --------------------------------------------------------------------
// This function returns the calculated future value given a set of
// transaction terms. It takes rate, number of periods, payment, and
// present value as inputs. Type is an optional input as well.
//
// ## Math:
//
//                                              (1+rate)^nper -1
//  fv = -pv*(1+rate)^nper - pmt*(1+rate*type)*------------------
//                                                   rate
//
// If rate equals 0, there is no time value of money consideration and
// fv = -pv - pmt * nper
//
// Returns a number.
// --------------------------------------------------------------------
//
Finance.prototype.FV = function (rate, nper, pmt, pv, type) {
  type = typeof type === "undefined" ? 0 : type;

  if (rate === 0) {
    return -pv - pmt * nper;
  } else {
    
    var tempVar = type !== 0 ? 1 + rate : 1;
    var tempVar2 = 1 + rate;
    var tempVar3 = Math.pow(tempVar2, nper);

    return -pv * tempVar3 - (pmt / rate) * tempVar * (tempVar3 - 1);
  }
};

// --------------------------------------------------------------------
// This function will calculate the interest portion of a payment
// for a given period of a set payment stream. It takes rate, the
// specific period, total number of periods, and present value as
// inputs.  It also has future value and type as optional inputs.
//
// The formula leverages the PMT and FV formulas. Essentially,
// it calculates what the future value is at the start of the target
// period. Since rate is constant for the period, fv * rate will
// provide the interest portion during that period.
// 
// If the period is set as 1 and payments are due in advance (type = 1)
// then no interest is due and the function returns 0.
//
// ## Math:
//
// IF payments are in arrears (type === 0), then:
//   IPMT = fv(per-1)*rate
// Else
//   IPMT = FV(per-2)*rate
//
// Returns either a number or error (as string).
// --------------------------------------------------------------------
//
Finance.prototype.IPMT = function (rate, per, nper, pv, fv, type) {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;

  var tempVar = type !== 0 ? 2 : 1;

  if (per <= 0 || per >= nper + 1) {
    return "Error - invalid Period";
  }

  if (type !== 0 && per === 1) {
    return 0;
  }

  var pmt = this.PMT(rate, nper, pv, fv, type);
  pv = type !== 0 ? pv + pmt : pv;
  var tempVarFV = this.FV(rate, per - tempVar, pmt, pv);

  return tempVarFV * rate;
};

// --------------------------------------------------------------------
// This function calculates the portion of a regular payment that is
// applied to principal based on rate, which period to calculate, the
// total number of periods, and the present value.  The future value and
// type are optional.
//
// ## Math:
//
// Since a regular payment is the essentially the Interest Payment plus
// the Principal Payment:
//
// ppmt = pmt - ipmt
//
// Returns either a number or error message (as string).
// --------------------------------------------------------------------
//
Finance.prototype.PPMT = function (rate, per, nper, pv, fv, type) {
  if (per <= 0 || per >= nper + 1) {
    return "Error - invalid Period";
  }

  var pmt = this.PMT(rate, nper, pv, fv, type);
  var tempVarIPMT = this.IPMT(rate, per, nper, pv, fv, type);

  return pmt - tempVarIPMT;
};

// --------------------------------------------------------------------
// This function calculates the net present value of a series of
// payments at a constant rate.  It uses the helper function, EVALNPV,
// to assist in determining the value.  Between this function and
// EVALNPV, the math is as follows:
//
// ## Math:
//
//         Value 1        Value 2             Value N
//  npv = ---------- + ------------- + ... -------------
//        (1 + rate)   (1 + rate)^2         (1 + rate)^N
//
// Returns either a number or error message (as string).
// --------------------------------------------------------------------
//
Finance.prototype.NPV = function (rate) {
  var values = Array.prototype.slice.call(arguments).slice(1);

  var lowerBound = 0;
  var upperBound = values.length -1;
  var tempVar = upperBound - lowerBound + 1;

  if (tempVar < 1) {
    return "Error - Invalid Values"
  }

  if (rate === -1) {
    return "Error - Invalid Rate"
  }

  return this.EVALNPV(rate, values, 0, lowerBound, upperBound);
};

// --------------------------------------------------------------------
// This function calculates the Internal Rate of Return (IRR) of a
// series of regular cash flows.  Negative values represent
// investments, and positive values represent returns.
//
// ## Math:
//
// Essentially, the algorithm uses the secant method to find a rate
// where the net present value is equal to 0, stepping through the
// calculations iteratively.  Once the rate is within the Epsilon
// tolerance, the approximate rate is returned.
//
// Returns either a number or error message (as string).
// --------------------------------------------------------------------
//
Finance.prototype.IRR = function(values, guess) {
  guess = typeof guess === "undefined" ? 0.1 : guess;

  var epslMax = 0.0000001;
  var step = 0.00001;
  var iterMax = 39;

  //Check for valid inputs
  if (guess <= -1) {
    return "Error - invalid guess";
  }

  if (values.length < 1) {
    return null;
  }

  //Scale up the Epsilon Max based on cash flow values
  var tempVar = values[0] > 0 ? values[0] : values[0] * -1;
  var i = 0;

  while (i < values.length) {
    if (Math.abs(values[i]) > tempVar) {
      tempVar = Math.abs(values[i]);
    }
    i++;
  }

  tempNpvEpsl = tempVar * epslMax * 0.01

  tempRate0 = guess;
  tempNpv0 = this.InternalPV(values, tempRate0);

  var tempRate1 = tempNpv0 > 0 ? tempRate0 + step : tempRate0 - step;

  if (tempRate1 <= -1) {
    return "Error - invalid values";
  }

  var tempNpv1 = this.InternalPV(values, tempRate1);

  var i = 0;

  while (i <= iterMax) {
    if (tempNpv1 === tempNpv0) {
      tempRate0 = tempRate1 > tempRate0 ? tempRate0 - step : tempRate0 + step;

      tempNpv0 = this.InternalPV(values, tempRate0);

      if (tempNpv1 === tempNpv0) {
        return "Error - invalid values";
      }
    }
    
    tempRate0 = tempRate1 - (tempRate1 - tempRate0) * tempNpv1 / (tempNpv1 - tempNpv0);

    //Secant method
    if (tempRate0 <= -1) {
      tempRate0 = (tempRate1 - 1) * 0.5;
    }

    //Give the algorithm a second chance...
    tempNpv0 = this.InternalPV(values, tempRate0);
    tempVar = tempRate0 > tempRate1 ? tempRate0 - tempRate1 : tempRate1 - tempRate0;
    
    var tempVar2 = tempNpv0 > 0 ? tempNpv0 : tempNpv0 * -1;

    //Test for npv = 0 and rate convergence
    if (tempVar2 < tempNpvEpsl && tempVar < epslMax) {
      return tempRate0;
    }
    //Transfer values and try again...
    tempVar = tempNpv0;
    tempNpv0 = tempNpv1;
    tempNpv1 = tempVar;
    tempVar = tempRate0;
    tempRate0 = tempRate1;
    tempRate1 = tempVar;

    i++;

  }
  return "Error - iterMax exceeded"
};
// --------------------------------------------------------------------
// This function returns the estimated contract rate based on the
// Number of periods, the regular payment, and the present value.
// Future value, type, and guess (an estimate for the rate) are
// optional.
//
// This function is not as simple as the other functions, since it
// is not possible to solve for rate algebraically. The formula
// leverages a secant method of approximation using guess (either
// provided by the user or defaulted to 10%) as a starting point.
//
// ## Math:
//
// Use Guess to determine Rate0 and Rate1.  Use the helper function
// EVALRATE to determine Y0 and Y1 respectively.
//
//  Iterate through:
//                                             Y0
//   New Rate0 = Rate1 - (Rate1 - Rate0) * -----------
//                                          (Y1 - Y0)
//
// Get new Y0.  Move New Rate0 to Rate1 and repeat.
// Stop when the absolute value of Y0 < epsilon max tolerance.
//
// Returns either a number or an error (as string).
// --------------------------------------------------------------------
//
Finance.prototype.RATE = function(nper, pmt, pv, fv, type, guess) {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;
  guess = typeof guess === "undefined" ? 0.1 : guess;

  if (nper <= 0) {
    return "Error - invalid Period"
  }

  // Variables for epsilon max and step from Microsoft reference docs.
  var epslMax = 0.0000001;
  var step = 0.00001;
  // Microsoft reference docs show 40 iterations (i = 0 to 39)
  // But I was running into undefined errors when the Guess was
  // Far off the actual Rate.  Increasing the iterations to 129
  // (i = 0 to 128) allowed enough iterations to get rates
  // Within 8 decimal places of Excel for my test suite.
  var iterMax = 128;

  var Rate0 = guess;
  var Y0 = this.EVALRATE(Rate0, nper, pmt, pv, fv, type);

  var Rate1 = Y0 > 0 ? Rate0 / 2 : Rate0 * 2;
  var Y1 = this.EVALRATE(Rate1, nper, pmt, pv, fv, type);

  var i = 0;

  while (i < iterMax) {
    if (Y1 === Y0) {
      Rate0 = Rate0 < Rate1 ? Rate0 - step : Rate0 - step * -1;

      Y0 = this.EVALRATE(Rate0, nper, pmt, pv, fv, type);
    }

    if (Y1 === Y0) {
      return "#NUM!";
    }

    Rate0 = Rate1 - (Rate1 - Rate0) * Y1 / (Y1 - Y0);
    Y0 = this.EVALRATE(Rate0, nper, pmt, pv, fv, type);

    if (Math.abs(Y0) < epslMax) {
      return Rate0;
    } else {
      var tempVar = Y0;
      Y0 = Y1;
      Y1 = tempVar;
      tempVar = Rate0;
      Rate0 = Rate1;
      Rate1 = tempVar;
    }
    i++;
  }
};

// --------------------------------------------------------------------
// EVALRATE is a local helper function for the
// RATE calculation.  It follows a similar
// Pattern to the PMT formula above.
// --------------------------------------------------------------------
//
Finance.prototype.EVALRATE = function (rate, nper, pmt, pv, fv, type) {
  if (rate === 0) {
    return pv + pmt * nper + fv;
  } else {
    var tempVar3 = rate + 1;
    var tempVar = Math.pow(tempVar3, nper);

    var tempVar2 = type !== 0 ? 1 + rate : 1;

    return pv * tempVar + pmt * tempVar2 * (tempVar - 1) / rate + fv;
  }
};

// --------------------------------------------------------------------
// EVALNPV is a local helper function for the
// NPV calculation.
// --------------------------------------------------------------------
//
Finance.prototype.EVALNPV = function (rate, values, npvType, lowerBound, upperBound) {
  var tempVar = 1;
  var tempTotal = 0;
  var i = lowerBound;

  while (i <= upperBound) {
    var tempVar2 = values[i];
    tempVar = tempVar + tempVar * rate;

    if (! (npvType > 0 &&  tempVar2 > 0) || ! (npvType < 0 && tempVar2 < 0)) {
      tempTotal = tempTotal + tempVar2 / tempVar;
    }
    i++
  }
  return tempTotal
};

// --------------------------------------------------------------------
// InternalPV is a local helper function for the
// IRR calculation.
// --------------------------------------------------------------------
//
Finance.prototype.InternalPV = function (values, guess) {
  guess = typeof guess === "undefined" ? 0.1 : guess;

  var lowerBound = 0;
  var upperBound = values.length - 1;

  var tempTotal = 0
  var divRate = 1 + guess;

  while (lowerBound <= upperBound && values[lowerBound] === 0) {
    lowerBound++;
  }

  var i = upperBound;
  var step = -1

  while (i >= lowerBound) {
    tempTotal = tempTotal / divRate;
    tempTotal = tempTotal + values[i];
    i = i + step;
  }
  return tempTotal;
}

module.exports = Finance;

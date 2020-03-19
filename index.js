//tvm-financejs

//Initialize a Finance Class
var Finance = function() {};

Finance.prototype.PV = function (rate, nper, pmt, fv, type) {
  type = typeof type === "undefined" ? 0 : type;
  fv = typeof fv === "undefined" ? 0 : fv;

  var varTemp = 1;

  if (rate === 0) {
    return -pmt * nper - fv;
  } else {
    if (type !== 0) {
      varTemp = 1 + rate;
    } else {
      varTemp = 1;
    }
    var varTemp2 = 1 + rate;
    var varTemp3 = Math.pow(varTemp2, nper);

    return -(fv + pmt * varTemp * ((varTemp3 - 1) / rate)) / varTemp3;
  }
};

module.exports = Finance;

'use strict';
var RetirementCountdown = require('./retirementCountdown');


exports.handler = function (event, context) {
    var retirementCountdown = new RetirementCountdown();
    retirementCountdown.execute(event, context);
};

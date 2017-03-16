'use strict';
var AlexaSkill = require('./AlexaSkill'),
    eventHandlers = require('./eventHandlers'),
    intentHandlers = require('./intentHandlers');

var APP_ID = "amzn1.ask.skill.460c7ead-9f94-41e7-b574-61de5d837927";
var skillContext = {};

/**
 * ScoreKeeper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var RetirementCountdown = function () {
    AlexaSkill.call(this, APP_ID);
    skillContext.needMoreHelp = true;
};


// Extend AlexaSkill
RetirementCountdown.prototype = Object.create(AlexaSkill.prototype);
RetirementCountdown.prototype.constructor = RetirementCountdown;

eventHandlers.register(RetirementCountdown.prototype.eventHandlers, skillContext);
intentHandlers.register(RetirementCountdown.prototype.intentHandlers, skillContext);

module.exports = RetirementCountdown;

'use strict';
var storage = require('./storage'),
    textHelper = require('./textHelper');

var registerEventHandlers = function (eventHandlers, skillContext) {
    eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
        //if user said a one shot command that triggered an intent event,
        //it will start a new session, and then we should avoid speaking too many words.
        skillContext.needMoreHelp = false;
    };

    eventHandlers.onLaunch = function (launchRequest, session, response) {
        //Speak welcome message and ask user questions
        //based on whether there is a retirement date set or not.
        storage.loadInfo(session, function (currentRetirement) {
            var speechOutput = '',
                reprompt;
            if (!currentRetirement.data.retirementDate[0]) {
                speechOutput += 'Retirement countdown, congratulations on planning your retirement! When is your last day?';
                reprompt = "Please tell me what your last day of work is.";
            } else if (currentRetirement.data.retirementDate[0]) {
                speechOutput += 'You can check when your last day of work is or ask how much longer you have until retirement. Which would you like?';
                reprompt = textHelper.nextHelp;
            } else {
                speechOutput += 'Retirement countdown, what can I do for you?';
                reprompt = textHelper.completeHelp;
            }
            response.ask(speechOutput, reprompt);
        });
    };
};
exports.register = registerEventHandlers;

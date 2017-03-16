'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.AddRetirementDateIntent = function (intent, session, response) {
        //add retirement date for user
        var retirementDate = intent.slots.RetirementDate.value;
        storage.loadInfo(session, function (currentRetirement) {
            var speechOutput = '',
                reprompt = textHelper.nextHelp;
            if (currentRetirement.data.retirementDate[0]) {
                speechOutput += 'I have your retirement date set as ' + currentRetirement.data.retirementDate[0] + '.';
                if (skillContext.needMoreHelp) {
                    response.ask(speechOutput + ' What would you like to do?', 'What would you like to do?');
                }
                response.ask(speechOutput + ' What would you like to do?', 'What would you like to do?');
                return;
            }
            if (!retirementDate) {
                response.ask('Congratulations on planning your retirement! When is your last day of work?', 'When is your last day of work?');
                return;
            }

            if (!retirementDateIsValid(retirementDate)){
                response.ask('I did not understand that date. When is your last day of work?', 'When is your last day of work?');
                return;
            }
            speechOutput += 'Congratulations! ' + retirementDate + ' has been set as your last day of work. ';
            currentRetirement.data.retirementDate[0] = retirementDate;

            currentRetirement.save(function () {
              response.ask(speechOutput + "Would you like to know anything else?", reprompt);
            });
        });
    };

    intentHandlers.ChangeRetirementDateIntent = function (intent, session, response) {
        //change the retirement date.
        var newRetirementDate = intent.slots.NewRetirementDate.value;
        if (!newRetirementDate || !retirementDateIsValid(newRetirementDate)) {
            response.ask('If you would like to change your last day of work, please say: change my retirement date to: followed by your new retirement date. ', 'Please say your retirement date again');
            return;
        }
        storage.loadInfo(session, function (currentRetirement) {
            var speechOutput = '',
              reprompt = textHelper.nextHelp;
            currentRetirement.data.retirementDate[0] = newRetirementDate;

            speechOutput += 'Your last day of work is set to ' + newRetirementDate + '. ';
            currentRetirement.save(function () {
              response.ask(speechOutput + "Anything else?", reprompt);
            });
        });
    };


    intentHandlers.GiveCountdownIntent = function (intent, session, response) {
        //tells the time left until retirement and sends the result in a card.
        storage.loadInfo(session, function (currentRetirement) {
            var interval = intent.slots.DateFormat.value,
                continueSession,
                speechOutput = '',
                cardOutput = '';
            if (!currentRetirement.data.retirementDate[0]) {
                response.ask('You have not set a retirement date. When is your last day of work?', "What is your last day of work?");
                return;
            }
            var currentRetirementDate = new Date(currentRetirement.data.retirementDate[0]);
            var todayDate = new Date();
            if (!interval) {
              interval = "days";
            }
            var ans = getCountdownStatus(todayDate, currentRetirementDate, interval);
            if (interval === "days") {
              ans += 1;
            }
            if (ans > 1){
              speechOutput += ans + ' ' + interval + ' until your last day of work!';
              cardOutput += ans + ' ' + interval + ' until your last day of work!';
            } else if (ans === 1) {
              if (interval == "months") {
                speechOutput += 'Only one month until your last day of work!';
                cardOutput += 'Only one month until your last day of work!';
              } else if (interval == "weeks") {
                speechOutput += 'Only one week until your last day of work!';
                cardOutput += 'Only one week until your last day of work!';
              } else if (interval == "days"){
                speechOutput += 'Just one day until your last day of work!';
                cardOutput += 'Just one day until your last day of work!';
              }
            } else if (ans === 0) {
              if (interval == "months") {
                speechOutput += 'You are retiring this month!';
                cardOutput += 'You are retiring this month!';
              } else if (interval == "weeks") {
                speechOutput += 'You are retiring this week!';
                cardOutput += 'You are retiring this week!';
              } else if (interval == "days"){
                speechOutput += 'You are retiring today!';
                cardOutput += 'You are retiring today!';
              }
            } else if (ans === -1) {
              if (interval == "weeks") {
                speechOutput += 'You retired a week ago!';
                cardOutput += 'You retired a week ago!';
              } else if (interval == "days"){
                speechOutput += 'You retired yesterday!';
                cardOutput += 'You retired yesterday!';
              }
            } else {
              ans = -ans;
              speechOutput += 'You are ' + ans + ' ' + interval + ' into retirement!';
              cardOutput += 'You are ' + ans + ' ' + interval + ' into retirement!';
            }

            response.tellWithCard(speechOutput, "Time Until Retirement", cardOutput);
        });
    };


    intentHandlers.RetirementIntent = function (intent, session, response) {
        // tells the time left until retirement and sends the result in a card.
        storage.loadInfo(session, function (currentRetirement) {
            var continueSession,
                speechOutput = '',
                cardOutput = '';
            if (!currentRetirement.data.retirementDate[0]) {
                response.ask('You have not set a retirement date. When is your last day of work?', 'When is your last day of work?');
                return;
            }
            var currentRetirementDate = currentRetirement.data.retirementDate[0];
            speechOutput += 'You are retiring on ' + currentRetirementDate;
            cardOutput += 'You are retiring on ' + currentRetirementDate;

            response.tellWithCard(speechOutput, "Retirement Date", cardOutput);
        });
    };


    intentHandlers.RetiredIntent = function (intent, session, response) {
        //remove retirement date
        storage.newRetirement(session).save(function () {
            response.tell('Congratulations! I hope you enjoy many years of blissful retirement.');
        });
    };

    intentHandlers['AMAZON.NoIntent'] = function (intent, session, response) {
      if (skillContext.needMoreHelp) {
          response.tell('Okay.  Whenever you\'re ready, you can ask about your retirement.');
      } else {
          response.tell('Goodbye');
      }
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.ask(textHelper.nextHelp);
        }
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay.  Whenever you\'re ready, you can ask about your retirement.');
        } else {
            response.tell('Goodbye');
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay.  Whenever you\'re ready, you can ask about your retirement.');
        } else {
            response.tell('Goodbye');
        }
    };
};

function retirementDateIsValid(date) {
    var currentDate = new Date();
    var proposedDate = new Date(date);
    var days = "days";
    var checkDate = getCountdownStatus(currentDate, proposedDate, days);
    if (!checkDate || isNaN(checkDate)) {
      return false;
    }  else {
      return true;
    }
}

function getCountdownStatus(date1,date2,interval) {
    var second=1000, minute=second*60, hour=minute*60, day=hour*24, week=day*7;
    var timediff = date2 - date1;
    if (isNaN(timediff)) return NaN;
    switch (interval) {
        case "years": return date2.getFullYear() - date1.getFullYear();
        case "months": return (
            ( date2.getFullYear() * 12 + date2.getMonth() )
            -
            ( date1.getFullYear() * 12 + date1.getMonth() )
        );
        case "weeks"  : return Math.floor(timediff / week);
        case "days"   : return Math.floor(timediff / day);
        default: return undefined;
    }
}

exports.register = registerIntentHandlers;

'use strict';
var AWS = require("aws-sdk");

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    /*
     * The Retirement class stores the last day of work as a hash for the user
     */
    function Retirement(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = {
                retirementDate: []
            };
        }
        this._session = session;
    }

    Retirement.prototype = {
        isRetiring: function () {
            //check if there is already data in the table
            //it can be used as an indication of whether the user has already set a retirement date
            var retiring = false;
            var retirementData = this.data;
            if (retirementData.retirementDate[0]) {
              retiring = true;
            }
            return retiring;
        },
        save: function (callback) {
            //save the retirement info in the session,
            //so next time we can save a read from dynamoDB
            this._session.attributes.currentRetirement = this.data;
            dynamodb.putItem({
                TableName: 'RetirementDates',
                Item: {
                    CustomerId: {
                        S: this._session.user.userId
                    },
                    Data: {
                        S: JSON.stringify(this.data)
                    }
                }
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback();
                }
            });
        }
    };

    return {
        loadInfo: function (session, callback) {
            if (session.attributes.currentRetirement) {
                console.log('get retirement info from session=' + session.attributes.currentRetirement);
                callback(new Retirement(session, session.attributes.currentRetirement));
                return;
            }
            dynamodb.getItem({
                TableName: 'RetirementDates',
                Key: {
                    CustomerId: {
                        S: session.user.userId
                    }
                }
            }, function (err, data) {
                var currentRetirement;
                if (err) {
                    console.log(err, err.stack);
                    currentRetirement = new Retirement(session);
                    session.attributes.currentRetirement = currentRetirement.data;
                    callback(currentRetirement);
                } else if (data.Item === undefined) {
                    currentRetirement = new Retirement(session);
                    session.attributes.currentRetirement = currentRetirement.data;
                    callback(currentRetirement);
                } else {
                    console.log('get retirement info from dynamodb=' + data.Item.Data.S);
                    currentRetirement = new Retirement(session, JSON.parse(data.Item.Data.S));
                    session.attributes.currentRetirement = currentRetirement.data;
                    callback(currentRetirement);
                }
            });
        },
        newRetirement: function (session) {
            return new Retirement(session);
        }
    };
})();
module.exports = storage;

/**
    Copyright 2016 Valorie Dodge. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located

    in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var RetirementCountdown = require('./retirementCountdown');


exports.handler = function (event, context) {
    var retirementCountdown = new RetirementCountdown();
    retirementCountdown.execute(event, context);
};

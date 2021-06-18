const Parse = require('Parse/node');
const debug = require('debug')('data-server:cloud');

Parse.Cloud.job('myJob', request => {
    const { params, headers, log, message } = request;
    message("I just started");
    debug("I just started");
    return;
});
const prompt = require('prompt');
const Promise = require('promise');
const commander = require('commander');

const ENV_VAR_USER_KEY = "PIO_USER";
const ENV_VAR_PASS_KEY = "PIO_PASS";

const operations = require('')

function getCredentials() {
    var credentials = new Promise(function(resolve, reject) {
        if(process.env[ENV_VAR_USER_KEY] && process.env[ENV_VAR_PASS_KEY]) {
            resolve(process.env[ENV_VAR_USER_KEY], process.env[ENV_VAR_PASS_KEY]);
        } else {
            prompt.start();
            
            prompt.get(['username', 'password'], function(error, result) {
                resolve(result.username, result.password);
            });
        }
    });
    
    return credentials;
}

module.export = {
    ask: getCredentials
}
const prompt = require('prompt');
const Promise = require('promise');
const commander = require('commander');

const ENV_VAR_USER_KEY = "PIO_USER";
const ENV_VAR_PASS_KEY = "PIO_PASS";

const operations = require('./app/operations')
const credentials = require('./app/credentials')

//
// Use the credentials
//
credentials.ask().then(function(username, password) {
    operations.fetchSecrets(password, username)
}, function() {
    console.log('Something terrible happened!');
});

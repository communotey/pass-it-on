var Promise = require('promise');

/*
    An asynchronous function which needs to be promisified.
    
    @param {Number} number
        Any number which is NOT 0.
    @param {Function} callback
        A function with the following signature: function(error, result)
*/
function asyncFn(number, callback) {
    if(number !== 0) {
        callback(null, 'No error.');
    } else {
        callback('Error!');
    }
}

/*
    Turns the asyncFn to promise-based instead of callback based. 
    
    @return {Promise}
        Resolves to the result of asyncFn()
*/
function promisifiedAsyncFn(number) {
    return new Promise(function(resolve, reject) {
       asyncFn(number, function(error, result) {
           if(error) return reject(error);
           
           return resolve(result);
       }) 
    });
}

/*
    TEST
    
    Change number to 1 to produce no error.
    Change number to 0 to produce an error.
*/
const number = 0
promisifiedAsyncFn(number).then(function(result) {
    console.log(result);
}, function(error) {
    console.log(error);
})
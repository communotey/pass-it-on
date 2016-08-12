const fs = require('fs');
const should = require('should');
const store = require('../app/store');

const JSON_STRING = JSON.stringify([1, 2, {three: 'four'}]);
const INVALID_JSON_STRING = '[1, 2, {three:"four"}, ]'

// TODO
// TODO
// TODO

describe('store.js', function() {
    describe('Opening a file', function() {
        describe('which exists', function() {
            describe('has data which is not JSON', function() {
                it('throws an exception', function() {
                   
                });
            });
           
            it('has data which is JSON', function() {
               it('retrieves the data successfully in JSON format', function() {
                   
               });
            });
        });
       
        describe("which doesn't exists", function() {
            it('', function() {
               
            })
        });
    });
});
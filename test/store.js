const fs = require('fs');
const should = require('should');
const store = require('../app/store');

const TEST_FILE_PATH = 'store.json';
const JSON_STRING = JSON.stringify([1, 2, {three: 'four'}]);
const INVALID_JSON_STRING = '[1, 2, {three:"four"}, ]'

// TODO
// TODO
// TODO

describe('store.js', function() {
    describe('Opening a file', function() {
        function storeExists() {
            return fs.statSync(TEST_FILE_PATH).isFile();
        }
        function deleteStore() {
            if(storeExists()) {
                fs.unlinkSync(TEST_FILE_PATH);
            }
        }

        describe('which exists', function() {
            describe('has data which is not JSON', function() {
                it('throws an exception', function() {
                   
                });
            });
           
            describe('has data which is JSON', function() {
               it('retrieves the data successfully in JSON format', function() {
                   
               });
            });
        });
       
        describe("which doesn't exist", function() {
            it('is created automatically', function() {
                deleteStore();
                               
                store.open(TEST_FILE_PATH);
                
                storeExists().should.be.true();
            });
            
            it("is assumed to have an empty object as it's data", function() {
                deleteStore();
                
                store.open(TEST_FILE_PATH);
                
                function isEmpty(obj) {
                    for(var prop in obj) {
                        if(obj.hasOwnProperty(prop))
                            return false;
                    }
                
                    return JSON.stringify(obj) === JSON.stringify({});
                }
                
                isEmpty(store.data).should.equal(true)
            });
        });
        
        describe('when one is open already', function() {
            it('should fail', function() {
                store.open(TEST_FILE_PATH); 
            });
        });
        
    });
    
    describe('Writing to a file', function() {
        
    })
});
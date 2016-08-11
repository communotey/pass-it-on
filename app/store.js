/*
    Store.js
    --------
    This module manages file I/O for a JSON-based flat file database.
    
    Usage
    -----
    var store = require('./store');
    
    store.open(STORE_FILE_LOCATION)
    
    store.data.groups.group1.blah = 3;
    store.write() // optional
    store.data.users = [{username: 'user1'}]
    
    store.close()
    
    NOTE:   open(fileLocation)  before making changes to `store.data`.
            write()             to write the current `store.data` to the file.
            close()             to write & close the file.
*/

module.exports = {
    data: file.data,
    open: open,
    close: close,
    write: write
}


const fs = require('fs');
const Promise = require('promise')

/*
    This object holds data about the currently open file
    
    If fileDescriptor != null, a file is open!
    Close that file before opening a new one.
*/
var file = {
    data: null,
    fileDescriptor: null,
};

/*
    @return {Boolean}
        true if file is open, false otherwise
    @private
*/
function isFileOpen() {
    return file.fileDescriptor !== null;
}

/*
    Opens the store file.
    
    @param {String} fileLocation
        Location of file which should be opened.
*/
function open(fileLocation) {
    if(isFileOpen()) {
        close().then(function(error) {
            if(!error) {
                proceed();
            } else {
                throw new Error(error)
            }
        })
    } else {
        proceed()
    }
    
    function proceed() {
        fs.open(fileLocation, 'a+', function(error, fileDescriptor) {
            
        })
    }
        
}

/*
    Closes the currently open file.
    
    @throws {Error} 
        file did not close properly. 
*/
function close() {
    return new Promse(function(resolve, reject) {
        if(isFileOpen()) {
            fs.close(file.fileDescriptor, function(error) {
                if(error) throw new Error(error);
                return resolve();
            });
        }
    });
}
"use strict";

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
    
    NOTE:   open(fileLocation)  before making changes to `store.data`, open a file.
                                If no fileLocation is provided, it opens the default location.
            write()             to write the current `store.data` to the file.
            close()             to write & close the file.
*/

const fs = require('fs');
const Promise = require('promise');

const FILE_ENCODING = 'utf-8'; // file encoding to use when reading/writing.
const DEFAULT_FILE_LOCATION = 'store.json'; // file location used when no other is provided.

var store = {}

/*
    This object holds data about the currently open file.
    
    json: 
        the json in the currently opened file.
        this is the variable you read/edit after opening the file.
        when you write/close the file, this variable is saved in the file.
    fileDescriptor: 
        the `fd` that is assigned by the operating system. 
        If fileDescriptor != null, a file is open!
        Close that file before opening a new one.
*/
var file = {
    json: {},
    fileDescriptor: null,
};

/*
    Clears an object without breaking references to that object.
    
    In other words, effectively doing this:
        obj = {}
    But without breaking other references to obj.
    
    @param {Object} obj
        Object whose properties should be cleared.
    @private
*/
function clearObject(obj) {
    for(var prop in obj) { 
        if(obj.hasOwnProperty(prop)) { 
            delete obj[prop]; 
        } 
    }
}

/*
    Make one object's properties the same as another's, without breaking any references to that object.
    
    In other words, effectively doing this:      
        obj = obj2
    But without breaking other references to obj.
    
    @param {Object} obj
        Object which should reflect the other object's properties.
        (It's original properties are deleted)
    @param {Object} obj2
        Object to be cloned.
    @private
*/
function copyObject(obj, obj2) {
    clearObject(obj);
    for (var prop in obj2) {
        if(obj2.hasOwnProperty(prop)) {
            obj[prop] = obj2[prop];
        }
    }
}

/*
    @return {Boolean}
        true if file is open, false otherwise
    @private
*/
store.isOpen = function isOpen() {
    return file.fileDescriptor !== null;
}

/**
    Opens a file and reads it it's content as JSON.
    Opening a file will fail if there is one open already.
    
    @param {String} [fileLocation]
        Location of file which should be opened.
        
    @throws {Error}
        If a file is already opened.
    
    @return {Promise}
*/
store.open = function open(fileLocation) {
    if(!fileLocation) fileLocation = DEFAULT_FILE_LOCATION;
    if(store.isOpen()) {
        throw new Error('File already open, close that one first.');
    } else {
        return new Promise(function(resolve, reject) {
            // 'a+' flag: Open file for reading and appending. The file is created if it does not exist.
            // TODO: fix the binding.open(pathModule._makeLong(path), path must be a string error
            fs.open(fileLocation, 'a+', function(error, fileDescriptor) {
                console.log('FileDescriptor:', fileDescriptor)
                fs.readFile(fileDescriptor, {encoding: FILE_ENCODING}, function(error, contents) {
                    if(error) return reject(error);

                    if(!contents) {
                        contents = {};
                    } else {
                        try {
                            contents = JSON.parse(contents);
                        } catch(syntaxError) {
                            return reject(syntaxError);
                        }
                    }

                    file.data = contents ? contents : {};
                    return resolve();
                });
            });

        });
    }
}

/**
    Closes the currently open file.
    
    @throws {Error} 
        File did not close properly or no file was open.
        
    @return {Promise}
*/
store.close = function close() {
    return new Promise(function(resolve, reject) {
        if(store.isOpen()) {
            store.write().then(function() {
                fs.close(file.fileDescriptor, function(error) {
                    if(error) throw new Error(error);
                    return resolve();
                });
            }, function(error) {
                return reject(error);
            })
        } else {
            throw new Error('Tried to close when no file was open.')
        }
    });
}

/**
    Saves current state of the data in the currently open file.
    
    @throws {Error}
        Fails to write when no file is not open!
        
    @return {Promise}
        Resolves when data is saved successfully!
*/
store.write = function write() {
    if(!store.isOpen()) {
        throw new Error('Tried to write when no file was open.');
    }
    
    return new Promise(function(resolve, reject) {
        var data = JSON.stringify(file.data);
        
        fs.write(file.fileDescriptor, data, FILE_ENCODING, function(error, written, string) {
            if(error) return reject(error);
            
            return resolve();
        });
    });
}

store.data = file.json

module.exports = store

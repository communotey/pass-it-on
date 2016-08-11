/*
    Store.js
    
    This module manages the keys and secrets.
*/

const STORE_FILE_NAME = 'store.js';

const fs = require('fs');
const Promise = require('promise')

// admin
function addUser(name) {
    // kl;ads
}

// admin
function createGroup(name) {
    
}


function addKeyToGroup() {
        
}

// recursive function that adds the groups user is part of + groups their group are part of
function getGroups(group, groups) {
    //TODO: get groups in groups into 1D array
    
    if (obj[group].groups_composed != []) {
        
        var fn = function next_level_recursion(v){ // sample async action
            // return new Promise(resolve => setTimeout(() => resolve(v * 2), 100));
            return new Promise(resolve => setTimeout(() => resolve(getGroups(group, groups), 100));
        };
        // map over forEach since it returns
        
        var actions = obj[groups].groups_composed.map(fn); // run the function over all items.
        
        // we now have a promises array and we want to wait for it
        
        var results = Promise.all(actions); // pass array of promises
        
        results.then(data => // or just .then(console.log)
            groups.concat(data) // [2, 4, 6, 8, 10]
        );
        
    }
    // else do nothing, i.e. base case is when there are no more groups to parse
}


// less params. is there overloading in js?
function getGroupList(user) {
    // TODO: forEach on all of the user's groups
    {
        
        getGroups(user, [group]);
    }
}


function deleteSecret(secret, user) {
    var groups = getGroupList(user);
    if ((user === "admin") | (user === "in_group")) // TODO: could be other users, but for now...
    {
        delete obj.secrets[secret];
    }
    else 
    {
        console.log("User not authenticated to do this action");
    }
}
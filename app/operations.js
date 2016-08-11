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
    var groups = obj.users[user].groups;
    
    var fn = function get_subgroups(v){ // sample async action
        return new Promise(resolve => setTimeout(() => resolve(getGroups(group, groups), 100));
    };
    // map over forEach since it returns
    
    var actions = groups.map(fn); // run the function over all items.
    
    // we now have a promises array and we want to wait for it
    
    var results = Promise.all(actions); // pass array of promises
    
    results.then(data => // or just .then(console.log)
        groups.concat(data) // [2, 4, 6, 8, 10]
    );
    
    return groups;
}


function deleteSecret(secret) {
    delete obj.secrets[secret];
}

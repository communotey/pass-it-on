
// admin
function createUser(name) {
    
    var user = generateUserKeys();
    
    store.data.users[name].salt = user.salt;
    store.data.users[name].groups = [];
    
    // user privkey encrypted with fernet
    store.data.users[name].privkey = user.privkey;
    
    if name === 'admin' {
        // TODO: encrypt user pubkey with fernet
        // TODO: immediately ask for user password
        // changePassword('admin', user.password, /* input */)
    }
    else {
        // TODO: encrypt user pubkey with admin pubkey
        store.data.users[name].pubkey = user.pubkey;
        
        
    // TODO: print password
    // TODO: "The following is the temporary password of the new user. Please put this in a safe place, and do not lose it, until you have given it to the person."
    }

}


// admin
// adminPriv: current user's private key (not the user being added)
function addUserToGroup(adminPriv, username, groupName) {
    
    // get user pubkey to get group's pubkey
    var pubkey = decryptCrypt(store.data.users[username].pubkey, adminPriv);
    
    // get group privkey
    var privkey = decryptCrypt(store.data.groups[groupName].users.admin, adminPriv);
    
    // encrypt privkey with user pubkey
    var crypt = encryptSecret(privkey, pubkey);
    
    store.data.groups[groupName].users[username] = crypt;
    store.data.users[username].groups += groupName;
    
}

// admin
function addGroupToGroup(childName, parentName, pubkey, password) {
    // TODO: get group private key
    // TODO: encrypt privkey with group pubkey
    groups[parentName].users[username] = crypt
    groups[childName].groups += parentName
    
}

// admin
function changeGroupKeys(adminPrivkey) {
    // recrypt all group keys with new privkey
    // recrypt all group secrets with group privkey
}

// admin
function changeSecret(groupPrivkey, value) {
    // recrypt with new value using group private key
}


// admin
function createGroup(name, pubkey) {
    store.data.groups[name] = {};
    
}


// returns nothing
function changePassword(user, currentPassword, newPassword) {
    
    // decrypt private key
    var secret = decryptKeysSym(store.data.users[user].privkey, currentPassword, store.data.users[user].salt);
    
    // recrypt private key
    encryptKeysSym(secret, newPassword, store.data.users[user].salt);
}


// name: of secret
// value: of secret
function addSecretToGroup(group, name, value, pubkey) {
    
    // creator of group can add people
    // creator of group adds admin
    var cipher = crypto.encrypt_secret(value, pubkey);
    store.data.groups[group].secrets[name] = cipher;
    store.data.secrets[name] = value;
}

// recursive function that adds the groups user is part of + groups their group are part of
function getGroups(group, groups) {
    //TODO: get groups in groups into 1D array
    
    if (obj[group].groups_composed != []) {
        
        var fn = function nextLevelRecursion(v){ // sample async action
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
    var groups = store.data.users[user].groups;
    
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
    delete store.data.secrets[secret];
}

function decryptUserPrivate(user, password) {
    store.data.users[user].private;
    
}

function decryptAdminKeys(password) {
    store.data.users.admin.public
    store.data.users.admin.private
    var keys = {
        privkey: "private",
        pubkey: "public"
    };
    return keys;
}

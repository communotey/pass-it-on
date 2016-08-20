function createAdmin() {
    
    var password;  // TODO: immediately ask for user password
    var user = generateAdminKeys(password);
    
    // encrypt user pubkey with fernet
    store.data.users[name].pubkey = user.pubkey;
    
    // encrypt user privkey with fernet
    store.data.users[name].privkey = user.privkey;
    
    store.data.users[name].salt = user.salt;
    // no groups array for admin
    
}


// admin
// adminPub: current user's public key
function createUser(adminPub, name) {
    
    var user = generateUserKeys()
    
    // encrypt user pubkey with admin pubkey
    store.data.users[name].pubkey = encryptSecret(adminPub, user.pubkey);
        
    // TODO: print password
    // TODO: "The following is the temporary password of the new user. Please put this in a safe place, and do not lose it, until you have given it to the person."
    
    // encrypt user privkey with fernet
    store.data.users[name].privkey = user.privkey;
    
    store.data.users[name].salt = user.salt;
    store.data.users[name].groups = [];

}


// admin
// adminPriv: current user's private key (not the user being added)
function addUserToGroup(adminPriv, username, group) {
    
    // get user pubkey to get group's pubkey
    var pubkey = decryptCrypt(store.data.users[username].pubkey, adminPriv);
    
    // get group privkey
    var privkey = decryptCrypt(store.data.groups[group].users.admin, adminPriv);
    
    // encrypt privkey with user pubkey
    var crypt = encryptSecret(privkey, pubkey);
    
    store.data.groups[group].users[username] = crypt;
    store.data.users[username].groups += group;
    
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
function addSecretToGroup(uPriv, group, name, value) {
    
    // TODO: get group pubkey using uPriv
    
    // creator of group can add people
    // creator of group adds admin
    var cipher = crypto.encrypt_secret(value, pubkey);
    store.data.groups[group].secrets[name] = cipher;
    store.data.secrets[name] = value;
}

// recursive function that adds the groups user is part of + groups their group are part of
function getGroups(group, groups) {
    //TODO: get groups in groups into 1D array
    
    if (store.data.groups[group].groups != []) {
        
        var fn = function nextLevelRecursion(v){ // sample async action
            // return new Promise(resolve => setTimeout(() => resolve(v * 2), 100));
            return new Promise(resolve => setTimeout(() => resolve(getGroups(group, groups), 100));
        };
        // map over forEach since it returns
        
        var actions = store.data.groups[groups].groups.map(fn); // run the function over all items.
        
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

function deleteSecretLoop(group, secret) {
    if store.data.groups[group].secrets[secret] {
        delete store.data.groups[group].secrets[secret];
    }
}

function deleteSecret(secret) {
    delete store.data.secrets[item];
    
    // delete wherever else the item is located
    // delete store.data.groups.*.secrets[secret]
    
    var fn = function noMoreSecrets(v){ // sample async action
      return new Promise(resolve => setTimeout(() => resolve(deleteSecretLoop(v, secret), 100));
    };
    // map over forEach since it returns
    
    var actions = store.data.groups.map(noMoreSecrets); // run the function over all items.
    
    // we now have a promises array and we want to wait for it
    
    var results = Promise.all(actions); // pass array of promises
    
    results.then(data => // or just .then(console.log)
      // I don't think we're waiting for something to happen
    );
    
}

function deleteUserLoop(group, user) {
    delete store.data.groups[group].users.read[user];

}

function deleteUser(user) {
    
    // for each in store.data.users[item].groups, delete user key from store.data.groups.group
    
    // delete store.data.groups.*.secrets[secret]
    
    var fn = function noMoreUser(v){ // sample async action
      return new Promise(resolve => setTimeout(() => resolve(deleteUserLoop(v, user), 100));
    };
    // map over forEach since it returns
    
    var actions = store.data.users[user].groups.map(noMoreUser); // run the function over all items.
    
    // we now have a promises array and we want to wait for it
    
    var results = Promise.all(actions); // pass array of promises
    
    results.then(data => // or just .then(console.log)
      // I don't think we're waiting for something to happen
    );
    
    delete store.data.users[user];
}

function decryptUserPrivate(user, password) {
    return decryptKeysSym(store.data.users[user].private, password, store.data.users[user].salt)
}

function decryptAdminKeys(password) {
    
    var pubkey = decryptKeysSym(store.data.users.admin.public, password, store.data.users.admin.salt)
    var privkey = decryptKeysSym(store.data.users.admin.private, password, store.data.users.admin.salt)
    
    var keys = {
        privkey: privkey,
        pubkey: pubkey
    };
    return keys;
}

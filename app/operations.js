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
    var pubkey = decryptCryptSym(store.data.users[username].pubkey, adminPriv, store.data.users[username].salt);
    
    // get group privkey
    var privkey = decryptCrypt(store.data.groups[group].users.read.admin, adminPriv);
    
    // encrypt privkey with user pubkey
    var crypt = encryptSecret(privkey, pubkey);
    
    store.data.groups[group].users.read[username] = crypt;
    store.data.users[username].groups += group;
    
}

// admin
function addGroupToGroup(adminPrivkey, childName, parentName, password) {
    // get child pubkey
    var pubkey = decryptCrypt(store.data.groups[childname].write.admin, adminPrivkey);
    
    // get parent privkey
    var privkey = decryptCrypt(store.data.groups[parentName].read.admin, adminPrivkey);
    
    // encrypt parent privkey with child pubkey
    var crypt = encryptSecret(privkey, pubkey);
    
    store.data.groups[parentName].users.read[childName] = crypt;
    store.data.groups[childName].groups += parentName;
    
}

// admin
function changeGroupKeys(adminPrivkey) {
    // TODO: decrypt all group keys with new privkey
    // TODO: recrypt all group keys with new privkey
    // TODO: decrypt all group secrets with group privkey
    // TODO: recrypt all group secrets with group privkey
}

// admin
function changeSecret(user, uPriv, group, secretName, value) {
    
    var privkey = crypto.decryptCrypt(store.data.groups[group].read[user], uPriv)
    
    // decrypt passphrase with group private key
    var passphrase = crypto.decryptCrypt(store.data.groups[group].secrets[secretName], privkey);
    
    var salt = store.data.groups[group].salt;
    
    // crypt new value using same passphrase
    var crypt = crypto.encryptSecretSym(value, passphrase, salt);
    
    // store value
    store.data.secrets[secretName] = crypt;
}

// admin
function changeSecretPassphrase(user, uPriv, group, secretName) {
    
    var salt = store.data.groups[group].salt;
    
    // TODO: decrypt secret
    // TODO: generate passphrase
    
    // recrypt secret with new passphrase
    var crypt = crypto.encryptSecretSym(secret, passphrase, salt);
    
    // store new values
    store.data.groups[group].secrets[secretName] = passphraseCrypt;
    store.data.secrets[secretName] = crypt;
}


// admin
function createGroup(adminPubkey, name, pubkey) {
    store.data.groups[name] = {};
    store.data.groups[name].groups = [];
    
    // generate pubkey, privkey
    var keys = crypto.generateKeys();
    store.data.groups[name].write.admin = encryptSecret(keys.pubkey, adminPubkey);
    store.data.groups[name].read.admin = encryptSecret(keys.privkey, adminPubkey);
}


// returns nothing
function changePassword(user, currentPassword, newPassword) {
    
    // decrypt private key
    var secret = decryptCryptSym(store.data.users[user].privkey, currentPassword, store.data.users[user].salt);
    
    // recrypt private key
    encryptSecretSym(secret, newPassword, store.data.users[user].salt);
}


// name: of secret
// value: of secret
function addSecretToGroup(user, uPriv, group, name, value) {
    
    // get group pubkey using uPriv
    var pubkey = crypto.decryptCrypt(store.data.groups[group].users.write[user], uPriv);
    
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
    return decryptCryptSym(store.data.users[user].private, password, store.data.users[user].salt)
}

function decryptAdminKeys(password) {
    
    var pubkey = decryptCryptSym(store.data.users.admin.public, password, store.data.users.admin.salt)
    var privkey = decryptCryptSym(store.data.users.admin.private, password, store.data.users.admin.salt)
    
    var keys = {
        privkey: privkey,
        pubkey: pubkey
    };
    return keys;
}

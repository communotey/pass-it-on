const security = require('./security');
const KeyPair = require('./KeyPair');

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
    var pubkey = decryptHashedCryptSym(store.data.users[username].pubkey, adminPriv, store.data.users[username].salt);
    
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
function changeGroupKeys(adminPrivkey, group) {
    store.open();
    
    var groupData = store.data.groups[group];
    
    var keys = security.generateKeys()
    var newPrivKey = keys.privkey;
    var newPubKey = keys.pubkey;
    
    // decrypt all group keys with admin privkey
    var groupPrivKey = security.decryptCrypt(store.data.groups[group].read.admin, adminPrivkey);
    var groupPubKey = security.decryptCrypt(store.data.groups[group].write.admin, adminPrivkey);

    var decryptedGroupKeys = [];
    var recryptedGroupKeys = [];
    var decryptedGroupSecrets = [];
    var recryptedGroupSecrets = [];
    
    
    // crypt should be the read/write keys for the group
    
    var kp = new KeyPair(groupData.write., groupData.read.);
    
    var decryptedGroupKey = security.decryptCrypt(store.data.groups[group]., adminPrivKey);
    decryptedGroupKeys.push(decryptedGroupKey);
    
    // recrypt all group keys with new pubkey
    for(var i = 0; i < decryptedGroupKey.length; i++) {
        var recryptedGroupKey = security.encryptSecret(decryptedGroupKeys[i], newPubKey);
        recryptedGroupKeys.push(recryptedGroupKey);
    }
    
    // decrypt all group secrets with group privkey
    for(var i = 0; i < decryptedGroupSecrets.length; i++) {
        var decryptedGroupSecret = security.decryptCrypt(crypt, groupPrivKey);
        decryptedGroupSecrets.push(decryptedGroupSecret);
    }
    
    // recrypt all group secrets with group pubkey
    for(var i = 0; i < decryptedGroupSecrets.length; i++) {
        var decryptedGroupSecret = security.encryptSecret(decryptedGroupSecrets[i], groupPubKey);
        recryptedGroupSecrets.push(decryptedGroupSecret);
    }
}

// admin
function changeSecret(user, uPriv, group, secretName, value) {
    
    var privkey = security.decryptCrypt(store.data.groups[group].read[user], uPriv)
    
    // decrypt passphrase with group private key
    var passphrase = security.decryptCrypt(store.data.groups[group].secrets[secretName], privkey);
    
    var salt = store.data.groups[group].salt;
    
    // crypt new value using same passphrase
    var crypt = security.encryptHashedSecretSym(value, passphrase, salt);
    
    // store value
    store.data.secrets[secretName] = crypt;
}

// admin
function changeSecretPassphrase(user, uPriv, group, secretName) {
    
    // get group privates
    var privkey = decryptCrypt(store.data.groups[group].users.read[user], uPriv);
    
    // get group passphrase
    var passOld = decryptCrypt(store.data.groups[group].secrets[secretName], privkey);
    
    // decrypt secret
    var secret = decryptCryptSym(store.data.secrets[secretName], passOld)
    
    // generate passphrase
    var pass = security.generatePassphrase();
    
    // recrypt secret with new passphrase
    var crypt = security.encryptSecretSym(secret, passphrase);
    
    // store new values
    store.data.groups[group].secrets[secretName] = passphraseCrypt;
    store.data.secrets[secretName] = crypt;
}


// admin
function createGroup(adminPubkey, name, pubkey) {
    store.data.groups[name] = {};
    store.data.groups[name].groups = [];
    
    // generate pubkey, privkey
    var keys = security.generateKeys();
    store.data.groups[name].write.admin = encryptSecret(keys.pubkey, adminPubkey);
    store.data.groups[name].read.admin = encryptSecret(keys.privkey, adminPubkey);
}


// returns nothing
function changePassword(user, currentPassword, newPassword) {
    
    // decrypt private key
    var secret = decryptHashedCryptSym(store.data.users[user].privkey, currentPassword, store.data.users[user].salt);
    
    // recrypt private key
    encryptHashedSecretSym(secret, newPassword, store.data.users[user].salt);
}


// name: of secret
// value: of secret
function addSecretToGroup(user, uPriv, group, name, value) {
    
    // get group pubkey using uPriv
    var pubkey = security.decryptCrypt(store.data.groups[group].users.write[user], uPriv);
    
    // creator of group can add people
    // creator of group adds admin
    var cipher = security.encrypt_secret(value, pubkey);
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
    
    var fn = function getSubgroups(v){ // sample async action
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
    return decryptHashedCryptSym(store.data.users[user].private, password, store.data.users[user].salt)
}

function exportSecret(name, value) {
    console.log("edit me Haris")
}


function decryptAdminKeys(password) {
    
    var pubkey = decryptHashedCryptSym(store.data.users.admin.public, password, store.data.users.admin.salt)
    var privkey = decryptHashedCryptSym(store.data.users.admin.private, password, store.data.users.admin.salt)
    
    var keys = {
        privkey: privkey,
        pubkey: pubkey
    };
    return keys;
}

function SecretNotFoundError(message) {
    this.name = "SecretNotFoundError";
    if (message != ""){
        this.message = (("Secret, " + message + ", not found or not available to specified user.") || "");
    }
    else {
        this.message = (("No secrets found or not available to specified user.") || "");
    }
}
SecretNotFoundError.prototype = Error.prototype;

// get value of a secret available to user
function fetchSecret(userPriv, user, secretName) {

    function found(node) {
        if (store.groups[node].secrets[secretName]) {
            return true;
        }
        else {
            return false;
        }
    }
    
    function loopGroups(group) {
        // group is parent
        // push all groups under that parent
        var groupArr = store.data.groups[group].groups;
        nodeStack.push(groupArr);
        for(int i = 0; i< groupArr.length; i++) {
            pathStack.push(groupArr[i]);
            if (found(groupArr[i])) {             // is it part of the group?
                return true;
            }
            else if (loopGroups(groupArr[i])) {   // is it part of subgroups?
                return true;
            }
            else {
                pathStack.pop();
            }
        }
        nodeStack.pop();
        return false;
    }
    
    var nodeStack = [];
    nodeStack[0] = [];  // each element represents a dimension
    var groupArr = store.data.users[user].groups;
    nodeStack[0].concat(groupArr);  // groups need to check
    var pathStack = []; // groups needed to obtain secret
    
    for(int i = 0; i< groupArr.length; i++) {
        pathStack.push(groupArr[i]);
        if (found(groupArr[i])) {             // is it part of the group?
            break;
        }
        else if (loopGroups(groupArr[i])) {   // is it part of subgroups?
            break;
        }
        pathStack.pop();
    }
    if (pathStack === []) {
        throw SecretNotFoundError(secretName);  // if not found, return error message
    }
    else {
        var privkey = userPriv;
        for (int i = 0; i < pathStack.length; i++) {
            
            privkey = security.decryptCrypt(store.data.groups[pathStack[i]].users[user], privkey);
        }
        var secret =  security.decryptCryptSym(store.data.secrets[secretName], privkey)
        exportSecret(secretName, secret)
    }
}

function fetchSecrets(userPriv, user) {
    
    function loopGroups(group) {
        // group is parent
        // push all groups under that parent
        var groupArr = store.data.groups[group].groups;
        nodeStack.push(groupArr);
        for(int i = 0; i< groupArr.length; i++) {
            pathStack.push(groupArr[i]);
            // TODO: privStack.push(security.decryptCrypt(store.groups[groupArr[i]].users.read[user], FIX: privStack[groupArr[i-2]]));
            if (groupArr[i] != []) {    // are there subgroups?
                loopGroups(groupArr[i])
            }
            // TODO: pop secrets onto privStack
            // for each secret in group, exportSecret(name, value)
            pathStack.pop();
            privStack.pop();
        }
        nodeStack.pop();
    }
    
    var nodeStack = [];
    nodeStack[0] = [];  // each element represents a dimension
    var groupArr = store.data.users[user].groups;
    nodeStack[0].concat(groupArr);  // groups need to check
    var pathStack = []; // groups needed to obtain secret
    var privStack = []; // unlocked private keys of each respective group
    
    // TODO: put userpriv onto privStack
    for(int i = 0; i< groupArr.length; i++) {
        pathStack.push(groupArr[i]);
        privStack.push(security.decryptCrypt(store.groups[groupArr[i]].users.read[user], userPriv))
        
        if (groupArr[i] != []) {    // are there subgroups?
            loopGroups(groupArr[i])
        }
        // TODO: pop secrets onto privStack
        // for each secret in group, exportSecret(name, value)
        pathStack.pop();
        privStack.pop();
    }
    if (pathStack === []) {
        throw SecretNotFoundError("");  // if not found, return error message
    }
    else {
        // TODO: decryption time!!
        return pathStack;
    }
}


// get names of ALL secrets available to a user
function listSecrets(user) {
    // get keys from groups in groups
    var groups = getGroupList(user);
    var secrets = []
    
    var fn = function tellMeYourSecrets(scientist){
        secrets.concat(store.data.groups[scientist].secrets.keys);
    };
    groups.forEach(tellMeYourSecrets);
    
    return secrets;
    
}

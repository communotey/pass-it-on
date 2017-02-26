const security = require('./security');
const jsonfile = require('jsonfile');

const STORE_FILE_LOCATION = 'store.json'

function readJson() {
    return jsonfile.readFileSync(STORE_FILE_LOCATION);
}

function saveJson(json) {
    jsonfile.writeFileSync(STORE_FILE_LOCATION, json);
}

var operations = {}

operations.init = function init(password) {
  json = {
    users: {},
    groups: {},
    secrets: {}
  };
  jsonfile.writeFileSync(STORE_FILE_LOCATION, json)

  // generate admin user
  operations.createAdmin(password);

  console.log('operations.init done!')
}

// password: set the value of the admin password
operations.createAdmin = function createAdmin(password) {
    var name = "admin"
    var user = security.generateAdminKeys(password).then(function(user) {
        var json = jsonfile.readFileSync(STORE_FILE_LOCATION);
        if(!json.users) {
            json.users = {}
        }
    
        if(!json.users[name]) {
            json.users[name] = {}
        }
    
        // encrypt user pubkey with fernet
        json.users[name].pubkey = user.pubkey;
    
        // encrypt user privkey with fernet
        json.users[name].privkey = user.privkey;
    
        json.users[name].salt = user.salt;
        // no groups array for admin
        jsonfile.writeFileSync(STORE_FILE_LOCATION, json);
        console.log('createAdmin done!') 
    });
    
    saveJson(json)
}

// admin
// adminPub: current user's public key
operations.createUser = function createUser(adminPub, name) {
    var user = security.generateUserKeys()

    // encrypt user pubkey with admin pubkey
    json.users[name].pubkey = encryptSecret(adminPub, user.pubkey);

    console.log("The following is the temporary password of the new user. Please put this in a safe place, and do not lose it, until you have given it to the person.")
    console.log(user.password)

    // encrypt user privkey with fernet
    json.users[name].privkey = user.privkey;

    json.users[name].salt = user.salt;
    json.users[name].groups = [];
    saveJson(json)

}

// admin-only, auth version
operations.createUserAuth = function createUserAuth (adminPassword, name) {
    var json = readJson();

    var adminPub = operations.decryptCryptSym(json.admin.pubkey, adminPassword)
    operations.createUser(adminPub, name)
    saveJson(json)
}

/*
    run by admin only

    @param {String} adminPriv: current user's private key (not the user being added)
*/
operations.addUserToGroup = function addUserToGroup(adminPriv, username, group) {
    var json = readJson();

    // get user pubkey to get group's pubkey
    var pubkey = security.decryptHashedCryptSym(json.users[username].pubkey, adminPriv, json.users[username].salt);

    // get group privkey
    var privkey = operations.decryptCrypt(json.groups[group].users.read.admin, adminPriv);

    // encrypt privkey with user pubkey
    var crypt = operations.encryptSecret(privkey, pubkey);

    json.groups[group].users.read[username] = crypt;
    json.users[username].groups += group;
    saveJson(json)

}

// admin-only
operations.addGroupToGroup = function addGroupToGroup(adminPrivkey, childName, parentName) {
    // get child pubkey
    var pubkey = operations.decryptCrypt(json.groups[childname].write.admin, adminPrivkey);

    // get parent privkey
    var privkey = operations.decryptCrypt(json.groups[parentName].read.admin, adminPrivkey);

    // encrypt parent privkey with child pubkey
    var crypt = operations.encryptSecret(privkey, pubkey);

    json.groups[parentName].users.read[childName] = crypt;
    json.groups[childName].groups += parentName;
    saveJson(json)

}


// admin-only
operations.changeGroupKeys = function changeGroupKeys(adminPrivkey, group) {
    var json = jsonfile.readFileSync(STORE_FILE_LOCATION)

    // TODO // FIXME // I just realized that this isn't done lol

    var groupData = json.groups[group];

    var keys = security.generateKeys()
    var newPrivKey = keys.privkey;
    var newPubKey = keys.pubkey;

    // decrypt all group keys with admin privkey
    var groupPrivKey = security.decryptCrypt(json.groups[group].read.admin, adminPrivkey);
    var groupPubKey = security.decryptCrypt(json.groups[group].write.admin, adminPrivkey);

    var decryptedGroupKeys = [];
    var recryptedGroupKeys = [];
    var decryptedGroupSecrets = [];
    var recryptedGroupSecrets = [];


    // crypt should be the read/write keys for the group
    var decryptedGroupKey = security.decryptCrypt(json.groups[group], adminPrivKey);
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
    
    saveJson(json)
}

// admin-only
operations.changeSecret = function changeSecret(user, uPriv, secretName, value) {

    // decrypt passphrase with group private key
    var passphrase = operations.fetchSecretPassphrase(uPriv, user, secretName)

    // crypt new value using same passphrase
    var crypt = security.encryptSecretSym(value, passphrase);

    // store value
    json.secrets[secretName] = crypt;
    saveJson(json)
}

// admin-only
operations.changeSecretPassphrase = function changeSecretPassphrase(user, uPriv, group, secretName) {
    var json = readJson();
    // get group privates
    var privkey = operations.decryptCrypt(json.groups[group].users.read[user], uPriv);

    // get group passphrase
    var passOld = operations.decryptCrypt(json.groups[group].secrets[secretName], privkey);

    // decrypt secret
    var secret = operations.decryptCryptSym(json.secrets[secretName], passOld)

    // generate passphrase
    var pass = security.generatePassphrase();

    // recrypt secret with new passphrase
    var crypt = security.encryptSecretSym(secret, pass);

    // store new values
    json.groups[group].secrets[secretName] = crypt;
    json.secrets[secretName] = crypt;
    saveJson(json)
}


// admin-only
operations.createGroup = function createGroup(adminPubkey, name) {
    var json = readJson()
    
    json.groups[name] = {};
    json.groups[name].groups = [];

    // generate pubkey, privkey
    var keys = security.generateKeys();
    json.groups[name].write.admin = operations.encryptSecret(keys.pubkey, adminPubkey);
    json.groups[name].read.admin = operations.encryptSecret(keys.privkey, adminPubkey);
    
    saveJson(json)
}

// admin-only, auth version
operations.createGroupAuth = function createGroupAuth (adminPassword, name) {
    var json = readJson();
    var saltBuffer = Buffer.from(json.users.admin.salt.data)
    
    var adminPub = security.decryptHashedCryptSym(json.users.admin.pubkey, adminPassword, saltBuffer)
    operations.createGroup(adminPub, name)
    
    saveJson(json);
}

// returns nothing
operations.changePassword = function changePassword(user, currentPassword, newPassword) {
    var json = readJson();
    
    // decrypt private key
    var secret = security.decryptHashedCryptSym(json.users[user].privkey, currentPassword, json.users[user].salt);

    // recrypt private key
    operations.encryptHashedSecretSym(secret, newPassword, json.users[user].salt);

    saveJson(json);
}

/*
// name: of secret
// value: of secret
*/

operations.addSecretToGroup = function addSecretToGroup(user, uPriv, group, name, value) {
    var json = readJson()
    // get group pubkey using uPriv
    var pubkey = security.decryptCrypt(json.groups[group].users.write[user], uPriv);

    var cipher = security.encrypt_secret(value, pubkey);
    json.groups[group].secrets[name] = cipher;
    json.secrets[name] = value;
    saveJson(json);
}

operations.addSecretToGroupAuth = function addSecretToGroupAuth(user, password, group, name, value) {
    var uPriv = "" // TODO: get user private key
    // secret.
    operations.addSecretToGroup(user, uPriv, group, name, value)
}

// recursive function that adds the groups user is part of + groups their group are part of
operations.getGroups = function getGroups(group, groups) {
    var json = readJson()
    // TODO: get groups in groups into 1D array

    if (json.groups[group].groups != []) {

        var fn = function nextLevelRecursion(v){ // sample async action
            // return new Promise(resolve => setTimeout(() => resolve(v * 2), 100));
            return new Promise(resolve => setTimeout(() => resolve(getGroups(group, groups), 100)));
        };
        // map over forEach since it returns

        var actions = json.groups[groups].groups.map(fn); // run the function over all items.

        // we now have a promises array and we want to wait for it

        var results = Promise.all(actions); // pass array of promises

        results.then(data => // or just .then(console.log)
            groups.concat(data) // [2, 4, 6, 8, 10]
        );

    }
    // else do nothing, i.e. base case is when there are no more groups to parse
}


// less params. is there overloading in js?
operations.getGroupList = function getGroupList(user) {
    var json = readJson()
    
    var groups = json.users[user].groups;

    var fn = function getSubgroups(group){ // sample async action
        return new Promise(resolve => setTimeout(() => resolve(operations.getGroups(group, groups), 100)));
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

operations.deleteSecretLoop = function deleteSecretLoop(group, secret) {
    var json = readJson()
    if (json.groups[group].secrets[secret]) {
        delete json.groups[group].secrets[secret];
    }
    saveJson(json);
}

operations.deleteSecret = function deleteSecret(secret) {
    var json = readJson()
    delete json.secrets[item];

    // delete wherever else the item is located
    // delete json.groups.*.secrets[secret]

    var fn = function noMoreSecrets(v){ // sample async action
      return new Promise(resolve => setTimeout(() => resolve(operations.deleteSecretLoop(v, secret), 100)));
    };
    // map over forEach since it returns

    var actions = json.groups.map(noMoreSecrets); // run the function over all items.

    // we now have a promises array and we want to wait for it

    var results = Promise.all(actions); // pass array of promises

    results.then(data => {}// or just .then(console.log)
      // I don't think we're waiting for something to happen
    );
    
    saveJson(json);
}

// remove access of a group to a secret
operations.removeSecret = function removeSecret(secret, group) {
    var json = readJson()
    delete json.groups[group].secrets[secret]
    saveJson(json);
}

operations.removeGroup = function removeGroup(child, parent) {
    var json = readJson()
    var index = json.groups[child].groups.indexOf(parent)
    if(index !== -1) {
        json.groups[child].groups.splice(index, 1);
    }

    delete json.groups[parent].users.read[child]
    saveJson(json);
}

operations.removeUser = function removeUser(user, group) {
    var json = readJson()
    var index = json.users[user].groups.indexOf(group)
    if(index !== -1) {
        json.users[user].groups.splice(index, 1);
    }

    delete json.groups[group].users.read[user]
    saveJson(json);
}

operations.deleteGroup = function deleteGroup(group) {
    var json = readJson()
    
    // remove parents' memories of children
    for (var parent in json.groups[group].groups) {
        delete json.groups[parent].users.read[group]
    }


    // if secret is only from given group, delete it
    for (var secret in json.groups[group].secrets) {
        var multi = false
        for (var g in json.groups) {
            if (g.secrets.includes(secret) && g != group) {
                multi = true
                break
            }
        }
        if (!multi) {
            delete json.secrets[secret]
        }
    }

    // delete group from users
    for (var user in json.groups[group].users.read) {
        operations.removeUser(user, group)
    }

    // delete group object
    delete json.groups[group]
    saveJson(json);
}

function deleteUserLoop(group, user) {
    var json = readJson()
    delete json.groups[group].users.read[user];
    saveJson(json);

}

operations.deleteUser = function deleteUser(user) {
    var json = readJson()
    // for each in json.users[item].groups, delete user key from json.groups.group

    // delete json.groups.*.secrets[secret]

    var fn = function noMoreUser(v){ // sample async action
      return new Promise(resolve => setTimeout(() => resolve(deleteUserLoop(v, user), 100)));
    };
    // map over forEach since it returns

    var actions = json.users[user].groups.map(noMoreUser); // run the function over all items.

    // we now have a promises array and we want to wait for it

    var results = Promise.all(actions); // pass array of promises

    results.then(data => {}// or just .then(console.log)
      // I don't think we're waiting for something to happen
    );

    delete json.users[user];
    saveJson(json);
}

operations.decryptUserPrivate = function decryptUserPrivate(user, password) {
    var json = readJson()
    return security.decryptHashedCryptSym(json.users[user].private, password, json.users[user].salt)
}

operations.exportSecret = function exportSecret(name, value) {
    // TODO: @Kemal, look over the following two APIs we could have:
    //
    // in a javascript file anywhere
    //      process.env.secrets.API_KEY
    //          positive ++++ we can override environment variables via commandline
    //          negative - occupy the "secrets" namespace only in environmental variables
    //      global.secrets.API_KEY
    //          positive ++ you just have to type secrets.API_KEY now
    //          negative ----- occupy the "secrets" namespace everywhere in the file...

    if(!process.env.secrets) process.env.secrets = {};
    process.env.secrets[name] = value;
}


operations.decryptAdminKeys = function decryptAdminKeys(password) {

    var pubkey = security.decryptHashedCryptSym(json.users.admin.public, password, json.users.admin.salt)
    var privkey = security.decryptHashedCryptSym(json.users.admin.private, password, json.users.admin.salt)

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
operations.fetchSecret = function fetchSecret(userPriv, user, secretName) {
    var json = readJson()
    var passphrase = operations.fetchSecretPassphrase(user, userPriv, secretName)

    var secret =  security.decryptCryptSym(json.secrets[secretName], userPriv)
    operations.exportSecret(secretName, secret)

}

// get value of a secret available to user
operations.fetchSecretPassphrase = function fetchSecretPassphrase (user, userPriv, secretName) {
    var json = readJson();

    function found(node) {
        if (json.groups[node].secrets[secretName]) {
            return true;
        }
        else {
            return false;
        }
    }

    function loopGroups(group) {
        // group is parent
        // push all groups under that parent
        var groupArr = json.groups[group].groups;
        nodeStack.push(groupArr);
        for(var i = 0; i< groupArr.length; i++) {
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

    // TODO: check secret integrity by checking public keys

    var nodeStack = [];
    nodeStack[0] = [];  // each element represents a dimension
    var groupArr = json.users[user].groups;
    nodeStack[0].concat(groupArr);  // groups need to check
    var pathStack = []; // groups needed to obtain secret

    for(var i = 0; i< groupArr.length; i++) {
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
        for (var i = 0; i < pathStack.length; i++) {

            privkey = security.decryptCrypt(json.groups[pathStack[i]].users.read[user], privkey);
        }
        return privkey
    }
}

operations.fetchSecrets = function fetchSecrets(userPriv, user) {
    var json = readJson();

    function loopGroups(group) {
        var groupArr = json.groups[group].groups;
        nodeStack.push(groupArr);
        for (var i = 0; i< groupArr.length; i++) {
            pathStack.push(groupArr[i]);
            privStack.push(security.decryptCrypt(json.groups[groupArr[i]].users.read[user], privStack[i]));

            if (groupArr[i] != []) {    // are there subgroups?
                loopGroups(groupArr[i])
            }

            pathStack.pop();
            var privkey = privStack.pop();

            for (var key in json.groups.secrets) {
                var secret = security.decryptCryptSym(json.secrets[key], privkey)
                operations.exportSecret(key, secret)
            }
        }
        nodeStack.pop();
    }

    var nodeStack = [];
    nodeStack[0] = [];  // each element represents a dimension
    var groupArr = json.users[user].groups;
    nodeStack[0].concat(groupArr);  // groups need to check
    var pathStack = []; // groups needed to obtain secret
    var privStack = []; // unlocked private keys of each respective group

    for(var i = 0; i< groupArr.length; i++) {
        pathStack.push(groupArr[i]);
        privStack.push(security.decryptCrypt(json.groups[groupArr[i]].users.read[user], userPriv))

        if (groupArr[i] != []) {    // are there subgroups?
            loopGroups(groupArr[i])
        }
        pathStack.pop();
        var privkey = privStack.pop();

        for (var key in json.groups.secrets) {
            var secret = security.decryptCryptSym(json.secrets[key], privkey)
            operations.exportSecret(key, secret)
        }
    }
    if (pathStack === []) {
        throw SecretNotFoundError("");  // if not found, return error message
    }
}


// get names of ALL secrets available to a user
operations.listSecrets = function listSecrets(user) {
    var json = readJson()
    
    // get keys from groups in groups
    var groups = operations.getGroupList(user);
    var secrets = []

    var tellMeYourSecrets = function tellMeYourSecrets(scientist){
        secrets.concat(json.groups[scientist].secrets.keys);
    };
    groups.forEach(tellMeYourSecrets);

    return secrets;

}

module.exports = operations

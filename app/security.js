var Promise = require("promise");

var crypto = require("crypto");
var fernet = require("fernet");
var pgp = require("openpgp");

var security = {}

// var keybase = require("kbpgp");
// var keybase-usr = require("keybase-user");

// var bignum = require('bignum');
var b64 = require('base64url');

pgp.initWorker({ path:'openpgp.worker.js' });

security.hashPassword = function hashPassword (password, salt) {
    var pbkdf2Hash = Promise.denodeify(crypto.pbkdf2)
    var derivedKey = pbkdf2Hash(password, salt, 100000, 32, 'sha512');
    var hashed = b64.encode(derivedKey);
    
    var secret = new fernet.Secret(hashed);
    
    var token = new fernet.Token({
        secret: secret,
    });
    
    return token;
}


security.generateKeys = function generateKeys () {
    // NOTE: yes there is a passphrase that can encrypt the private key, but it's using an outdated standard
    // Hence: we still need the AES thing above for password
    
    var privkey, pubkey;
    var options = {
        // userIds: [{ name:'Jon Smith', email:'jon@example.com' }], // multiple user IDs, could be group/username key
        numBits: 4096,                                            // RSA key size 
        // passphrase: 'super long and hard to guess secret'         // optional, protects the private key 
    };
     
    pgp.generateKey(options).then(function(key) {
        privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... ' 
        pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... ' 
    });
    var keys = {
        privkey: privkey,
        pubkey: pubkey
    }
    return keys
}

// non-hashed symmetric key generation
// when a non-user-generated key is needed
security.generatePassphrase = function generatePassphrase() {
    var bytes = crypto.randomBytes(32);
    var passphrase = b64.encode(bytes, {encoding: "utf8"});
    return passphrase;
}

// encrypt with non-hashed symmetric encryption
// when a non-user-generated key is needed
security.encryptSecretSym = function encryptSecretSym(secret, passphrase) {
    var phrase = new fernet.Secret(passphrase);
    
    var token = new fernet.Token({
        secret: phrase,
    });
    // fernet encrypt
    return token.encode(secret);
    
}

security.decryptCryptSym = function decryptCryptSym(crypt, passphrase) {
    var phrase = new fernet.Secret(passphrase);
    
    var token = new fernet.Token({
        secret: phrase,
    });
    // fernet decrypt
    return token.decode(crypt);

}

// symmetric encryption using fernet, using hashed password
security.encryptHashedSecretSym = function encryptHashedSecretSym(secret, passphrase, salt) {

    // generate hash with password+salt
    var token = hashPassword(passphrase, salt);
    
    // fernet encrypt with hash
    return token.encode(secret);
}

// symmetric decryption using fernet, using hashed password
security.decryptHashedCryptSym = function decryptHashedCryptSym(crypt, passphrase, salt) {
    
    // generate hash with password+salt
    var token = hashPassword(passphrase, salt);
    
    // fernet decrypt with hash
    return token.decode(crypt);
}

security.generateAdminKeys = function generateAdminKeys(password) {

    // generate user's private key
    var keys = generateKeys()
    
    // generate random salt
    var salt = crypto.randomBytes(16);
    
    var privkey = encryptHashedSecretSym(keys.privkey, password, salt);
    var pubkey = encryptHashedSecretSym(keys.pubkey, password, salt);
    
    var user = {
        privkey: privkey,
        pubkey: pubkey,
        salt: salt,
        password: password
    };
    return user;
}

security.generateUserKeys = function generateUserKeys() {
    
    // generate temporary password
    var password = crypto.randomBytes(12).toString('hex');
    password = "t_" + password;
    
    // generate user's private key
    var keys = generateKeys()
    
    // generate random salt
    var salt = crypto.randomBytes(16);
    
    var privkey = encryptHashedSecretSym(keys.privkey, password, salt);
    
    var user = {
        privkey: privkey,
        pubkey: keys.pubkey,
        salt: salt,
        password: password
    };
    return user;
}

// assymetric encrypt
security.encryptSecret = function encryptSecret(secret, pubkey) {
    var options = {
        data: secret,                              // input as String (or Uint8Array) 
        publicKeys: pgp.key.readArmored(pubkey).keys,  // for encryption
        // privateKeys: pgp.key.readArmored(privkey).keys // of cryptor for signing (optional)
    };
    pgp.encrypt(options).then(function(ciphertext) {
        return ciphertext.data; // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----' 
    });
}

// assymetric decrypt
security.decryptCrypt = function decryptCrypt(crypt, privkey) {
    var options = {
        message: pgp.message.readArmored(crypt),            // parse armored message
        // publicKeys: pgp.key.readArmored(vkey).keys[0]    // for decryption 
    };
     
    pgp.decrypt(options).then(function(plaintext) {
        return plaintext.data;                              // Secret
    });
}

security.findPubkeyServer = function findPubkeyServer(server, email) {
    var hkp = new pgp.HKP(server);
     
    var options = {
        query: email
    };
     
    hkp.lookup(options).then(function(key) {
        return pgp.key.readArmored(key);
    });
}

// instead of storing everyone's pubkeys / privkeys in the store, keep online
// NOTE: NOT FUNCTIONAL
security.storePubkeyServer = function storePubkeyServer(server, pubkey, email) {
    var hkp = new pgp.HKP(server);
     
    hkp.upload(pubkey).then(function() {
        // TODO: finish
    });
}

// when someone requires this module
module.exports = security;

// TODO: a method to access group keys if you already have your private key
// * Perhaps use it to unlock / lock the user-group key
// * then use the group key to get the passwords necessary

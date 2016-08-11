var Promise = require("Promise");

var crypto = require("crypto");
var fernet = require("fernet");
var pgp = require("openpgp");

// var keybase = require("kbpgp");
// var keybase-usr = require("keybase-user");

var bignum = require('bignum');
var b64 = require('base64url');

pgp.initWorker({ path:'openpgp.worker.js' });

function hash_password(password, salt) {
    var pbkdf2_hash = Promise.denodeify(crypto.pbkdf2)
    var derivedKey = pbkdf2_hash(password, salt, 100000, 32, 'sha512');
    var hashed = b64.encode(derivedKey);
    
    var secret = new fernet.Secret(hashed);
    
    var token = new fernet.Token({
        secret: secret,
    });
    
    return token;
}


function generate_keys() {
    // NOTE: yes there is a passphrase that can encrypt the private key, but it's using an outdated standard
    // Hence: we still need the AES thing above for password
    
    var privkey, pubkey;
    var options = {
        userIds: [{ name:'Jon Smith', email:'jon@example.com' }], // multiple user IDs 
        numBits: 4096,                                            // RSA key size 
        passphrase: 'super long and hard to guess secret'         // optional, protects the private key 
    };
     
    pgp.generateKey(options).then(function(key) {
        privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... ' 
        pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... ' 
    });
    var keys = {
        private: privkey,
        public: pubkey
    }
    return keys
}

function generate_user_keys(password) {
    // TODO: generate user's private key
    
    // generate random salt
    var salt = crypto.randomBytes(16);
    
    // generate hash with password+salt
    var token = hash_password(password, salt);
    
    // fernet encrypt with hash
    var private = token.encode("bob");
}

function encrypt_secret(secret, pubkey) {
    var options = {
        data: secret,                              // input as String (or Uint8Array) 
        publicKeys: pgp.key.readArmored(pubkey).keys,  // for encryption
    };
    pgp.encrypt(options).then(function(ciphertext) {
        return ciphertext.data; // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----' 
    });
}

function decrypt_crypt(crypt, privkey) {
    var options = {
        message: pgp.message.readArmored(crypt),            // parse armored message
        privateKey: pgp.key.readArmored(privkey).keys[0]    // for decryption 
    };
     
    pgp.decrypt(options).then(function(plaintext) {
        return plaintext.data;                              // Secret
    });
}

function find_pubkey_server(server, email) {
    var hkp = new pgp.HKP(server);
     
    var options = {
        query: email
    };
     
    hkp.lookup(options).then(function(key) {
        return pgp.key.readArmored(key);
    });
}

// NOTE: NOT FUNCTIONAL
function store_pubkey_server(server, pubkey, email) {
    var hkp = new pgp.HKP(server);
     
    hkp.upload(pubkey).then(function() {
        // TODO: finish
    });
}

// when someone requires this module
module.exports = {
    hash_password: hash_password,
    generate_keys: generate_keys,
    generate_user_keys: generate_user_keys,
    encrypt_secret: encrypt_secret,
    decrypt_crypt: decrypt_crypt,
    
};

// TODO: a method to access group keys if you already have your private key
// * Perhaps use it to unlock / lock the user-group key
// * then use the group key to get the passwords necessary

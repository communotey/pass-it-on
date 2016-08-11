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


function generate_private() {
    // NOTE: yes there is a passphrase that can encrypt the private key, but it's using an outdated standard
    // Hence: we still need the AES thing above
    var options = {
        userIds: [{ name:'Jon Smith', email:'jon@example.com' }], // multiple user IDs 
        numBits: 4096,                                            // RSA key size 
        passphrase: 'super long and hard to guess secret'         // optional, protects the private key 
    };
     
    pgp.generateKey(options).then(function(key) {
        var privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... ' 
        var pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... ' 
    });
    var keys = {
        private: privkey,
        public: pubkey
    }
    return keys
}

function generate_user_private(password) {
    // TODO: generate user's private key
    
    // generate random salt
    var salt = crypto.randomBytes(16);
    
    // generate hash with password+salt
    var token = hash_password(password, salt);
    
    // fernet encrypt with hash
    var private = token.encode("bob");
}

// when someone requires this module
module.exports = {
    hash_password: hash_password,
    generate_private: generate_private,
    generate_user_private: generate_user_private
};

// TODO: a method to access group keys if you already have your private key
// * Perhaps use it to unlock / lock the user-group key
// * then use the group key to get the passwords necessary

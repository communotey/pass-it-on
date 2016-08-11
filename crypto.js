var Promise = require("Promise");

var crypto = require("crypto");
var fernet = require("fernet");
var pgp = require("openpgp");
var keybase = require("keybase-user");

var bignum = require('bignum');
var b64 = require('base64url');

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
}
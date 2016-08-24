function KeyPair(publicKey, privateKey) {
    this._pubKey = publicKey;
    this._privKey = privateKey;
}

KeyPair.prototype.getPublicKey = function getPublicKey() {
    return this._pubKey;
}

KeyPair.prototype.getPrivateKey = function getPrivateKey() {
    return this._privKey;
}

module.exports = KeyPair;
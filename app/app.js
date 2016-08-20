const Promise = require('promise');

const fs = require("fs");
const cli = require("cli");

const crypto = require('./crypto'); 
// crypto.generate_private()

const STORE_FILE_LOCATION = 'store.json';
const store = require('./store');

var user, password, location;

// sample cli inputs --user=goatandsheep password=SherbetLemon
cli.parse({
    user: ['u', 'Authenticate with username'],
    password: ['p', 'Authorize with password', 'as-is'],
    location: [false, "Path to password storage", 'as-is', 'store.js']
});
// TODO: add/check as SSH key

// TODO: logout

var obj = JSON.parse(fs.readFileSync('store.json', 'utf8'));

var read = Promise.denodeify(fs.readFile)
var write = Promise.denodeify(fs.writeFile)

var p = read('store.json', 'utf8')
  .then(function (str) {
    return write(location, JSON.stringify(JSON.parse(str), null, '  '), 'utf8')
  })

var groups = [];
var option; // TODO: get option from cli
var item; // what does the option affect?
var value; // value of thing we are affecting

// states
// 1. First time
// 2. check the username and password with json
// 3. give options based on username
//    A. Admin can add new users
//    B. Everyone else can 

// 1. First time: setup store.json
if (option === 'init') {
  store.open(STORE_FILE_LOCATION);
  store.data.users = {};
  store.data.groups = {};
  store.data.secrets = {};
  store.close();
  
  // generate admin user
  createAdmin();
  
}

if (user === 'admin') {
  var keys = operations.decrypt_admin_keys(password);
  var privkey = keys.privkey;
  var pubkey = keys.pubkey;
  switch (option) {
    case 'g':
      // add group
      // group: name of group
      // store.data.groups[item] = {};
      break;
    case 's':
      // add secret to group
      // group: name of group
      // item: name of secret
      // value: secret
      operations.addSecretToGroup(privkey, group, item, value)
      break;
    case 'd':
      // delete group
      // group: name of group
      // delete store.data.groups[group];
      break;
    case 'e':
      // erase secret
      // item: name of secret
      operations.deleteSecret(item);
      break;
    case 'n':
      // new user
      // item: name of user
      operations.createUser(pubkey, item)
      break;
    case 'r':
      // remove user
      // item: name of user
      operations.deleteUser(item);
      break;
    case 'c':
      // change password
      // value: new password
      operations.changePassword(user, password, value)
  }
}
else {
  groups = store.getGroupList(user);
  // TODO: unlock private key
  var privkey = decryptUserPrivate(user, password);
  switch (option) {
    case 'a':
      // add / modify secret to associated group
      // item: name of secret
      // value: secret
      // group: name of group
      
      // if secret exists, make key pair
      break;
    case 'd':
      // delete accessible secrets
      // item: which secret
      operations.deleteSecret(item)
      break;
    case 'l':
      // list accessible secrets
      break;
    case 'r':
      // read all accessible secrets
      break;
    case 'f':
      // fetch specific accessible secret
      // item: name of secret
      break;
    case 'c':
      // change password
      // item: new password
      operations.changePassword(user, password, item)
      
      // relock private key
    // TODO: if password starts with "t_", change it, i.e. temp password
  }
}


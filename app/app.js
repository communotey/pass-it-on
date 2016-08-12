var Promise = require('promise');

var fs = require("fs");
var cli = require("cli");

var crypto = require('./crypto'); 
// crypto.generate_private()

var store = require('./store');

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
  obj.users = {};
  obj.groups = {};
  obj.secrets = {};
  // TODO: create admin user
}

if (user === 'admin') {
  var keys = operations.decrypt_admin_keys(password);
  switch (option) {
    case 'g':
      // add group
      // item: name of group
      // obj.groups[item] = {};
      break;
    case 's':
      // add secret to group
      // item: name of group
      // value: secret
      break;
    case 'd':
      // delete group
      // item: name of group
      // delete obj.groups[item];
      break;
    case 'e':
      // erase secret
      // item: name of secret
      // delete obj.secrets[item];
      // TODO: delete wherever 
      break;
    case 'n':
      // new user
      // item: name of user
      // value: temporary password
      break;
    case 'r':
      // remove user
      // item: name of user
      // for each in obj.users[item].groups, delete user key from obj.groups.group
      // delete obj.users[item];
      // TODO: delete user from groups 
      
    // TODO: change password
  }
}
else {
  groups = store.getGroupList(user);
  // TODO: unlock private key
  var privkey;
  switch (option) {
    case 'a':
      // add / modify secret to associated group
      // item: name of secret
      // value: secret
      // TODO: which group?
      
      // if secret exists, make key pair
      break;
    case 'd':
      // delete accessible secrets
      // item: which secret
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
      // 1. 
    case 'c':
      // change password
      // item: new password
      
      // relock private key
      
  }
}


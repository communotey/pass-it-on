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


// states
// 1. First time
// 2. check the username and password with json
// 3. give options based on username
//    A. Admin can add new users
//    B. Everyone else can 

// 1. First time: setup store.json
  // create admin user
  // obj.users = {}
  // obj.groups = {}
  // obj.secrets = {}

var groups = [];
var option; // TODO: get option from cli
var item; // what does the option affect?

if (user === 'admin') {
  switch (option) {
    case 'g':
      // add group
      // item: name of group
      break;
    case 's':
      // add secret to group
      // item: name of group
      // secret: value
      break;
    case 'd':
      // delete group
      // item: name of group
      break;
    case 'e':
      // erase secret
      // item: name of secret
      break;
    case 'n':
      // new user
      // item: name of user
      // TODO: how does this work??
      break;
    case 'r':
      // remove user
      // item: name of user
    // TODO: change password
  }
}
else {
  groups = store.getGroupList(user);
  switch (option) {
    case 'a':
      // add / modify secret to associated group
      // item: name of secret
      // secret: value
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
    // TODO: change password
  }
}


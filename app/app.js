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

var groups = [];
if (user === 'admin') {
  // add groups
  // add secret to group
  // add users
  // delete groups
  // delete secrets
  // delete users
}
else {
  groups = store.getGroupList(user);
  // add secret to group part off
  // delete accessible secrets
  // list accessible secrets
  // read accessible secrets
}


var Promise = require('promise');

var fs = require("fs");
var cli = require("cli");

var crypto = require('./crypto'); 
var store = require('./store');


// sample cli inputs --user=goatandsheep password=SherbetLemon
cli.parse({
    user: ['user'],
    password: ['password'],
});


var obj = JSON.parse(fs.readFileSync('store.json', 'utf8'));

var read = Promise.denodeify(fs.readFile)
var write = Promise.denodeify(fs.writeFile)

var p = read('store.json', 'utf8')
  .then(function (str) {
    return write('store.json', JSON.stringify(JSON.parse(str), null, '  '), 'utf8')
  })


// check the username with json
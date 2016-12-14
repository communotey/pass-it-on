#! /usr/bin/env node

/*

                          USAGE:      pio <verb> [options]
* Initialize store                    pio init
                          
* Add group to group                  pio add     -c|--child <groupChild> -g|--group <groupParent>
                                                  -s|--secret <secret> -g|--group <group>
                                                  -u|--user <user> -g|--group <group>
                                          
                                          change  -s|--secret <secret>
                                                  -p|--password
                                                  
                                          create  -g|--group <group>
                                                  -s|--secret <secret>
                                                  -u|--user <user>
                                          
                                          delete  -g|--group <group>
                                                  -s|--secret <secret>
                                                  -u|--user <user>
                                                  
                                          remove  -c|--child -g|--group <group>
                                                  -s|--secret <secret> -g|--group <group>
                                                  -u|--user -g|--group <group>
*/

// TODO: session loop

const co = require('co')
const program = require('commander');
const prompt = require('prompt');
const colors = require('colors');
const credentials = require('../app/credentials')
const operations = require('../app/operations')

const NO_TARGET_GROUP_GIVEN = 'No target group was specified with --group <Target group name>'
const INCORRECT_OPTIONS_GIVEN = 'Option not available 😔 refer to docs'

program.version('0.0.1')

program
  .command('init')
  .description('Initialize store file and admin user')
  .action(function() {
    prompt.get([{
      name: 'admin',
      hidden: true,
      description: 'Enter the admin password'
    }], function(error, result) {
      var adminPassword = result.admin
      
      operations.init(adminPassword)
    })
  })
  
program
  .command('add')
  .usage('<option> -g|--group <groupParent>')
  .description('Group operations')
  .option('-c, --child <groupChild>', 'Add a child group')
  .option('-s, --secret <secret>', 'Add secret to a group')
  .option('-u, --user <user>', 'Add a user to a group')
  .option('-g, --group <groupParent>', 'Specify the parent group')
  .action(function(options) {
      if(!options.groupParent) {
        console.log(NO_TARGET_GROUP_GIVEN)
        return;
      }
      
      if(options.secret) {
        credentials.ask().then(function(username, password) {
          var privkey = operations.decryptUserPrivate(username, password)
          var parentGroup = options.groupParent
          
          var name = options.secret;
          
          prompt.get([{
            name: 'value',
            hidden: true,
            description: 'Enter the value of the secret?'
          }], function(error, result) {
            var value = result.value
            
            operations.addSecretToGroup(username, privkey, parentGroup, name, value)
          }, function (error) {
            // TODO: create error message (bad value?)
            console.log()
          });
        }, function(error) {
          // TODO: create error message (incorrect groupParent?)
          console.log()
        })

      } else if(options.user) {
        credentials.ask().then(function(username, password) {
          var adminPrivKey = operations.decryptUserPrivate(username, password)
          var parentGroup = options.groupParent
          
          operations.addUserToGroup(adminPrivKey, username, parentGroup)
        }, function(error) {
          // TODO: create error message (incorrect groupParent?)
          console.log()
        })
      } else if(options.child) {
        credentials.ask().then(function(username, password) {
          var adminPrivkey = operations.decryptUserPrivate(username, password)
          var childGroup = options.groupChild
          var parentGroup = options.groupParent
          
          operations.addGroupToGroup(adminPrivkey, childGroup, parentGroup)
        }, function(error) {
          // TODO: create error message (incorrect groupParent?)
          console.log()
        })
      } else {
        console.log(INCORRECT_OPTIONS_GIVEN)
     }
  })
  
program
  .command('change')
  .description('Change the value of a secret or a user\'s password')
  .option('-s, --secret <secret>', '')
  .option('-p, --password', 'Change a user password (will be prompted to login as that user and select a new password)')
  .action(function (options) {
    if(options.secret) {
      credentials.ask().then(function(username, password) {
        var uPriv = operations.decryptUserPrivate(username, password)
        var secretName = operations.secret
        
        // TODO: value description
        prompt.get([{
          name: 'value',
          hidden: true,
          description: 'Enter the new value of the secret'
        }], function(error, result) {
          var value = result.value
          operations.changeSecret(username, uPriv, secretName, value)
        }, function (error) {
          // TODO: create error message (bad value?)
          console.log()
        }
      }, function(error) {
        // TODO: create error message (?)
        console.log()
      })
    } else if(options.password) {
      credentials.ask().then(function(username, password) {
        prompt.get([{
          name: 'password',
          hidden: true,
          description: 'Enter the new value of the password'
        }], function(error, result) {
          operations.changePassword(username, password, result['password'])
        })
      }, function(error) {
        
      })
    } else {
      console.log(INCORRECT_OPTIONS_GIVEN)
    }
  })
  
program
  .command('create')
  .description('Create groups, secrets or users')
  .option('-g, --group <group>', 'Create a group')
  .option('-s, --secret <secret>', 'Create a secret')
  .option('-u, --user <user>', 'Create a user')
  .action(function (options) {
    if(options.group) {
      var name = options.group
      // TODO
      // operations.createGroup(adminPubkey, name)
    } else if(options.secret) {
      var name = options.secret
      // TODO
      // operations.createSecret(adminPubkey, name)
    } else if(options.user) {
      var name = options.user
      // TODO
      // operations.createUser(adminPub, name)
    }
  })

program
  .command('delete')
  .description('Delete entities from the store')
  .option('-g, --group <group>', 'Delete a group')
  .option('-s, --secret <secret>', 'Delete a secret')
  .option('-u, --user <user>', 'Delete a user')
  .action(function(options) {
    if(!options.parentGroup) {
      console.log(NO_TARGET_GROUP_GIVEN)
      return;
    }
    
    var parentGroup = options.parentGroup
    
    if(options.child) {
      operations.deleteGroup(options.group)
    } else if(options.secret) {
      operations.deleteSecret(options.secret)
    } else if(options.user) {
      operations.deleteUser(options.user)
    } else {
      console.log(INCORRECT_OPTIONS_GIVEN)
    }
  })

program
  .command('remove')
  .usage('<option> -g|--group <groupParent>')
  .description('')
  .option('-c, --child <groupChild>', 'Child group to remove from group')
  .option('-s, --secret <secret>', 'Secret to remove from group')
  .option('-u, --user <user>', 'User to remove from group')
  .option('-g, --group <groupParent>', 'Specify the parent group')
  .action(function(options) {
    if(!options.parentGroup) {
      console.log(NO_TARGET_GROUP_GIVEN)
      return;
    }
    
    var parentGroup = options.parentGroup
    
    if(options.child) {
      operations.removeGroup(options.child, parentGroup)
    } else if(options.secret) {
      operations.removeSecret(options.secret, parentGroup)
    } else if(options.user) {
      operations.removeUser(options.user, parentGroup)
    } else {
      console.log(INCORRECT_OPTIONS_GIVEN)
    }
  })

program.parse(process.argv);

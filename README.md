# Pass-It-On

[![Build Status](https://travis-ci.org/communotey/pass-it-on.svg?branch=master)](https://travis-ci.org/communotey/pass-it-on)
[![Dependency Status](https://gemnasium.com/badges/github.com/communotey/pass-it-on.svg)](https://gemnasium.com/github.com/communotey/pass-it-on)
[![Coverage Status](https://coveralls.io/repos/github/communotey/pass-it-on/badge.svg?branch=master)](https://coveralls.io/github/goatandsheep/pass-it-on?branch=master)
[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/pass-it-on/Lobby)

> **Note**: there is no guarantee that this is secure and definitely requires extensive security testing before it can be used in production settings. For now, you should probably just use [AWS KMS](https://aws.amazon.com/documentation/kms/). This is meant as a final resort for a private repository, such that you have time to change your passwords if the data is accidentally made public. Make sure you are changing your passwords at most every 3 months.

## What is it

**Pass-It-On** is a password manager for:

- Giving password access to multiple users
  - Uses LABELs or USER GROUPS (i.e. sets of users who can use the same **keys** or **secrets**)
- Allows you to store your keys in a code repository
- Automatic retrieval at server start for autoscaling purposes

## How it works

### Unlocking Group Level Keys

> Encrypting the access keys

- **Add**:
  - *ADMIN* fetches a public or private key
  - Encrypts with user's public key
  - **Append**: `json.item_name = "key_encrypted_by_password"`
    - Password is salted and hashed using PBKDF2
      - **Fernet**: encrypts user's private key using hash
- **Remove**:
  - `delete json.item_name`

### Unlocking Keys as GROUP

> Accessing the passwords, themselves

Types:

- Read: private key
- Write: public keys

Locked with **GPG**

### ADMIN user

> A user that has read and write privileges of everything

- Add user
- Create group
- Delete user
- List groups
- List users

### Other Users

- Access available keys
  - Read passwords
  - Write password

## Usage

Modes:

1. Administration
2. Injection

### 1. Administration

> A mode where you manage the password store

#### Functions:

* Initialize store
* Add user to group
* Create new group
* Add keys to group
* Add / Modify / Delete users
* Add / Modify / Delete / List keys
* Change passwords

#### Authentication

1. Run the application
2. Enter username and password
3. Choose options available to that user

### 2. Injection

> Run this inside your application and the passwords you have been authorized access to will be injected into the development environment

There are two ways of being authenticated in *injection mode*:

1. Putting your username and password inside `PIO_USER` and `PIO_PASS`, respectively.
2. Following the prompt.

## Notes to contributors

* Going to start using [this standard](https://github.com/feross/standard/blob/master/README.md) for javascript
* Promises > callbackss


## Cryptography Notice

This distribution includes cryptographic software. The country in which you currently reside may have restrictions on the import, possession, use, and/or re-export to another country, of encryption software. BEFORE using any encryption software, please check your country's laws, regulations and policies concerning the import, possession, or use, and re-export of encryption software, to see if this is permitted. See [http://www.wassenaar.org/](http://www.wassenaar.org/) for more information.

The U.S. Government Department of Commerce, Bureau of Industry and Security (BIS), has classified this software as Export Commodity Control Number (ECCN) 5D002.C.1, which includes information security software using or performing cryptographic functions with asymmetric algorithms. The form and manner of this distribution makes it eligible for export under the License Exception ENC Technology Software Unrestricted (TSU) exception (see the BIS Export Administration Regulations, Section 740.13) for both object code and source code.

##TODO

- [ ] fix store.js
- [ ] test cases: `npm test` fails 😥
- [ ] command line commands (`pio.js`)
- [ ] Teach Kemal how to do config and env variables file
- [ ] operations: removeSecret, deleteSecret, addSecretToGroup
- [ ] figure out grouping stuff
- [ ] make `Auth` version of public-facing functions to auto-decrypt pub/priv keys because operations should be only thing that talks to security
- [ ] is it ok that `store.json` is ignored?

# Pass-It-On

[![CircleCI](https://circleci.com/gh/goatandsheep/pass-it-on.svg?style=svg)](https://circleci.com/gh/goatandsheep/pass-it-on)

> **Note**: there is no guarantee that this is secure and definitely requires extensive security testing before it can be used in production settings. For now, you should probably just use [AWS KMS](https://aws.amazon.com/documentation/kms/).

## What is it

**Pass-It-On** is a password manager for:

- Giving password access to multiple users
  - Uses LABELs or USER GROUPS (i.e. groups of users who can use the same set of passwords)
- Allows you to store your keys in a code repository
- Automatic retrieval at server start for autoscaling purposes

## User Functions

A user should be able to use pass-it-on as an option when starting their server, for example:

`node app.js --user=goatandsheep --password=SherbetLemon`

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

## How it works

### Unlocking Group Level Keys

> Encrypting the access keys

- **Add**:
  - *ADMIN* fetches a public or private key
  - Encrypts with user's public key
  - **Append**: `json.item_name = "key_encrypted_by_password"`
    - Password could be salted
      - **AES** encrypts user's private key
- **Remove**:
  - `delete json.item_name`

### Unlocking Keys as GROUP

> Accessing the passwords, themselves

Types:

- Read: private key
- Write: public keys

Locked with **GPG**

## Initialization

1. Admin password is set

## Cryptography Notice

This distribution includes cryptographic software. The country in which you currently reside may have restrictions on the import, possession, use, and/or re-export to another country, of encryption software. BEFORE using any encryption software, please check your country's laws, regulations and policies concerning the import, possession, or use, and re-export of encryption software, to see if this is permitted. See [http://www.wassenaar.org/](http://www.wassenaar.org/) for more information.

The U.S. Government Department of Commerce, Bureau of Industry and Security (BIS), has classified this software as Export Commodity Control Number (ECCN) 5D002.C.1, which includes information security software using or performing cryptographic functions with asymmetric algorithms. The form and manner of this distribution makes it eligible for export under the License Exception ENC Technology Software Unrestricted (TSU) exception (see the BIS Export Administration Regulations, Section 740.13) for both object code and source code.

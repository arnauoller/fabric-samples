# To do
Employee:
* Nothing left?

Both:
* Modify contract

General:
* delete other samples and unused files

Renaming:
* Digibank to employee
* Magnetocorp to employer
* all chain code references
* Comments
* naming of people and organisations inside the wallets

Readme: put our scenario and our setup + quick start ...
  
# Check what I did here Gabriel
* PROBLEM CheckContract: Check if requester has permission
  * Was not working -->  as owner it appeared DigiBank but the actual owner was Admin@org1.example.com
  * WHAT I DID
    * Instead of putting as issuer DigiBank I put the username of the user creating the contract
    * I did the same with MagentoCorp
  * NOT AN OPTIMAL SOLUTION in a real world application (Maybe 2 admins from magentocorp have access)
    * But I think that for our system is enough



# Done
Employee:
* terminateContract

# Renaming
* checkPaper to checkContract
* terminateContract to redeem

Both:
* checkContract: Message is required


General:
* Use UNIX time

Renaming:
* Nothing

# logging-system


## Scenario

In this implementation 2 organizations: employer and employee each one with 1 member will interact with a contract using loggin-system solution. 

Once you’ve set up a basic network, you’ll act as Isabella, an employer of the company, who will issue a contract for an employee candidate. You’ll then switch hats to take the role of Balaji, an employee of the company, who will accept this contract, hold it for a period of time, in which he and the employer will consult it, and then terminate the contract.

## Quick Start

1) Start the Hyperledger Fabric infrastructure

   _although the scenario has two organizations, the 'basic' or 'developement' Fabric infrastructure will be used_

2) Install and Instantiate the Contracts

3) Run client applications in the roles of employer and employee to interact with the contract

   - Issue the contract as an employer
   - Accept the contract as an employee
   - CheckContract as employee and employer
   - TerminateContract as an employee

## Setup

You will need a a machine with the following

- Docker and docker-compose installed
- Node.js v8

It is advised to have 3 console windows open; one to monitor the infrastructure and one each for employer and employee

change to the `logging-system` directory

```
//TODO: change this
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples/commercial-paper
```

This `README.md` file is in the the `logging-system` directory, the source code for client applications and the contracts ins in the `ogranization` directory, and some helper scripts are in the `roles` directory.

## Running the Infrastructure

In one console window, run the `./roles/network-starter.sh` script; this will start the basic infrastructure and also start monitoring all the docker containers. 

You can cancel this if you wish to reuse the terminal, but it's best left open. 

### Install and Instantiate the contract

The contract code is in JavaScript. Although our client language is also in JavaScript the choice of contract language does not affect the choice of client language.

In your 'employer' window run the following command
//TODO:
`./roles/magnetocorp.sh`

This will start a docker container for Fabric CLI commands, and put you in the correct directory for the source code. 

**For a JavaScript Contract:**

//TODO: maybe change papercontract name for just paper contract
```
docker exec cliMagnetoCorp peer chaincode install -n papercontract -v 0 -p /opt/gopath/src/github.com/contract -l node

docker exec cliMagnetoCorp peer chaincode instantiate -n papercontract -v 0 -l node -c '{"Args":["org.papernet.commercialpaper:instantiate"]}' -C mychannel -P "AND ('Org1MSP.member')"
```

## Client Applications

You will need to install the dependencies first. Use this command in each application directory

```
npm install
```

### Issue the paper 


*Add the Identity to be used*

```
node addToWallet.js
```

*Issue the Commercial Paper*

```
node issue.js
```

### Accept and terminate the contract

This is running as *Employer*; you've not acted as this organization before so in your 'Employer' window run the following command in the 
`fabric-samples/commercial-paper/` directory
//TODO: change this
`./roles/digibank.sh` 

You can now run the applications to accept the contract and terminate the contract
//TODO: change this
Change to the `commercial-paper/organization/digibank/application`

*Add the Identity to be used*

```
node addToWallet.js
```

*Buy the paper*

```
node buy.js
```

*TerminateContract*

```
node terminateContract.js
```

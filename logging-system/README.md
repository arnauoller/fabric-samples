# logging-system

## Scenario
We implemented two organizations, one for the employer and one for the employee. Each organisation has one member that 
can interact with a contract using the developed logging system.

Once you’ve set up a basic network, you’ll act as Isabella, an employer of the company, who will issue a contract for
an employee candidate. You’ll then switch hats to take the role of Balaji, a future employee of the company, who will
accept this contract, hold it for a period of time, and then terminate it. During the time that the contract is held,
both parties can view the contract.

## Limitations
Unfortunately we weren't able to rename the organisations. DigiBank is representing the employee, MagnetoCorp the
employer. 

## Quick Start

1. Start the Hyperledger Fabric infrastructure

   _although the scenario has two organizations, the 'basic' Fabric infrastructure will be used_

2. Install and instantiate the Contracts

3. Run client applications in the roles of employer and employee to interact with the contract

   - Issue the contract as an employer
   - Accept the contract as an employee
   - CheckContract as employee and employer
   - TerminateContract as an employee

## Setup

You will need a a machine with the following

- Docker and docker-compose installed
- Node.js v8

It is advised to have 3 console windows open; one to monitor the infrastructure and one each for employer and employee

This `README.md` file is in the the `logging-system` directory, the source code for the client applications and the 
contracts in the `ogranization` directory, and some helper scripts are in the `roles` directory.

## Running the Infrastructure

In one console window, run the `./roles/network-starter.sh` script; this will start the basic infrastructure and also 
start monitoring all the docker containers. 

You can cancel this if you wish to reuse the terminal, but it's best left open. 

### Install and instantiate the contract

The contract code is written in JavaScript. Although our client language is also in JavaScript the choice of contract
language does not affect the choice of client language.

In your 'employer' window run the following command
`./roles/employer.sh`

This will start a docker container for Fabric CLI commands, and put you in the correct directory for the source code. 

```
docker exec cliMagnetoCorp peer chaincode install -n papercontract -v 0 -p /opt/gopath/src/github.com/contract -l node

docker exec cliMagnetoCorp peer chaincode instantiate -n papercontract -v 0 -l node -c '{"Args":["org.papernet.commercialpaper:instantiate"]}' -C mychannel -P "AND ('Org1MSP.member')"
```

## Client Applications

You will need to install the dependencies first. Use this command in each application directory

```
npm install
```

### Issue the Contract 
This is running as *Employer*

Inside the application directory

*Add the Identity to be used*

```
node addToWallet.js
```

*Issue the contract*

```
node issue.js
```

*View the contract*

```
node checkContract.js
```
### Accept and terminate the contract
This is running as *Employee*;

Change to the `logging-system/organization/employee/application` folder

You can now run the applications to accept the contract and terminate the contract

*Add the Identity to be used*

```
node addToWallet.js
```

*Accept the contract*

```
node acceptContract.js
```

*View the contract*

```
node checkContract.js
```

*TerminateContract*

```
node terminateContract.js
```


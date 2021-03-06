'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const DigiContract = require('../../employer/contract/lib/paper.js');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('../identity/user/balaji/wallet');

async function main () {
    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = 'Admin@org1.example.com';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled: false, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access logging network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use org.papernet.commercialpaper smart contract.');

        const contract = await network.getContract('papercontract');

        // Check contract
        let message = '';
        let args = process.argv.slice(2);
        if(args[0]){
            message = args[0];
        } else {
            console.log('No message was passed\nTerminating');
            return;
        }
        console.log('Submit check transaction.');
        const checkResponse = await contract.submitTransaction('checkContract', 'User1@org1.example.com', '00001', userName, message);

        // process response
        console.log('Process check transaction response.\n');

        let receivedContract = DigiContract.fromBuffer(checkResponse);

        console.log('====================');

        console.log(`Contract number:${receivedContract.paperNumber}`);
        console.log(`Issuer: ${receivedContract.issuer}\n`);
        console.log(`Issue date: ${receivedContract.issueDateTime}`);
        console.log(`Employee salary: ${receivedContract.salary}`);
        console.log(`Employee age: ${receivedContract.age}`);
        console.log(`Employee sex: ${receivedContract.sex}`);
        console.log(`Request log: \n\t${receivedContract.log}`);

        console.log('====================');

    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

    }
}
main().then(() => {

    console.log('CheckContract program complete.');

}).catch((e) => {

    console.log('CheckContract program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});

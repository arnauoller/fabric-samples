/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access logging-system network
 * 4. Construct request to accept contract
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const DigiContract = require('../../magnetocorp/contract/lib/paper.js');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('../identity/user/balaji/wallet');

// Main program function
async function main () {

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

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

        // Access logging-system network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        //TODO: change the naming
        // Get addressability to commercial paper contract
        console.log('Use org.papernet.commercialpaper smart contract.');

        const contract = await network.getContract('papercontract', 'org.papernet.commercialpaper');

        // Accept contract
        console.log('Submit accept contract transaction.');

        const acceptResponse = await contract.submitTransaction('acceptContract', 'User1@org1.example.com', '00001', userName, '4900000', '2020-05-31');

        // process response
        console.log('Process accept contract transaction response.');

        let paper = DigiContract.fromBuffer(acceptResponse);

        console.log(`${paper.issuer} offered contract : ${paper.paperNumber} successfully accepted by ${paper.owner}`);
        console.log('Transaction complete.');

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

    console.log('Accept program complete.');

}).catch((e) => {

    console.log('Accept program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
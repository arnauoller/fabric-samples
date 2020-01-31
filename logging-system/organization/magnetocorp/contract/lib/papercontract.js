/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// PaperNet specifc classes
const DigiContract = require('./paper.js');
const PaperList = require('./paperlist.js');

/**
 * A custom context provides easy access to list of all commercial papers
 */
class CommercialPaperContext extends Context {

    constructor() {
        super();
        // All papers are held in a list of papers
        this.paperList = new PaperList(this);
    }

}

/**
 * Define commercial paper smart contract by extending Fabric Contract class
 *
 */
class CommercialPaperContract extends Contract {

    constructor() {
        // Unique name when multiple contracts per chaincode file
        super('org.papernet.commercialpaper');
    }

    /**
     * Define a custom context for commercial paper
    */
    createContext() {
        return new CommercialPaperContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Issue commercial paper
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} issueDateTime paper issue date
     * @param {String} maturityDateTime paper maturity date
     * @param {Integer} salary salary of the employee
     * @param {Integer} age age of the employee
     * @param {String} sex sex of the employee
    */
    async issue(ctx, issuer, paperNumber, issueDateTime, maturityDateTime, salary, age, sex ) {

        let logMessage = 'issued by' + issuer + 'at time:' + issueDateTime;
        let log = [logMessage];
        // create an instance of the paper
        let paper = DigiContract.createInstance(issuer, paperNumber, issueDateTime, maturityDateTime, salary, age, sex, log);

        // Smart contract, rather than paper, moves paper into ISSUED state
        paper.setIssued();

        // Newly issued paper is owned by the issuer
        paper.setOwner(issuer);

        // Add the paper to the list of all similar commercial papers in the ledger world state
        await ctx.paperList.addPaper(paper);

        // Must return a serialized paper to caller of smart contract
        return paper;
    }

    /**
     * Accept contract from the side of employee
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer contract issuer
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} currentOwner current owner of paper
     * @param {String} newOwner new owner of paper
     * @param {Integer} price price paid for this paper
     * @param {String} purchaseDateTime time paper was purchased (i.e. traded)
    */
    async acceptContract(ctx, issuer, paperNumber, newOwner, price, purchaseDateTime) {

        // Retrieve the current paper using key fields provided
        let paperKey = DigiContract.makeKey([issuer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);

        // // Validate current owner
        // if (paper.getOwner() !== currentOwner) {
        //     throw new Error('Paper ' + issuer + paperNumber + ' is not owned by ' + currentOwner);
        // }

        // First acceptContract moves state from ISSUED to TRADING
        if (paper.isIssued()) {
            paper.setTrading();
        }

        // Check paper is not already TERMINATED
        if (paper.isTrading()) {
            paper.setOwner(newOwner);
        } else {
            throw new Error('Paper ' + issuer + paperNumber + ' is not trading. Current state = ' +paper.getCurrentState());
        }

        // Update the paper
        await ctx.paperList.updatePaper(paper);
        return paper;
    }

    /**
     * Terminate contract
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} terminatingOwner employee terminating the contract
    */
    async terminateContract(ctx, issuer, paperNumber, terminatingOwner) {
        let now = new Date();
        let month = now.getMonth() +1;

        if (now.getMonth() < 10) {
            month = '0' + month;
        }
        let terminatingDateTime = now.getFullYear() + '-' + month + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes();

        let paperKey = DigiContract.makeKey([issuer, paperNumber]);

        let paper = await ctx.paperList.getPaper(paperKey);

        // Check the contract is not already terminated
        if (paper.isTerminated()) {
            throw new Error('contract ' + issuer + paperNumber + ' already terminated');
        }

        // Verify that the employee owns the contract before terminating it
        if (paper.getOwner() === terminatingOwner) {
            paper.setOwner(paper.getIssuer());
            paper.setTerminated();
            paper.log = paper.log + '\nTerminated contract at ' + terminatingDateTime;
        } else {
            throw new Error('Terminating owner does not own contract ' + issuer + paperNumber);
        }

        await ctx.paperList.updatePaper(paper);
        return paper;
    }

    /**
     * Check contract information
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} caller who is checking the data
     * @param {String} message message stating why he/she checked info
    */
    async checkContract(ctx, issuer, paperNumber, caller, message) {
        if (message === '') {
            throw new Error('No message was passed. You should provide a message. Terminating');
        }

        // Retrieve the current paper using key fields provided
        let paperKey = DigiContract.makeKey([issuer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);
        if (caller !== paper.getIssuer() && caller !== paper.getOwner()) {
            paper.log = paper.log + '\n\'' + caller + '\' tried to illegally access the contract of \'' + paper.getOwner() + '\'';
        }

        // Add new log line to the contract
        paper.log = paper.log + '\n Checked by \'' + caller + '\' at \'' + new Date().toLocaleString() + '\': ' + message;

        // let newPaper = await ctx.paperList.getPaper(paper);
        return await ctx.paperList.updatePaper(paper);
    }

}

module.exports = CommercialPaperContract;

const YIELDToken = artifacts.require('YIELDToken');
const chai = require('chai');
chai.use(require('chai-as-promised')).should();
const BN = require('bn.js');
chai.use(require('chai-bn')(BN));
const fs = require('fs');

let yieldTokenInstance;
let totalSupply = web3.utils.toWei('140736000', 'ether');
const gasPrice = '65000000000';

const DYCOFactoryABI = JSON.parse(
  fs.readFileSync('./abi/DYCOFactory2.abi', 'utf8')
);

const dycoFactoryContract = new web3.eth.Contract(
  DYCOFactoryABI,
  '0x1F8c663e62f1d957d0ACf91dcb18A2Fb0e4cd107'
);

contract('YIELDToken', (accounts) => {
  it(`balance of deployer should be ${totalSupply} YIELDToken in the first account`, async () => {
    yieldTokenInstance = await YIELDToken.new();
    (await yieldTokenInstance.balanceOf(accounts[0])).should.be.bignumber.equal(
      totalSupply,
      `${totalSupply} wasn't in the first account`
    );
  });

  it(`shoud check communication of dyco...`, async () => {
    let operator = accounts[0]; //Address of the operator, that will manage the Toll Bridge, add whitelisted users and provide the tokens to the contract;
    let tollFee = 8500; //8500 = 85%
    let distributionRate = 1000;
    let fullDistributionSeconds = 8899200;
    let isBurnableToken = true;
    let initialDistributionEnabled = false; // If true, during the users whitelisting process, first X% will be automatically distributed to the whitelisted users, if false users will have to manually claim the first X% of tokens.

    //fullDistributionSeconds
    let distributionDelays = ['0', '2592000', '2592000', '2592000']; //Array of releases in seconds (e.g. 3 months would be 7776000). (The first element of the array should be 0 if distribution on TGE is desired).
    let distributionPercents = ['3000', '2000', '2000', '3000']; //Array of percents for each release (multiplied by 100, e.g 20% would be 2000). The total sum of percents must be 10000.
    /*let log = */ await dycoFactoryContract.methods
      .cloneDyco(
        yieldTokenInstance.address,
        operator,
        tollFee,
        distributionRate,
        fullDistributionSeconds,
        distributionDelays,
        distributionPercents,
        initialDistributionEnabled,
        isBurnableToken
      )
      .send({
        from: operator,
        gas: 5500000,
        gasPrice,
      });

    /*let transaction = await web3.eth.getTransactionReceipt(log.transactionHash);
    console.log(`transaction => `, transaction);

    let events = await dycoFactoryContract.getPastEvents('allEvents', {
      fromBlock: transaction.blockNumber,
      toBlock: 'latest',
    });

    console.log(`events => `, events);*/
  });
});

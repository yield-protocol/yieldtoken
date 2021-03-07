const fs = require('fs');
const Web3 = require('web3');

/*let setup = {
  name: 'kovan',
  operatorJson: 'operator.test.json',
  factoryAddress: '0x447f6D271396553C8E06E3637ABf4B7649500471',
  gasPrice: '91000000000',
  yieldTokenAddress: '0xEEaD363757aAEb019b71d7A26239bE97D2488868',
  provider: 'https://kovan.infura.io/v3/.....',
};*/

let setup = {
  name: 'mainnet',
  operatorJson: 'operator.mainnet.json',
  factoryAddress: '0x5992E583675576215D7634ad13955D6f00d03925',
  gasPrice: '150000000000',
  yieldTokenAddress: '0xa8B61CfF52564758A204F841E636265bEBC8db9B',
  provider: 'https://mainnet.infura.io/v3/.....',
};

const operator = JSON.parse(
  fs.readFileSync(`./script/${setup.operatorJson}`, 'utf8')
);

//http://127.0.0.1:8545
let web3 = new Web3(new Web3.providers.HttpProvider(setup.provider));
web3.eth.accounts.wallet.add(
  web3.eth.accounts.privateKeyToAccount(operator.privateKey)
);

const DYCOFactoryABI = JSON.parse(
  fs.readFileSync('./abi/DYCOFactory2.abi', 'utf8')
);

const dycoFactoryContract = new web3.eth.Contract(
  DYCOFactoryABI,
  setup.factoryAddress
);

async function cloneDyco(name, distributionDelays, distributionPercents) {
  let tollFee = 8500; //8500 = 85%
  let distributionRate = 1000;
  let fullDistributionSeconds = 8899200;
  let initialDistributionEnabled = false; // If true, during the users whitelisting process, first X% will be automatically distributed to the whitelisted users, if false users will have to manually claim the first X% of tokens.
  let isBurnableToken = true;

  let log = await dycoFactoryContract.methods
    .cloneDyco(
      setup.yieldTokenAddress,
      operator.address,
      tollFee,
      distributionRate,
      fullDistributionSeconds,
      distributionDelays,
      distributionPercents,
      initialDistributionEnabled,
      isBurnableToken
    )
    .send({
      from: operator.address,
      gas: 5500000,
      gasPrice: setup.gasPrice,
    });

  let transaction = await web3.eth.getTransactionReceipt(log.transactionHash);
  console.log(`${name} transaction => `, transaction);
  console.log(`${name} transaction...log => `, transaction.logs);

  let events = await dycoFactoryContract.getPastEvents('allEvents', {
    fromBlock: transaction.blockNumber,
    toBlock: 'latest',
  });
  console.log(`events => `, events);
}

//3600 * 24 * 30 = 2592000 seconds
/*let seedAndPrivateDistributionDelays = ['0', '2592000', '2592000', '2592000'];
let seedAndPrivateDistributionPercents = ['3000', '2000', '2000', '3000'];

cloneDyco(
  'Seed and Private',
  seedAndPrivateDistributionDelays,
  seedAndPrivateDistributionPercents
);*/

let strategicDistributionDelays = ['0', '2592000', '2592000', '2592000'];
let strategicDistributionPercents = ['4000', '2000', '2000', '2000'];

cloneDyco(
  'Strategic',
  strategicDistributionDelays,
  strategicDistributionPercents
);

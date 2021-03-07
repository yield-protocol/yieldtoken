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

const erc20ABI = JSON.parse(fs.readFileSync('./abi/ERC20.abi', 'utf8'));
const erc20Contract = new web3.eth.Contract(erc20ABI, setup.yieldTokenAddress);

async function approve(name, cloneAddress, amount) {
  let log = await erc20Contract.methods.approve(cloneAddress, amount).send({
    from: operator.address,
    gas: 5500000,
    gasPrice: setup.gasPrice,
  });

  let transaction = await web3.eth.getTransactionReceipt(log.transactionHash);
  console.log(`${name} transaction => `, transaction);
  console.log(`${name} transaction...log => `, transaction.logs);
}

//34,168,000
/*approve(
  'Seed and Private',
  '0x9279a161cace9c45c07a93c2096133094f22f258',
  '31000000000000000000000000'
); //24,000,000.00 + 8,400,000.00 = 32,400,000
*/

approve(
  'Strategic',
  '0x671d70480548c6b171dcb7dbad3f3b3755ba4770',
  '26000000000000000000000000'
); //26,000,000.00

//58400000

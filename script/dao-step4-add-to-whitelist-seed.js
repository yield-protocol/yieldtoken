// -----------------------------------------
// IMPORT PACKAGES
// -----------------------------------------

const Web3 = require('web3');
const axios = require('axios');
const EthereumTx = require('ethereumjs-tx').Transaction;
const fs = require('fs');

// -----------------------------------------
// EDITABLE AREAS
// -----------------------------------------

/*const operator = JSON.parse(
  fs.readFileSync(`./script/operator.test.json`, 'utf8')
);
const DYCO_FACTORY_CONTRACT = '0x447f6D271396553C8E06E3637ABf4B7649500471'; // <---- Add DYCO Factory address here
const TARGET_DYCO_CONTRACT = '0xD197bccB09F4e8f4B80D2942FF887a50ef63513f'; // <---- Add your DYCO address here
const OPERATOR_ACCOUNT = operator.address; // <---- Add DYCO Operator address here
const PRIVATE_KEY = operator.privateKeyNo0x; // <---- Add DYCO Operator private key here
const NETWORK = 'kovan'; // <---- Change to your preferred network (mainnet, goerli)
*/

const operator = JSON.parse(
  fs.readFileSync(`./script/operator.mainnet.json`, 'utf8')
);
const DYCO_FACTORY_CONTRACT = '0x5992E583675576215D7634ad13955D6f00d03925'; // <---- Add DYCO Factory address here
const TARGET_DYCO_CONTRACT = '0x9279a161cace9c45c07a93c2096133094f22f258'; // <---- Add your DYCO address here
const OPERATOR_ACCOUNT = operator.address; // <---- Add DYCO Operator address here
const PRIVATE_KEY = operator.privateKeyNo0x; // <---- Add DYCO Operator private key here
const NETWORK = 'mainnet'; // <---- Change to your preferred network (mainnet, goerli)

// -----------------------------------------
// INITIAL SETTINGS
// -----------------------------------------

const WSS_PROVIDER = `wss://${NETWORK}.infura.io/ws/v3/.....`;
const GAS_STATION_URL = 'https://ethgasstation.info/json/ethgasAPI.json';
const web3 = new Web3(new Web3.providers.WebsocketProvider(WSS_PROVIDER));

const WHITELISTED_USERS = {
  // <---- Add addresses and amounts inside this object or use demo accouts

  addresses: [
    '0x21F2f28AE06c4C2dAac0aB743Ac0b09eFfEecB2F',
    '0x6d16749cEfb3892A101631279A8fe7369A281D0E',
    '0xA2dCB52F5cF34a84A2eBFb7D937f7051ae4C697B',
    '0x8Fe9C787995D12b6EF3a9448aA944593DaC93C6c',
    '0xbc4a41fab35600b5ee85ed087f45bb7bc317c328',
    '0x285B10c73de847Ee35BCB5Cd86f17D55Ff936476',
    '0x8E32aA7c1eB8fC693F80f134362b8e5d27FA9612',
    '0x7d555aa86324467a25c43e839b9afc543b885d5f',
    '0x009653EFe6617f7add25E5D4D27Ae2bd32F159bF',
    '0xc6ddf90790b433743bd050c1d1d45f673a3413f4',
    '0xa596A01acb9e36ae574495dCED3922377ABbBb74',
    '0x6C4536967535e8AADf7370c7e9b2145386946B79',
    '0x0fFAfC69244f5Ed98e7362979e24449c9313aC67',
    '0xE9a21f6efeba79b60437c452F27A2De7DCA4ba8a',
    '0x6c52C497f500CD06891B024CB901469c74F2A921',
    '0x574bE81aAA9594DD252bb7b913e95bBb755e8898',
    '0xD200119113F8fEED5fD692FDC161317C48c1aF89',
  ],
  amounts: [
    2978723.404,
    1489361.702,
    2978723.404,
    2085106.383,
    1489361.702,
    2978723.404,
    1787234.043,
    1489361.702,
    2085106.383,
    1902857.143,
    1057142.857,
    422857.1429,
    2234042.553,
    2234042.553,
    1691428.571,
    1691428.571,
    126000,
  ],
};

// -----------------------------------------
// SCRIPT SETTINGS
// -----------------------------------------

const ADDRESSES_PER_TX = 50;
const DEFAULT_GAS_PRICE = '150';
const WHITELISTING_GAS_LIMIT = '8000000'; // 8 mln gas limit
const ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_dyco', type: 'address' },
      { internalType: 'address[]', name: '_users', type: 'address[]' },
      { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
    ],
    name: 'addWhitelistedUsers',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
const contractInstance = new web3.eth.Contract(ABI, DYCO_FACTORY_CONTRACT);
let account, privateKey;

// -----------------------------------------
// FUNCTIONS
// -----------------------------------------

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, parseInt(ms * 1000)); // Second to milliseconds
  });
};

const getGasPrice = async () => {
  let detectedGasPrice;
  try {
    const response = await axios(GAS_STATION_URL);
    detectedGasPrice = parseInt(response.data.fast / 10).toString();
  } catch {
    // If API will return wrong value use hardcoded amount
    detectedGasPrice = DEFAULT_GAS_PRICE;
  }

  return web3.utils.toWei(DEFAULT_GAS_PRICE, 'gwei');
};

const signAndSend = (rawTransaction) => {
  const tx = new EthereumTx(rawTransaction, {
    chain: NETWORK,
    hardfork: 'petersburg',
  });
  tx.sign(privateKey);
  const serializedTx = '0x' + tx.serialize().toString('hex');
  return web3.eth.sendSignedTransaction(serializedTx);
};

const start = async () => {
  try {
    if (
      WHITELISTED_USERS.addresses.length === 0 ||
      WHITELISTED_USERS.addresses.length !== WHITELISTED_USERS.amounts.length
    ) {
      throw new Error('Invalid whitelisted users data!');
    }

    if (
      !web3.utils.isAddress(OPERATOR_ACCOUNT) ||
      !web3.utils.isAddress(DYCO_FACTORY_CONTRACT) ||
      !web3.utils.isAddress(TARGET_DYCO_CONTRACT)
    ) {
      throw new Error('Invalid operator, DYCO or factory address!');
    }

    if (!PRIVATE_KEY) {
      throw new Error('Private key is missing!');
    }

    account = web3.utils.toChecksumAddress(OPERATOR_ACCOUNT);
    privateKey = Buffer.from(PRIVATE_KEY, 'hex');

    const batchesCount = Math.ceil(
      WHITELISTED_USERS.addresses.length / ADDRESSES_PER_TX
    );
    const gasPrice = await getGasPrice();
    let nonce = await web3.eth.getTransactionCount(account, 'pending');
    console.log('batchesCount', batchesCount);

    for (let i = 0; i < batchesCount; i++) {
      const startIndex = i * ADDRESSES_PER_TX;
      const endIndex = startIndex + ADDRESSES_PER_TX;
      console.log(`User Range: ${startIndex} - ${endIndex}`);

      // Divide data into small groups
      const addresses = WHITELISTED_USERS.addresses.slice(startIndex, endIndex);
      const amounts = WHITELISTED_USERS.amounts
        .slice(startIndex, endIndex)
        .map((el) => web3.utils.toWei(el.toString()));

      if (!addresses.length || !amounts.length) break;

      // Prepare transaction for sign
      const rawTransaction = {
        nonce: web3.utils.toHex(nonce),
        from: account,
        to: DYCO_FACTORY_CONTRACT,
        gas: web3.utils.toHex(WHITELISTING_GAS_LIMIT),
        gasPrice: web3.utils.toHex(gasPrice),
        value: web3.utils.toHex('0'),
        data: contractInstance.methods
          .addWhitelistedUsers(TARGET_DYCO_CONTRACT, addresses, amounts)
          .encodeABI(),
      };

      // Get signed request body
      await signAndSend(rawTransaction);

      // Increase the nonce
      nonce++;

      // Execute
      console.log(`Executed!`);

      // Wait a few seconds before next batch requests
      await sleep(25);
    }
  } catch (error) {
    console.log('Error found =>', error);
  } finally {
    process.exit();
  }
};

start();

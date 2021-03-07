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
const TARGET_DYCO_CONTRACT = '0x671d70480548c6b171dcb7dbad3f3b3755ba4770'; // <---- Add your DYCO address here
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
    '0x9455fd942ca87446fd914e07c403c785bdcde84e',
    '0x468cb54a3821d8b0129c42ea6adf12748d97fd98',
    '0x3e6beb6bc71f3e71629dc42d67adc4acec3bfc4c',
    '0x9540cee706d07b9347816e15c661e9c6cb1b7d81',
    '0xb0dbfa6e34adf8cbca0332a155f0fd9b93abf35c',
    '0xc7526a206c8c65567a9a24b7feda6dcc6f266f84',
    '0x0213a402474495d09431731e80301cd93f3db26b',
    '0xbc627254fa9e73117cb70e1d4eed610ba0a9de0d',
    '0x9ed5507070dc38fe1c8d64039f8aac5a9d720aff',
    '0xc14ac897f036e983dbb5f04c18b4e15116e39a28',
    '0x1dbe623157f7cdf98771020e688f7bc25a2e9a21',
    '0xbe4aa0296b2b217d03ddfff792675cfca96a95b4',
    '0x0ed67daaacf97acf041cc65f04a632a8811347ff',
    '0xd61951e5983646ae63d1236cdd112bbb5e10e159',
    '0xc308624d4f4b0c386cdc53bbeab2c97dd69c28f2',
    '0x2165ffc3b1c7ee4a618ecdf3d025625f30112e4e',
    '0x642b17abd6e509149bc00abaa8b87dfe6ca19879',
    '0xde2c27d6e7145918bc8105cfba492030bd3dd4c9',
    '0x438ee75b1ed112b676f041ecc0677d9da7bab78f',
    '0x9d05d9b59e6d0965469908a61ccb3dff8a8f650f',
    '0x9e12da5ca525ad3ef2a35bf8286369b3eeb0a0d2',
    '0x2938b2a7ebf9a59645e39d51ec5eca2869d6c53d',
    '0x2cbae16f9237757bc18c89f04e80ba9ba36d2dfd',
    '0xc2f2baf3e68309a85220129412270f9170920dca',
    '0x1a7d839dad213e8664411be731754ca9abcac2f7',
    '0xce2c3e9e17d365add29ba90ac87c2e79b3e97f0e',
    '0xd8e360db31d77867cfb21280dd264e9f7a230ee6',
    '0x42ffa211fa0e84309142d6253fed73da9039ca14',
    '0xd33619b122b27f712aa5f784bc54de9c95c7588d',
    '0xaef54eadac1dc4613b98ddaceccc4ef611c2ad8e',
    '0xd03369083eeb403b8155722ddfe9b00c8e4f4dc3',
    '0x31a01e7bdce65c399303a4207091466b752a96d2',
    '0xff29570cb69aef5b6b781fbb43177d45152cc380',
    '0x52e7bde89fcbd1e1c656db1c08dde45d82447e25',
    '0xce771b2a4fc2d4e2d8d1d516d978601fc4b6fc85',
    '0xe337c828d39dd4962f4f80512d07907e815314d5',
    '0x2ba162f2d358386bbe207d817e87db2faef6c948',
    '0xe7521950426479d525381940604d27aec12fe97a',
    '0x64766f7fb8ccc99c5fdba54e2e968d1d244b83be',
    '0x4943dd54dfe70f84c0176948deb53607b174cda1',
    '0x52045085a47ab53a8e7dd91305c2acf1d8997137',
    '0x7048b5651039064a0659c8760d5dcf3488f3388d',
    '0xacf1adc6e2423314b84f6f1485c1c609b4106d47',
    '0x883ad562d0a83569da00ddf88c96c348519c0030',
    '0xed80007bf274ab34373fe6f4261a3cb60d5c2c38',
    '0x41cc6c03f772353998be7d9752bbd97257f746d4',
    '0x7438b42d2dc59d089e2527d706563dc9b40b913a',
    '0x779d892313916e02d2615db569afd7fbefd2b70b',
    '0xd1634241edB51E568403cCbF5dB1DA28e213FDc3',
    '0x85D48E6040bD8a7Ae3e0570E7EC479938E4eB037',
    '0xF0aDE7DbF91ec5c0a0f1f0E409e75e4E7441C749',
    '0xe2C83Cd70E81B3999aeD15E8a407066BAcAfDB9f',
    '0x6613270734C78A6Dd99482bb789f0dd47d99F74C',
    '0x6aA3cA7e91Eca4cdBbE7D93f502110D307ABB222',
    '0xF2FE183C7e4E3dfF6B0e4BD06a7827bE36573aBF',
    '0xAF71613dA4805601fCC6D26b95b0073eABCd7De2',
    '0x4BDC0501D81936523Ae8f3460bBbEE13E1A3761c',
    '0xE4bF2C0aeAF5f44f9aF3935352C346A9f6B92892',
    '0x4431dAfCDDEba429007133f42a17afCf23C15026',
    '0xABDD5d1c4287A50c2B5Ad53612858F375cF3E60a',
    '0xf4CdED7a43d140422f8D5bFDdC49929dAD7281f0',
    '0xf1aF4184191bf5Ff9B2CF00c723166e3eee0ab9d',
    '0x701A219cDf7147AA08C5dF039AdE2172c0A88824',
    '0xC0c9f93640E6cd67Ae41d4d9F3aF09AF6BcC9786',
    '0x19a1D66c7949471801949c61e14ADef352863270',
    '0x5ad5dda845a66d908d6c22b4d236ab44191bd877',
    '0x60e88a09e6cd1d7bff5a5aec8c521d26068a75f0',
    '0xAD00338D081A2F5Fcfe66c02aDc78c49daEC009a',
    '0xC5cF89b68DC07Ee97b248F6b27c1dbfbC43BBB7f',
    '0x4F914648d4ED6247129be15928e5175F6FF66697',
    '0x119A15b61F933b9400bF751148EE87338047950c',
    '0x22B9829c9A7Faf4f91a6BfcaCCF1dF0b858d51d0',
    '0xb2C1bb68Dfd931269dCe09853DCfd1c15E436971',
    '0x98F9b765C9163F1d24F8C5E6AF0a5f53ee88735c',
    '0x2c7576df2053d91c9eccaf57b043efb37b84cd9c',
    '0x0c4fd0276474a42ad8d44fc915bdf51031b19ad4',
    '0x89d5250AA5d6C68dEcDA759FA3aedED3d7e575C5',
    '0xe787949d68c28f47a49eeb805ec8480279272563',
    '0xD9c65Ff6482d150d9D3AeD3476d2d5cEC2C7859C',
    '0xbFC94A95d4448C802E848C68fdD2FC0fEE4a876E',
    '0xb8C165d4CeabE669574F8b12965861A8BDC3F9d4',
    '0x385F62060ca60316ca8F8d7816E20513B3b9Ae1f',
    '0xEb7f577fDe4BDD10A600fd87EFae9E1bDF46d70b',
    '0xd4cE1744799B189c7A19A3D3cE0AAC8DE60F781b',
    '0xF0D168cB0F5d24265f9E9e5615A019b1f6Fa4354',
    '0x68882cc879f215d0fc862d0e304d6f27676fd327',
    '0x0c4736CAf75e5F0377331f8D7254b43AaE24415f',
    '0x9fcf67eD70F5888B60E5A814f0A7207cfc690333',
    '0x0F6e6eeB5059429a6349a4b87bf36aCc59b4B1ec',
    '0x1A8eCE7a2db171a3b183063260c3bd65E5937c4e',
    '0x6CFc7FACCBaDfC0262CCE471809DA730486178AA',
    '0x98f104E0e22867e9d4386a00EAA529837d7B1e9D',
    '0x91646c2c2fF05C4e9822740b0aD9d8B3DA51382b',
    '0x615b53F80B81656d17Fe5922B5ee9F3652BABa25',
    '0x73e535297F57D29acB8341D61564676B4bBa8f4d',
    '0xd62a38bd99376013d485214cc968322c20a6cc40',
  ],

  amounts: [
    211764.71,
    282352.94,
    282352.94,
    235294.12,
    188235.29,
    47058.82,
    352941.18,
    141176.47,
    94117.65,
    94117.65,
    117647.06,
    28235.29,
    235294.12,
    141176.47,
    47058.82,
    94117.65,
    117647.06,
    282352.94,
    188235.29,
    141176.47,
    141176.47,
    94117.65,
    141176.47,
    658823.52,
    70588.24,
    141176.47,
    47058.82,
    141176.47,
    94117.65,
    70588.24,
    70588.24,
    94117.65,
    117647.06,
    94117.65,
    70588.24,
    35294.12,
    141176.47,
    70588.24,
    35294.12,
    23529.41,
    70588.24,
    23529.41,
    23529.41,
    11764.71,
    23529.41,
    11764.71,
    11764.71,
    18823.53,
    47058.82,
    56470.59,
    32941.18,
    56470.59,
    80000.0,
    47058.82,
    32941.18,
    42352.94,
    28235.29,
    28235.29,
    23529.41,
    23529.41,
    23529.41,
    23529.41,
    32941.18,
    11764.71,
    70588.24,
    47058.82,
    47058.82,
    47058.82,
    47058.82,
    94117.65,
    94117.65,
    70588.24,
    47058.82,
    117647.06,
    94117.65,
    47058.82,
    23529.41,
    94117.65,
    470588.24,
    470588.24,
    941176.47,
    941176.47,
    8232941.18,
    235294.12,
    117647.06,
    117647.06,
    352941.18,
    117647.06,
    470588.24,
    470588.24,
    470588.24,
    235294.12,
    941176.47,
    470588.24,
    3294117.65,
    94117.65,
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

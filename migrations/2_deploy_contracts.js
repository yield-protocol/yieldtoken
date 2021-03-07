const YIELDToken = artifacts.require('YIELDToken');
const BN = require('bn.js');
let tenpow18 = new BN(10).pow(new BN(18));
let accumulatedCap = new BN(0);

let holders = [];
holders.push(artifacts.require('YIELDTokenHolderLiquidity.sol'));
holders.push(artifacts.require('YIELDTokenHolderMarketing.sol'));
holders.push(artifacts.require('YIELDTokenHolderStakingRewards.sol'));
holders.push(artifacts.require('YIELDTokenHolderTeam.sol'));

//Marketing = 16,400,000.00
//StakingRewards = 16,400,000.00
//Marketing = 16,400,000.00
//Team = 25,136,000.00
const tokensAmount = {
  'Yield Protocol - Liquidity': new BN('16400000').mul(tenpow18),
  'Yield Protocol - Marketing': new BN('16400000').mul(tenpow18),
  'Yield Protocol - Staking Rewards': new BN('16400000').mul(tenpow18),
  'Yield Protocol - Team': new BN('25136000').mul(tenpow18),
};

let log = [];
//let deployPromises = [];
//let sendPromises = [];
module.exports = async function (deployer) {
  await deployer.deploy(YIELDToken);
  let yieldToken = await YIELDToken.deployed();

  log.push(`YIELDToken => ${YIELDToken.address}`);

  /*for (let c = 0; c < holders.length; c++) {
    deployPromises.push(deployer.deploy(holders[c], YIELDToken.address));
  }
  await Promise.all(deployPromises);*/

  for (let c = 0; c < holders.length; c++) {
    await deployer.deploy(holders[c], YIELDToken.address);
    let holder = await holders[c].deployed();
    let name = await holder.name();

    /*console.log(
      `name => ${name}`,
      tokensAmount,
      `tokensAmount[name] => ${tokensAmount[name]}`
    );*/

    accumulatedCap = accumulatedCap.add(tokensAmount[name]);
    await yieldToken.transfer(holder.address, tokensAmount[name]);
    let _num = tokensAmount[name].div(tenpow18).toNumber().toLocaleString();
    log.push(`${name} => ${_num} at ${holder.address}`);
  }

  //await Promise.all(sendPromises);

  console.log(log);
  accumulatedCap = accumulatedCap.div(tenpow18).toNumber().toLocaleString();
  console.log(`accumulatedCap = ${accumulatedCap}`);
};

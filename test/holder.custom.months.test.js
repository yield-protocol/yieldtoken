const { expectRevert } = require('@openzeppelin/test-helpers'); ///*expectEvent, */
const increaseTime = require('./helpers/increaseTime');
const YIELDToken = artifacts.require('YIELDToken.sol');

const btLiquidityHolder = artifacts.require(
  'YIELDTokenHolderLiquidityMock.sol'
);
const btMarketingHolder = artifacts.require(
  'YIELDTokenHolderMarketingMock.sol'
);
const btStakingHolder = artifacts.require(
  'YIELDTokenHolderStakingRewardsMock.sol'
);

const chai = require('chai');
chai.use(require('chai-as-promised')).should();
const BN = require('bn.js');
//const { assert } = require('chai');
chai.use(require('chai-bn')(BN));
const tenpow18 = new BN(10).pow(new BN(18));

const holderSettings = {
  'Yield Protocol - Liquidity': {
    maxCap: new BN('16400000').mul(tenpow18),
    unlockRate: 14,
    fullLockMonths: 0,
    perMonthCustom: [
      new BN('8200000').mul(tenpow18),
      new BN('1640000').mul(tenpow18),
      new BN('0'),
      new BN('0'),
      new BN('1640000').mul(tenpow18),
      new BN('0'),
      new BN('0'),
      new BN('1640000').mul(tenpow18),
      new BN('0'),
      new BN('0'),
      new BN('1640000').mul(tenpow18),
      new BN('0'),
      new BN('0'),
      new BN('1640000').mul(tenpow18),
    ],
  },
  'Yield Protocol - Marketing': {
    maxCap: new BN('16400000').mul(tenpow18),
    unlockRate: 13,
    fullLockMonths: 0,
    perMonthCustom: [
      new BN('328000').mul(tenpow18),
      new BN('820000').mul(tenpow18),
      new BN('0'),
      new BN('820000').mul(tenpow18),
      new BN('1640000').mul(tenpow18),
      new BN('1640000').mul(tenpow18),
      new BN('1640000').mul(tenpow18),
      new BN('1640000').mul(tenpow18),
      new BN('1640000').mul(tenpow18),
      new BN('1640000').mul(tenpow18),
      new BN('1640000').mul(tenpow18),
      new BN('1640000').mul(tenpow18),
      new BN('1312000').mul(tenpow18),
    ],
  },
  'Yield Protocol - Staking Rewards': {
    maxCap: new BN('16400000').mul(tenpow18),
    unlockRate: 19,
    fullLockMonths: 0,
    perMonthCustom: [
      new BN('820000').mul(tenpow18),
      new BN('0'),
      new BN('0'),
      new BN('2460000').mul(tenpow18),
      new BN('0'),
      new BN('0'),
      new BN('2460000').mul(tenpow18),
      new BN('0'),
      new BN('0'),
      new BN('2460000').mul(tenpow18),
      new BN('0'),
      new BN('0'),
      new BN('2460000').mul(tenpow18),
      new BN('0'),
      new BN('0'),
      new BN('2460000').mul(tenpow18),
      new BN('0'),
      new BN('0'),
      new BN('3280000').mul(tenpow18),
    ],
  },
};

contract('btLiquidityHolder', runLiquidityHolderTest);
contract('btMarketingHolder', runMarketingHolderTest);
contract('btStakingHolder', runStakingHolderTest);

function runLiquidityHolderTest(accounts) {
  testHolder(accounts, btLiquidityHolder, 'Yield Protocol - Liquidity');
}

function runMarketingHolderTest(accounts) {
  testHolder(accounts, btMarketingHolder, 'Yield Protocol - Marketing');
}

function runStakingHolderTest(accounts) {
  testHolder(accounts, btStakingHolder, 'Yield Protocol - Staking Rewards');
}

async function testHolder(accounts, TokenHolder, name) {
  let yieldTokenHolder;
  let yieldToken;
  let unlockRate;
  //let fullLockMonths;
  let tranche1;
  let tranche2;

  describe('Initialization', () => {
    it('should deploy YIELDToken', async () => {
      yieldToken = await YIELDToken.new();
    });

    it(`should deploy ${name} holder`, async () => {
      yieldTokenHolder = await TokenHolder.new(yieldToken.address);
      (await yieldTokenHolder.name()).should.be.equal(name);
    });

    it('should transfer maxCap funds to the holder', async () => {
      unlockRate = await yieldTokenHolder.unlockRate();
      //fullLockMonths = await yieldTokenHolder.fullLockMonths();

      unlockRate = unlockRate.toNumber();
      //fullLockMonths = fullLockMonths.toNumber();
      unlockRate.should.be.equal(holderSettings[name].unlockRate);
      //fullLockMonths.should.be.equal(holderSettings[name].fullLockMonths);

      await yieldToken.transfer(
        yieldTokenHolder.address,
        holderSettings[name].maxCap
      );
      (
        await yieldToken.balanceOf(yieldTokenHolder.address)
      ).should.be.bignumber.equal(holderSettings[name].maxCap);
    });
  });

  describe('Send the tokens [month #1]', () => {
    /*it('should not send tokens if fullLockMonths > 0', async () => {
      if (fullLockMonths > 0) {
        await expectRevert(
          yieldTokenHolder.send(accounts[1], '2'),
          `available amount is less than requested amount`
        );

        //this line tests YIELDTokenSale.sol line 45.
        //even though truffle run coverage says it's without cover
        (await yieldTokenHolder.getAvailableTokens()).should.be.bignumber.equal(
          '0'
        );
      }
    });*/

    it('should increaseTime to skip full lock and get successful mint', async () => {
      //let additionalMonth = fullLockMonths * 3600 * 24 * 30;
      //await increaseTime.increaseTime(additionalMonth);

      (await yieldTokenHolder.getAvailableTokens()).should.be.bignumber.equal(
        holderSettings[name].perMonthCustom[0]
      );

      tranche1 = new BN('262144');
      tranche2 = holderSettings[name].perMonthCustom[0].sub(tranche1);
      await yieldTokenHolder.send(accounts[2], tranche1);
      (await yieldToken.balanceOf(accounts[2])).should.be.bignumber.equal(
        tranche1
      );
    });

    it('should correctly transfer leftover of first month', async () => {
      await yieldTokenHolder.send(accounts[2], tranche2);
      (await yieldToken.balanceOf(accounts[2])).should.be.bignumber.equal(
        holderSettings[name].perMonthCustom[0]
      );

      await expectRevert(
        yieldTokenHolder.send(accounts[2], '1'),
        `available amount is less than requested amount.`
      );

      (await yieldTokenHolder.sent()).should.be.bignumber.equal(
        holderSettings[name].perMonthCustom[0]
      );
    });
  });

  let x3MonthTotal;
  describe('Send the tokens [months #2-#4]', () => {
    it('shoud work with time travel', async () => {
      (await yieldTokenHolder.getAvailableTokens()).should.be.bignumber.equal(
        '0'
      );

      let additionalMonth = 3 * 3600 * 24 * 30; //3 month

      x3MonthTotal = holderSettings[name].perMonthCustom[1]
        .add(holderSettings[name].perMonthCustom[2])
        .add(holderSettings[name].perMonthCustom[3]);

      await increaseTime.increaseTime(additionalMonth);

      (await yieldTokenHolder.getAvailableTokens()).should.be.bignumber.equal(
        x3MonthTotal
      );
    });

    it('should correctly transfer all 3 month value', async () => {
      await yieldTokenHolder.send(accounts[3], x3MonthTotal);
      (await yieldToken.balanceOf(accounts[3])).should.be.bignumber.equal(
        x3MonthTotal
      );

      await expectRevert(
        yieldTokenHolder.send(accounts[3], '1'),
        `available amount is less than requested amount.`
      );

      (await yieldTokenHolder.sent()).should.be.bignumber.equal(
        holderSettings[name].perMonthCustom[0].add(x3MonthTotal)
      );
    });
  });

  let otherMonthsTotal;
  let fullMonthsTotal = new BN('0');
  describe('Send the tokens [months #5-...]', () => {
    it('shoud work with time travel', async () => {
      (await yieldTokenHolder.getAvailableTokens()).should.be.bignumber.equal(
        '0'
      );

      for (let c = 0; c < holderSettings[name].perMonthCustom.length; c++) {
        fullMonthsTotal = fullMonthsTotal.add(
          holderSettings[name].perMonthCustom[c]
        );
      }

      otherMonthsTotal = fullMonthsTotal.sub(
        holderSettings[name].perMonthCustom[0].add(x3MonthTotal)
      );
      fullMonthsTotal.should.be.bignumber.equal(holderSettings[name].maxCap);

      let additionalMonths = 300 * 3600 * 24 * 30; //300 months
      await increaseTime.increaseTime(additionalMonths);

      (await yieldTokenHolder.getAvailableTokens()).should.be.bignumber.equal(
        otherMonthsTotal
      );
    });

    it('should correctly transfer all 3 month value', async () => {
      await yieldTokenHolder.send(accounts[4], otherMonthsTotal);
      (await yieldToken.balanceOf(accounts[4])).should.be.bignumber.equal(
        otherMonthsTotal
      );

      await expectRevert(
        yieldTokenHolder.send(accounts[4], '1'),
        `available amount is less than requested amount`
      );

      (await yieldTokenHolder.sent()).should.be.bignumber.equal(
        fullMonthsTotal
      );
    });
  });

  describe('final check', () => {
    it('should increaseTime to random amount to test overflow', async () => {
      await increaseTime.increaseTime(86400 * 30 * 365 * 3); //+9 years
    });

    it('getAvailableTokens should be 0', async () => {
      (await yieldTokenHolder.getAvailableTokens()).should.be.bignumber.equal(
        '0'
      );
    });
  });
}

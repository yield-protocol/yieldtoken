const { expectRevert } = require('@openzeppelin/test-helpers'); ///*expectEvent, */
const increaseTime = require('./helpers/increaseTime');
const YIELDToken = artifacts.require('YIELDToken.sol');

const btTeamHolder = artifacts.require('YIELDTokenHolderTeamMock.sol');

const chai = require('chai');
chai.use(require('chai-as-promised')).should();
const BN = require('bn.js');
//const { assert } = require('chai');
chai.use(require('chai-bn')(BN));
const tenpow18 = new BN(10).pow(new BN(18));

contract('btTeamHolder', runTeamHolderTest);

function runTeamHolderTest(accounts) {
  testHolder(accounts, btTeamHolder, 'Yield Protocol - Team');
}

async function testHolder(accounts, TokenHolder, name) {
  let yieldTokenHolder;
  let yieldToken;
  let releasesMonths;
  let fullLockMonths;

  const holderSettings = {
    'Yield Protocol - Team': {
      maxCap: new BN('25136000').mul(tenpow18),
      releasesMonths: 10,
      fullLockMonths: 6,
      team: [
        {
          address: accounts[7],
          perMonth: new BN('1809865').mul(tenpow18),
          maxCap: new BN('18098650').mul(tenpow18),
          sent: new BN('0'),
          _tranche1: new BN('262144'),
          _tranche2: new BN('0'),
          _claimTo: '0x14E60f29678EfcD53BF50F91e10b6D6287972Ae8',
        },
        {
          address: accounts[8],
          perMonth: new BN('468651').mul(tenpow18),
          maxCap: new BN('4686510').mul(tenpow18),
          sent: new BN('0'),
          _tranche1: new BN('65536'),
          _tranche2: new BN('0'),
          _claimTo: '0x8F68b861b0EE911f341deda1b0f93104f563FBC2',
        },
        {
          address: accounts[9],
          perMonth: new BN('235084').mul(tenpow18),
          maxCap: new BN('2350840').mul(tenpow18),
          sent: new BN('0'),
          _tranche1: new BN('26214400000000000000000'),
          _tranche2: new BN('0'),
          _claimTo: '0xF036e5fE5a1310D1f08196288eDBf3EC1Ff638A8',
        },
      ],
    },
  };

  describe('Initialization', () => {
    it('should deploy YIELDToken', async () => {
      yieldToken = await YIELDToken.new();
    });

    it(`should deploy ${name} holder`, async () => {
      yieldTokenHolder = await TokenHolder.new(
        yieldToken.address,
        holderSettings[name].team[0].address,
        holderSettings[name].team[1].address,
        holderSettings[name].team[2].address
      );
      (await yieldTokenHolder.name()).should.be.equal(name);
    });

    it('should transfer maxCap funds to the holder', async () => {
      fullLockMonths = await yieldTokenHolder.fullLockMonths();
      releasesMonths = await yieldTokenHolder.releasesMonths();

      releasesMonths = releasesMonths.toNumber();
      fullLockMonths = fullLockMonths.toNumber();
      releasesMonths.should.be.equal(holderSettings[name].releasesMonths);
      fullLockMonths.should.be.equal(holderSettings[name].fullLockMonths);

      let _maxCap = new BN(0);
      for (let c = 0; c < holderSettings[name].team.length; c++) {
        let _lt = holderSettings[name].team[c];

        let _contribution = await getTeamContribution(
          yieldTokenHolder,
          _lt.address
        );
        _contribution.perMonth.should.be.bignumber.equal(_lt.perMonth);
        _contribution.maxCap.should.be.bignumber.equal(_lt.maxCap);
        _contribution.sent.should.be.bignumber.equal(_lt.sent);

        _contribution.perMonth
          .muln(releasesMonths)
          .should.be.bignumber.equal(_lt.maxCap);

        _maxCap = _maxCap.add(_lt.maxCap);
      }

      holderSettings[name].maxCap.should.be.bignumber.equal(_maxCap);

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
    it('should init tranches', async () => {
      for (let c = 0; c < holderSettings[name].team.length; c++) {
        let _lt = holderSettings[name].team[c];
        _lt._tranche2 = _lt.perMonth.sub(_lt._tranche1);
      }
    });

    it('should show 0 balance for an uknown addres', async () => {
      (
        await yieldTokenHolder.getAvailableTokens(
          '0x71b9ec42bb3cb40f017d8ad8011be8e384a95fa5'
        )
      ).should.be.bignumber.equal('0');
    });

    it('should not send tokens if fullLockMonths > 0', async () => {
      if (fullLockMonths > 0) {
        await expectRevert(
          yieldTokenHolder.claim(holderSettings[name].team[0].address, '2'),
          `available amount is less than requested amount`
        );

        (
          await yieldTokenHolder.getAvailableTokens(
            holderSettings[name].team[1].address
          )
        ).should.be.bignumber.equal('0');
      }
    });

    it('should increaseTime to skip full lock and get successful mint', async () => {
      let additionalMonth = fullLockMonths * 3600 * 24 * 30;
      await increaseTime.increaseTime(additionalMonth);
    });

    it('should not send tokens from an uknown addres ', async () => {
      await expectRevert(
        yieldTokenHolder.claim(holderSettings[name].team[1].address, '777', {
          from: accounts[1],
        }),
        `available amount is less than requested amount`
      );
    });

    it('should correctly transfer first portion', async () => {
      for (let c = 0; c < holderSettings[name].team.length; c++) {
        let _lt = holderSettings[name].team[c];
        (
          await yieldTokenHolder.getAvailableTokens(_lt.address)
        ).should.be.bignumber.equal(_lt.perMonth);

        await yieldTokenHolder.claim(_lt._claimTo, _lt._tranche1, {
          from: _lt.address,
        });
        (await yieldToken.balanceOf(_lt._claimTo)).should.be.bignumber.equal(
          _lt._tranche1
        );
      }
    });

    it('should correctly transfer leftover', async () => {
      for (let c = 0; c < holderSettings[name].team.length; c++) {
        let _lt = holderSettings[name].team[c];

        await yieldTokenHolder.claim(_lt._claimTo, _lt._tranche2, {
          from: _lt.address,
        });
        (await yieldToken.balanceOf(_lt._claimTo)).should.be.bignumber.equal(
          _lt.perMonth
        );

        await expectRevert(
          yieldTokenHolder.claim(_lt._claimTo, '1', {
            from: _lt.address,
          }),
          `available amount is less than requested amount.`
        );

        let _contribution = await getTeamContribution(
          yieldTokenHolder,
          _lt.address
        );
        _contribution.sent.should.be.bignumber.equal(_lt.perMonth);
      }
    });
  });

  describe('Do not send portion 2 yet', () => {
    it(`should increase time but not enough [29 days]`, async () => {
      await increaseTime.increaseTime(86400 * 29);
      await expectRevert(
        yieldTokenHolder.claim(holderSettings[name].team[1].address, '1', {
          from: accounts[1],
        }),
        `available amount is less than requested amount`
      );

      (
        await yieldTokenHolder.getAvailableTokens(
          holderSettings[name].team[0].address
        )
      ).should.be.bignumber.equal('0');
    });
  });

  describe('Send two portions [for 2 months]', () => {
    it('should increaseTime to +2 month', async () => {
      await increaseTime.increaseTime(86400 * 30 * 2); //+2 months in total
    });
    it('should send tokens for two months +2 month', async () => {
      for (let c = 0; c < holderSettings[name].team.length; c++) {
        let _lt = holderSettings[name].team[c];
        let amountToSend =
          releasesMonths > 2 ? _lt.perMonth.muln(2) : _lt.perMonth;

        (
          await yieldTokenHolder.getAvailableTokens(_lt.address)
        ).should.be.bignumber.equal(amountToSend);

        await yieldTokenHolder.claim(_lt._claimTo, amountToSend, {
          from: _lt.address,
        });
        (await yieldToken.balanceOf(_lt._claimTo)).should.be.bignumber.equal(
          amountToSend.add(_lt.perMonth)
        );
      }
    });

    it('should not send anymore', async () => {
      for (let c = 0; c < holderSettings[name].team.length; c++) {
        let _lt = holderSettings[name].team[c];
        (
          await yieldTokenHolder.getAvailableTokens(_lt.address)
        ).should.be.bignumber.equal('0');

        await expectRevert(
          yieldTokenHolder.claim(_lt._claimTo, '1', {
            from: _lt.address,
          }),
          `available amount is less than requested amount.`
        );

        let _contribution = await getTeamContribution(
          yieldTokenHolder,
          _lt.address
        );
        _contribution.sent.should.be.bignumber.equal(
          _lt.perMonth.muln(releasesMonths > 2 ? 3 : 2)
        );
      }
    });
  });

  describe('check final portion', () => {
    it('should increaseTime exactly to get all tokens', async () => {
      //-2 cause we already pass the two month
      await increaseTime.increaseTime(
        (releasesMonths + fullLockMonths - 2) * 86400 * 30
      );
    });

    it('should match available balance', async () => {
      for (let c = 0; c < holderSettings[name].team.length; c++) {
        let _lt = holderSettings[name].team[c];

        let _contribution = await getTeamContribution(
          yieldTokenHolder,
          _lt.address
        );

        (
          await yieldTokenHolder.getAvailableTokens(_lt.address)
        ).should.be.bignumber.equal(
          _contribution.maxCap.sub(_contribution.sent)
        );
      }
    });
  });

  describe('Send final portion', () => {
    it('should increaseTime to random amount to test overflow', async () => {
      await increaseTime.increaseTime(86400 * 30 * 365 * 3); //+9 years
    });

    it('should not send [overflow]', async () => {
      for (let c = 0; c < holderSettings[name].team.length; c++) {
        let _lt = holderSettings[name].team[c];
        await expectRevert(
          yieldTokenHolder.claim(_lt._claimTo, _lt.maxCap, {
            from: _lt.address,
          }),
          `available amount is less than requested amount`
        );
      }
    });

    it('should not show availability overflow', async () => {
      for (let c = 0; c < holderSettings[name].team.length; c++) {
        let _lt = holderSettings[name].team[c];

        (
          await yieldTokenHolder.getAvailableTokens(_lt.address)
        ).should.be.bignumber.equal(
          _lt.maxCap.sub(_lt.perMonth.muln(releasesMonths > 2 ? 3 : 2))
        );
      }
    });

    it('should send', async () => {
      if (releasesMonths > 2) {
        for (let c = 0; c < holderSettings[name].team.length; c++) {
          let _lt = holderSettings[name].team[c];
          let amountToSend = _lt.maxCap.sub(_lt.perMonth.muln(3));

          await yieldTokenHolder.claim(_lt._claimTo, amountToSend, {
            from: _lt.address,
          });

          (await yieldToken.balanceOf(_lt._claimTo)).should.be.bignumber.equal(
            _lt.maxCap
          );
        }
      }
    });

    it('should not send anymore, even 1 token', async () => {
      for (let c = 0; c < holderSettings[name].team.length; c++) {
        let _lt = holderSettings[name].team[c];
        await expectRevert(
          yieldTokenHolder.claim(_lt._claimTo, '1', {
            from: _lt.address,
          }),
          `available amount is less than requested amount`
        );

        let _contribution = await getTeamContribution(
          yieldTokenHolder,
          _lt.address
        );

        _contribution.maxCap.should.be.bignumber.equal(_contribution.sent);

        (
          await yieldTokenHolder.getAvailableTokens(_lt.address)
        ).should.be.bignumber.equal(new BN(0));
      }
    });

    it('holder contrac should not have any yield tokens anymore', async () => {
      (
        await yieldToken.balanceOf(yieldTokenHolder.address)
      ).should.be.bignumber.equal(new BN('0'));
    });
  });
}

async function getTeamContribution(yieldTokenHolder, address) {
  let _contribution = await yieldTokenHolder.team(address);
  return {
    perMonth: _contribution[0],
    maxCap: _contribution[1],
    sent: _contribution[2],
  };
}

const YIELDToken = artifacts.require('YIELDToken');
const Chain = artifacts.require('Chain');
const Wallet = require('ethereumjs-wallet').default;
const chai = require('chai');
chai.use(require('chai-as-promised')).should();
const BN = require('bn.js');
chai.use(require('chai-bn')(BN));
const { expectRevert } = require('@openzeppelin/test-helpers'); ///*expectEvent, */

const { sign2612 } = require('./helpers/signatures');
const { MAX_UINT256 } = require('./helpers/constants');

let yieldTokenInstance;
let totalSupply = web3.utils.toWei('140736000', 'ether');

contract('YIELDToken', (accounts) => {
  it(`balance of deployer should be ${totalSupply} YIELDToken in the first account`, async () => {
    yieldTokenInstance = await YIELDToken.new();
    (await yieldTokenInstance.balanceOf(accounts[0])).should.be.bignumber.equal(
      totalSupply,
      `${totalSupply} wasn't in the first account`
    );
  });

  it(`It should approve & transferFrom some tokens`, async () => {
    await yieldTokenInstance.approve(
      accounts[1],
      web3.utils.toWei('10', 'ether')
    );

    (
      await yieldTokenInstance.allowance(accounts[0], accounts[1])
    ).should.be.bignumber.equal(
      web3.utils.toWei('10', 'ether'),
      `${web3.utils.toWei('10', 'ether')} wasn't in allowance`
    );

    await yieldTokenInstance.transferFrom(
      accounts[0],
      accounts[1],
      web3.utils.toWei('10', 'ether'),
      { from: accounts[1] }
    );

    (await yieldTokenInstance.balanceOf(accounts[1])).should.be.bignumber.equal(
      web3.utils.toWei('10', 'ether'),
      `${web3.utils.toWei('10', 'ether')} wasn't in the second account`
    );
  });

  it(`It should burn something`, async () => {
    await yieldTokenInstance.burn(web3.utils.toWei('10', 'ether'), {
      from: accounts[1],
    });
    (await yieldTokenInstance.balanceOf(accounts[1])).should.be.bignumber.equal(
      '0',
      `Burn function is probably wrong`
    );
  });

  let walletAddress;
  let amount;
  let chainId;
  const OTHER_USER = accounts[1];
  it('should change allowance through permit', async () => {
    const wallet = Wallet.generate();
    walletAddress = wallet.getAddressString();
    amount = new BN(10).pow(new BN(18));

    //we got missmatches on some environments
    //chainId = await web3.eth.getChainId();

    let chainContract = await Chain.new();
    chainId = await chainContract.getChainId();

    //actually transfer some tokens to newly genereated address`
    await yieldTokenInstance.transfer(walletAddress, amount);

    const contractData = {
      name: 'Yield Protocol',
      verifyingContract: yieldTokenInstance.address,
    };
    const transactionData = {
      owner: walletAddress,
      spender: OTHER_USER,
      value: amount,
    };
    const { v, r, s } = sign2612(
      contractData,
      transactionData,
      wallet.getPrivateKey(),
      chainId
    );

    await yieldTokenInstance.permit(
      walletAddress,
      OTHER_USER,
      amount.toString(10),
      MAX_UINT256.toString(10),
      v,
      r,
      s,
      {
        from: OTHER_USER,
      }
    );

    (
      await yieldTokenInstance.allowance(walletAddress, OTHER_USER)
    ).should.be.bignumber.equal(amount, `${amount} wasn't in allowance`);
  });

  it('should transfer allowed amount via permit', async () => {
    await yieldTokenInstance.transferFrom(walletAddress, OTHER_USER, amount, {
      from: OTHER_USER,
    });
    (await yieldTokenInstance.balanceOf(OTHER_USER)).should.be.bignumber.equal(
      amount,
      `${amount} wasn't in the last account`
    );
  });

  let doubleWallet;
  let _v, _r, _s;
  it('should change allowance through permit one more time', async () => {
    doubleWallet = Wallet.generate();
    walletAddress = doubleWallet.getAddressString();
    amount = new BN(6).pow(new BN(18));

    //actually transfer some tokens to newly genereated address`
    await yieldTokenInstance.transfer(walletAddress, amount);

    const contractData = {
      name: 'Yield Protocol',
      verifyingContract: yieldTokenInstance.address,
    };
    const transactionData = {
      owner: walletAddress,
      spender: OTHER_USER,
      value: amount,
    };
    const { v, r, s } = sign2612(
      contractData,
      transactionData,
      doubleWallet.getPrivateKey(),
      chainId
    );

    _v = v;
    _r = r;
    _s = s;

    //wrong amount, should be revert
    await expectRevert(
      yieldTokenInstance.permit(
        walletAddress,
        OTHER_USER,
        '151616',
        MAX_UINT256.toString(10),
        v,
        r,
        s,
        {
          from: OTHER_USER,
        }
      ),
      'ERC20Permit: invalid signature'
    );

    //wrong time, should be revert
    await expectRevert(
      yieldTokenInstance.permit(
        walletAddress,
        OTHER_USER,
        amount.toString(10),
        25995,
        v,
        r,
        s,
        {
          from: OTHER_USER,
        }
      ),
      'ERC20Permit: expired deadline'
    );

    await yieldTokenInstance.permit(
      walletAddress,
      OTHER_USER,
      amount.toString(10),
      MAX_UINT256.toString(10),
      v,
      r,
      s,
      {
        from: OTHER_USER,
      }
    );

    (
      await yieldTokenInstance.allowance(walletAddress, OTHER_USER)
    ).should.be.bignumber.equal(amount, `${amount} wasn't in allowance`);
  });

  it('it should get DOMAIN_SEPARATOR', async () => {
    (await yieldTokenInstance.DOMAIN_SEPARATOR()).should.not.be.empty;
  });
  // Re-using the same sig doesn't work since the nonce has been incremented
  // on the contract level for replay-protection
  it('should NOT re-use the same sig since the nonce has been incremented', async () => {
    (await yieldTokenInstance.nonces(walletAddress)).should.be.bignumber.equal(
      new BN('1'),
      `nonce is wrong`
    );

    await expectRevert(
      yieldTokenInstance.permit(
        walletAddress,
        OTHER_USER,
        amount.toString(10),
        MAX_UINT256.toString(10),
        _v,
        _r,
        _s,
        {
          from: OTHER_USER,
        }
      ),
      'ERC20Permit: invalid signature'
    );

    (
      await yieldTokenInstance.allowance(walletAddress, OTHER_USER)
    ).should.be.bignumber.equal(amount, `${amount} wasn't in allowance`);
  });
});

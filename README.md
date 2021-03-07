# YIELDToken

Package for implementing the YIELD ERC20 token (EIP-2612)

## Running tests

1. Clone the repository

```bash
$ git clone https://github.com/YFarmerIO/yieldtoken.git
```

2. Install the dependencies

```bash
$ cd yieldtoken
$ npm install
```

3. Setup truffle-config.js depending on your requirements, template: truffle-config.js.default

4. Run tests

```bash
$ truffle run coverage
```

5. Deployment (this requires addition truffle-config.js configuration)

```bash
$ truffle migrate
```

6. Verify deployment on etherscan
```bash
$ truffle run verify YIELDToken YIELDTokenHolderLiquidity YIELDTokenHolderMarketing YIELDTokenHolderStakingRewards YIELDTokenHolderTeam --network {deployed network here}
```
// SPDX-License-Identifier: MIT
pragma solidity =0.7.4;

/**
 * @dev this contract is for test purpses only, to get current chain id for permittable token.
 * Of course we can get it via await web3.eth.getChainId(), 
 * but we got missmatches on some environments 
 */
contract Chain{
    function getChainId() public view returns (uint256 chainId) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        // solhint-disable-next-line no-inline-assembly
        assembly {
        chainId := chainid()
        }
    }
}

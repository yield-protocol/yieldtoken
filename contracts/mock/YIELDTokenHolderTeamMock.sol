// SPDX-License-Identifier: MIT
pragma solidity =0.7.4;

import "../YIELDTokenHolderTeam.sol";

contract YIELDTokenHolderTeamMock is YIELDTokenHolderTeam {

    constructor (address _yieldTokenAddress, address _address1, address _address2, address _address3) YIELDTokenHolderTeam(_yieldTokenAddress){
        team[_address1] = TeamOptions(1809865 ether, 18098650 ether, 0);
        team[_address2] = TeamOptions(468651 ether, 4686510 ether, 0);
        team[_address3] = TeamOptions(235084 ether, 2350840 ether, 0);
    }

}
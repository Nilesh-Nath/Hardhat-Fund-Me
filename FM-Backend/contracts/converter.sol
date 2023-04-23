//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library converter {
    //Library functions should be internal
    function getPrice(
        AggregatorV3Interface priceFeedAddress
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeedAddress.latestRoundData();
        return uint256(price * 1e10);
    }

    function convertPrice(
        uint256 ethAmount,
        AggregatorV3Interface priceFeedAddress
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeedAddress);
        return ((ethAmount * ethPrice) / 1e18);
    }
}

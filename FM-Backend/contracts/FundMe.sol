//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./converter.sol";

contract FundMe {
    uint256 private minimumUSD = 50 * 1e18;
    using converter for uint256;
    address[] public funders;
    mapping(address => uint256) public fundersToFund;
    address private owner;
    AggregatorV3Interface public priceFeedAddress;

    constructor(address dataPriceFeedAddress) {
        owner = msg.sender;
        priceFeedAddress = AggregatorV3Interface(dataPriceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.convertPrice(priceFeedAddress) > minimumUSD,
            "Not Paid Enough!"
        );
        address funder = msg.sender;
        funders.push(funder);
        fundersToFund[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        // payable(msg.sender).transfer(address(this).balance);
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Unsuccessfull!");
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            fundersToFund[funder] = 0;
        }

        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Withdraw Failed!");
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Sorry , Only owners can withdraw Fund :( )"
        );
        _;
    }

    function getterOwner() public view returns (address) {
        return owner;
    }

    function getterMinimumUSD() public view returns (uint256) {
        return minimumUSD;
    }
}

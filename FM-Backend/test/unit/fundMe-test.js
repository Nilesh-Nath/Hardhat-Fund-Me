const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");

describe("FundMe", () => {
  let deployer, fundMe, mock;
  const ethAmount = ethers.utils.parseEther("1");
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mock = await ethers.getContract("MockV3Aggregator", deployer);
  });

  it("The Address of mock should be equal to the data Feed Address we provided!", async () => {
    const priceFeed = await fundMe.priceFeedAddress();
    assert.equal(priceFeed, mock.address);
  });

  describe("Fund", () => {
    it("It should revert the transcation if the funded amount is less than minimum required Amount!", async () => {
      expect(fundMe.fund()).to.be.revertedWith(
        "It should revert the transcation if the funded amount is less than minimum required Amount!"
      );
    });

    it("It should store the address of funders to the array!", async () => {
      const response = await fundMe.fund({ value: ethAmount });
      const funder = await fundMe.funders(0);
      assert.equal(funder, deployer);
    });

    it("It should map to the address of funder to the respective Donated fund!", async () => {
      const response = await fundMe.fund({ value: ethAmount });
      const amount = await fundMe.fundersToFund(deployer);
      assert.equal(amount.toString(), ethAmount.toString());
    });
  });

  describe("Withdraw", () => {
    it("It should withdraw the fund from the contract!", async () => {
      const balanceOfContractB4Tx = await ethers.provider.getBalance(
        fundMe.address
      );
      const balanceOfDeployerB4Tx = await ethers.provider.getBalance(deployer);

      const transcationResponse = await fundMe.withdraw();
      const transactionReceipt = await transcationResponse.wait(1);
      const { effectiveGasPrice, gasUsed } = transactionReceipt;
      const totalGas = effectiveGasPrice.mul(gasUsed);
      const balanceOfContractAfterTx = await ethers.provider.getBalance(
        fundMe.address
      );
      const balanceOfDeployerAfterTx = await ethers.provider.getBalance(
        deployer
      );

      assert.equal(balanceOfContractAfterTx, 0);
      assert.equal(
        balanceOfContractB4Tx.add(balanceOfDeployerB4Tx).toString(),
        balanceOfDeployerAfterTx.add(totalGas).toString()
      );
    });
  });
});

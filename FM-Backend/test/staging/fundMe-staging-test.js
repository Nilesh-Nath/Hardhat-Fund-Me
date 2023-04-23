const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");

const chainId = network.config.chainId;

chainId !== 31337
  ? describe.skip
  : describe("FundMe", () => {
      let deployer, fundMe;
      const ethAmount = ethers.utils.parseEther("1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("It should revert the transaction if not enough amount is funded!", async () => {
        expect(fundMe.fund()).to.be.revertedWith(
          "It should revert the transaction if not enough amount is funded!"
        );
      });

      it("It should store the funders address in array!", async () => {
        const fund = await fundMe.fund({ value: ethAmount });
        const funder = await fundMe.funders(0);
        assert.equal(funder, deployer);
      });

      it("It should map the address of the funder to the Fund They Donated!", async () => {
        const transaction = await fundMe.fund({ value: ethAmount });
        const fund = await fundMe.fundersToFund(deployer);
        assert.equal(fund.toString(), ethAmount.toString());
      });

      it("It should Withdraw money from the Contract!", async () => {
        const balanceOfContractB4Tx = await ethers.provider.getBalance(
          fundMe.address
        );
        const balanceOfDeployerB4Tx = await ethers.provider.getBalance(
          deployer
        );

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

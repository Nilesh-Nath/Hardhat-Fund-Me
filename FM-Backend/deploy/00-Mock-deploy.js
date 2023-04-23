const { network } = require("hardhat");
const { DECIMAL, INITIAL_ANSWER } = require("../helper.config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const args = [DECIMAL, INITIAL_ANSWER];

  if (chainId == 31337) {
    log("Local Host Detected....Deploying Mocks....");
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: args,
    });
    log("Mocks Deployed!");
  }
};

module.exports.tags = ["all"];

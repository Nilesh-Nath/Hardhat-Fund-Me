const { network } = require("hardhat");
const { networkConfig } = require("../helper.config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let ethUsdPriceFeedAddress;
  if (chainId == 31337) {
    const mock = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = mock.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["address"];
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    log: true,
    args: [ethUsdPriceFeedAddress],
  });

  log("Verifying....");

  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
};

module.exports.tags = ["all"];

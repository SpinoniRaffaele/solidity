const { getNamedAccounts, ethers } = require("hardhat");

async function getWeth() {
  const { deployer } = await getNamedAccounts();

  // interacting with wETH contract
  const hardhartNetworkWethContractAddress =
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const iWeth = await ethers.getContractAt(
    "IWeth",
    hardhartNetworkWethContractAddress,
    deployer
  );
  await iWeth.deposit({ value: "100000000000000000" });
  await Text.await(1);
  const wethBalance = await iWeth.balanceOf(deployer);
  console.log(wethBalance);
}

module.exports = { getWeth };

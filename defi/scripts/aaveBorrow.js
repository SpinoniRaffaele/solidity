const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth } = require("../scripts/getWeth");

// AAVE interaction:
// deposit wEth to the protocol,
// borrow some DAI (conversion rate provided by oracle),
// repay the DAI
async function main() {
  await getWeth();
  const { deployer } = await getNamedAccounts();
  const lendingPool = await getLendingPool(deployer);

  // interacting with wETH contract
  const hardhartNetworkWethContractAddress =
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  await approveErc20(
    hardhartNetworkWethContractAddress,
    lendingPool.address,
    "200000000000000000",
    deployer
  );
  await lendingPool.deposit(
    hardhartNetworkWethContractAddress,
    "20000000000000000000",
    deployer,
    0 // just the referral
  );

  let { availableBorrowsEth, totalDebtEth } = getBorrowUserData(
    lendingPool,
    deployer
  );

  const daiPrice = await getDaiPrice();
  const amountDaiToBorrow =
    availableBorrowsEth.toString() * 0.95 * (1 / daiPrice) * 10 ** 18;

  const datTokenAddress = "0x..."; // public adress available online
  await borrowDai(datTokenAddress, lendingPool, amountDaiToBorrow, deployer);

  await repay(amountDaiToBorrow, daiTokenAddress, lendingPool, deployer);
}

async function repay(amount, daiAddress, lendingPool, account) {
  await approveErc20(daiAddress, lendingPool.address, amount, account);
  const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
}

async function borrowDai(daiAddress, lendingPool, amountDai, account) {
  const tx = await lendingPool.borrow(daiAddress, amountDai, account);
  await tx.wait(1);
}

async function getDaiPrice() {
  const daiEthOracleAddress = ""; // it's available on chainlink
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    daiEthOracleAddress
  );
  const price = (await daiEthPriceFeed.latestRoundData())[1];
  return price;
}

async function getBorrowUserData(lendingPool, account) {
  const { totalCollateralEth, totalDebtEth, availableBorrwsEth } =
    await lendingPool.geUserAccountData(account);
  console.log(
    `total collateral : ${totalCollateralEth}, 
    you have ${totalDebtEth} borrowed 
    and ${availableBorrwsEth} available`
  );
  return { totalCollateralEth, totalDebtEth };
}

// interacting with AAVE contract
// Lending pool address provider is publicly available on aave website
// (as the interface of the contract for the ABI)
async function getLendingPool(account) {
  const address = "";
  const lendingPoolAddressProvider = ethers.getContractAt(
    "ILendingPoolAddressProvider", //coming from node_modules (@aave dependency)
    address,
    account
  );
  const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
}

async function approveErc20(
  contractAddress,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt(
    "IERC20",
    contractAddress,
    account
  );
  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
}

main();

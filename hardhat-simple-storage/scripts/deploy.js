const { ethers } = require("hardhat");

async function main() {
  const simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await simpleStorageFactory.deploy();
  simpleStorage.waitForDeployment();
  const a = await simpleStorage.getAddress();
  console.log(a);

  const transactionResponse = await simpleStorage.store(7);
  await transactionResponse.wait(1);

  const value = await simpleStorage.retrieve();
  console.log(value);
}

main();

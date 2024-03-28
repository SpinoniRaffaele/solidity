const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage test", () => {
  let simpleStorageFactory, simpleStorage;

  beforeEach(async () => {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
  });

  it("should start with favorite number of 0", async () => {
    const result = await simpleStorage.retrieve();
    expect(result).equal(0);
  });

  it("should set favorite number", async () => {
    await simpleStorage.store(7);
    const result = await simpleStorage.retrieve();
    expect(result.toString()).equal("7");
  });
});

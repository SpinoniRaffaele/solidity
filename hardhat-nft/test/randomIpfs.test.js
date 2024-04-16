const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");

describe("Random IPFS NFT Unit Tests", function () {
  let randomIpfsNft, deployer, vrfCoordinatorV2Mock;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["mocks", "randomipfs"]);
    randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
    vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock",
      deployer
    );
  });

  describe("constructor", () => {
    it("sets starting values correctly", async function () {
      const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0);
      assert(dogTokenUriZero.includes("ipfs://"));
    });
  });

  describe("requestNft", () => {
    it("emits an event and kicks off a random word request", async function () {
      const fee = await randomIpfsNft.getMintFee();
      await expect(randomIpfsNft.requestNft({ value: fee.toString() })).to.emit(
        randomIpfsNft,
        "NftRequested"
      );
    });
  });
  describe("fulfillRandomWords", () => {
    it("mints NFT after random number is returned", async function () {
      await new Promise(async (resolve, reject) => {
        randomIpfsNft.once("NftMinted", async (tokenId, breed, minter) => {
          try {
            const tokenUri = await randomIpfsNft.tokenURI(tokenId.toString());
            const tokenCounter = await randomIpfsNft.getTokenCounter();
            const dogUri = await randomIpfsNft.getDogTokenUris(
              breed.toString()
            );
            assert.equal(tokenUri.toString().includes("ipfs://"), true);
            assert.equal(dogUri.toString(), tokenUri.toString());
            assert.equal(+tokenCounter.toString(), +tokenId.toString() + 1);
            assert.equal(minter, deployer.address);
            resolve();
          } catch (e) {
            console.log(e);
            reject(e);
          }
        });
        try {
          const fee = await randomIpfsNft.getMintFee();
          const requestNftResponse = await randomIpfsNft.requestNft({
            value: fee.toString(),
          });
          const requestNftReceipt = await requestNftResponse.wait(1);
          await vrfCoordinatorV2Mock.fulfillRandomWords(
            requestNftReceipt.events[1].args.requestId,
            randomIpfsNft.address
          );
        } catch (e) {
          console.log(e);
          reject(e);
        }
      });
    });
  });
  describe("getBreedFromModdedRng", () => {
    it("should return pug if moddedRng < 10", async function () {
      const expectedValue = await randomIpfsNft.getBreedFromModdedRng(7);
      assert.equal(0, expectedValue);
    });
    it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
      const expectedValue = await randomIpfsNft.getBreedFromModdedRng(21);
      assert.equal(1, expectedValue);
    });
    it("should return st. bernard if moddedRng is between 40 - 99", async function () {
      const expectedValue = await randomIpfsNft.getBreedFromModdedRng(77);
      assert.equal(2, expectedValue);
    });
  });
});

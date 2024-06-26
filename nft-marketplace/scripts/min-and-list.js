const PRICE = "100000000000000000";

async function mintAndList() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const basicNft = await ethers.getContract("BasicNft");
  console.log("Minitng...");
  const mintTx = await basicNft.mintNft();
  const mintTxReceipt = await mintTx.wait(1);
  const tokenId = mintTxReceipt.events[0].args.tokenId;
  console.log("Approving Nft...");

  const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId);
  await approvalTx.wait(1);
  console.log("Listing...");
  const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
  await tx.wait(1);
  console.log("Listed");
}

mintAndList();

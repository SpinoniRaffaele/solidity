const { ethers } = require("ethers");

async function main() {
  const boxProxyAdmin = await ethers.getContract("BoxProxyAdmin");
  const transparentProxy = await ethers.getContract("Box_Proxy"); // the transparent proxy into the proxy admin contract
  const boxV2 = await ethers.getContract("BoxV2");

  const upgradeTx = await boxProxyAdmin.upgrade(
    transparentProxy.address,
    boxV2.address
  ); //function of the proxy that allows to swap implementation
  await upgradeTx.wait(1);

  // the user of the proxy will use the ABI of the implementation and the address of the proxy
  const proxyBox = await ethers.getContractAt(
    "BoxV2",
    transparentProxy.address
  );
  // now you can normally interact with the transparent proxy like it were BoxV2
}

main();

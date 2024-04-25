module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const boxV2 = await deploy("BoxV2", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
    proxy: {
      //this is telling hardhat to deploy it behind a proxy, it needs @openzeppelin/contracts as a dependency and a Proxy contract implementation
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: {
        name: "BoxProxyAdmin",
        artifact: "BoxProxyAdmin", //checkout the simple implementation
      },
    },
  });
};

module.exports.tags = ["all", "box"];

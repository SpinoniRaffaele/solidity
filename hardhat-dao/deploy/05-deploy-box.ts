import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {getNamedAccounts, deployments} = hre;
    const {deploy, log, get} = deployments;
    const {deployer} = await getNamedAccounts();
    const box = await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1
    });
    const timelock = await ethers.getContract("TimeLock");
    const boxContract = await ethers.getContract("Box");

    const transferOwnerTx = await boxContract.transferOwnership(timelock.address);
    // setting the new owner to be the timelock which is the head of the governance
    await transferOwnerTx.wait(1);
}

export default deployBox;
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const VOTING_PERIOD = 5;
export const VOTING_DELAY = 1;
export const QUORUM_PERCENTAGE = 4;

const governorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {getNamedAccounts, deployments} = hre;
    const {deploy, log, get} = deployments;
    const {deployer} = await getNamedAccounts();
    const governanceToken = await get("GovernanceToken");
    const timelock = await get("TimeLock");
    const governorContract = await deploy("GovernorContract", {
        from: deployer,
        args: [governanceToken.address, timelock.address, QUORUM_PERCENTAGE, VOTING_PERIOD, VOTING_DELAY],
        log: true,
        waitConfirmations: 1
    });
}

export default governorContract;
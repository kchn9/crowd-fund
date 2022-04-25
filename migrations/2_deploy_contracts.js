var CrowdFund = artifacts.require("./CrowdFund.sol");
require("dotenv").config({ path: "../.env" });

const timeToFundingOver = process.env.TIME_TO_FUNDING_PHASE_OVER; // time in seconds to end stake phase
const fundingGoal = process.env.FUNDING_GOAL;

module.exports = async function(deployer, _, accounts) {
  deployer.deploy(CrowdFund, timeToFundingOver, fundingGoal, await accounts[0]);
};

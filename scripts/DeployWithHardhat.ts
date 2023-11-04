import { ethers } from "hardhat";
//const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
  const proposals = process.argv.slice(2);
  if (!proposals || proposals.length < 1)
    throw new Error("Proposals not provided");
  console.log(
    "--------------------Deploying Ballot contract-----------------------------------"
  );

  //const signers = await ethers.getSigners();
  //const provider = signers[0].provider;

  const ballotFactory = await ethers.getContractFactory("Ballot");
  const proposalsBytes32 = proposals.map(ethers.encodeBytes32String);
  const ballotContract = await ballotFactory.deploy(proposalsBytes32);
  console.log(
    "---------------------Waiting for deployment-------------------------------------"
  );
  await ballotContract.waitForDeployment();
  console.log(
    "---------------------Contract has been deployed-------------------------------------"
  );
  console.log(`Contract deployed to ${ballotContract.target}`);
  for (let index = 0; index < proposals.length; index++) {
    const proposal = await ballotContract.proposals(index);
    const name = ethers.decodeBytes32String(proposal.name);
    console.log({ index, name, proposal });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

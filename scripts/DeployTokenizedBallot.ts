import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { TokenizedBallot__factory } from "../typechain-types";
dotenv.config();


const MYTOKEN_CONTRACT_ADDRESS = "0x83D094e3A9980113153B5015d2FEF9C62725B901";

async function main() {
  //receiving parameters
  const proposals = process.argv.slice(2);
  if (!proposals || proposals.length < 1)
    throw new Error("Proposals not provided");
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });

  //inspecting data from public blockchains using RPC connections (configuring the provider)
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  const lastBlock = await provider.getBlock("latest");
  console.log(`Last block number: ${lastBlock?.number}`);
  const lastBlockTimestamp = lastBlock?.timestamp ?? 0;
  const lastBlockDate = new Date(lastBlockTimestamp * 1000);
  console.log(
    `Last block timestamp: ${lastBlockTimestamp} (${lastBlockDate.toLocaleDateString()} ${lastBlockDate.toLocaleTimeString()})`
  );
  //configuring the wallet - metamask wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

  console.log(`Using wallet ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance} ETH`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  //deploying the smart contract using Typechain
  const ballotFactory = new TokenizedBallot__factory(wallet);
  const ballotContract = await ballotFactory.deploy(
    proposals.map(ethers.encodeBytes32String),
    MYTOKEN_CONTRACT_ADDRESS,
    "4685737"
  );
  await ballotContract.waitForDeployment();
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
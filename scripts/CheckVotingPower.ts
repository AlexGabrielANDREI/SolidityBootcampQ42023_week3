import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";
import { getProvider, getWalletAddress } from "./Helpers";
dotenv.config();

async function main() {
  //receiving parameters
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 1)
    throw new Error("Parameters not provided");
  const contractAddress = parameters[0];
  const accountAddress = parameters[1];

  console.log(
    `Contract address: ${contractAddress}`
  );

  //inspecting data from public blockchains using RPC connections (configuring the provider)
  const provider = getProvider();
  // const lastBlock = await provider.getBlock("latest");
  // console.log(`Last block number: ${lastBlock?.number}`);
  // const lastBlockTimestamp = lastBlock?.timestamp ?? 0;
  // const lastBlockDate = new Date(lastBlockTimestamp * 1000);
  // console.log(
  //   `Last block timestamp: ${lastBlockTimestamp}`
  // );

  // configuring the wallet - metamask wallet
  const wallet = getWalletAddress(provider);

  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance} ETH`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  //attaching the smart contract using Typechain
  const ballotFactory = new TokenizedBallot__factory(wallet);
  const ballotContract = ballotFactory.attach(
    contractAddress
  ) as TokenizedBallot;
  const VotesAfter = await ballotContract.votingPower(accountAddress);
  
  console.log(
    `Account ${accountAddress} has ${VotesAfter.toString()} units of voting power after self delegating\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from "hardhat";

const main = async () => {
  const transactionsFactory = await ethers.getContractFactory("Transactions");
  const transactionsContract = await transactionsFactory.deploy();

  await transactionsContract.waitForDeployment();

  const address = await transactionsContract.getAddress();
  console.log("Transactions address: ", address);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();

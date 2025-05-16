const hre = require("hardhat");

async function main() {
  // Get the contract factories
  const USDCPaymentRouter = await hre.ethers.getContractFactory("USDCPaymentRouter");
  const BeaconPoints = await hre.ethers.getContractFactory("BeaconPoints");
  const BusinessRegistry = await hre.ethers.getContractFactory("BusinessRegistry");
  const DiscountEngine = await hre.ethers.getContractFactory("DiscountEngine");

  // Base Mainnet USDC address (verify this is the correct address)
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  console.log("Deploying contracts to Base Mainnet...");

  // Deploy contracts
  const paymentRouter = await USDCPaymentRouter.deploy(USDC_ADDRESS);
  await paymentRouter.deployed();
  console.log("USDCPaymentRouter deployed to:", paymentRouter.address);

  const beaconPoints = await BeaconPoints.deploy();
  await beaconPoints.deployed();
  console.log("BeaconPoints deployed to:", beaconPoints.address);

  const businessRegistry = await BusinessRegistry.deploy();
  await businessRegistry.deployed();
  console.log("BusinessRegistry deployed to:", businessRegistry.address);

  const discountEngine = await DiscountEngine.deploy();
  await discountEngine.deployed();
  console.log("DiscountEngine deployed to:", discountEngine.address);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await paymentRouter.deployTransaction.wait(5);
  await beaconPoints.deployTransaction.wait(5);
  await businessRegistry.deployTransaction.wait(5);
  await discountEngine.deployTransaction.wait(5);

  console.log("All contracts deployed successfully!");

  // Verify contracts on BaseScan
  console.log("Verifying contracts on BaseScan...");
  
  try {
    await hre.run("verify:verify", {
      address: paymentRouter.address,
      constructorArguments: [USDC_ADDRESS],
    });
    console.log("USDCPaymentRouter verified on BaseScan");
  } catch (error) {
    console.log("Error verifying USDCPaymentRouter:", error);
  }

  try {
    await hre.run("verify:verify", {
      address: beaconPoints.address,
      constructorArguments: [],
    });
    console.log("BeaconPoints verified on BaseScan");
  } catch (error) {
    console.log("Error verifying BeaconPoints:", error);
  }

  try {
    await hre.run("verify:verify", {
      address: businessRegistry.address,
      constructorArguments: [],
    });
    console.log("BusinessRegistry verified on BaseScan");
  } catch (error) {
    console.log("Error verifying BusinessRegistry:", error);
  }

  try {
    await hre.run("verify:verify", {
      address: discountEngine.address,
      constructorArguments: [],
    });
    console.log("DiscountEngine verified on BaseScan");
  } catch (error) {
    console.log("Error verifying DiscountEngine:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
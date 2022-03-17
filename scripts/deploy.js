async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("DeBeToken");
  const token = await Token.deploy();
  await token.deployed();

  console.log("Token address:", token.address);

  Lottery = await ethers.getContractFactory("Lottery");
  lottery = await Lottery.deploy(token.address);
  await lottery.deployed();

  console.log("Contract address:", lottery.address);

  // save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(token, "DeBeToken");
  saveFrontendFiles(lottery, "Lottery");
}

function saveFrontendFiles(contract, contractName) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Contract: contract.address }, undefined, 2)
  );

  const ContractArtifact = artifacts.readArtifactSync(contractName);

  fs.writeFileSync(
    contractsDir + "/" + contractName + ".json",
    JSON.stringify(ContractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

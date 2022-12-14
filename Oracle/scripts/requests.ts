import { ethers } from "hardhat";
// require("@nomiclabs/hardhat-waffle");
// const hre = require("hardhat");
// import {request}

async function main() {

    const Request = await ethers.getContractFactory("Request");
    const request = await Request.attach("0xCa9f888D7d4C54833aB5D430D1fa6eAdFF017840");
    // const test_id = await request.callStatic.requestPrice("QQQ",11 , -1600000000000123n, 10100001010101000n, ["this is a test", "array of strings"]);
    // console.log(`test_id: ${JSON.stringify(test_id, null, 2)}`);
    const request_txn = await request.requestPrice("TSLA");
    // console.log(`Request deployed to ${JSON.stringify(request_txn, null, 2)}`);
    const request_txn_receipt = await request_txn.wait();
    console.log(`Request txn receipt: ${JSON.stringify(request_txn_receipt,null, 2)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

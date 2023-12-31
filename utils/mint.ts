import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  Ed25519Keypair,
  Ed25519PublicKey,
} from "@mysten/sui.js/keypairs/ed25519";
import { fromHEX } from "@mysten/sui.js/utils";
import { exec } from "child_process";

// create a new SuiClient object pointing to the network you want to use
const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface TickRecordContent {
  fields: {
    current_epoch: string;
  };
}

async function get_current_epoch(suiClient: SuiClient, TickRecordID: string) {
  const tick_record = await suiClient.getObject({
    id: TickRecordID,
    options: { showContent: true, showDisplay: true },
  });

  const tick_record_content = tick_record?.data
    ?.content as unknown as TickRecordContent;

  return parseInt(tick_record_content.fields.current_epoch);
}

let latest_epoch = -1;

export const executeStop = () => {
  execute = false;
};

let execute = true;

export async function executeTransaction(sKey: string,seconds: number = 10, tick: string = "MOVE") {
  const secretKey = sKey; // 修改这里，填入私钥
  const PACKAGE_ID =
    "0x830fe26674dc638af7c3d84030e2575f44a2bdc1baa1f4757cfe010a4b106b6a"; // mainnet
  const TickRecordID =
    "0xfa6f8ab30f91a3ca6f969d117677fb4f669e08bbeed815071cf38f4d19284199"; // mainnet
  const MINT_FEE = 100000000; // 0.1 SUI
  const TICK = tick;

  // Keypair from an existing secret key (Uint8Array)
  const keypair = Ed25519Keypair.fromSecretKey(fromHEX(secretKey));
  const publickey = new Ed25519PublicKey(keypair.getPublicKey().toRawBytes());
  const MY_ADDRESS = publickey.toSuiAddress();
  console.log(`My address: ${MY_ADDRESS}`);
  execute = true;
  while (execute) {
    let current_epoch = await get_current_epoch(suiClient, TickRecordID);
    if (latest_epoch == current_epoch) {
      await sleep(seconds * 1000); // 10 seconds
      continue;
    }
    latest_epoch = current_epoch;
    const txb = new TransactionBlock();
    const [coin] = txb.splitCoins(txb.gas, [MINT_FEE]);
    txb.moveCall({
      target: `${PACKAGE_ID}::movescription::mint`,
      // object IDs must be wrapped in moveCall arguments
      arguments: [
        txb.object(TickRecordID),
        txb.pure(TICK),
        coin,
        txb.pure("0x6"),
      ],
    });
    const result = await suiClient.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: keypair,
    });

    const transactionBlock = await suiClient.waitForTransactionBlock({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });
    console.log(`current epoch: ${current_epoch}`);
    console.log(`transactionBlock: ${JSON.stringify(transactionBlock)}`);
    console.log(`result: ${JSON.stringify(result)}`);
  }
}

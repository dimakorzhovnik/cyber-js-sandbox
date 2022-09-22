import { promises as fsPromises } from "fs"
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { SigningCyberClient, CyberClient } from "@cybercongress/cyber-js"
import { getHackatom } from './testutils';

const rpc = "https://rpc.space-pussy-1.cybernode.ai" // testnet

// testnet
// CHAIN_ID: 'space-pussy-1',
// NODE_URL_RPC: 'https://rpc.space-pussy-1.cybernode.ai',
// NODE_URL_LCD: 'https://lcd.space-pussy-1.cybernode.ai',

const getAliceSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
  return DirectSecp256k1HdWallet.fromMnemonic(
    (await fsPromises.readFile("./testnet.alice.mnemonic.key")).toString(),
    {
      prefix: "bostrom",
    }
  )
}

const runAll = async (): Promise<void> => {
  const client = await CyberClient.connect(rpc)
  console.log("With client, chain id:", await client.getChainId(), ", height:", await client.getHeight())

  const aliceSigner: OfflineDirectSigner = await getAliceSignerFromMnemonic()
  const alice = (await aliceSigner.getAccounts())[0].address
  console.log("Alice's address from signer", alice)

  console.log("Alice balances:", await client.getAllBalances(alice))

  const signingClient = await SigningCyberClient.connectWithSigner(rpc, aliceSigner)
  console.log(
    "With signing client, chain id:",
    await signingClient.getChainId(),
    ", height:",
    await signingClient.getHeight()
  )


  const wasmCode = getHackatom().data

  const result = await signingClient.upload(alice, wasmCode, {
    amount: [{ denom: "boot", amount: "0" }],
    gas: "2000000",
  })
  
  console.log("Transfer result:", result)
}

runAll()

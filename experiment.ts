import { promises as fsPromises } from "fs"
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { SigningCyberClient, CyberClient } from "@cybercongress/cyber-js"

const rpc = "http://127.0.0.1:26657" // local testnet

// testnet
// CHAIN_ID: 'space-pussy-1',
// NODE_URL_RPC: 'https://rpc.space-pussy-1.cybernode.ai',
// NODE_URL_LCD: 'https://lcd.space-pussy-1.cybernode.ai',

const bobAddress: string = "bostrom1apfeqr3mpfnpe8h3tmglzpm4yp6wkkv2g85srj"

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
}

runAll()

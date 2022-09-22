import { promises as fsPromises } from "fs"
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { SigningCyberClient, CyberClient } from "@cybercongress/cyber-js"

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

const checkPersonalBandwidth = async (client: CyberClient, alice: string): Promise<boolean> => {
  try {
    const response = await client.price()
    const priceLink = response.price.dec * 10 ** -18

    const responseAccountBandwidth = await client.accountBandwidth(alice)
    const { maxValue, remainedValue } = responseAccountBandwidth.neuronBandwidth

    if (maxValue === 0 || remainedValue === 0) {
      return false
    } else if (Math.floor(remainedValue / (priceLink * 1000)) === 0) {
      return false
    }

    return true
  } catch (error) {
    console.log('error', error)
    return false
  }
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

  if (await checkPersonalBandwidth(client, alice)) {
    const result = await signingClient.cyberlink(
      alice,
      "QmRX8qYgeZoYM3M5zzQaWEpVFdpin6FvVXvp6RPQK3oufV",
      "QmUX9mt8ftaHcn9Nc6SR4j9MsKkYfkcZqkfPTmMmBgeTe5",
      {
        amount: [],
        gas: "200000",
      }
    )
    console.log('result', result)
  } else {
    console.log("not enough personal bandwidth")
    return;
  }


}

runAll()

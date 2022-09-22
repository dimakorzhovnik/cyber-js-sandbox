import { fromBase64 } from "@cosmjs/encoding"

const hackatom = require('./testdata/contract.json');

/** An internal testing type. SigningCyberClient has a similar but different interface */
export interface ContractUploadInstructions {
  /** The wasm bytecode */
  readonly data: Uint8Array
}

export function getHackatom(): ContractUploadInstructions {
  return {
    data: fromBase64(hackatom.data),
  }
}

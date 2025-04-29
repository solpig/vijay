// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VijayIDL from '../target/idl/vijay.json'
import type { Vijay } from '../target/types/vijay'

// Re-export the generated IDL and type
export { Vijay, VijayIDL }

// The programId is imported from the program IDL.
export const VIJAY_PROGRAM_ID = new PublicKey(VijayIDL.address)

// This is a helper function to get the Vijay Anchor program.
export function getVijayProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...VijayIDL, address: address ? address.toBase58() : VijayIDL.address } as Vijay, provider)
}

// This is a helper function to get the program ID for the Vijay program depending on the cluster.
export function getVijayProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Vijay program on devnet and testnet.
      return new PublicKey('HQY5kLNtUJkEiArKxDyrkCKHBtK8pDFGUBifrGFjtLDt')
    case 'mainnet-beta':
    default:
      return VIJAY_PROGRAM_ID
  }
}

import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Vijay} from '../target/types/vijay'

describe('vijay', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Vijay as Program<Vijay>

  const vijayKeypair = Keypair.generate()

  it('Initialize Vijay', async () => {
    await program.methods
      .initialize()
      .accounts({
        vijay: vijayKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([vijayKeypair])
      .rpc()

    const currentCount = await program.account.vijay.fetch(vijayKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Vijay', async () => {
    await program.methods.increment().accounts({ vijay: vijayKeypair.publicKey }).rpc()

    const currentCount = await program.account.vijay.fetch(vijayKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Vijay Again', async () => {
    await program.methods.increment().accounts({ vijay: vijayKeypair.publicKey }).rpc()

    const currentCount = await program.account.vijay.fetch(vijayKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Vijay', async () => {
    await program.methods.decrement().accounts({ vijay: vijayKeypair.publicKey }).rpc()

    const currentCount = await program.account.vijay.fetch(vijayKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set vijay value', async () => {
    await program.methods.set(42).accounts({ vijay: vijayKeypair.publicKey }).rpc()

    const currentCount = await program.account.vijay.fetch(vijayKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the vijay account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        vijay: vijayKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.vijay.fetchNullable(vijayKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})

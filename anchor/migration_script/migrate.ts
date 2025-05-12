const anchor = require("@coral-xyz/anchor");

const migrate = async () => {
  console.log("Starting migration...");
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Vijay;

 const [statePDA] = await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("owner")],
    program.programId
  );
  await program.methods.initializeState()
    .accountsPartial({
      state: statePDA,
      signer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log(`State account initialized`);
};

migrate().catch(err => {
  console.error("Migration failed:", err);
});

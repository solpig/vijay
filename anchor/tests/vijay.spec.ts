import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Vijay} from '../target/types/vijay'
import { utf8 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

describe('vijay', () => {

  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Vijay as Program<Vijay>;

  const client_wallet_publicKey = anchor.AnchorProvider.local().wallet.publicKey;

  const freelancer_wallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
 

  beforeAll(async () => {
    await provider.connection.requestAirdrop(freelancer_wallet.publicKey, 2 * LAMPORTS_PER_SOL);

    // Wait for confirmation
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(freelancer_wallet.publicKey, 1000 * LAMPORTS_PER_SOL),
      "confirmed"
    );
    console.log(`Freelancer wallet ${freelancer_wallet.publicKey.toString()} airdropped with 1000 SOL`);
  });

  test('Initialize the client', async () => {
    const clientDetails = {
      name: "OpenSource Defi Ltd.",
      domain: "web3, blockchain, defi",
      requiredSkills: "Rust, React, Solana",
      contact: "123-456-7890"
    };
    
    await program.methods
      .initializeClient(
        clientDetails.name,
        clientDetails.domain,
        clientDetails.requiredSkills,
        clientDetails.contact
      )
      .rpc();

    const [clientPDA] = await anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('client'),
        client_wallet_publicKey.toBuffer(), 
      ],
      program.programId
    );

    const [clientReportPDA] = await anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('client_report'),
        client_wallet_publicKey.toBuffer(), 
      ],
      program.programId
    );

    const client = await program.account.client.fetch(clientPDA);
    const clientReport = await program.account.clientReportCard.fetch(clientReportPDA);

    expect(client.name).toEqual(clientDetails.name);
    expect(client.domain).toEqual(clientDetails.domain);
    expect(client.requiredSkills).toEqual(clientDetails.requiredSkills);
    expect(client.contact).toEqual(clientDetails.contact);
    expect(client.projectCounter.toNumber()).toEqual(0);
    expect(client.owner.toString()).toEqual(client_wallet_publicKey.toString());

    expect(clientReport.totalProjects.toNumber()).toEqual(0);
    expect(clientReport.projectsInProgress.toNumber()).toEqual(0);
    expect(clientReport.completed.toNumber()).toEqual(0);
    expect(clientReport.withdrawn.toNumber()).toEqual(0);
    expect(clientReport.transferred.toNumber()).toEqual(0);
    expect(clientReport.successRate).toEqual(0);
    expect(clientReport.riskScore).toEqual(0);
  });

  test('Initialize the freelancer', async () => {
    const freelancerDetails = {
      name: "John Doe",
      domain: "web3, blockchain, defi",
      skills: "Rust, React, Solana",
      contact: "123-456-7890"
    };
    
    await program.methods
      .initializeFreelancer(
        freelancerDetails.name,
        freelancerDetails.domain,
        freelancerDetails.skills,
        freelancerDetails.contact
      ).accounts({
        signer: freelancer_wallet.publicKey,
      })
      .signers([freelancer_wallet])
      .rpc();

    const [freelancerPDA] = await anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('freelancer'),
        freelancer_wallet.publicKey.toBuffer(), 
      ],
      program.programId
    );

    const [freelancerReportPDA] = await anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('freelancer_report'),
        freelancer_wallet.publicKey.toBuffer(), 
      ],
      program.programId
    );

    const freelancer = await program.account.freelancer.fetch(freelancerPDA);
    const freelancerReport = await program.account.freelancerReportCard.fetch(freelancerReportPDA);

    expect(freelancerReport.totalProjects.toNumber()).toEqual(0);
    expect(freelancerReport.projectsInProgress.toNumber()).toEqual(0);
    expect(freelancerReport.completed.toNumber()).toEqual(0);
    expect(freelancerReport.rejected.toNumber()).toEqual(0);
    expect(freelancerReport.successRate).toEqual(0);
    expect(freelancerReport.riskScore).toEqual(0);

    expect(freelancer.name).toEqual(freelancerDetails.name);
    expect(freelancer.skills).toEqual(freelancerDetails.skills);
    expect(freelancer.contact).toEqual(freelancerDetails.contact);
    expect(freelancer.projectCounter.toNumber()).toEqual(0);
    expect(freelancer.owner.toString()).toEqual(freelancer_wallet.publicKey.toString());
  });

  test('Creating two different project for a client', async () => {
    const [clientPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client"), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const client = await program.account.client.fetch(clientPda);
    
    const counterValueOne = new anchor.BN(client.projectCounter.toNumber() + 1);
    const counterOne = counterValueOne.toArrayLike(Buffer, "le", 8);

    const counterValueTwo = new anchor.BN(client.projectCounter.toNumber() + 2);
    const counterTwo = counterValueTwo.toArrayLike(Buffer, "le", 8);
    
    const [projectPdaOne] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"), counterOne, client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const [projectPdaTwo] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"), counterTwo, client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const projectDetailsOne = {
      name: "Freelancing on Solana - Project 1",
      description: "A decentralized application using Solana",
      url: "some_url.com",
      budget: new anchor.BN(1000),
    };

    const projectDetailsTwo = {
      name: "Freelancing on Solana - Project 2",
      description: "A decentralized application using Solana",
      url: "some_url.com",
      budget: new anchor.BN(1000),
    };

    await program.methods
      .initializeProject(
        projectDetailsOne.name,
        projectDetailsOne.description,
        projectDetailsOne.url,
        projectDetailsOne.budget,
      ).accountsPartial({
        signer: client_wallet_publicKey,
        client: clientPda,
        project: projectPdaOne,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

    await program.methods
      .initializeProject(
        projectDetailsTwo.name,
        projectDetailsTwo.description,
        projectDetailsTwo.url,
        projectDetailsTwo.budget,
      ).accountsPartial({
        signer: client_wallet_publicKey,
        client: clientPda,
        project: projectPdaTwo,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

    const projectOne = await program.account.project.fetch(projectPdaOne);

    const projectTwo = await program.account.project.fetch(projectPdaTwo);

    expect(projectOne.name).toEqual(projectDetailsOne.name);
    expect(projectOne.description).toEqual(projectDetailsOne.description);
    expect(projectOne.url).toEqual(projectDetailsOne.url);
    expect(projectOne.budget.toNumber()).toEqual(projectDetailsOne.budget.toNumber());
    expect(projectOne.isActive).toEqual(true);
    expect(projectOne.inProgress).toEqual(false);
    expect(projectOne.assignedFreelancer).toEqual(new PublicKey("11111111111111111111111111111111"));
    expect(projectOne.assignedFreelancerProjectId.toNumber()).toEqual(0);
    expect(projectOne.owner.toString()).toEqual(client_wallet_publicKey.toString());

    expect(projectTwo.name).toEqual(projectDetailsTwo.name);
    expect(projectTwo.description).toEqual(projectDetailsTwo.description);
    expect(projectTwo.url).toEqual(projectDetailsTwo.url);
    expect(projectTwo.budget.toNumber()).toEqual(projectDetailsTwo.budget.toNumber());
    expect(projectTwo.isActive).toEqual(true);
    expect(projectTwo.inProgress).toEqual(false);
    expect(projectTwo.assignedFreelancer).toEqual(new PublicKey("11111111111111111111111111111111"));
    expect(projectTwo.assignedFreelancerProjectId.toNumber()).toEqual(0);
    expect(projectTwo.owner.toString()).toEqual(client_wallet_publicKey.toString());
  });

  test('Assigning a project to a freelancer', async () => {
    const counter = new anchor.BN(1).toArrayLike(Buffer, "le", 8);
   
    const [freelancerPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer"), freelancer_wallet.publicKey.toBuffer()],
      program.programId
    );

    const [clientProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"),counter, client_wallet_publicKey.toBuffer()],
      program.programId
    );

    // fetching the client project and freelancer account
    const freelancer = await program.account.freelancer.fetch(freelancerPda);
    const project = await program.account.project.fetch(clientProjectPda);

    const [projectEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_escrow"), Buffer.from(project.name).subarray(0,32), client_wallet_publicKey.toBuffer()],
      program.programId
    );
    
    const [escrowVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), Buffer.from(project.name).subarray(0,32), client_wallet_publicKey.toBuffer()],
      program.programId
    );
   
    const [freelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_project"), Buffer.from(project.name).subarray(0,32), new anchor.BN(1).toArrayLike(Buffer, "le", 8),  freelancer.owner.toBuffer()],
      program.programId
    );

    const [freelancerReportPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_report"), freelancer_wallet.publicKey.toBuffer()],
      program.programId
    );

    const [clientReportPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_report"), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const amount = 2 * anchor.web3.LAMPORTS_PER_SOL;

    const projectDetails = {
      projectID: new anchor.BN(1),
      freelancer: freelancer_wallet.publicKey,
      budget: new anchor.BN(amount),
      total_task: new anchor.BN(2),
    }

    await program.methods.projectEscrowSetup(
        projectDetails.projectID,
        projectDetails.freelancer,
        projectDetails.budget,
        projectDetails.total_task,
      ).accountsPartial({
        signer: client_wallet_publicKey,
        project: clientProjectPda,
        escrow: projectEscrowPda,
        vault: escrowVaultPda,
        freelancer: freelancerPda,
        freelancerProject: freelancerProjectPda,
        freelancerReportCard: freelancerReportPda,
        clientReportCard: clientReportPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      // get the account details after the transaction
      const updatedProject = await program.account.project.fetch(clientProjectPda);
      const updatedFreelancer = await program.account.freelancer.fetch(freelancerPda);
      const escrow = await program.account.escrow.fetch(projectEscrowPda);
      const freelancerProject = await program.account.freelancerProject.fetch(freelancerProjectPda);
      const clientReport = await program.account.clientReportCard.fetch(clientReportPda);
      const freelancerReport = await program.account.freelancerReportCard.fetch(freelancerReportPda);
      const vaultBalance = await program.provider.connection.getBalance(escrowVaultPda);
      
      // assert the vault balance
      expect(vaultBalance).toBeGreaterThan(amount);
      
      // assert if the freelancer project counter is updated
      expect(updatedFreelancer.projectCounter.toNumber()).toEqual(freelancer.projectCounter.toNumber() + 1);

      // assert if the project details have been updated with the assigned freelancer details
      expect(updatedProject.assignedFreelancer.toString()).toEqual(freelancer_wallet.publicKey.toString());
      expect(updatedProject.assignedFreelancerProjectId.toNumber()).toEqual(updatedFreelancer.projectCounter.toNumber());
      expect(updatedProject.inProgress).toEqual(true);
      expect(updatedProject.isActive).toEqual(true);

      // assert if the escrow account has been created with correct details
      expect(escrow.depositor).toEqual(client_wallet_publicKey);
      expect(escrow.receiver).toEqual(freelancer_wallet.publicKey);
      expect(escrow.budget.toNumber()).toEqual(projectDetails.budget.toNumber());
      expect(escrow.totalTasks.toNumber()).toEqual(projectDetails.total_task.toNumber());
      expect(escrow.tasksCompleted.toNumber()).toEqual(0);
      expect(escrow.isActive).toEqual(true);

      // assert if the freelancer project has been created with correct details
      expect(freelancerProject.completedTaskUrl).toEqual("");
      expect(freelancerProject.projectName).toEqual(project.name);
      expect(freelancerProject.projectClient).toEqual(client_wallet_publicKey);
      expect(freelancerProject.approvedTasks.toNumber()).toEqual(0);
      expect(freelancerProject.rejectedTasks.toNumber()).toEqual(0);
      expect(freelancerProject.isActive).toEqual(true);

      // assert if the client report card has been updated
      expect(clientReport.totalProjects.toNumber()).toEqual(1);
      expect(clientReport.projectsInProgress.toNumber()).toEqual(1);

      // assert if the freelancer report card has been updated
      expect(freelancerReport.totalProjects.toNumber()).toEqual(1);
      expect(freelancerReport.projectsInProgress.toNumber()).toEqual(1);
  });

  test('Requesting a task review', async () => {
    const freelancerProjectId = new anchor.BN(1);  
    const taskDetails = {
      taskUrl: "some_url.com",
      projectName: "Freelancing on Solana - Project 1"
    };
    
    const [freelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_project"), Buffer.from(taskDetails.projectName).subarray(0,32), new anchor.BN(1).toArrayLike(Buffer, "le", 8),  freelancer_wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods.requestTaskReview(
      taskDetails.projectName,
      freelancerProjectId,
      taskDetails.taskUrl,
    )
    .accountsPartial({
      signer: freelancer_wallet.publicKey,
      freelancerProject: freelancerProjectPda
    })
    .signers([freelancer_wallet])
    .rpc();

    const freelancerProject = await program.account.freelancerProject.fetch(freelancerProjectPda);
    expect(freelancerProject.completedTaskUrl).toEqual(taskDetails.taskUrl);
  });

  test('approving a task review', async () => {
    const projectId = new anchor.BN(1);
    const projectName = "Freelancing on Solana - Project 1"

    // get all the PDAs
    const [clientProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"),projectId.toArrayLike(Buffer, "le", 8), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const [freelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_project"), Buffer.from(projectName).subarray(0,32), new anchor.BN(1).toArrayLike(Buffer, "le", 8),  freelancer_wallet.publicKey.toBuffer()],
      program.programId
    );

    const [projectEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_escrow"), Buffer.from(projectName).subarray(0,32), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const [escrowVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), Buffer.from(projectName).subarray(0,32), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const [freelancerReportPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_report"), freelancer_wallet.publicKey.toBuffer()],
      program.programId
    );

    const [clientReportPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_report"), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    // get the initial balance of the freelancer and vault
    const InitialfreelancerBalance = await provider.connection.getBalance(freelancer_wallet.publicKey);
    const InitialVaultBalance = await provider.connection.getBalance(escrowVaultPda);

    console.log(`Freelancer wallet balance before: ${InitialfreelancerBalance}`);
    console.log(`Vault balance before: ${InitialVaultBalance}`);

    await program.methods
            .reviewTaskProcess(projectId, true)
            .accountsPartial({
              signer: client_wallet_publicKey,
              project: clientProjectPda,
              freelancerProject: freelancerProjectPda,
              escrow: projectEscrowPda,
              vault: escrowVaultPda,
              freelancerReportCard: freelancerReportPda,
              clientReportCard: clientReportPda,
              receiver: freelancer_wallet.publicKey
            })
            .rpc();

    // get the final balance of the freelancer and vault        
    const updatedFreelancerBalance = await provider.connection.getBalance(freelancer_wallet.publicKey);
    const updatedVaultBalance = await provider.connection.getBalance(escrowVaultPda);

    console.log(`Freelancer wallet balance after: ${updatedFreelancerBalance}`);
    console.log(`Vault balance after: ${updatedVaultBalance}`);
    console.log(`Freelancer wallet difference: ${updatedFreelancerBalance - InitialfreelancerBalance}`);
    console.log(`Vault balance difference: ${InitialVaultBalance - updatedVaultBalance}`);
        
    // assert the balance difference of the freelancer and vault
    expect(updatedVaultBalance).toEqual(InitialVaultBalance - 1 * anchor.web3.LAMPORTS_PER_SOL);
    expect(updatedFreelancerBalance).toEqual(InitialfreelancerBalance + 1 * anchor.web3.LAMPORTS_PER_SOL);

    // assert the freelancer project details
    const freelancerProject = await program.account.freelancerProject.fetch(freelancerProjectPda);
    expect(freelancerProject.completedTaskUrl).toEqual("");
    expect(freelancerProject.approvedTasks.toNumber()).toEqual(1);

    //TODO: make another call to assert the last task completion
  });
});

import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Vijay} from '../target/types/vijay'
import { utf8 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

describe('vijay', () => {

  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Vijay as Program<Vijay>;

  const client_wallet = anchor.AnchorProvider.local().wallet;
  const client_wallet_publicKey = client_wallet.publicKey;

  const freelancer_wallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
 
  beforeAll(async () => {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(freelancer_wallet.publicKey, 20 * LAMPORTS_PER_SOL),
      "confirmed"
    );
    console.log(`Freelancer wallet ${freelancer_wallet.publicKey.toString()} airdropped with 20 SOL`);

    // Wait for confirmation
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(client_wallet.publicKey, 1000 * LAMPORTS_PER_SOL),
      "confirmed"
    );
    console.log(`Client wallet ${client_wallet.publicKey.toString()} airdropped with 1000 SOL`);
    console.log(`Client wallet balance: ${await provider.connection.getBalance(client_wallet.publicKey)}`);

    await program.methods.initializeState().rpc();
    console.log(`State account initialized`);
    const [statePDA] = await anchor.web3.PublicKey.findProgramAddressSync(
      [utf8.encode('owner')],
      program.programId
    );
    const state = await program.account.state.fetch(statePDA);
    console.log(`State account owner: ${state.owner.toString()}`);
    expect(state.owner.toString()).toEqual(client_wallet_publicKey.toString());
    expect(state.balance.toNumber()).toEqual(0);
  });

  afterAll(async () => {
    const [statePDA] = await anchor.web3.PublicKey.findProgramAddressSync(
      [utf8.encode('owner')],
      program.programId
    );
    const state = await program.account.state.fetch(statePDA);
    console.log(`State account owner: ${state.owner.toString()}`)
    console.log(`State account payable balance: ${state.balance.toNumber()}`);
   
    const stateBalance = await provider.connection.getBalance(statePDA);
    console.log(`State account balance before wirthdraw: ${stateBalance}`);
   
    const ownerBalance = await provider.connection.getBalance(client_wallet_publicKey);
    console.log(`Owner balance before withdraw: ${ownerBalance}`);

    await program.methods.withdrawBalance()
      .accountsPartial({
        owner: client_wallet_publicKey,
        state: statePDA,
      }).rpc();
    const newState = await program.account.state.fetch(statePDA);
    console.log(`State account payable balance after withdraw: ${newState.balance.toNumber()}`);
    
    const updatedOwnerBalance = await provider.connection.getBalance(client_wallet_publicKey);
    console.log(`Owner balance after withdraw: ${updatedOwnerBalance}`);

    const updatedStateBalance = await provider.connection.getBalance(statePDA);
    console.log(`State account balance after wirthdraw: ${updatedStateBalance}`);

    expect(newState.balance.toNumber()).toEqual(0);
    expect(updatedOwnerBalance).toBeGreaterThan(ownerBalance);
    expect(updatedStateBalance).toBeLessThan(stateBalance);
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

  test('Initialize another client', async () => {
    const clientDetails = {
      name: "Sol Wallet Ltd.",
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
      ).accounts({
        signer: freelancer_wallet.publicKey,
      })
      .signers([freelancer_wallet])
      .rpc();

    const [clientPDA] = await anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('client'),
        freelancer_wallet.publicKey.toBuffer(), 
      ],
      program.programId
    );

    const [clientReportPDA] = await anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('client_report'),
        freelancer_wallet.publicKey.toBuffer(), 
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
    expect(client.owner.toString()).toEqual(freelancer_wallet.publicKey.toString());

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

  test('Client setting up two different projects for freelancing', async () => {
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
      name: "Freelancing on Solana - Project1",
      description: "A decentralized application using Solana",
      url: "some_url.com",
      budget: new anchor.BN(10),
    };

    const projectDetailsTwo = {
      name: "Freelancing on Solana - Project2",
      description: "A decentralized application using Solana",
      url: "some_url.com",
      budget: new anchor.BN(10),
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

    const [clientReportPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_report"), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const clientReport = await program.account.clientReportCard.fetch(clientReportPda);

    expect(clientReport.totalProjects.toNumber()).toEqual(2);

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

  test('Client assigning two different projects to a single freelancer', async () => {
    const firstProjectCounter = new anchor.BN(1).toArrayLike(Buffer, "le", 8);
    const secondProjectCounter = new anchor.BN(2).toArrayLike(Buffer, "le", 8);
   
    const [freelancerPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer"), freelancer_wallet.publicKey.toBuffer()],
      program.programId
    );

    const [firstProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"), firstProjectCounter, client_wallet_publicKey.toBuffer()],
      program.programId
    );

    // fetching the client project and freelancer account
    const freelancer = await program.account.freelancer.fetch(freelancerPda);
    const firstProject = await program.account.project.fetch(firstProjectPda);

    const [projectEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_escrow"), firstProjectCounter, client_wallet_publicKey.toBuffer()],
      program.programId
    );
    
    const [escrowVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), firstProjectCounter, client_wallet_publicKey.toBuffer()],
      program.programId
    );
   
    const [freelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_project"), firstProjectCounter,  freelancer.owner.toBuffer()],
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

    const amount = 2;

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
        project: firstProjectPda,
        escrow: projectEscrowPda,
        vault: escrowVaultPda,
        freelancer: freelancerPda,
        freelancerProject: freelancerProjectPda,
        freelancerReportCard: freelancerReportPda,
        clientReportCard: clientReportPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      // get the account details after the transaction
      const updatedProject = await program.account.project.fetch(firstProjectPda);
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
      expect(freelancerProject.projectName).toEqual(firstProject.name);
      expect(freelancerProject.projectClient).toEqual(client_wallet_publicKey);
      expect(freelancerProject.approvedTasks.toNumber()).toEqual(0);
      expect(freelancerProject.rejectedAttempts.toNumber()).toEqual(0);
      expect(freelancerProject.isActive).toEqual(true);

      // assert if the client report card has been updated
      expect(clientReport.projectsInProgress.toNumber()).toEqual(1);

      // assert if the freelancer report card has been updated
      expect(freelancerReport.totalProjects.toNumber()).toEqual(1);
      expect(freelancerReport.projectsInProgress.toNumber()).toEqual(1);

      // assign another project to the freelancer
      const secondProjectDetails = {
        projectID: new anchor.BN(2),
        freelancer: freelancer_wallet.publicKey,
        budget: new anchor.BN(amount),
        total_task: new anchor.BN(4),
      }

      const [secondProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("client_project"), secondProjectCounter, client_wallet_publicKey.toBuffer()],
        program.programId
      );

      const [secondProjectEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("project_escrow"), secondProjectCounter, client_wallet_publicKey.toBuffer()],
        program.programId
      );
      
      const [secondEscrowVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), secondProjectCounter, client_wallet_publicKey.toBuffer()],
        program.programId
      );
     
      const [secondFreelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("freelancer_project"), secondProjectCounter,  freelancer.owner.toBuffer()],
        program.programId
      );

      await program.methods.projectEscrowSetup(
        secondProjectDetails.projectID,
        secondProjectDetails.freelancer,
        secondProjectDetails.budget,
        secondProjectDetails.total_task,
      ).accountsPartial({
        signer: client_wallet_publicKey,
        project: secondProjectPda,
        escrow: secondProjectEscrowPda,
        vault: secondEscrowVaultPda,
        freelancer: freelancerPda,
        freelancerProject: secondFreelancerProjectPda,
        freelancerReportCard: freelancerReportPda,
        clientReportCard: clientReportPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      const updatedClientReport = await program.account.clientReportCard.fetch(clientReportPda);
      const updatedFreelancerReport = await program.account.freelancerReportCard.fetch(freelancerReportPda);

      // assert if the freelancer and client report is updated
      expect(updatedClientReport.projectsInProgress.toNumber()).toEqual(2);
      expect(updatedFreelancerReport.projectsInProgress.toNumber()).toEqual(2);
      expect(updatedFreelancerReport.totalProjects.toNumber()).toEqual(2);
  });

  test('Freelancer requesting for a task review', async () => {
    const freelancerProjectId = new anchor.BN(1);  
    const taskDetails = {
      taskUrl: "some_url.com",
      projectName: "Freelancing on Solana - Project1"
    };
    
    const [freelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_project"), freelancerProjectId.toArrayLike(Buffer, "le", 8),  freelancer_wallet.publicKey.toBuffer()],
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

  test('Client approving a task review', async () => {
    const freelancerProjectId = new anchor.BN(1);
    const projectName = "Freelancing on Solana - Project1";
    const taskUrl = "some_other_url.com";

    // get all the PDAs
    const [clientProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"), freelancerProjectId.toArrayLike(Buffer, "le", 8), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const clientProject = await program.account.project.fetch(clientProjectPda);

    const [freelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_project"), freelancerProjectId.toArrayLike(Buffer, "le", 8),  freelancer_wallet.publicKey.toBuffer()],
      program.programId
    );


    const [projectEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_escrow"), freelancerProjectId.toArrayLike(Buffer, "le", 8), clientProject.owner.toBuffer()],
      program.programId
    );

    const escrowAcc = await program.account.escrow.fetch(projectEscrowPda);
    console.log(`Escrow account: ${escrowAcc.budget.toNumber()}, ${escrowAcc.totalTasks.toNumber()}`);

    const [escrowVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), freelancerProjectId.toArrayLike(Buffer, "le", 8), client_wallet_publicKey.toBuffer()],
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
            .reviewTaskProcess(freelancerProjectId, true)
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

    // request another review 
    await program.methods.requestTaskReview(
      projectName,
      freelancerProjectId,
      taskUrl,
    )
    .accountsPartial({
      signer: freelancer_wallet.publicKey,
      freelancerProject: freelancerProjectPda
    })
    .signers([freelancer_wallet])
    .rpc();

    // approve the second review
    await program.methods
            .reviewTaskProcess(freelancerProjectId, true)
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

    const escrowAccount = await program.account.escrow.fetch(projectEscrowPda);
    const updatedProjectAccount = await program.account.project.fetch(clientProjectPda);
    const updatedFreelancerReport = await program.account.freelancerReportCard.fetch(freelancerReportPda);
    const updatedClientReport = await program.account.clientReportCard.fetch(clientReportPda);

    expect(escrowAccount.tasksCompleted.toNumber()).toEqual(2);
    expect(escrowAccount.isActive).toEqual(false);
   
    expect(updatedProjectAccount.inProgress).toEqual(false);
    expect(updatedProjectAccount.isActive).toEqual(false);
    expect(updatedProjectAccount.taskInReview).toEqual("");
   
    expect(updatedFreelancerReport.completed.toNumber()).toEqual(1);
    expect(updatedFreelancerReport.projectsInProgress.toNumber()).toEqual(1);
    expect(updatedFreelancerReport.successRate).toEqual(10000);
    expect(updatedClientReport.completed.toNumber()).toEqual(1);
    expect(updatedClientReport.projectsInProgress.toNumber()).toEqual(1);
    expect(updatedClientReport.successRate).toEqual(10000);

  });

  test('Client rejecting a task review', async () => {
    const freelancerProjectId = new anchor.BN(2);  
    const taskDetails = {
      taskUrl: "some_url.com",
      projectName: "Freelancing on Solana - Project2"
    };
    
    const [freelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_project"),freelancerProjectId.toArrayLike(Buffer, "le", 8),  freelancer_wallet.publicKey.toBuffer()],
      program.programId
    );

    // request a task review
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

    // get all the PDAs
    const [clientProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"),freelancerProjectId.toArrayLike(Buffer, "le", 8), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const [projectEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_escrow"), freelancerProjectId.toArrayLike(Buffer, "le", 8), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const [escrowVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), freelancerProjectId.toArrayLike(Buffer, "le", 8), client_wallet_publicKey.toBuffer()],
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
    
    
    // reject the task review
    await program.methods
    .reviewTaskProcess(freelancerProjectId, false)
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
    const freelancerProject = await program.account.freelancerProject.fetch(freelancerProjectPda);
    expect(freelancerProject.completedTaskUrl).toEqual("");
    expect(freelancerProject.rejectedAttempts.toNumber()).toEqual(1);
  });

  test('Client cancelling the project', async () => {
     const projectID = new anchor.BN(2);

     const [clientProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"), projectID.toArrayLike(Buffer, "le", 8), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const [escrowVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), projectID.toArrayLike(Buffer, "le", 8), client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const [projectEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_escrow"), projectID.toArrayLike(Buffer, "le", 8), client_wallet_publicKey.toBuffer()],
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

    const [freelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_project"), projectID.toArrayLike(Buffer, "le", 8),  freelancer_wallet.publicKey.toBuffer()],
      program.programId
    );

    let initialClientBalance = await provider.connection.getBalance(client_wallet_publicKey);

    await program.methods
    .withdrawProject(projectID)
    .accountsPartial({
      signer: client_wallet_publicKey,
      project: clientProjectPda,
      escrow: projectEscrowPda,
      vault: escrowVaultPda,
      freelancerProject: freelancerProjectPda,
      freelancerReportCard: freelancerReportPda,
      clientReportCard: clientReportPda
    }).rpc();

    let updatedClientBalance = await provider.connection.getBalance(client_wallet_publicKey);
   
    // updated balance will be slightly more than transferred amount since vault and escrow account are getting closed
    // therefore the rent is refunded
    expect(updatedClientBalance).toBeGreaterThan(initialClientBalance);

    const freelanceReport = await program.account.freelancerReportCard.fetch(freelancerReportPda);
    expect(freelanceReport.successRate).toEqual(5000);
    expect(freelanceReport.riskScore).toEqual(5000);
    expect(freelanceReport.rejected.toNumber()).toEqual(1);
    
    const clientReport = await program.account.clientReportCard.fetch(clientReportPda);
    expect(clientReport.withdrawn.toNumber()).toEqual(1);
    expect(clientReport.successRate).toEqual(5000);
    expect(clientReport.riskScore).toEqual(5000);

    const updatedClientProject = await program.account.project.fetch(clientProjectPda);
    expect(updatedClientProject.isActive).toEqual(false);
    expect(updatedClientProject.inProgress).toEqual(false);

    const updatedFreelancerProject = await program.account.freelancerProject.fetch(freelancerProjectPda);
    expect(updatedFreelancerProject.isActive).toEqual(false);
  });

  test('Client transferring the project', async () => {
    const projectCounter = new anchor.BN(3).toArrayLike(Buffer, "le", 8);

    const [clientPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client"), client_wallet_publicKey.toBuffer()],
      program.programId
    );
   
    const [freelancerPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer"), freelancer_wallet.publicKey.toBuffer()],
      program.programId
    );

    const [projectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"), projectCounter, client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const projectDetails = {
      name: "Freelancing on Solana - Project3",
      description: "A decentralized application using Solana",
      url: "some_url.com",
      budget: new anchor.BN(1000),
    }

    // project setup by client
    await program.methods
      .initializeProject(
        projectDetails.name,
        projectDetails.description,
        projectDetails.url,
        projectDetails.budget,
      ).accountsPartial({
        signer: client_wallet_publicKey,
        client: clientPda,
        project: projectPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

    // fetching the client project and freelancer account
    const freelancer = await program.account.freelancer.fetch(freelancerPda);
    const project = await program.account.project.fetch(projectPda);

    const [projectEscrowPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("project_escrow"), projectCounter, client_wallet_publicKey.toBuffer()],
      program.programId
    );
    
    const [escrowVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), projectCounter, client_wallet_publicKey.toBuffer()],
      program.programId
    );
   
    const [freelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer_project"), projectCounter,  freelancer.owner.toBuffer()],
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

    const amount = 2;

    const projectMetaInfo = {
      projectID: new anchor.BN(3),
      freelancer: freelancer_wallet.publicKey,
      budget: new anchor.BN(amount),
      total_task: new anchor.BN(5),
    }

    // setup the project escrow and assign the project to the freelancer
    await program.methods.projectEscrowSetup(
          projectMetaInfo.projectID,
          projectMetaInfo.freelancer,
          projectMetaInfo.budget,
          projectMetaInfo.total_task,
      ).accountsPartial({
        signer: client_wallet_publicKey,
        project: projectPda,
        escrow: projectEscrowPda,
        vault: escrowVaultPda,
        freelancer: freelancerPda,
        freelancerProject: freelancerProjectPda,
        freelancerReportCard: freelancerReportPda,
        clientReportCard: clientReportPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      // setting up the new freelancer
      const newFreelancerKeyPair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
      await provider.connection.requestAirdrop(newFreelancerKeyPair.publicKey, 2 * LAMPORTS_PER_SOL);

      // Wait for confirmation
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(newFreelancerKeyPair.publicKey, 10 * LAMPORTS_PER_SOL),
        "confirmed"
      );
      console.log(`Freelancer wallet ${newFreelancerKeyPair.publicKey.toString()} airdropped with 10 SOL`);


      // set the new freelancer account
      const freelancerDetails = {
        name: "Rocky",
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
          signer: newFreelancerKeyPair.publicKey,
        })
        .signers([newFreelancerKeyPair])
        .rpc();

      // get the PDAs for the new freelancer
      const [newFreelancerPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("freelancer"), newFreelancerKeyPair.publicKey.toBuffer()],
        program.programId
      );
      
      const [newFreelancerReportPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("freelancer_report"), newFreelancerKeyPair.publicKey.toBuffer()],
        program.programId
      );
      
      const [newFreelancerProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("freelancer_project"), new anchor.BN(1).toArrayLike(Buffer, "le", 8), newFreelancerKeyPair.publicKey.toBuffer()],
        program.programId
      );

      //transfer the project to new freelancer
      await program.methods
        .transferProject(
          projectMetaInfo.projectID,
          newFreelancerKeyPair.publicKey,
        ).accountsPartial({
          signer: client_wallet_publicKey,
          project: projectPda,
          newFreelancer: newFreelancerPda,
          escrow: projectEscrowPda,
          freelancerProject: freelancerProjectPda,
          freelancerReport: freelancerReportPda,
          clientReport: clientReportPda,
          newFreelancerReport: newFreelancerReportPda,
          newFreelancerProject: newFreelancerProjectPda,
        }).rpc();
        
        const newFreelancer = await program.account.freelancer.fetch(newFreelancerPda);
        const updatedProject = await program.account.project.fetch(projectPda);       
        const escrow = await program.account.escrow.fetch(projectEscrowPda);
        const newFreelancerProject = await program.account.freelancerProject.fetch(newFreelancerProjectPda);        
        const newFreelancerReport = await program.account.freelancerReportCard.fetch(newFreelancerReportPda);
        const oldFreelancerProject = await program.account.freelancerProject.fetch(freelancerProjectPda);
        const oldFreelancerReport = await program.account.freelancerReportCard.fetch(freelancerReportPda);
        const clientReport = await program.account.clientReportCard.fetch(clientReportPda);

        expect(updatedProject.assignedFreelancer.toString()).toEqual(newFreelancerKeyPair.publicKey.toString());
        expect(updatedProject.assignedFreelancerProjectId.toNumber()).toEqual(newFreelancer.projectCounter.toNumber());
        expect(updatedProject.inProgress).toEqual(true);
        expect(updatedProject.isActive).toEqual(true);

        expect(escrow.receiver.toString()).toEqual(newFreelancerKeyPair.publicKey.toString());

        expect(newFreelancerProject.projectName).toEqual(project.name);
        expect(newFreelancerProject.projectClient.toString()).toEqual(client_wallet_publicKey.toString());
        expect(newFreelancerProject.approvedTasks.toNumber()).toEqual(0);
        expect(newFreelancerProject.rejectedAttempts.toNumber()).toEqual(0);
        expect(newFreelancerProject.isActive).toEqual(true);

        expect(newFreelancerReport.totalProjects.toNumber()).toEqual(1);
        expect(newFreelancerReport.projectsInProgress.toNumber()).toEqual(1);
        expect(newFreelancerReport.successRate).toEqual(0);
        expect(newFreelancerReport.riskScore).toEqual(0);

        expect(oldFreelancerProject.isActive).toEqual(false);
        
        expect(oldFreelancerReport.rejected.toNumber()).toEqual(2);
        expect(oldFreelancerReport.projectsInProgress.toNumber()).toEqual(0);
        expect(oldFreelancerReport.successRate).toEqual(3333);
        expect(oldFreelancerReport.riskScore).toEqual(6666);

        expect(clientReport.totalProjects.toNumber()).toEqual(3);
        expect(clientReport.projectsInProgress.toNumber()).toEqual(1);
        expect(clientReport.withdrawn.toNumber()).toEqual(1);
        expect(clientReport.transferred.toNumber()).toEqual(1);
        expect(clientReport.successRate).toEqual(5000);
        expect(clientReport.riskScore).toEqual(6666);

  });

  test('Freelancer should not be able to setup a project', async () => {
    const [freelancerPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("freelancer"), client_wallet_publicKey.toBuffer()],
      program.programId
    );
    
    const counter = new anchor.BN(4).toArrayLike(Buffer, "le", 8);
    
    const [projectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"), counter, client_wallet_publicKey.toBuffer()],
      program.programId
    );

    const projectDetails = {
      name: "Freelancing on Solana - Project4",
      description: "A decentralized application using Solana",
      url: "some_url.com",
      budget: new anchor.BN(1000),
    };

    try {
      await program.methods
      .initializeProject(
        projectDetails.name,
        projectDetails.description,
        projectDetails.url,
        projectDetails.budget,
      ).accountsPartial({
        signer: freelancer_wallet.publicKey,
        client: freelancerPda,
        project: projectPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([freelancer_wallet])
      .rpc();
    } catch (err) {
      if (err instanceof anchor.AnchorError) {
          expect(
            err.error.errorCode.code
          ).toEqual("AccountNotInitialized");
          expect(
            err.error.errorMessage
          ).toEqual("The program expected this account to be already initialized");
      }
    }
  });
});

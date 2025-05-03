import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Vijay} from '../target/types/vijay'
import { utf8 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { PublicKey } from '@solana/web3.js';

describe('vijay', () => {

  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Vijay as Program<Vijay>;
  const publicKey = anchor.AnchorProvider.local().wallet.publicKey;

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
        publicKey.toBuffer(), 
      ],
      program.programId
    );

    const [clientReportPDA] = await anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('client_report'),
        publicKey.toBuffer(), 
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
    expect(client.owner.toString()).toEqual(publicKey.toString());

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
      )
      .rpc();

    const [freelancerPDA] = await anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('freelancer'),
        publicKey.toBuffer(), 
      ],
      program.programId
    );

    const [freelancerReportPDA] = await anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('freelancer_report'),
        publicKey.toBuffer(), 
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
    expect(freelancer.owner.toString()).toEqual(publicKey.toString());
  });

  test('Create a project', async () => {
    const [clientPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client"), publicKey.toBuffer()],
      program.programId
    );

    const client = await program.account.client.fetch(clientPda);
    const counterValue = new anchor.BN(client.projectCounter.toNumber() + 1);
    const counter = counterValue.toArrayLike(Buffer, "le", 8);
    const [projectPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("client_project"), counter, publicKey.toBuffer()],
      program.programId
    );

    const projectDetails = {
      name: "Freelancing on Solana",
      description: "A decentralized application using Solana",
      url: "some_url.com",
      budget: new anchor.BN(1000),
    };

    await program.methods
      .initializeProject(
        projectDetails.name,
        projectDetails.description,
        projectDetails.url,
        projectDetails.budget,
      ).accountsPartial({
        signer: publicKey,
        client: clientPda,
        project: projectPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

    const project = await program.account.project.fetch(projectPda);

    expect(project.name).toEqual(projectDetails.name);
    expect(project.description).toEqual(projectDetails.description);
    expect(project.url).toEqual(projectDetails.url);
    expect(project.budget.toNumber()).toEqual(projectDetails.budget.toNumber());
    expect(project.isActive).toEqual(true);
    expect(project.inProgress).toEqual(false);
    expect(project.assignedFreelancer).toEqual(new PublicKey("11111111111111111111111111111111"));
    expect(project.assignedFreelancerProjectId.toNumber()).toEqual(0);
    expect(project.owner.toString()).toEqual(publicKey.toString());
  });
});

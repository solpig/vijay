'use client'

import { getVijayProgram, getVijayProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey, SystemProgram } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { BN } from '@coral-xyz/anchor'
import { cancelProject, initializeClient, initializeProject, processTaskReview, projectEscrowSetup, transferProject } from './client-data-model'

export function useProgramAccounts() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVijayProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getVijayProgram(provider, programId), [provider, programId])

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  return {
    program,
    programId,
    getProgramAccount,
  }
}


export function useClientAccounts({ account }: { account: PublicKey }) {
  
  const { cluster } = useCluster()
  const { program } = useProgramAccounts()
  const transactionToast = useTransactionToast()

  const queryClientAccounts = useQuery({
    queryKey: ['client', 'all', { cluster }],
    queryFn: () => program.account.client.all(),
  })


  const queryClientAccount = useQuery({
    queryKey: ['fetch', 'client', { cluster, account }],
    queryFn: async() => {
      const [clientPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('client'), account.toBuffer()],
        program.programId
      );
      return await program.account.client.fetch(clientPDA);
    }
  })

  const fetchEscrowAccount = async (account: PublicKey, projectID: number) => {
    const [freelancerPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('project_escrow'), new BN(projectID).toArrayLike(Buffer, 'le', 8), account.toBuffer()],
      program.programId
    );
    return await program.account.escrow.fetch(freelancerPDA);
  }

  const queryClientPerformance = useQuery({
    queryKey: ['fetch', 'client', 'performance', { cluster, account }],
    queryFn: async() => {
      const [clientReportPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('client_report'), account.toBuffer()],
        program.programId
      );
      return await program.account.clientReportCard.fetch(clientReportPDA);
    }
  })

  const NewProjectMutation = (onSuccessCallback?: () => void) => {
   return useMutation<string, Error, initializeProject>({
    mutationKey: ['initialize','project', { cluster, account }],
    mutationFn: async ({name, description, url, budget}) => {
      let [clientPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('client'), account.toBuffer()],
        program.programId
      );

      const client = await program.account.client.fetch(clientPDA);
      const projectID = client.projectCounter.toNumber() + 1;
      const [projectPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('client_project'), new BN(projectID).toArrayLike(Buffer, 'le', 8), account.toBuffer()],
        program.programId
      );
      
      let signature = await program.methods
                      .initializeProject(name, description, url, new BN(budget))
                      .accountsPartial(
                        { 
                          signer: account,
                          client: clientPDA,
                          project: projectPDA,
                          systemProgram: SystemProgram.programId,
                        }).rpc();
      return signature;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      if (onSuccessCallback) onSuccessCallback(); 
    },
    onError: (err) => {
      toast.error(`Failed to setup a new project:: ${err.message}`);
    },
  });
}

  const reviewTaskProcessMutation = useMutation<string, Error, processTaskReview>({
    mutationKey: ['process', 'review', { cluster }],
    mutationFn: async ({projectID, approval}) => {
      const signature = await program.methods.reviewTaskProcess(new BN(projectID), approval).rpc();
      return signature
    },
    onSuccess: (tx) => {
      transactionToast(tx)
    },
    onError: (err) => {
      toast.error(`Failed to process the task review:: ${err.message}`);
    },
  })

  const withdrawProjectMutation = useMutation<string, Error, cancelProject>({
    mutationKey: ['cancel', 'project', { cluster }],
    mutationFn: async ({projectID, keypair}) => {
      const signature = await program.methods.withdrawProject(new BN(projectID)).accounts({ signer: keypair.publicKey }).signers([keypair]).rpc();
      return signature
    },
    onSuccess: (tx) => {
      transactionToast(tx)
    },
    onError: (err) => {
      toast.error(`Failed to cancel the project:: ${err.message}`);
    },
  })

  const transferProjectMutation = useMutation<string, Error, transferProject>({
    mutationKey: ['transfer', 'project', { cluster }],
    mutationFn: async ({projectID, newFreelancer, keypair}) => {
      const signature = await program.methods.transferProject(new BN(projectID), newFreelancer.publicKey).accounts({ signer: keypair.publicKey }).signers([keypair]).rpc();
      return signature
    },
    onSuccess: (tx) => {
      transactionToast(tx)
    },
    onError: (err) => {
      toast.error(`Failed to transfer the project:: ${err.message}`);
    },
  })

  const fetchClientProjects = async (account: PublicKey, projectID: number) => {
    const [freelancerPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('client_project'), new BN(projectID).toArrayLike(Buffer, 'le', 8), account.toBuffer()],
      program.programId
    );
    return await program.account.project.fetch(freelancerPDA);
  }

  const useProjectEscrowSetupMutation = (onSuccessCallback?: () => void) => {
    return useMutation<string, Error, projectEscrowSetup>({
      mutationKey: ['setup', 'project', { cluster, account }],
      mutationFn: async ({projectID, projectName, freelancer, budget, totalTasks}) => {
        
        if(projectName.length < 32) {
          projectName = projectName.padEnd(32, ' ');
        }

        let [clientProjectPDA] = await PublicKey.findProgramAddressSync(
          [Buffer.from('client_project'), new BN(projectID).toArrayLike(Buffer, 'le', 8), account.toBuffer()],
          program.programId
        );

        let [freelancerPDA] = await PublicKey.findProgramAddressSync(
          [Buffer.from('freelancer'),freelancer.toBuffer()],
          program.programId
        );
        
        let [escrowPDA] = await PublicKey.findProgramAddressSync(
          [Buffer.from('project_escrow'), new BN(projectID).toArrayLike(Buffer, 'le', 8),  account.toBuffer()],
          program.programId 
        );
        
        let [vaultPDA] = await PublicKey.findProgramAddressSync([Buffer.from('vault'), new BN(projectID).toArrayLike(Buffer, 'le', 8), account.toBuffer()],
         program.programId
        );

        const freelancerDetails = await program.account.freelancer.fetch(freelancerPDA);
        let freelancerProjectCounter = freelancerDetails.projectCounter.add(new BN(1));
        let [freelancerProjectPDA] = await PublicKey.findProgramAddressSync(
          [Buffer.from('freelancer_project'), freelancerProjectCounter.toArrayLike(Buffer, 'le', 8), freelancer.toBuffer()],
          program.programId
         );

         let [freelancerReportPDA] = await PublicKey.findProgramAddressSync(
          [Buffer.from('freelancer_report'), freelancer.toBuffer()],
          program.programId
         );

        let [clientReportPDA] = await PublicKey.findProgramAddressSync(
          [Buffer.from('client_report'), account.toBuffer()],
          program.programId
        );

        let signature = await program.methods.projectEscrowSetup(new BN(projectID), freelancer, new BN(budget), new BN(totalTasks))
        .accountsPartial({
           signer: account,
           project: clientProjectPDA,
           freelancer: freelancerPDA, 
           escrow: escrowPDA,
           vault: vaultPDA,
           freelancerProject: freelancerProjectPDA,
           freelancerReportCard: freelancerReportPDA,
           clientReportCard: clientReportPDA,
           systemProgram: SystemProgram.programId,
          }).rpc();
        return signature;
      },
      onSuccess: (signature) => {
        transactionToast(signature);
        if (onSuccessCallback) onSuccessCallback(); 
      },
      onError: (err) => {
        toast.error(`Failed to setup escrow for the project:: ${err.message}`);
      },
    });
  };
  
  const useInitializeClientMutation = (onSuccessCallback?: () => void) => {
    return useMutation<string, Error, initializeClient>({
            mutationKey: ['initialize','client', { cluster, account }],
            mutationFn: async ({name, domain, requiredSkills, contact}) => {
              let signature = await program.methods.initializeClient(name, domain, requiredSkills, contact).accounts({ signer: account }).rpc();
              return signature;
            },
            onSuccess: (signature) => {
              transactionToast(signature);
              if (onSuccessCallback) onSuccessCallback(); 
            },
            onError: (err) => {
              toast.error(`Failed to create a client account:: ${err.message}`);
            },
          });
  }

  return {
    // custom hooks
    queryClientAccount,
    queryClientAccounts,
    queryClientPerformance,
    reviewTaskProcessMutation,
    withdrawProjectMutation,
    transferProjectMutation,
    // custom functions
    NewProjectMutation,
    fetchClientProjects,
    fetchEscrowAccount,
    useProjectEscrowSetupMutation,
    useInitializeClientMutation,
  }
}


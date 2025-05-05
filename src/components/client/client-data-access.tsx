'use client'

import { getVijayProgram, getVijayProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { BN } from '@coral-xyz/anchor'
import { cancelProject, initializeClient, initializeFreelancer, initializeProject, processTaskReview, projectEscrowSetup, requestTaskReview, transferProject } from './client-data-model'

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
      const [clientPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('client'), account.toBuffer()],
        program.programId
      );
      return await program.account.client.fetch(clientPDA);
    }
  })


  const initializeClientMutation = useMutation<string, Error, initializeClient>({
    mutationKey: ['initialize','client', { cluster, account }],
    mutationFn: async ({name, domain, requiredSkills, contact}) => {
      console.log('account', account.toBase58())
      let signature = await program.methods.initializeClient(name, domain, requiredSkills, contact).accounts({ signer: account }).rpc();
      return signature;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return queryClientAccounts.refetch()
    },
    onError: (err) => {
      toast.error(`Failed to create a client account:: ${err.message}`);
    },
  });

  const newProjectMutation = useMutation<string, Error, initializeProject>({
    mutationKey: ['initialize','project', { cluster }],
    mutationFn: async ({name, description, url, budget, keypair}) => {
      let signature = await program.methods.initializeProject(name, description, url, new BN(budget)).accounts({ signer: keypair.publicKey }).signers([keypair]).rpc();
      return signature;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return queryClientAccounts.refetch()
    },
    onError: (err) => {
      toast.error(`Failed to setup a new project:: ${err.message}`);
    },
  });

  const projectEscrowSetupMutation = useMutation<string, Error, projectEscrowSetup>({
    mutationKey: ['setup', 'project', { cluster }],
    mutationFn: async ({projectID, freelancer, budget, totalTasks, keypair}) => {
      let signature = await program.methods.projectEscrowSetup(new BN(projectID), freelancer.publicKey, new BN(budget), new BN(totalTasks)).accounts({ signer: keypair.publicKey }).signers([keypair]).rpc();
      return signature;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return queryClientAccounts.refetch()
    },
    onError: (err) => {
      toast.error(`Failed to setup escrow for the project:: ${err.message}`);
    },
  });

  const reviewTaskProcessMutation = useMutation<string, Error, processTaskReview>({
    mutationKey: ['process', 'review', { cluster }],
    mutationFn: async ({projectID, approval, keypair}) => {
      const signature = await program.methods.reviewTaskProcess(new BN(projectID), approval).signers([keypair]).rpc();
      return signature
    },
    onSuccess: (tx) => {
      transactionToast(tx)
    },
    onError: (err) => {
      toast.error(`Failed to process the task review:: ${err.message}`);
    },
  })

  const cancelProjectMutation = useMutation<string, Error, cancelProject>({
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

  return {
    queryClientAccount,
    queryClientAccounts,
    initializeClientMutation,
    newProjectMutation,
    projectEscrowSetupMutation,
    reviewTaskProcessMutation,
    cancelProjectMutation,
    transferProjectMutation
  }
}

export function useFreelancerAccounts({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program } = useProgramAccounts()

  const queryFreelancerAccounts = useQuery({
    queryKey: ['freelancer', 'all', { cluster }],
    queryFn: () => program.account.freelancer.all(),
  })

  const queryFreelancerAccount = useQuery({
    queryKey: ['fetch', 'freelancer', { cluster, account }],
    queryFn: () => program.account.freelancer.fetch(account),
  })

  const initializeFreelancerMutation  = useMutation<string, Error, initializeFreelancer>({
    mutationKey: ['initialize','freelancer', { cluster }],
    mutationFn: async ({name, domain, skills, contact, keypair}) => {
      let signature = await program.methods.initializeFreelancer(name, domain, skills, contact).accounts({ signer: keypair.publicKey }).signers([keypair]).rpc();
      return signature;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return queryFreelancerAccounts.refetch()
    },
    onError: (err) => {
      toast.error(`Failed to create a freelancer account:: ${err.message}`);
    },
  });

  const taskReviewMutation = useMutation<string, Error, requestTaskReview>({
    mutationKey: ['request', 'review', { cluster }],
    mutationFn: async ({projectID, projectName, taskURL, keypair}) => {
      const signature = await program.methods.requestTaskReview(projectName, new BN(projectID), taskURL).accounts({ signer: keypair.publicKey }).signers([keypair]).rpc();
      return signature
    },
    onSuccess: (tx) => {
      transactionToast(tx)
    },
    onError: (err) => {
      toast.error(`Failed to request the task review:: ${err.message}`);
    },
  })

  return {
    queryFreelancerAccounts,
    queryFreelancerAccount,
    initializeFreelancerMutation,
    taskReviewMutation
  }
}

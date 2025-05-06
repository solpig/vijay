import { useProgramAccounts } from "../client/client-data-access"
import { useCluster } from "../cluster/cluster-data-access"
import { useTransactionToast } from "../ui/ui-layout"
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PublicKey } from '@solana/web3.js'
import { initializeFreelancer, requestTaskReview } from "./freelancer-data-model"
import { BN } from "@coral-xyz/anchor"

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
      mutationKey: ['initialize','freelancer', { cluster, account }],
      mutationFn: async ({name, domain, skills, contact}) => {
        let signature = await program.methods.initializeFreelancer(name, domain, skills, contact).accounts({ signer: account }).rpc();
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
  
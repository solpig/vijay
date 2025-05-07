import { useProgramAccounts } from "../client/client-data-access"
import { useCluster } from "../cluster/cluster-data-access"
import { useTransactionToast } from "../ui/ui-layout"
import { QueryFunctionContext, useMutation, useQuery } from '@tanstack/react-query'
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
      queryFn: async() => {
        const [freelancerPDA] = await PublicKey.findProgramAddressSync(
          [Buffer.from('freelancer'), account.toBuffer()],
          program.programId
        );
        return await program.account.freelancer.fetch(freelancerPDA);
      }
    })

    const queryFreelancerProjects = (account: PublicKey, projectID: number, projectName: string, program: any) => {
      return useQuery({
      queryKey: ['fetch-freelancer-projects', projectID, projectName] as const,
      queryFn: async(context: QueryFunctionContext<['fetch-freelancer-projects', number, string]>) => {
        const [_, projectID, projectName] = context.queryKey;
        const [freelancerPDA] = await PublicKey.findProgramAddressSync(
          [Buffer.from('freelancer_project'), Buffer.from(projectName).subarray(0, 32), new BN(projectID).toArrayLike(Buffer, 'le', 8), account.toBuffer()],
          program.programId
        );
        return await program.account.freelancerProject.fetch(freelancerPDA);
      }
    })
  }

    const queryFreelancerPerformance = useQuery({
      queryKey: ['fetch', 'freelancer', 'performance', { cluster, account }],
      queryFn: async() => {
        const [freelancerReportPDA] = await PublicKey.findProgramAddressSync(
          [Buffer.from('freelancer_report'), account.toBuffer()],
          program.programId
        );
        return await program.account.freelancerReportCard.fetch(freelancerReportPDA);
      }
    })
  
    const initializeFreelancerMutation = (onSuccessCallback?: () => void) => {
      return useMutation<string, Error, initializeFreelancer>({
        mutationKey: ['initialize','freelancer', { cluster, account }],
        mutationFn: async ({name, domain, skills, contact}) => {
          let signature = await program.methods.initializeFreelancer(name, domain, skills, contact).accounts({ signer: account }).rpc();
          return signature;
        },
        onSuccess: (signature) => {
          transactionToast(signature);
          if (onSuccessCallback) onSuccessCallback(); 
        },
        onError: (err) => {
          toast.error(`Failed to create a freelancer account:: ${err.message}`);
        },
      });
    } 
  
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
      taskReviewMutation,
      queryFreelancerPerformance,
      queryFreelancerProjects
    }
  }
  
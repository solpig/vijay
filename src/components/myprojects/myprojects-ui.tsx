'use client'

import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { useFreelancerAccounts } from "../freelancer/freelancer-data-access";
import { useClientAccounts } from "../client/client-data-access";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../modal/modal";
import { BN } from "@coral-xyz/anchor";


export function MyProjects({ address }: { address: PublicKey }) {
    const { queryFreelancerAccount, fetchFreelancerProjects } = useFreelancerAccounts({ account: address });
    const { queryClientAccount, fetchClientProjects } = useClientAccounts({ account: address });
  
    const clientDetails = queryClientAccount.data;
    const clientProjectCounter = clientDetails?.projectCounter.toNumber() || 0;


    const clientProjectQueries = useQueries({
        queries: useMemo(() => {
          if (!clientProjectCounter) return [];
          console.log("client Project Queries")
          return Array.from({ length: clientProjectCounter }, (_, i) => {
            return {
              queryKey: ['fetch-client-project', i + 1],
              queryFn: () => fetchClientProjects(address, i + 1),
            };
          });
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [clientProjectCounter, address]),
      });

    const clientProjectsLoading = clientProjectQueries.some(q => q.isLoading)
    const clientProjects = clientProjectQueries.map(q => q.data).filter(Boolean)
    console.log("client Projects", clientProjects)
    const freelancerDetails = queryFreelancerAccount.data;
    const freelancerProjectCounter = freelancerDetails?.projectCounter.toNumber() || 0;

    const freelancerProjectQueries = useQueries({
        queries: useMemo(() => {
          if (!freelancerProjectCounter) return [];
          console.log("freelancer Project Queries")
          return Array.from({ length: freelancerProjectCounter }, (_, i) => {
            return {
              queryKey: ['fetch-freelancer-project', i + 1],
              queryFn: () => fetchFreelancerProjects(address, i + 1),
            };
          });
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [freelancerProjectCounter, address]),
      });

    const freelancerProjectLoading = freelancerProjectQueries.some(q => q.isLoading)
    const freelancerProjects = freelancerProjectQueries.map(q => q.data).filter(Boolean)

    if (clientProjectsLoading && freelancerProjectLoading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div>
            {
                clientProjects.length > 0 && 
                <div className="flex mt-32 justify-center min-h-screen bg-gray-70">
                    <div className="max-w-16xl px-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clientProjects.map((result, i) => (
                        <ClientProjectCard 
                          key={i}
                          address={address}
                          details={result} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
            }
            {
                freelancerProjects.length > 0 && 
                <div className="flex mt-32 justify-center min-h-screen bg-gray-70">
                    <div className="max-w-16xl px-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {freelancerProjects.map((result, i) => (
                        <FreelancerProjectCard 
                          key={i}
                          address={address}
                          details={result} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
            }
        </div>
    
    )
}

type EscrowAccount = {
  depositor: PublicKey;
  receiver: PublicKey;
  vault: PublicKey;
  budget: BN;
  amountPaid: BN;
  totalTasks: BN;
  tasksCompleted: BN;
  isActive: boolean;
};

function ClientProjectCard({ address, details }: { address: PublicKey, details: any; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSubModal, setIsOpenSubModal] = useState(false);
  const [freelancerAccount, setFreelancerAccount] = useState('');
  const [newFreelancerAccount, setNewFreelancerAccount] = useState('');
  const [budget, setBudget] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [vaultBalance, setVaultBalance] = useState(0);

  const queryClient = useQueryClient();
  const { ProjectEscrowSetupMutation, fetchEscrowAccount, ReviewTaskProcessMutation, fetchVaultAccountBalance, WithdrawProjectMutation, TransferProjectMutation } = useClientAccounts({ account: address });
  
  const [escrowAccount, setEscrowAccount] = useState<EscrowAccount | null>(null);


  useEffect(() => {
      const DEFAULT_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");
      const loadEscrowAccount = async () => {
        if (!address || !details?.id || details?.assignedFreelancerProjectId.toNumber() === 0) return;
        console.log(`Details: ${details.id}`, details);
        try {
          const data = await fetchEscrowAccount(address, details?.id.toNumber());
          const vaultBalance = await fetchVaultAccountBalance(address, details?.id.toNumber());
          setVaultBalance(vaultBalance);
          console.log(`Vault Balance: ${vaultBalance}`);
          console.log(`Escrow Account: ${details?.id}`, data);
          setEscrowAccount(data);
          if (!(details?.assignedFreelancer.toString() === DEFAULT_PROGRAM_ID.toString()) && escrowAccount) {
            setFreelancerAccount(details?.assignedFreelancer.toString());
            setBudget(escrowAccount?.budget.toNumber());
          }
        } catch (err) {
          console.log(`Error fetching escrow account: ${details?.id}`, err);
        }
      };

      loadEscrowAccount();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, details]);



  let cardColor = details?.inProgress
  ? 'from-yellow-100 to-yellow-200'
  : 'from-red-100 to-red-200';

  if (details?.taskInReview) {
    cardColor = 'from-blue-100 to-blue-200';
  }

  if (!details?.isActive) {
    cardColor = 'from-gray-100 to-gray-200';
  }
  const projectSetupMut = ProjectEscrowSetupMutation(() => {
    setIsOpen(false);
    setFreelancerAccount('');
    queryClient.invalidateQueries({ queryKey: ['fetch-client-project'] });
  });

  const reviewProcessTaskMut = ReviewTaskProcessMutation(() => {
    setIsOpen(false);
    queryClient.invalidateQueries({ queryKey: ['fetch-client-project'] });
  });

  const withdrawProjectMut = WithdrawProjectMutation(() => {
    setIsOpen(false);
    queryClient.invalidateQueries({ queryKey: ['fetch-client-project'] });
  });

  const transferProjectMut = TransferProjectMutation(() => {
    setIsOpen(false);
    setIsOpenSubModal(false);
    setNewFreelancerAccount('');
    queryClient.invalidateQueries({ queryKey: ['fetch-client-project'] });
  });

  return (
  <div>
    <div onClick={() => setIsOpen(true)} className={`rounded-3xl shadow-lg bg-gradient-to-br ${cardColor}
                        p-6 space-y-4 border
                        cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl`}>
      
      <h2 className="text-2xl font-semibold text-center text-indigo-600">
        {details?.name}
      </h2>
      
      <div className="space-y-2 text-gray-700 text-sm truncate overflow-hidden whitespace-nowrap">
        <p>
          <span className="font-medium text-gray-900">Job Description:</span> {details?.description}
        </p>
        <p>
          <span className="font-medium text-gray-900">Job URL:</span> {details?.url}
        </p>
        <p>
          <span className="font-medium text-gray-900">Expected Budget(in SOL):</span> {details?.budget.toNumber()}
        </p>
      </div>
    </div>
    {
      isOpen &&
        (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>  
              <div className="flex flex-col">
                <label htmlFor="project-id">Project ID</label>
                <input
                  type="number"
                  placeholder="Project ID"
                  className="input input-bordered w-full mb-4"
                  value={details?.id}
                  disabled={true}
                />
                <label htmlFor="project-name">Project Name</label>
                <input
                  type="text"
                  placeholder="Project Name"
                  className="input input-bordered w-full mb-4"
                  value={details?.name}
                  disabled={true}
                />               
                {
                  !escrowAccount && details?.isActive && (
                    <div>
                      <label htmlFor="freelancer-account">Freelancer Account</label>
                      <input
                          type="text"
                          placeholder="Freelancer Account Address"
                          className="input input-bordered w-full mb-4"
                          value={freelancerAccount}
                          required
                          onChange={(e) => setFreelancerAccount(e.target.value)}
                      />
                      <label htmlFor="budget">Finalized Budget (in SOL)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Budget (in SOL)"
                        className="input input-bordered w-full mb-4"
                        disabled={details?.assignedFreelancerProjectId.toNumber() !== 0}
                        value={budget}
                        required
                        onChange={(e) => setBudget(Number(e.target.value))}
                      />
                    </div>)
                }
                {escrowAccount && (
                  <div>
                    <label htmlFor="freelancer-account">Assigned Freelancer</label>
                      <input
                          type="text"
                          placeholder="Freelancer Account Address"
                          className="input input-bordered w-full mb-4"
                          value={details?.assignedFreelancer.toBase58()}
                          required
                          disabled={true}
                      />
                    <label htmlFor="budget">Finalized Budget (in SOL)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Budget (in SOL)"
                        className="input input-bordered w-full mb-4"
                        disabled={true}
                        value={escrowAccount?.budget.toNumber()}
                      />
                    <label htmlFor="amount-paid">Amount Paid</label>
                      <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Budget (in SOL)"
                          className="input input-bordered w-full mb-4"
                          disabled={true}
                          value={escrowAccount?.amountPaid.toNumber() / 1000000000}
                      />
                    <label htmlFor="amount-paid">Vault Balance</label>
                      <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Budget (in SOL)"
                          className="input input-bordered w-full mb-4"
                          disabled={true}
                          value={vaultBalance / 1000000000}
                      />
                    <label htmlFor="total-tasks">Total Tasks</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Total Tasks"
                        className="input input-bordered w-full mb-4"
                        value={escrowAccount?.totalTasks.toNumber()}
                        disabled={true}
                      />
                    <label htmlFor="tasks-completed">Tasks Completed</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Tasks Completed"
                        className="input input-bordered w-full mb-4"
                        value={escrowAccount?.tasksCompleted.toNumber()}
                        disabled={true}
                      />
                  </div>
                )}
                {(details?.assignedFreelancerProjectId.toNumber() === 0) ? 
                ( 
                  <div className="flex flex-col">
                   <label htmlFor="total-tasks">Total Tasks</label>
                   <input
                     type="number"
                     min="0"
                     step="1"
                     placeholder="Total Tasks"
                     className="input input-bordered w-full mb-4"
                     value={totalTasks}
                     required
                     onChange={(e) => setTotalTasks(Number(e.target.value))}
                   />
                   <button
                      className="btn btn-xs lg:btn-md btn-primary btn-outline text-blue-500 ml-auto"
                      onClick={() => projectSetupMut.mutateAsync({projectID: details?.id, projectName: details?.name, freelancer: new PublicKey(freelancerAccount), budget: budget, totalTasks: totalTasks})} 
                      disabled={projectSetupMut.isPending}>
                      Assign Freelancer{projectSetupMut.isPending && '...'}
                   </button>
                  </div>
                ): (
                      <div>
                          { details?.isActive && details?.taskInReview && 
                              <div>
                                  <label htmlFor="task-url">Requested Task Review</label>
                                  <input
                                    type="text"
                                    placeholder="Task URL"
                                    className="input input-bordered w-full mb-4"
                                    value={details?.taskInReview}
                                    disabled={true}
                                  />
                                  <div className="flex space-x-4 mb-12">
                                    <div className="ml-auto flex space-x-4">
                                      <label className="cursor-pointer">
                                            <input type="radio" name="taskStatus" value="approve" className="peer hidden" onChange={() => reviewProcessTaskMut.mutateAsync({ projectID: details?.id, approval: true, assignedFreelancer: details?.assignedFreelancer, assignedFreelancerProjectID: details?.assignedFreelancerProjectId.toNumber() })} />
                                            <div className="px-4 py-2 rounded-full border border-green-500 text-green-500 peer-checked:bg-green-500 peer-checked:text-white transition">
                                              Approve
                                            </div>
                                          </label>
                                          <label className="cursor-pointer">
                                            <input type="radio" name="taskStatus" value="reject" className="peer hidden" onChange={() => reviewProcessTaskMut.mutateAsync({ projectID: details?.id, approval: false, assignedFreelancer: details?.assignedFreelancer, assignedFreelancerProjectID: details?.assignedFreelancerProjectId.toNumber() })} />
                                            <div className="px-4 py-2 rounded-full border border-red-500 text-red-500 peer-checked:bg-red-500 peer-checked:text-white transition">
                                              Reject
                                            </div>
                                      </label>
                                    </div>
                                  </div>
                              </div>
                          }
  
                      { details?.isActive &&
                          <div className="flex justify-between space-x-4">
                            <button
                                className="btn btn-xs lg:btn-md btn-outline text-orange-500"
                                onClick={() => setIsOpenSubModal(true)}>
                                Transfer Project{projectSetupMut.isPending && '...'}
                            </button>
                            <button
                                className="btn btn-xs lg:btn-md btn-outline text-red-500"
                                onClick={() => withdrawProjectMut.mutateAsync({projectID: details?.id})} 
                                disabled={withdrawProjectMut.isPending}>
                                Withdraw Project{withdrawProjectMut.isPending && '...'}
                            </button>
                          </div>
                      }
                      {
                        isOpenSubModal && (
                          <Modal isOpen={isOpenSubModal} onClose={() => setIsOpenSubModal(false)}>  
                            <div className="flex flex-col">
                              <label htmlFor="new-freelancer-account">New Freelancer Account</label>
                              <input
                                  type="text"
                                  placeholder="New Freelancer Account Address"
                                  className="input input-bordered w-full mb-4"
                                  value={newFreelancerAccount}
                                  required
                                  onChange={(e) => setNewFreelancerAccount(e.target.value)}
                              />
                              <button
                                    className="btn btn-xs lg:btn-md btn-outline text-blue-500 ml-auto"
                                    onClick={() => transferProjectMut.mutateAsync({projectID: details?.id, newFreelancer: new PublicKey(newFreelancerAccount)})} 
                                    disabled={transferProjectMut.isPending}>
                                    Transfer Project{transferProjectMut.isPending && '...'}
                              </button>
                            </div>
                          </Modal>
                        )
                      }
                  </div>
                )
              }
              </div>
        </Modal>
        )
    }
  </div>
  )
}

function FreelancerProjectCard({ address, details }: { address: PublicKey, details: any; }) {
  const { TaskReviewMutation } = useFreelancerAccounts({ account: address });
  console.log("Freelancer Project Card details", details)
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false)
  const [taskURL, setTaskURL] = useState('')

  useEffect(() => {
    console.log("freelancer Project Card")
    if (details && details?.completedTaskUrl !== '') {
      setTaskURL(details?.completedTaskUrl);
    }
  },[details]);


  let cardColor = details?.isActive
  ? 'from-green-100 to-green-200'
  : 'from-red-100 to-red-200';

  const taskReviewMut = TaskReviewMutation(() => {
    setIsOpen(false);
    setTaskURL('');
    queryClient.invalidateQueries({ queryKey: ['fetch-freelancer-project'] });
  });

  const isRequestFormValid = () => {
    if (taskURL.length === 0) {
      return false;
    }
    return true;
  }
      

  return (
  <div>
    <div onClick={() => setIsOpen(true)} className={`rounded-3xl shadow-lg bg-gradient-to-br ${cardColor}
                        to-slate-50 p-6 space-y-4 border border-gray-200
                        cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl`}>
      
      <h2 className="text-2xl font-semibold text-center text-indigo-600">
        {details?.projectName}
      </h2>
      
      <div className="space-y-2 text-gray-700 text-sm truncate overflow-hidden whitespace-nowrap">
        <p>
          <span className="font-medium text-gray-900">project Owner:</span> {details?.projectClient.toBase58()}
        </p>
        <p>
          <span className="font-medium text-gray-900">Amount Paid:</span> {details?.amountPaid.toNumber() / 1000000000}
        </p>
        <p>
          <span className="font-medium text-gray-900">Approved Tasks:</span> {details?.approvedTasks.toNumber()}
        </p>
        <p>
          <span className="font-medium text-gray-900">Attempts rejected:</span> {details?.rejectedAttempts.toNumber()}
        </p>
      </div>
    </div>
    {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>  
            <div className="flex flex-col">
              <label htmlFor="project-id">Project ID</label>
              <input
                type="number"
                placeholder="Project ID"
                className="input input-bordered w-full mb-4"
                value={details?.id}
                disabled={true}
              />
              <label htmlFor="project-name">Project Name</label>
              <input
                type="text"
                placeholder="Project Name"
                className="input input-bordered w-full mb-4"
                value={details?.projectName}
                disabled={true}
              />
              
              {details?.isActive &&
                <div className="flex flex-col">
                  <label htmlFor="task-url">Task Url</label>
                  <input
                    type="text"
                    placeholder="Enter URL to completed task"
                    className="input input-bordered w-full mb-4"
                    value={taskURL}
                    minLength={1}
                    required
                    disabled={details?.completedTaskUrl !== ''}
                    onChange={(e) => setTaskURL(e.target.value)}
                  />
                  <button
                        className="btn btn-xs lg:btn-md btn-outline text-green-500 ml-auto"
                        onClick={() => taskReviewMut.mutateAsync({projectID: details?.id, projectName: details?.projectName, taskURL: taskURL })} 
                        disabled={taskReviewMut.isPending || details?.completedTaskUrl !== '' || details?.isActive === false || !isRequestFormValid()}>
                        {details?.completedTaskUrl !== '' ? <b>Review requested</b> : 'Request Task Review'}{taskReviewMut.isPending && '...'}
                  </button>
                </div>
              }
            </div>
        </Modal>
    )}
  </div>
  )
}

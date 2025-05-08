'use client'

import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { useFreelancerAccounts } from "../freelancer/freelancer-data-access";
import { useClientAccounts } from "../client/client-data-access";
import { useQueries } from "@tanstack/react-query";
import { Modal } from "../modal/modal";


export function MyProjects({ address }: { address: PublicKey }) {
    const { queryFreelancerAccount, fetchFreelancerProjects } = useFreelancerAccounts({ account: address });
    const { queryClientAccount, fetchClientProjects } = useClientAccounts({ account: address });
  
    const clientDetails = queryClientAccount.data;
    const clientProjectCounter = clientDetails?.projectCounter.toNumber() || 0;


    const clientProjectQueries = useQueries({
        queries: useMemo(() => {
          if (!clientProjectCounter) return [];
          return Array.from({ length: clientProjectCounter }, (_, i) => {
            return {
              queryKey: ['fetch-client-project', i + 1],
              queryFn: () => fetchClientProjects(address, i + 1),
            };
          });
        }, [clientProjectCounter, address]),
      });

    const clientProjectsLoading = clientProjectQueries.some(q => q.isLoading)
    const clientProjects = clientProjectQueries.map(q => q.data).filter(Boolean)

    const freelancerDetails = queryFreelancerAccount.data;
    const freelancerProjectCounter = freelancerDetails?.projectCounter.toNumber() || 0;

    const freelancerProjectQueries = useQueries({
        queries: useMemo(() => {
          if (!freelancerProjectCounter) return [];
          return Array.from({ length: freelancerProjectCounter }, (_, i) => {
            return {
              queryKey: ['fetch-freelancer-project', i + 1],
              queryFn: () => fetchFreelancerProjects(address, i + 1),
            };
          });
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

function ClientProjectCard({ address, details }: { address: PublicKey, details: any; }) {

  const { useProjectEscrowSetupMutation } = useClientAccounts({ account: address });

  const [isOpen, setIsOpen] = useState(false)
  const [freelancerAccount, setFreelancerAccount] = useState('')
  const [budget, setBudget] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)

  const DEFAULT_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

  useEffect(() => {
    if (details) {
      if (!(details?.assignedFreelancer.toString() === DEFAULT_PROGRAM_ID.toString())) {
        setFreelancerAccount(details?.assignedFreelancer.toString());
        setBudget(details?.budget.toNumber());
      }
    }
  }, [details]);


  let cardColor = details?.inprogress
  ? 'from-yellow-100 to-yellow-200'
  : 'from-red-100 to-red-200';

  if (!details?.isActive) {
    cardColor = 'from-gray-100 to-gray-200';
  }
  const projectSetupMut = useProjectEscrowSetupMutation(() => {
    setIsOpen(false);
    setFreelancerAccount('');
  });

  return (
  <div>
    <div onClick={() => setIsOpen(true)} className={`rounded-3xl shadow-lg bg-gradient-to-br ${cardColor}
                        from-white to-slate-50 p-6 space-y-4 border border-gray-200
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
          <span className="font-medium text-gray-900">Budget(in SOL):</span> {details?.budget.toNumber()}
        </p>
      </div>
    </div>
    {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>  
          {!details?.inprogress ? (
            <div>
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
              <label htmlFor="freelancer-account">Freelancer Account</label>
              <input
                type="text"
                placeholder="Freelancer Account Address"
                className="input input-bordered w-full mb-4"
                value={freelancerAccount}
                required
                onChange={(e) => setFreelancerAccount(e.target.value)}
              />
              <label htmlFor="budget">Budget</label>
              <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Budget (in SOL)"
                  className="input input-bordered w-full mb-4"
                  value={budget === 0 ? '' : budget}
                  required
                  onChange={(e) => setBudget(Number(e.target.value))}
              />
              {details?.assignedFreelancerProjectId.toNumber() === 0 && (
                <div>
                 <label htmlFor="total-tasks">Total Tasks</label>
                 <input
                   type="number"
                   min="0"
                   step="1"
                   placeholder="Total Tasks"
                   className="input input-bordered w-full mb-4"
                   value={totalTasks === 0 ? '' : totalTasks}
                   required
                   onChange={(e) => setTotalTasks(Number(e.target.value))}
                 />
                 <button
                    className="btn btn-xs lg:btn-md btn-primary btn-outline text-blue-500"
                    onClick={() => projectSetupMut.mutateAsync({projectID: details?.id, projectName: details?.name, freelancer: new PublicKey(freelancerAccount), budget: details?.budget, totalTasks: details?.totalTasks})} 
                    disabled={projectSetupMut.isPending}>
                    Assign Freelancer{projectSetupMut.isPending && '...'}
                </button>
                </div>
              )}
            </div>
          ):
          (
             <div>
             </div>
          )     
        }
        </Modal>
    )}
  </div>
  )
}

function FreelancerProjectCard({ address, details }: { address: PublicKey, details: any; }) {
  const { TaskReviewMutation } = useFreelancerAccounts({ account: address });

  const [isOpen, setIsOpen] = useState(false)
  const [taskURL, setTaskURL] = useState('')

  useEffect(() => {
    if (details && details?.completedTaskUrl !== '') {
      setTaskURL(details?.completedTaskUrl);
    }
  },[details?.completedTaskUrl]);

  let cardColor = details?.isActive
  ? 'from-green-100 to-green-200'
  : 'from-red-100 to-red-200';

  const taskReviewMut = TaskReviewMutation(() => {
    setIsOpen(false);
    setTaskURL('');
  });

  return (
  <div>
    <div onClick={() => setIsOpen(true)} className={`rounded-3xl shadow-lg bg-gradient-to-br ${cardColor}
                        from-white to-slate-50 p-6 space-y-4 border border-gray-200
                        cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl`}>
      
      <h2 className="text-2xl font-semibold text-center text-indigo-600">
        {details?.projectName}
      </h2>
      
      <div className="space-y-2 text-gray-700 text-sm truncate overflow-hidden whitespace-nowrap">
        <p>
          <span className="font-medium text-gray-900">project Owner:</span> {details?.projectClient.toBase58()}
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
          {!details?.inprogress ? (
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
              <label htmlFor="task-url">Task Url</label>
              <input
                type="text"
                placeholder="Enter URL to completed task"
                className="input input-bordered w-full mb-4"
                value={taskURL}
                required
                onChange={(e) => setTaskURL(e.target.value)}
              />
              <button
                    className="btn btn-xs lg:btn-md btn-primary btn-outline text-blue-500 ml-auto"
                    onClick={() => taskReviewMut.mutateAsync({projectID: details?.id, projectName: details?.projectName, taskURL: taskURL })} 
                    disabled={taskReviewMut.isPending}>
                    Request Task Review{taskReviewMut.isPending && '...'}
              </button>
            </div>
          ):
          (
             <div>
             </div>
          )     
        }
        </Modal>
    )}
  </div>
  )
}

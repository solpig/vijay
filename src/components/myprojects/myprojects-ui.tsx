'use client'

import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { useFreelancerAccounts } from "../freelancer/freelancer-data-access";
import { useClientAccounts } from "../client/client-data-access";
import { useQueries } from "@tanstack/react-query";


export function MyProjects({ address }: { address: PublicKey }) {
    const { queryFreelancerAccount, QueryFreelancerProjects } = useFreelancerAccounts({ account: address });
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

    const projectsLoading = clientProjectQueries.some(q => q.isLoading)
    const clientProjects = clientProjectQueries.map(q => q.data).filter(Boolean)

    if (projectsLoading) {
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
                          console.log("result", result),
                        <ProjectCard 
                          key={i}
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

function ProjectCard({ details }: { details: any }) {

  let cardColor = details?.inprogress
  ? 'from-yellow-100 to-yellow-200'
  : 'from-red-100 to-red-200';

  if (!details?.isActive) {
    cardColor = 'from-gray-100 to-gray-200';
  }

  return (
  <div>
    <div className={`rounded-3xl shadow-lg bg-gradient-to-br ${cardColor}
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
          <span className="font-medium text-gray-900">Contact:</span> {details?.budget.toNumber()}
        </p>
      </div>
    </div>
  </div>
  )
}

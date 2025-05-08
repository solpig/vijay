'use client'

import { useClientAccounts } from './client-data-access'
import { PublicKey } from '@solana/web3.js'
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

export default function ClientInfoFeature({ account }: { account: String }) {
  if (!account) {
        throw new Error('account is undefined');
  }
  const  publicKey  = new PublicKey(account)
  const { queryClientAccount, queryClientPerformance, fetchClientProjects } = useClientAccounts({ account: publicKey });

  const clientDetails = queryClientAccount.data;
  const clientLoading = queryClientAccount.isLoading;
 
  const clientPerformance = queryClientPerformance.data;
  const performanceLoading = queryClientPerformance.isLoading;

  const projectCounter = clientDetails?.projectCounter.toNumber() || 0;

  const projectQueries = useQueries({
    queries: useMemo(() => {
      if (!projectCounter) return [];
      return Array.from({ length: projectCounter }, (_, i) => {
        return {
          queryKey: ['fetch-client-project', i + 1],
          queryFn: () => fetchClientProjects(publicKey, i + 1),
        };
      });
    }, [projectCounter, publicKey]),
  });

  const projectsLoading = projectQueries.some(q => q.isLoading)
  const clientProjects = projectQueries.map(q => q.data).filter(Boolean)


  if (clientLoading || performanceLoading || projectsLoading) {
        return <div className="text-center">Loading...</div>;
  } 

  return (
    <div className="h-screen w-full grid grid-rows-2">
      <div className="grid grid-cols-2 border-b">
        <div className="p-6 bg-white border-r border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-600 mb-10">Client Info</h1>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Public Key:</span> {publicKey.toBase58()}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Name:</span> {clientDetails?.name}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Domain:</span> {clientDetails?.domain}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Skills:</span> {clientDetails?.requiredSkills}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Contact:</span> {clientDetails?.contact}</p>
        </div>

        <div className="p-6 bg-indigo-50 text-center">
          <h2 className="text-xl font-semibold text-indigo-800 mb-10">Performance Report Card</h2>
          <p className="mt-2">Total Projects: {clientPerformance?.totalProjects.toNumber()}</p>
          <p className="mt-2">Completed: {clientPerformance?.completed.toNumber()}</p>
          <p className="mt-2">In-Progress: {clientPerformance?.projectsInProgress.toNumber()}</p>
          <p className="mt-2">Withdrawn: {clientPerformance?.withdrawn.toNumber()}</p>
          <p className="mt-2">Withdrawn: {clientPerformance?.transferred.toNumber()}</p>
          <p className="mt-2">RiskScore: {clientPerformance?.riskScore}</p>
          <p className="mt-2">SuccessRate: {clientPerformance?.successRate}</p>
        </div>
      </div>
          <div className="p-6 bg-gray-50">
          <h2 className="text-xl font-semibold text-indigo-800 mb-10">Published projects</h2>
            <div className="max-w-16xl mx-auto mr-16 mt-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientProjects.map((result, i) => (
                <ClientProjectCard 
                  key={i}
                  details={result} 
                />
              ))}
            </div>
          </div>
        </div>
    </div>
  );
 }


function ClientProjectCard({ details }: { details: any }) {
  return (<div>
    <div className="max-w-md w-full mx-auto rounded-3xl shadow-lg bg-gradient-to-br 
                        from-white to-slate-50 p-6 space-y-4 border border-gray-200
                        cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl">
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
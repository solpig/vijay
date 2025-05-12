'use client'

import { useQueries } from '@tanstack/react-query';
import { useFreelancerAccounts } from './freelancer-data-access'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react';

export default function FreelancerInfoFeature({ account }: { account: String }) {
  if (!account) {
        throw new Error('account is undefined');
  }
  const publicKey = useMemo(() => new PublicKey(account), [account]);
  const { queryFreelancerAccount, QueryFreelancerPerformance: queryFreelancerPerformance, fetchFreelancerProjects: queryFreelancerProjects } = useFreelancerAccounts({ account: publicKey });

  const freelancerDetails = queryFreelancerAccount.data;
  const freelancerLoading = queryFreelancerAccount.isLoading;

  const freelancerPerformance = queryFreelancerPerformance.data;
  const performanceLoading = queryFreelancerPerformance.isLoading;

  let projectCounter = freelancerDetails?.projectCounter.toNumber() || 0;

  const projectQueries = useQueries({
    queries: useMemo(() => {
      if (!projectCounter) return [];
      return Array.from({ length: projectCounter }, (_, i) => {
        return {
          queryKey: ['fetch-freelancer-project', i + 1],
          queryFn: () => queryFreelancerProjects(publicKey, i + 1),
        };
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectCounter, publicKey]),
  });

  const projectsLoading = projectQueries.some(q => q.isLoading)
  const freelancerProjects = projectQueries.map(q => q.data).filter(Boolean)

  if (freelancerLoading || performanceLoading || projectsLoading) {
        return <div className="text-center">Loading...</div>;
  } 

  return (
    <div className="h-screen w-full grid grid-rows-2">
      <div className="grid grid-cols-2 border-b">
        <div className="p-6 bg-white border-r border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-600 mb-10">Freelancer Info</h1>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Account Address:</span> {publicKey.toBase58()}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Name:</span> {freelancerDetails?.name}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Domain:</span> {freelancerDetails?.domain}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Expertise:</span> {freelancerDetails?.skills}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Contact:</span> {freelancerDetails?.contact}</p>
        </div>

        <div className="p-6 bg-indigo-50 text-center">
          <h2 className="text-xl font-semibold text-indigo-800 mb-10">Performance Report Card</h2>
          <p className="mt-2">Total Projects: {freelancerPerformance?.totalProjects.toNumber()}</p>
          <p className="mt-2">Completed: {freelancerPerformance?.completed.toNumber()}</p>
          <p className="mt-2">In-Progress: {freelancerPerformance?.projectsInProgress.toNumber()}</p>
          <p className="mt-2">Cancelled: {freelancerPerformance?.rejected.toNumber()}</p>
          <p className="mt-2">RiskRate: {(freelancerPerformance && freelancerPerformance?.riskScore) ? freelancerPerformance?.riskScore / 100 : 0} %</p>
          <p className="mt-2">SuccessRate: {(freelancerPerformance && freelancerPerformance?.successRate) ? freelancerPerformance.successRate / 100 : 0} %</p>
        </div>
      </div>
          <div className="p-6 bg-gray-50 h-[500px] overflow-y-auto space-y-4 p-4">
           <h2 className="text-xl font-semibold text-indigo-800 mb-10">Assigned projects</h2>
            <div className="max-w-16xl mx-auto mr-16 mt-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {freelancerProjects.map((result, i) => (
                  <FreelancerProjectCard key={i} details={result} />
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}

function FreelancerProjectCard({ details }: { details: any }) {
  return (
    <div>
    <div className="max-w-md w-full mx-auto rounded-3xl shadow-lg bg-gradient-to-br 
                        from-white to-slate-50 p-6 space-y-4 border border-gray-200
                        cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      <h2 className="text-2xl font-semibold text-center text-indigo-600">
        {details?.name}
      </h2>
      <div className="space-y-2 text-gray-700 text-sm truncate overflow-hidden whitespace-nowrap">
          <p>
            <span className="font-medium text-gray-900">Project Name:</span> {details?.projectName}
          </p>
          <p>
            <span className="font-medium text-gray-900">Project Owner:</span> {details?.projectClient.toBase58()}
          </p>
          <p>
            <span className="font-medium text-gray-900">Tasks Approved:</span> {details?.approvedTasks.toNumber()}
          </p>
          <p>
            <span className="font-medium text-gray-900">Rejected Attempts:</span> {details?.rejectedAttempts.toNumber()}
          </p>
        </div>
      </div>
    </div>
  )
}
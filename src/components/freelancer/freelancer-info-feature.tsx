'use client'

import { useFreelancerAccounts } from './freelancer-data-access'
import { PublicKey } from '@solana/web3.js'

export default function FreelancerInfoFeature({ account }: { account: String }) {
  if (!account) {
        throw new Error('account is undefined');
  }
  const  publicKey  = new PublicKey(account)
  const { queryFreelancerAccount, queryFreelancerPerformance, queryFreelancerProjects } = useFreelancerAccounts({ account: publicKey });

  const freelancerDetails = queryFreelancerAccount.data;
  const freelancerPerformance = queryFreelancerPerformance.data;
  let projectCounter = freelancerDetails?.projectCounter.toNumber() || 0;
    let projectIDs = [];
    for (let i = 0; i < projectCounter; i++) {
        projectIDs.push(i);
    }
//   const freelancerProject = queryFreelancerProjects(publicKey, 1, "Project A", queryFreelancerPerformance.data?.program);

  const performanceLoading = queryFreelancerPerformance.isLoading;
  const freelancerLoading = queryFreelancerAccount.isLoading;

  if (freelancerLoading || performanceLoading) {
        return <div className="text-center">Loading...</div>;
  } 

  return (
    <div className="h-screen w-full grid grid-rows-2">
      <div className="grid grid-cols-2 border-b">
        <div className="p-6 bg-white border-r border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-600 mb-10">Freelancer Info</h1>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Public Key:</span> {publicKey.toBase58()}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Name:</span> {freelancerDetails?.name}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Domain:</span> {freelancerDetails?.domain}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Skills:</span> {freelancerDetails?.skills}</p>
          <p className="text-gray-700 mt-2"><span className="font-semibold">Contact:</span> {freelancerDetails?.contact}</p>
        </div>

        <div className="p-6 bg-indigo-50 text-center">
          <h2 className="text-xl font-semibold text-indigo-800 mb-10">Performance Report Card</h2>
          <p className="mt-2">Total Projects: {freelancerPerformance?.totalProjects.toNumber()}</p>
          <p className="mt-2">Completed: {freelancerPerformance?.completed.toNumber()}</p>
          <p className="mt-2">In-Progress: {freelancerPerformance?.projectsInProgress.toNumber()}</p>
          <p className="mt-2">Cancelled: {freelancerPerformance?.rejected.toNumber()}</p>
          <p className="mt-2">RiskScore: {freelancerPerformance?.riskScore}</p>
          <p className="mt-2">SuccessRate: {freelancerPerformance?.successRate}</p>
        </div>
      </div>

      <div className="p-6 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bio & Projects</h2>
        <p className="text-gray-700">
          John is a full-stack blockchain developer specializing in Solana smart contracts and DeFi apps.
        </p>
        <p className="mt-4 text-gray-700">
          He maintains open-source libraries and mentors new developers in the Web3 ecosystem.
        </p>
      </div>
    </div>
  );
}

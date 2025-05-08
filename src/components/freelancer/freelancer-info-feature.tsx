'use client'

import { UseQueryResult } from '@tanstack/react-query';
import { useFreelancerAccounts } from './freelancer-data-access'
import { PublicKey } from '@solana/web3.js'

export default function FreelancerInfoFeature({ account }: { account: String }) {
  if (!account) {
        throw new Error('account is undefined');
  }
  const  publicKey  = new PublicKey(account)
  const { queryFreelancerAccount, QueryFreelancerPerformance: queryFreelancerPerformance, QueryFreelancerProjects: queryFreelancerProjects } = useFreelancerAccounts({ account: publicKey });

  const freelancerDetails = queryFreelancerAccount.data;
  const freelancerPerformance = queryFreelancerPerformance.data;
  let projectCounter = freelancerDetails?.projectCounter.toNumber() || 0;

  
  let projectIDs: number[] = [];
    for (let i = 0; i < projectCounter; i++) {
        projectIDs.push(i);
    }
  console.log("projectIDs", projectIDs)
  let freelancerProjects: UseQueryResult[] = [];
  for (let i = 0; i < projectCounter; i++) {
      const id = projectIDs[i];
      freelancerProjects.push(queryFreelancerProjects(publicKey, id));
  };
  console.log("freelancerProjects", freelancerProjects)
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

function FreelancerProjectCard({ details }: { details: UseQueryResult }) {
  // const router = useRouter();
  // const  freelancerDetails = account.account;
  // console.log("freelancerDetails", freelancerDetails)
  // const handleClick = () => {
  //   if (freelancerDetails?.owner) {
  //     router.push(`/freelancer/${freelancerDetails.owner.toString()}`);
  //   }
  // };
  console.log("details", details)
  return (
    <div></div>
    // <div onClick={handleClick} className="max-w-md w-full mx-auto rounded-3xl shadow-lg bg-gradient-to-br 
    //                     from-white to-slate-50 p-6 space-y-4 border border-gray-200
    //                     cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl">
    //   <h2 className="text-2xl font-semibold text-center text-indigo-600">
    //     {freelancerDetails.name}
    //   </h2>
    //   <div className="space-y-2 text-gray-700 text-sm truncate overflow-hidden whitespace-nowrap">
    //     <p>
    //       <span className="font-medium text-gray-900">Domain:</span> {freelancerDetails.domain}
    //     </p>
    //     <p>
    //       <span className="font-medium text-gray-900">Skills:</span> {freelancerDetails.skills}
    //     </p>
    //     <p>
    //       <span className="font-medium text-gray-900">Contact:</span> {freelancerDetails.contact}
    //     </p>
    //   </div>
    // </div>
  )
}
import { useFreelancerAccounts } from '@/components/freelancer/freelancer-data-access';
import FreelancerInfoFeature from '@/components/freelancer/freelancer-info-feature';
import { PublicKey } from '@solana/web3.js';

interface Params {
  params: { publicKey: string };
}

export default function FreelancerDetailPage({ params }: Params) {
  const { publicKey } = params;
  return <FreelancerInfoFeature account={publicKey} />;
}

import ClientInfoFeature from '@/components/client/client-info-feature';

interface Params {
  params: { publicKey: string };
}

export default function FreelancerDetailPage({ params }: Params) {
  const { publicKey } = params;
  return <ClientInfoFeature account={publicKey} />;
}

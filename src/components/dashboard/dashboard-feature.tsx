'use client'

import Link from 'next/link';
import { AppHero } from '../ui/ui-layout'

export default function DashboardFeature() {
  return (
    <div>
      <AppHero title="Vijay" subtitle="A decentralized freelancing platform that connects clients and freelancers on the Solana blockchain." />
      <div className="max-w-xl mx-auto py-10 px-6 text-center">
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            href="/client"
            className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-300"
          >
            Proceed as Client
          </Link>
          <Link
            href="/freelancer"
            className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-green-700 transition duration-300"
          >
            Proceed as Freelancer
          </Link>
        </div>
      </div>
    </div>
  )
}

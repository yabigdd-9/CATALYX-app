import Image from 'next/image'
import Link from 'next/link'
import { Disclaimer } from '@/components/catalyx-ui'

const groups = [
  ['Phase 1 Core', [['Dashboard', '/dashboard'], ['Onboarding', '/onboarding'], ['Grow tracker', '/grows'], ['Feed calculator', '/feed-calculator'], ['Feed logging', '/feed-log'], ['Reminders', '/reminders']]],
  ['Planned Pro', [['Copilot', '/copilot'], ['Feed charts', '/feed-charts'], ['Analytics', '/analytics'], ['Pricing', '/pricing'], ['Export', '/export']]],
  ['Brand Ecosystem', [['Products', '/products'], ['Protocols', '/protocols'], ['University', '/university'], ['Inventory', '/inventory'], ['About', '/about'], ['Admin', '/admin']]],
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.1fr_2fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/brand/official/logo-production-official.png" alt="Catalyx Labs" width={300} height={215} className="h-16 w-auto object-contain" />
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-400">Precision cultivation made simple. A professional companion for feeding, tracking, education, optimisation, and confidence.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {groups.map(([title, links]) => (
            <div key={title as string}>
              <h3 className="font-bold text-[#c8f500]">{title as string}</h3>
              <div className="mt-3 grid gap-2">
                {(links as string[][]).map(([label, href]) => (
                  <Link key={href} href={href} className="text-sm text-zinc-400 hover:text-white">{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <Disclaimer />
      </div>
    </footer>
  )
}

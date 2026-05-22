import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Catalyx Labs',
  description: 'Privacy Policy for Catalyx Labs website visitors and customers.',
}

const sections = [
  {
    title: 'Information We Collect',
    body: 'We may collect contact details, order information, messages you send us, and basic website usage data needed to operate the site and support customers.',
  },
  {
    title: 'How We Use Information',
    body: 'We use information to process orders, respond to enquiries, improve the website, maintain security, and provide customer support.',
  },
  {
    title: 'Sharing Information',
    body: 'We do not sell personal information. We may share limited information with service providers such as payment, shipping, analytics, or support tools when needed to operate the business.',
  },
  {
    title: 'Data Security',
    body: 'We use reasonable safeguards to protect customer information, but no online service can guarantee absolute security.',
  },
  {
    title: 'Your Choices',
    body: 'You may contact us to request access, correction, or deletion of your personal information where required by applicable law.',
  },
  {
    title: 'Policy Updates',
    body: 'We may update this policy as the website and business change. The latest version will be posted on this page.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="bg-[#050707] text-white">
      <section className="border-b border-white/10 bg-black py-16">
        <div className="container mx-auto px-4">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#c8f500]">
            Catalyx Labs
          </p>
          <h1 className="text-5xl font-black uppercase tracking-[0.12em]">Privacy Policy</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">
            This policy explains how Catalyx Labs handles basic website and customer information.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-lg border border-white/10 bg-black p-6">
            <h2 className="text-xl font-black uppercase tracking-[0.12em] text-[#c8f500]">
              Privacy Requests
            </h2>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Send privacy questions or account requests through the contact page and include the email address connected to your enquiry.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-md border border-[#c8f500]/70 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#c8f500] transition hover:bg-[#c8f500] hover:text-black"
            >
              Contact Us
            </Link>
          </aside>

          <div className="space-y-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-lg border border-white/10 bg-black p-6">
                <h2 className="text-xl font-black uppercase tracking-[0.12em]">{section.title}</h2>
                <p className="mt-3 leading-7 text-zinc-400">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

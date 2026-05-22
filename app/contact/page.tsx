'use client'

import { useState } from 'react'
import { PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  return (
    <ShellSection>
      <PageHeader title="Contact Catalyx Labs" copy="Support, product education, professional cultivation questions, wholesale interest, and app feedback." />
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel className="p-5">
          <h2 className="text-2xl font-black">Newsletter signup</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">Get product education previews, protocol updates, and Catalyx University notes.</p>
          <form className="mt-5 grid gap-3" onSubmit={(event) => { event.preventDefault(); setSent(true) }}>
            <input className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Email address" type="email" required />
            <button className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Subscribe</button>
          </form>
        </Panel>
        <Panel className="p-5">
          <h2 className="text-2xl font-black">Send a message</h2>
          <form className="mt-5 grid gap-3" onSubmit={(event) => { event.preventDefault(); setSent(true) }}>
            {['Name', 'Email', 'Subject'].map((field) => (
              <input key={field} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder={field} type={field === 'Email' ? 'email' : 'text'} required />
            ))}
            <textarea className="min-h-36 rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Message" required />
            <button className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Send message</button>
            {sent ? <p className="text-sm text-[#c8f500]">Message captured in mock mode. Connect Supabase or an email service to persist submissions.</p> : null}
          </form>
        </Panel>
      </div>
    </ShellSection>
  )
}


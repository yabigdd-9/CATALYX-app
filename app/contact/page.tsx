'use client'

import Link from 'next/link'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'

const contacts = [
  {
    title: 'Product and wholesale',
    email: 'dion@catalyxlabs.co.nz',
    body: 'Use this route for product questions, wholesale interest, launch planning, and range structure.',
  },
  {
    title: 'App and technical support',
    email: 'robert@catalyxlabs.co.nz',
    body: 'Use this route for Grow OS issues, account problems, checkout questions, and site feedback.',
  },
  {
    title: 'Product operations',
    email: 'daena@catalyxlabs.co.nz',
    body: 'Use this route for product information requests, rollout coordination, and customer-facing process questions.',
  },
]

export default function ContactPage() {
  return (
    <ShellSection>
      <PageHeader
        title="Contact Catalyx Labs"
        copy="Choose the right direct contact path below for product, app, or operations questions."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {contacts.map((contact) => (
          <Panel key={contact.email} className="flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8f500]">Direct contact</p>
                <h2 className="mt-3 text-2xl font-black text-white">{contact.title}</h2>
              </div>
              <StatusPill tone="blue">Email</StatusPill>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-300">{contact.body}</p>
            <div className="mt-auto pt-6">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex w-full items-center justify-center rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black"
              >
                {contact.email}
              </a>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#33d9ff]">Need more context first?</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.04em] text-white">Review the team, kits, or product guide before reaching out.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/team" className="rounded-md border border-white/15 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white">
              Meet the team
            </Link>
            <Link href="/preorder" className="rounded-md border border-white/15 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white">
              Compare kits
            </Link>
            <Link href="/product-guide" className="rounded-md border border-white/15 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white">
              Open guide
            </Link>
          </div>
        </div>
      </Panel>
    </ShellSection>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Catalyx Labs',
  description: 'Terms of Service for Catalyx Labs hydroponic nutrient products and website use.',
}

const sections = [
  {
    title: 'Use of This Website',
    body: 'By using the Catalyx Labs website, you agree to use it only for lawful purposes and in a way that does not interfere with the experience, security, or availability of the site for other customers.',
  },
  {
    title: 'Product Information',
    body: 'Product descriptions, usage guidance, specifications, and availability are provided for general information. Always follow the product label, feeding schedule, and local requirements before use.',
  },
  {
    title: 'Orders and Pricing',
    body: 'Prices, product availability, promotions, and shipping options may change without notice. We may correct errors, refuse orders, or cancel orders where information is inaccurate or unavailable.',
  },
  {
    title: 'Customer Responsibilities',
    body: 'You are responsible for ensuring products are suitable for your system, crop, location, and intended application. Store and handle all nutrient products according to label directions.',
  },
  {
    title: 'Returns and Support',
    body: 'If you have an issue with an order or product, contact Catalyx Labs support with your order details. Return eligibility may depend on product condition, timing, and applicable consumer law.',
  },
  {
    title: 'Limitation of Liability',
    body: 'To the fullest extent permitted by law, Catalyx Labs is not liable for indirect, incidental, or consequential losses arising from website use, product misuse, or conditions outside our control.',
  },
  {
    title: 'Changes to These Terms',
    body: 'We may update these terms from time to time. Continued use of the website after changes are posted means you accept the updated terms.',
  },
]

export default function TermsPage() {
  return (
    <div className="bg-[#050707] text-white">
      <section className="border-b border-white/10 bg-black py-16">
        <div className="container mx-auto px-4">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#c8f500]">
            Catalyx Labs
          </p>
          <h1 className="text-5xl font-black uppercase tracking-[0.12em]">Terms of Service</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">
            These terms outline the basic conditions for using this website and purchasing Catalyx Labs products.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-lg border border-white/10 bg-black p-6">
            <h2 className="text-xl font-black uppercase tracking-[0.12em] text-[#c8f500]">
              Need Help?
            </h2>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Questions about an order, product use, or account issue can be sent through the contact page.
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

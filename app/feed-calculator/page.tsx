import FeedCalculator from '@/components/FeedCalculator'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function FeedCalculatorPage() {
  return (
    <ShellSection>
      <PageHeader title="Catalyx feed calculator" copy="Stage-based ml/L and tank-size calculator with beginner, standard, professional, adaptive, medium-specific, and safety-aware recommendations." />
      <div className="mt-6">
        <FeedCalculator />
      </div>
    </ShellSection>
  )
}


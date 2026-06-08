import InstallExperience from '@/components/InstallExperience'
import { ShellSection } from '@/components/catalyx-ui'

export default function InstallPage() {
  return (
    <div className="min-h-screen bg-[#050707] text-white">
      <ShellSection className="py-12">
        <InstallExperience />
      </ShellSection>
    </div>
  )
}

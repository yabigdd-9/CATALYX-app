import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import PhotoUpload from '@/components/PhotoUpload'

export default function PhotosPage() {
  return (
    <ShellSection>
      <PageHeader title="Photo tracking" copy="Upload photos, review timeline, compare week by week, tag by stage, record notes, and prepare timelapse-ready progress." />
      <div className="mt-6">
        <PhotoUpload />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {['Week 4 canopy', 'Week 5 bloom set', 'Week 6 flower swell', 'Side-by-side comparison', 'Best growth week', 'Timelapse placeholder'].map((item, index) => (
          <Panel key={item} className="overflow-hidden">
            <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(200,245,0,0.18),transparent_35%),linear-gradient(135deg,#101516,#050707)]">
              <div className="h-24 w-24 rounded-full border border-white/10 bg-black/30 shadow-[0_0_40px_rgba(200,245,0,0.12)]" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-black">{item}</h2>
                <StatusPill tone={index < 3 ? 'lime' : 'blue'}>{index < 3 ? 'Mid flower' : 'Pro'}</StatusPill>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">Photo-based observation placeholder: visible growth remains strong with stable canopy posture.</p>
            </div>
          </Panel>
        ))}
      </div>
    </ShellSection>
  )
}

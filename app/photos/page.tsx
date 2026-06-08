import { PageHeader, ShellSection } from '@/components/catalyx-ui'
import PhotoUpload from '@/components/PhotoUpload'

export default function PhotosPage() {
  return (
    <ShellSection>
      <PageHeader title="Photo tracking" copy="Upload photos, review timeline, compare week by week, tag by stage, record notes, and prepare timelapse-ready progress." />
      <div className="mt-6">
        <PhotoUpload />
      </div>
    </ShellSection>
  )
}

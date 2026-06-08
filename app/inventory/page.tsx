import InventoryReorderGrid from '@/components/InventoryReorderGrid'
import ProGate from '@/components/ProGate'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'

export default function InventoryPage() {
  return (
    <ShellSection>
      <PageHeader title="My Shelf inventory" copy="Track owned Catalyx products, bottle size, amount remaining, usage per feed, days left, reorder timing, and low-stock warnings." />
      <ProGate
        featureKey="inventory_tracking"
        feature="Inventory tracking"
        reason="Catalyx Pro tracks bottle usage, days left, reorder timing, and low-stock warnings tied to your feed logs."
        preview
      >
        <Panel className="mt-6 border-[#33d9ff]/20 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Reorder engine</p>
              <h2 className="mt-2 text-2xl font-black text-white">Predict days left and route low stock into checkout</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">Shelf inventory now points to a next order window instead of just showing bottle counts. Low-stock items can move straight into cart while wallet credit offsets the reorder cost.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="blue">Inventory to cart</StatusPill>
              <StatusPill tone="amber">Credit-aware reorder timing</StatusPill>
            </div>
          </div>
        </Panel>
        <InventoryReorderGrid />
      </ProGate>
    </ShellSection>
  )
}

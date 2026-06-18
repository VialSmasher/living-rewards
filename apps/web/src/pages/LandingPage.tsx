import {
  ArrowRight,
  Bell,
  Building2,
  CalendarClock,
  ClipboardCheck,
  FileWarning,
  Gift,
  Gauge,
  ShieldCheck,
  Users,
  WalletCards,
  Wrench,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const proofPoints = [
  ['Service requests', 'Photos, access notes, vendor assignment, SLA pressure, and communication history.', Wrench],
  ['Notice records', 'Targeted resident or tenant notices with acknowledgement tracking and audit evidence.', Bell],
  ['Lease risk', 'Renewal windows, critical dates, COIs, and next actions for commercial and residential teams.', CalendarClock],
  ['Incentives', 'Resident rewards and tenant engagement tied to useful operating outcomes.', Gift],
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#111412] text-white">
      <header className="border-b border-white/10 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f6c451] text-stone-950">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black">Living Rewards PropertyOps</p>
              <p className="text-xs text-white/55">Property operations plus resident and tenant engagement</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white" asChild>
              <Link href="/resident-loyalty/resident-demo">Resident portal</Link>
            </Button>
            <Button className="bg-[#f6c451] text-stone-950 hover:bg-[#ffd76a]" asChild>
              <Link href="/resident-loyalty">
                Open operations demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80"
            alt="Commercial property exterior"
            className="absolute inset-0 h-full w-full object-cover opacity-28"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111412] via-[#111412]/92 to-[#111412]/62" />
          <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-8 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-[1fr_430px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-[#f6c451]">
                <Building2 className="h-4 w-4" />
                Residential and commercial PM operations MVP
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-none md:text-7xl">
                A daily operating cockpit for property managers.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                Living Rewards is evolving from resident loyalty into a property operations layer. It helps managers
                reduce chasing, coordinate service, preserve acknowledgement records, surface lease risk, and give
                residents or tenants a useful portal for the work that keeps buildings running.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button className="bg-[#f6c451] text-stone-950 hover:bg-[#ffd76a]" asChild>
                  <Link href="/resident-loyalty">
                    View the C+ operations demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white" asChild>
                  <Link href="/resident-loyalty/setup">
                    Tenant onboarding
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.08] p-3 shadow-2xl">
              <div className="rounded-lg bg-[#fbf7ee] p-4 text-stone-950">
                <div className="rounded-lg bg-stone-950 p-5 text-white">
                  <p className="text-xs font-semibold uppercase text-[#f6c451]">Morning PM queue</p>
                  <p className="mt-2 text-4xl font-black">17</p>
                  <p className="mt-2 text-sm text-white/65">open operational items across residential and commercial properties</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-stone-200 p-3">
                    <Wrench className="h-4 w-4 text-rose-700" />
                    <p className="mt-2 text-sm font-black">SLA risk</p>
                    <p className="mt-1 text-xs text-stone-600">2 commercial requests</p>
                  </div>
                  <div className="rounded-lg border border-stone-200 p-3">
                    <FileWarning className="h-4 w-4 text-amber-700" />
                    <p className="mt-2 text-sm font-black">COI gaps</p>
                    <p className="mt-1 text-xs text-stone-600">3 tenant records</p>
                  </div>
                  <div className="rounded-lg border border-stone-200 p-3">
                    <Bell className="h-4 w-4 text-sky-700" />
                    <p className="mt-2 text-sm font-black">Notice proof</p>
                    <p className="mt-1 text-xs text-stone-600">Resident and tenant acks</p>
                  </div>
                  <div className="rounded-lg border border-stone-200 p-3">
                    <WalletCards className="h-4 w-4 text-emerald-700" />
                    <p className="mt-2 text-sm font-black">Incentives</p>
                    <p className="mt-1 text-xs text-stone-600">Rewards tied to action</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="grid gap-3 md:grid-cols-4">
            {proofPoints.map(([title, detail, Icon]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
                <Icon className="h-5 w-5 text-[#f6c451]" />
                <p className="mt-4 font-black">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/60">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
              <Users className="h-5 w-5 text-emerald-300" />
              <p className="mt-3 text-xl font-black">Residential mode</p>
              <p className="mt-2 text-sm leading-6 text-white/62">
                Resident onboarding, maintenance photos, notice acknowledgement, renewal intent, community moments,
                and meaningful rewards.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
              <ShieldCheck className="h-5 w-5 text-sky-300" />
              <p className="mt-3 text-xl font-black">Commercial mode</p>
              <p className="mt-2 text-sm leading-6 text-white/62">
                Tenant service desk, COI expiry, lease critical dates, vendor dispatch, tenant notices, and portfolio
                health.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.07] p-5">
              <ClipboardCheck className="h-5 w-5 text-[#f6c451]" />
              <p className="mt-3 text-xl font-black">PMS path</p>
              <p className="mt-2 text-sm leading-6 text-white/62">
                Start as the operating layer, then expand into CRUD, files, roles, reporting exports, integrations,
                lease charges, and accounting only after validation.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

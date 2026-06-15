import { ArrowRight, Bell, Building2, Camera, Gift, MessageSquare, WalletCards, Wrench } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#111412] text-white">
      <header className="border-b border-white/10 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f6c451] text-stone-950">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black">Living Rewards</p>
              <p className="text-xs text-white/55">Resident loyalty for multifamily operations</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white" asChild>
              <Link href="/resident-loyalty/resident-demo">Resident app</Link>
            </Button>
            <Button className="bg-[#f6c451] text-stone-950 hover:bg-[#ffd76a]" asChild>
              <Link href="/resident-loyalty">
                Open demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <section className="grid min-h-[calc(100vh-9rem)] gap-8 lg:grid-cols-[1fr_430px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-[#f6c451]">
              <WalletCards className="h-4 w-4" />
              Resident rewards prototype, without payments or card rails
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-none md:text-7xl">
              A property portal residents have a reason to open.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
              Living Rewards helps multifamily landlords reduce property-manager chasing by rewarding residents for
              useful operational behavior: better maintenance requests, confirmed access, acknowledged notices,
              early renewal signals, move-in readiness, and consistent rent habits.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
                <Wrench className="h-5 w-5 text-emerald-300" />
                <p className="mt-3 font-black">Operations</p>
                <p className="mt-1 text-sm text-white/60">Less chasing, cleaner records</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
                <MessageSquare className="h-5 w-5 text-rose-300" />
                <p className="mt-3 font-black">Community</p>
                <p className="mt-1 text-sm text-white/60">Notices, polls, and resident moments</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
                <Gift className="h-5 w-5 text-[#f6c451]" />
                <p className="mt-3 font-black">Rewards</p>
                <p className="mt-1 text-sm text-white/60">Rent, grocery, internet, and transit credits</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.07] p-3 shadow-2xl">
            <div className="overflow-hidden rounded-lg bg-[#fbf7ee] text-stone-950">
              <div className="relative h-40">
                <img
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"
                  alt="Modern apartment living space"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-semibold uppercase text-[#f6c451]">Connected home</p>
                  <p className="mt-1 text-2xl font-black">Maclaren House</p>
                </div>
              </div>
              <div className="p-4">
                <div className="rounded-lg bg-stone-950 p-5 text-white">
                  <p className="text-xs text-white/55">Available points</p>
                  <p className="mt-2 text-5xl font-black">375</p>
                  <p className="mt-2 text-sm text-white/65">875 lifetime points, 7 month rent streak</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-stone-200 p-3">
                    <Camera className="h-4 w-4 text-emerald-700" />
                    <p className="mt-2 text-sm font-black">Add repair photos</p>
                    <p className="mt-1 text-xs text-stone-600">+100 points</p>
                  </div>
                  <div className="rounded-lg border border-stone-200 p-3">
                    <Bell className="h-4 w-4 text-rose-700" />
                    <p className="mt-2 text-sm font-black">Acknowledge notice</p>
                    <p className="mt-1 text-xs text-stone-600">+25 points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

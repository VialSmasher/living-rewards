import { QueryClientProvider } from "@tanstack/react-query";
import { Link, Route, Switch } from "wouter";
import { Spinner } from "@/components/ui/spinner";
import { queryClient } from "@/lib/queryClient";
import ResidentLoyaltyManagerPage from "@/features/resident-loyalty/ResidentLoyaltyManagerPage";
import ResidentLoyaltyResidentDemoPage from "@/features/resident-loyalty/ResidentLoyaltyResidentDemoPage";
import ResidentLoyaltySetupPage from "@/features/resident-loyalty/ResidentLoyaltySetupPage";
import LandingPage from "@/pages/LandingPage";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-4 text-stone-950">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase text-stone-500">Page not found</p>
        <h1 className="mt-2 text-3xl font-black">This route is not part of the Living Rewards MVP.</h1>
        <Link href="/resident-loyalty" className="mt-5 inline-flex rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white">
          Open manager demo
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/resident-loyalty/resident-demo" component={ResidentLoyaltyResidentDemoPage} />
        <Route path="/resident-loyalty/setup" component={ResidentLoyaltySetupPage} />
        <Route path="/property-ops" component={ResidentLoyaltyManagerPage} />
        <Route path="/resident-loyalty" component={ResidentLoyaltyManagerPage} />
        <Route path="/loading" component={Spinner} />
        <Route component={NotFound} />
      </Switch>
    </QueryClientProvider>
  );
}

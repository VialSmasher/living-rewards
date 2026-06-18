import { apiRequest } from '@/lib/queryClient';
import type { ResidentLoyaltyDemoState } from './types';

type ResidentLoyaltyStatePatch = Partial<Pick<
  ResidentLoyaltyDemoState,
  | 'landlords'
  | 'properties'
  | 'buildings'
  | 'units'
  | 'residents'
  | 'commercialSuites'
  | 'commercialTenants'
  | 'commercialServiceRequests'
  | 'commercialNotices'
  | 'commercialCoiRecords'
  | 'leaseCriticalDates'
  | 'vendors'
  | 'tenantLifecycles'
  | 'onboardingSteps'
>>;

type ResidentLoyaltyStateResponse = {
  source: 'database' | 'frontend-demo';
  state: ResidentLoyaltyStatePatch | null;
};

export function mergeResidentLoyaltyState(
  base: ResidentLoyaltyDemoState,
  patch?: ResidentLoyaltyStatePatch | null,
): ResidentLoyaltyDemoState {
  if (!patch) return base;
  return {
    ...base,
    landlords: patch.landlords?.length ? patch.landlords : base.landlords,
    properties: patch.properties?.length ? patch.properties : base.properties,
    buildings: patch.buildings?.length ? patch.buildings : base.buildings,
    units: patch.units?.length ? patch.units : base.units,
    residents: patch.residents?.length ? patch.residents : base.residents,
    commercialSuites: patch.commercialSuites?.length ? patch.commercialSuites : base.commercialSuites,
    commercialTenants: patch.commercialTenants?.length ? patch.commercialTenants : base.commercialTenants,
    commercialServiceRequests: patch.commercialServiceRequests?.length
      ? patch.commercialServiceRequests
      : base.commercialServiceRequests,
    commercialNotices: patch.commercialNotices?.length ? patch.commercialNotices : base.commercialNotices,
    commercialCoiRecords: patch.commercialCoiRecords?.length ? patch.commercialCoiRecords : base.commercialCoiRecords,
    leaseCriticalDates: patch.leaseCriticalDates?.length ? patch.leaseCriticalDates : base.leaseCriticalDates,
    vendors: patch.vendors?.length ? patch.vendors : base.vendors,
    tenantLifecycles: patch.tenantLifecycles?.length ? patch.tenantLifecycles : base.tenantLifecycles,
    onboardingSteps: patch.onboardingSteps?.length ? patch.onboardingSteps : base.onboardingSteps,
  };
}

function normalized(value?: string) {
  return value?.trim().toLowerCase() || '';
}

function remapId(value: string, ids: Map<string, string>) {
  return ids.get(value) || value;
}

export function mergeResidentLoyaltyPortalState(
  base: ResidentLoyaltyDemoState,
  patch?: ResidentLoyaltyStatePatch | null,
): ResidentLoyaltyDemoState {
  if (!patch) return base;

  const buildingIds = new Map<string, string>();
  for (const building of patch.buildings || []) {
    const local =
      base.buildings.find((item) => normalized(item.name) === normalized(building.name)) ||
      (patch.buildings?.length === 1 ? base.buildings[0] : undefined);
    if (local) buildingIds.set(building.id, local.id);
  }

  const unitIds = new Map<string, string>();
  for (const unit of patch.units || []) {
    const local = base.units.find((item) => item.unitNumber === unit.unitNumber);
    if (local) unitIds.set(unit.id, local.id);
  }

  const residentIds = new Map<string, string>();
  for (const resident of patch.residents || []) {
    const local = base.residents.find(
      (item) => normalized(item.email) === normalized(resident.email) || normalized(item.name) === normalized(resident.name),
    );
    if (local) residentIds.set(resident.id, local.id);
  }

  return mergeResidentLoyaltyState(base, {
    tenantLifecycles: patch.tenantLifecycles?.map((record) => ({
      ...record,
      residentId: remapId(record.residentId, residentIds),
      buildingId: remapId(record.buildingId, buildingIds),
      unitId: remapId(record.unitId, unitIds),
    })),
    onboardingSteps: patch.onboardingSteps?.map((step) => ({
      ...step,
      residentId: remapId(step.residentId, residentIds),
      buildingId: remapId(step.buildingId, buildingIds),
      unitId: remapId(step.unitId, unitIds),
    })),
  });
}

export async function loadResidentLoyaltyState() {
  const response = await apiRequest('GET', '/api/resident-loyalty/state');
  return (await response.json()) as ResidentLoyaltyStateResponse;
}

export async function runResidentLoyaltyAction(path: string) {
  const response = await apiRequest('POST', path);
  return (await response.json()) as ResidentLoyaltyStateResponse;
}

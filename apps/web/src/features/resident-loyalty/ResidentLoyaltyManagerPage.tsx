import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { Link } from 'wouter';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileWarning,
  Gift,
  Gauge,
  Home,
  KeyRound,
  LayoutDashboard,
  MailCheck,
  MessageSquare,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  Timer,
  UserRoundCheck,
  Users,
  WalletCards,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createResidentLoyaltyDemoState } from './residentLoyaltyDemoData';
import {
  buildResidentEvent,
  calculateBuildingStats,
  calculateResidentPoints,
  getResidentName,
  getResidentUnitNumber,
  rewardCategoryLabel,
} from './residentLoyaltyLogic';
import { loadResidentLoyaltyState, mergeResidentLoyaltyState, runResidentLoyaltyAction } from './residentLoyaltyApi';
import type {
  BuildingNotice,
  CommercialCoiRecord,
  CommercialNotice,
  CommercialServiceRequest,
  CommercialServiceStatus,
  LeaseCriticalDate,
  MaintenanceRequest,
  PropertyVertical,
  Resident,
  ResidentLoyaltyDemoState,
  VendorRecord,
} from './types';

type IconType = ComponentType<{ className?: string }>;

const DEMO_NOW = new Date('2026-06-16T16:00:00.000Z').getTime();

const verticalCopy = {
  residential: {
    label: 'Residential ops',
    kicker: 'Multifamily building',
    headline: 'Move-ins, notices, maintenance, renewals, and resident incentives.',
  },
  commercial: {
    label: 'Commercial ops',
    kicker: 'Office, retail, and mixed-use',
    headline: 'Tenant service, COIs, critical dates, vendors, notices, and SLA control.',
  },
} satisfies Record<PropertyVertical, { label: string; kicker: string; headline: string }>;

const statusTone = (value: string) => {
  const normalized = value.toLowerCase();
  if (normalized.includes('overdue') || normalized.includes('expired') || normalized.includes('urgent') || normalized.includes('missing')) {
    return 'border-rose-200 bg-rose-50 text-rose-800';
  }
  if (normalized.includes('due') || normalized.includes('expiring') || normalized.includes('pending') || normalized.includes('waiting')) {
    return 'border-amber-300 bg-amber-50 text-amber-800';
  }
  if (normalized.includes('assigned') || normalized.includes('scheduled') || normalized.includes('reviewed') || normalized.includes('triage')) {
    return 'border-sky-200 bg-sky-50 text-sky-800';
  }
  if (normalized.includes('complete') || normalized.includes('current') || normalized.includes('approved') || normalized.includes('signed')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  return 'border-stone-200 bg-stone-50 text-stone-700';
};

const priorityTone = (priority: string) => {
  if (priority === 'urgent') return 'bg-rose-700 text-white';
  if (priority === 'high') return 'bg-amber-500 text-stone-950';
  if (priority === 'normal') return 'bg-sky-700 text-white';
  return 'bg-stone-700 text-white';
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso));

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

function readable(value: string) {
  return value.replace(/_/g, ' ');
}

function StatusBadge({ value }: { value: string }) {
  return (
    <Badge variant="outline" className={`capitalize ${statusTone(value)}`}>
      {readable(value)}
    </Badge>
  );
}

function Panel({
  eyebrow,
  title,
  icon: Icon,
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  icon?: IconType;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && <p className="text-xs font-semibold uppercase text-stone-500">{eyebrow}</p>}
          <h2 className="mt-1 text-xl font-black text-stone-950">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {action}
          {Icon && (
            <div className="rounded-lg bg-stone-950 p-2 text-[#f6c451]">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: IconType;
  tone: 'dark' | 'gold' | 'green' | 'blue' | 'rose' | 'stone';
}) {
  const tones = {
    dark: 'bg-stone-950 text-[#f6c451]',
    gold: 'bg-[#fff3ce] text-[#7a4c00]',
    green: 'bg-emerald-50 text-emerald-800',
    blue: 'bg-sky-50 text-sky-800',
    rose: 'bg-rose-50 text-rose-800',
    stone: 'bg-stone-100 text-stone-800',
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-stone-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-stone-950">{value}</p>
          <p className="mt-1 text-xs leading-5 text-stone-600">{detail}</p>
        </div>
        <div className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function noticeRate(notice: BuildingNotice | CommercialNotice) {
  if ('acknowledgedResidentIds' in notice) {
    return Math.round((notice.acknowledgedResidentIds.length / 16) * 100);
  }
  return notice.targetTenantIds.length
    ? Math.round((notice.acknowledgedTenantIds.length / notice.targetTenantIds.length) * 100)
    : 0;
}

function getCommercialTenantName(state: ResidentLoyaltyDemoState, tenantId: string) {
  return state.commercialTenants.find((tenant) => tenant.id === tenantId)?.companyName ?? 'Tenant';
}

function getCommercialSuiteNumber(state: ResidentLoyaltyDemoState, suiteId: string) {
  return state.commercialSuites.find((suite) => suite.id === suiteId)?.suiteNumber ?? 'Suite';
}

function getVendorName(state: ResidentLoyaltyDemoState, vendorId?: string) {
  if (!vendorId) return 'Unassigned';
  return state.vendors.find((vendor) => vendor.id === vendorId)?.name ?? 'Vendor';
}

function calculateCommercialStats(state: ResidentLoyaltyDemoState, propertyId: string) {
  const suites = state.commercialSuites.filter((suite) => suite.propertyId === propertyId);
  const tenants = state.commercialTenants.filter((tenant) => tenant.propertyId === propertyId);
  const requests = state.commercialServiceRequests.filter((request) => request.propertyId === propertyId);
  const notices = state.commercialNotices.filter((notice) => notice.propertyId === propertyId);
  const coiRecords = state.commercialCoiRecords.filter((record) => record.propertyId === propertyId);
  const criticalDates = state.leaseCriticalDates.filter((date) => date.propertyId === propertyId);
  const openRequests = requests.filter((request) => request.status !== 'completed');
  const urgentRequests = openRequests.filter((request) => request.priority === 'urgent' || request.priority === 'high');
  const slaAtRisk = openRequests.filter((request) => new Date(request.slaDueAt).getTime() <= DEMO_NOW + 36 * 60 * 60 * 1000);
  const coiRisk = coiRecords.filter((record) => record.status === 'expired' || record.status === 'expiring' || record.status === 'missing');
  const criticalDateRisk = criticalDates.filter((date) => date.status === 'overdue' || date.status === 'due_soon');
  const acknowledged = notices.reduce((sum, notice) => sum + notice.acknowledgedTenantIds.length, 0);
  const targets = notices.reduce((sum, notice) => sum + notice.targetTenantIds.length, 0);
  const noticeAcknowledgementRate = targets ? Math.round((acknowledged / targets) * 100) : 0;
  const occupiedSuites = suites.filter((suite) => suite.occupancyStatus === 'occupied' || suite.occupancyStatus === 'expiring').length;
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        noticeAcknowledgementRate * 0.25 +
          (100 - coiRisk.length * 12) * 0.25 +
          (100 - urgentRequests.length * 10) * 0.2 +
          (100 - criticalDateRisk.length * 8) * 0.2 +
          (occupiedSuites / Math.max(1, suites.length)) * 100 * 0.1,
      ),
    ),
  );

  return {
    suiteCount: suites.length,
    occupiedSuites,
    tenantCount: tenants.length,
    openRequestCount: openRequests.length,
    urgentRequestCount: urgentRequests.length,
    slaAtRiskCount: slaAtRisk.length,
    coiRiskCount: coiRisk.length,
    criticalDateRiskCount: criticalDateRisk.length,
    noticeAcknowledgementRate,
    healthScore,
  };
}

function advanceServiceStatus(status: CommercialServiceStatus): CommercialServiceStatus {
  const nextStatus: Record<CommercialServiceStatus, CommercialServiceStatus> = {
    new: 'triage',
    triage: 'vendor_assigned',
    vendor_assigned: 'scheduled',
    scheduled: 'completed',
    waiting_tenant: 'scheduled',
    completed: 'completed',
  };
  return nextStatus[status];
}

function getCoiForTenant(state: ResidentLoyaltyDemoState, tenantId: string) {
  return state.commercialCoiRecords.find((record) => record.tenantId === tenantId);
}

function getNextCriticalDateForTenant(state: ResidentLoyaltyDemoState, tenantId: string) {
  return [...state.leaseCriticalDates]
    .filter((date) => date.tenantId === tenantId)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
}

function ResidentialWorkspace({
  state,
  onReviewMaintenance,
  onAcknowledgeNotice,
  onConfirmAccess,
}: {
  state: ResidentLoyaltyDemoState;
  onReviewMaintenance: (request: MaintenanceRequest) => void;
  onAcknowledgeNotice: (noticeId: string) => void;
  onConfirmAccess: (request: MaintenanceRequest) => void;
}) {
  const building = state.buildings[0];
  const stats = calculateBuildingStats(state, building.id);
  const openRequests = state.maintenanceRequests.filter((request) => request.status !== 'completed');
  const residentRows = state.residents.slice(0, 8).map((resident) => ({
    resident,
    points: calculateResidentPoints(resident.id, state.events, state.rewardRedemptions),
    openTasks: state.tasks.filter((task) => task.residentId === resident.id && task.status === 'available').length,
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <MetricTile label="Health score" value={stats.healthScore} detail="Weighted by notices, maintenance quality, access, renewals, and streaks." icon={Gauge} tone="dark" />
        <MetricTile label="Resident records" value={stats.residentCount} detail={`${stats.occupiedUnits}/${stats.unitCount} units connected`} icon={Users} tone="stone" />
        <MetricTile label="Maintenance quality" value={`${stats.maintenancePhotoRate}%`} detail={`${stats.maintenanceWithPhotosCount}/${stats.maintenanceRequestCount} requests include photos`} icon={Camera} tone="green" />
        <MetricTile label="Follow-ups avoided" value={stats.estimatedFollowUpsAvoided} detail="Estimated manager touches saved by resident actions." icon={BadgeCheck} tone="gold" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel eyebrow="Residential service desk" title="Maintenance work that needs a manager" icon={Wrench}>
          <div className="space-y-3">
            {openRequests.map((request) => (
              <div key={request.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-black text-stone-950">{request.title}</p>
                  <StatusBadge value={request.status} />
                  <Badge variant="outline" className={request.photoCount > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-800'}>
                    {request.photoCount > 0 ? `${request.photoCount} photos` : 'needs photos'}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  Unit {getResidentUnitNumber(state, request.residentId)} - {getResidentName(state, request.residentId)}
                </p>
                <p className="mt-1 text-xs font-semibold text-stone-500">
                  {request.accessConfirmed ? 'Access confirmed' : 'Access still needs confirmation'} - submitted {formatDate(request.submittedAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => onReviewMaintenance(request)}>
                    Review
                  </Button>
                  {!request.accessConfirmed && (
                    <Button size="sm" variant="outline" onClick={() => onConfirmAccess(request)}>
                      Confirm access
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Resident records" title="Unit-level next actions" icon={UserRoundCheck}>
          <div className="space-y-2">
            {residentRows.map(({ resident, points, openTasks }) => (
              <div key={resident.id} className="grid gap-2 rounded-lg border border-stone-200 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-black text-stone-950">
                    Unit {getResidentUnitNumber(state, resident.id)} - {resident.name}
                  </p>
                  <p className="text-sm text-stone-600">
                    {resident.rentStreakMonths} month streak - {points.toLocaleString()} points - {openTasks} open tasks
                  </p>
                </div>
                <StatusBadge value={resident.renewalWindow === 'active' ? 'renewal active' : resident.renewalWindow} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel eyebrow="Notice proof" title="Acknowledgement center" icon={MailCheck}>
          <div className="space-y-3">
            {state.notices.map((notice) => {
              const rate = noticeRate(notice);
              return (
                <div key={notice.id} className="rounded-lg border border-stone-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-stone-950">{notice.title}</p>
                      <p className="mt-1 text-xs text-stone-500">Due {formatDate(notice.dueAt)}</p>
                    </div>
                    <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-800">{rate}%</Badge>
                  </div>
                  <Progress value={rate} className="mt-3 h-2" />
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => onAcknowledgeNotice(notice.id)}>
                    Mark next acknowledgement
                  </Button>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel eyebrow="Renewal visibility" title="Early renewal queue" icon={CalendarClock}>
          <div className="space-y-3">
            {state.renewals.map((renewal) => (
              <div key={renewal.id} className="rounded-lg border border-stone-200 p-3">
                <p className="font-black text-stone-950">
                  Unit {getResidentUnitNumber(state, renewal.residentId)} - {getResidentName(state, renewal.residentId)}
                </p>
                <p className="mt-1 text-sm text-stone-600">Target {formatDate(renewal.targetDate)}</p>
                <StatusBadge value={renewal.status} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Incentive budget" title="Rewards tied to operations" icon={Gift}>
          <div className="space-y-3">
            {state.rewards.slice(0, 6).map((reward) => (
              <div key={reward.id} className="rounded-lg border border-stone-200 p-3">
                <p className="font-black text-stone-950">{reward.label}</p>
                <p className="mt-1 text-sm text-stone-600">{rewardCategoryLabel(reward.category)} - {reward.valueLabel}</p>
                <p className="mt-1 text-xs font-semibold text-stone-500">
                  {reward.pointCost ? `${reward.pointCost.toLocaleString()} points` : `${reward.milestoneMonths} month streak`}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function CommercialWorkspace({
  state,
  onAdvanceRequest,
  onAcknowledgeNotice,
  onRequestCoi,
}: {
  state: ResidentLoyaltyDemoState;
  onAdvanceRequest: (requestId: string) => void;
  onAcknowledgeNotice: (noticeId: string) => void;
  onRequestCoi: (coiId: string) => void;
}) {
  const property = state.properties.find((item) => item.vertical === 'commercial') ?? state.properties[0];
  const stats = calculateCommercialStats(state, property.id);
  const serviceRequests = state.commercialServiceRequests.filter((request) => request.propertyId === property.id);
  const tenants = state.commercialTenants.filter((tenant) => tenant.propertyId === property.id);
  const criticalDates = state.leaseCriticalDates.filter((date) => date.propertyId === property.id);
  const coiRecords = state.commercialCoiRecords.filter((record) => record.propertyId === property.id);
  const vendors = state.vendors.filter((vendor) => vendor.propertyId === property.id);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-5">
        <MetricTile label="Health score" value={stats.healthScore} detail="Weighted by SLAs, COIs, critical dates, notices, and occupancy." icon={Gauge} tone="dark" />
        <MetricTile label="Tenants" value={stats.tenantCount} detail={`${stats.occupiedSuites}/${stats.suiteCount} suites active or expiring`} icon={Building2} tone="stone" />
        <MetricTile label="Open service" value={stats.openRequestCount} detail={`${stats.urgentRequestCount} high or urgent requests`} icon={Wrench} tone="rose" />
        <MetricTile label="COI risk" value={stats.coiRiskCount} detail="Expired, expiring, or missing insurance records." icon={ShieldAlert} tone="gold" />
        <MetricTile label="Critical dates" value={stats.criticalDateRiskCount} detail="Lease obligations needing PM action." icon={CalendarClock} tone="blue" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Panel eyebrow="Commercial service desk" title="Tenant requests with SLA pressure" icon={Timer}>
          <div className="space-y-3">
            {serviceRequests.map((request) => (
              <div key={request.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-black text-stone-950">{request.title}</p>
                  <Badge className={`${priorityTone(request.priority)} hover:opacity-95`}>{request.priority}</Badge>
                  <StatusBadge value={request.status} />
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  Suite {getCommercialSuiteNumber(state, request.suiteId)} - {getCommercialTenantName(state, request.tenantId)}
                </p>
                <p className="mt-1 text-xs font-semibold text-stone-500">
                  SLA {formatDate(request.slaDueAt)} - {getVendorName(state, request.assignedVendorId)} - {request.photoCount} photos
                </p>
                <p className="mt-2 text-xs leading-5 text-stone-500">{request.accessNotes}</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => onAdvanceRequest(request.id)}>
                  Advance status
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Commercial tenant records" title="Lease, COI, and relationship health" icon={FileCheck2}>
          <div className="space-y-2">
            {tenants.map((tenant) => {
              const coi = getCoiForTenant(state, tenant.id);
              const nextDate = getNextCriticalDateForTenant(state, tenant.id);
              return (
                <div key={tenant.id} className="rounded-lg border border-stone-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-black text-stone-950">{tenant.companyName}</p>
                      <p className="text-sm text-stone-600">
                        Suite {getCommercialSuiteNumber(state, tenant.suiteId)} - {tenant.primaryContact}
                      </p>
                    </div>
                    <StatusBadge value={`${tenant.renewalRisk} risk`} />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg bg-stone-50 p-2">
                      <p className="text-[11px] font-semibold uppercase text-stone-500">Lease end</p>
                      <p className="text-sm font-black text-stone-950">{formatDate(tenant.leaseEnd)}</p>
                    </div>
                    <div className="rounded-lg bg-stone-50 p-2">
                      <p className="text-[11px] font-semibold uppercase text-stone-500">COI</p>
                      <p className="text-sm font-black capitalize text-stone-950">{coi ? readable(coi.status) : 'missing'}</p>
                    </div>
                    <div className="rounded-lg bg-stone-50 p-2">
                      <p className="text-[11px] font-semibold uppercase text-stone-500">Next action</p>
                      <p className="text-sm font-black text-stone-950">{nextDate ? formatDate(nextDate.dueDate) : 'None'}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase text-stone-500">Relationship health</p>
                      <p className="text-sm font-black">{tenant.relationshipHealth}%</p>
                    </div>
                    <Progress value={tenant.relationshipHealth} className="mt-2 h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel eyebrow="Compliance" title="COI tracker" icon={ShieldCheck}>
          <div className="space-y-3">
            {coiRecords.map((record) => (
              <div key={record.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-stone-950">{getCommercialTenantName(state, record.tenantId)}</p>
                    <p className="mt-1 text-sm text-stone-600">{record.providerName} - expires {formatDate(record.expiryDate)}</p>
                    {record.lastRequestedAt && <p className="mt-1 text-xs text-stone-500">Last requested {formatDate(record.lastRequestedAt)}</p>}
                  </div>
                  <StatusBadge value={record.status} />
                </div>
                {record.status !== 'current' && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => onRequestCoi(record.id)}>
                    Send COI request
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Lease obligations" title="Critical date command center" icon={CalendarClock}>
          <div className="space-y-3">
            {criticalDates.map((date) => (
              <div key={date.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-stone-950">{date.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{getCommercialTenantName(state, date.tenantId)}</p>
                    <p className="mt-1 text-xs font-semibold text-stone-500">{date.owner} - {formatDate(date.dueDate)}</p>
                  </div>
                  <StatusBadge value={date.status} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Vendor control" title="SLA and dispatch board" icon={Wrench}>
          <div className="space-y-3">
            {vendors.map((vendor: VendorRecord) => (
              <div key={vendor.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-stone-950">{vendor.name}</p>
                    <p className="mt-1 text-sm text-stone-600">{vendor.trade} - {vendor.openJobs} open jobs</p>
                  </div>
                  <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-800">{vendor.slaPerformance}% SLA</Badge>
                </div>
                <Progress value={vendor.slaPerformance} className="mt-3 h-2" />
                <p className="mt-2 text-xs text-stone-500">{vendor.phone}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel eyebrow="Tenant notices" title="Acknowledgement records for commercial tenants" icon={MailCheck}>
          <div className="space-y-3">
            {state.commercialNotices.map((notice) => {
              const rate = noticeRate(notice);
              return (
                <div key={notice.id} className="rounded-lg border border-stone-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-stone-950">{notice.title}</p>
                      <p className="mt-1 text-sm capitalize text-stone-600">{readable(notice.type)} - due {formatDate(notice.dueAt)}</p>
                    </div>
                    <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-800">{rate}%</Badge>
                  </div>
                  <Progress value={rate} className="mt-3 h-2" />
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => onAcknowledgeNotice(notice.id)}>
                    Mark next tenant acknowledgement
                  </Button>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel eyebrow="Tenant portal" title="What the commercial tenant would see" icon={Store}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [Wrench, 'Submit service request', 'Add photos, priority, access notes, and preferred service window.'],
              [ShieldCheck, 'Upload COI', 'Respond to expiring insurance requests before manager follow-up.'],
              [Bell, 'Acknowledge building notice', 'Fire panel tests, loading dock closures, policy updates, and emergencies.'],
              [CalendarClock, 'Review lease dates', 'Option windows, rent steps, expiry dates, and tenant obligations.'],
            ].map(([Icon, title, detail]) => {
              const TypedIcon = Icon as IconType;
              return (
                <div key={title as string} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <div className="rounded-lg bg-stone-950 p-2 text-[#f6c451] w-fit">
                    <TypedIcon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-black text-stone-950">{title as string}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{detail as string}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default function ResidentLoyaltyManagerPage() {
  const [demo, setDemo] = useState(createResidentLoyaltyDemoState);
  const [activeVertical, setActiveVertical] = useState<PropertyVertical>('commercial');
  const [isDatabaseBacked, setIsDatabaseBacked] = useState(false);
  const [persistenceNote, setPersistenceNote] = useState('Public demo mode. Connect auth to persist commercial PM records.');

  const building = demo.buildings[0];
  const landlord = demo.landlords[0];
  const residentialProperty = demo.properties.find((property) => property.vertical === 'residential') ?? demo.properties[0];
  const commercialProperty = demo.properties.find((property) => property.vertical === 'commercial') ?? demo.properties[0];
  const activeProperty = activeVertical === 'residential' ? residentialProperty : commercialProperty;

  const residentialStats = useMemo(() => calculateBuildingStats(demo, building.id), [demo, building.id]);
  const commercialStats = useMemo(() => calculateCommercialStats(demo, commercialProperty.id), [demo, commercialProperty.id]);

  const totalOpenWork = demo.maintenanceRequests.filter((request) => request.status !== 'completed').length + commercialStats.openRequestCount;
  const totalNoticeGaps =
    demo.notices.reduce((sum, notice) => sum + Math.max(0, demo.residents.length - notice.acknowledgedResidentIds.length), 0) +
    demo.commercialNotices.reduce((sum, notice) => sum + Math.max(0, notice.targetTenantIds.length - notice.acknowledgedTenantIds.length), 0);
  const totalRiskItems = commercialStats.coiRiskCount + commercialStats.criticalDateRiskCount + demo.renewals.filter((renewal) => renewal.status === 'pending' || renewal.status === 'declined').length;

  useEffect(() => {
    let cancelled = false;

    async function loadPersistedState() {
      try {
        const payload = await loadResidentLoyaltyState();
        if (cancelled || !payload.state) {
          if (!cancelled) {
            setIsDatabaseBacked(false);
            setPersistenceNote('Public demo mode. Connect auth to persist commercial PM records.');
          }
          return;
        }
        setDemo((current) => mergeResidentLoyaltyState(current, payload.state));
        setIsDatabaseBacked(payload.source === 'database');
        setPersistenceNote(
          payload.source === 'database'
            ? 'Database-backed pilot mode. Commercial service, COI, notice, suite, tenant, vendor, and critical-date records are loaded from Supabase.'
            : 'Public demo mode. Connect auth to persist commercial PM records.',
        );
      } catch (error: any) {
        if (!cancelled) {
          setIsDatabaseBacked(false);
          setPersistenceNote(error?.message ? `Database load failed; continuing locally. ${error.message}` : 'Database load failed; continuing locally.');
        }
      }
    }

    loadPersistedState();
    return () => {
      cancelled = true;
    };
  }, []);

  const syncPersistedAction = async (path: string) => {
    if (!isDatabaseBacked) return;
    try {
      const payload = await runResidentLoyaltyAction(path);
      if (payload.state) {
        setDemo((current) => mergeResidentLoyaltyState(current, payload.state));
      }
      setPersistenceNote('Saved to Supabase-backed commercial PM records.');
    } catch (error: any) {
      setIsDatabaseBacked(false);
      setPersistenceNote(error?.message ? `Database save failed; continuing locally. ${error.message}` : 'Database save failed; continuing locally.');
    }
  };

  const operatingQueue = [
    {
      icon: AlertTriangle,
      title: 'Commercial SLA pressure',
      detail: `${commercialStats.slaAtRiskCount} service requests need action before an SLA miss.`,
      tone: 'border-rose-200 bg-rose-50 text-rose-900',
    },
    {
      icon: ShieldAlert,
      title: 'COI follow-up',
      detail: `${commercialStats.coiRiskCount} tenant insurance records are expired, expiring, or missing.`,
      tone: 'border-amber-300 bg-amber-50 text-amber-900',
    },
    {
      icon: Bell,
      title: 'Notice gaps',
      detail: `${totalNoticeGaps} resident or tenant acknowledgements still need follow-up.`,
      tone: 'border-sky-200 bg-sky-50 text-sky-900',
    },
    {
      icon: ClipboardCheck,
      title: 'Move-in review',
      detail: `${residentialStats.moveInReviewCount} residential inspection package is waiting for manager review.`,
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    },
  ];

  const reviewMaintenanceRequest = (request: MaintenanceRequest) => {
    setDemo((current) => ({
      ...current,
      maintenanceRequests: current.maintenanceRequests.map((item) =>
        item.id === request.id ? { ...item, status: item.accessConfirmed ? 'scheduled' : 'reviewed' } : item,
      ),
    }));
  };

  const confirmResidentialAccess = (request: MaintenanceRequest) => {
    setDemo((current) => {
      const event = buildResidentEvent(current, request.residentId, 'access_confirmed', { requestId: request.id });
      return {
        ...current,
        maintenanceRequests: current.maintenanceRequests.map((item) =>
          item.id === request.id ? { ...item, accessConfirmed: true } : item,
        ),
        events: [event, ...current.events],
      };
    });
  };

  const acknowledgeNextResidentialNotice = (noticeId: string) => {
    setDemo((current) => {
      const notice = current.notices.find((item) => item.id === noticeId);
      const resident = current.residents.find((item: Resident) => notice && !notice.acknowledgedResidentIds.includes(item.id));
      if (!notice || !resident) return current;
      const event = buildResidentEvent(current, resident.id, 'notice_acknowledged', { noticeId });
      return {
        ...current,
        notices: current.notices.map((item) =>
          item.id === noticeId ? { ...item, acknowledgedResidentIds: [...item.acknowledgedResidentIds, resident.id] } : item,
        ),
        events: [event, ...current.events],
      };
    });
  };

  const advanceCommercialRequest = (requestId: string) => {
    setDemo((current) => ({
      ...current,
      commercialServiceRequests: current.commercialServiceRequests.map((request) =>
        request.id === requestId ? { ...request, status: advanceServiceStatus(request.status) } : request,
      ),
    }));
    void syncPersistedAction(`/api/resident-loyalty/commercial/service-requests/${requestId}/advance`);
  };

  const acknowledgeNextCommercialNotice = (noticeId: string) => {
    setDemo((current) => {
      const notice = current.commercialNotices.find((item) => item.id === noticeId);
      const tenantId = notice?.targetTenantIds.find((id) => !notice.acknowledgedTenantIds.includes(id));
      if (!notice || !tenantId) return current;
      return {
        ...current,
        commercialNotices: current.commercialNotices.map((item) =>
          item.id === noticeId ? { ...item, acknowledgedTenantIds: [...item.acknowledgedTenantIds, tenantId] } : item,
        ),
      };
    });
    void syncPersistedAction(`/api/resident-loyalty/commercial/notices/${noticeId}/acknowledge-next`);
  };

  const requestCoi = (coiId: string) => {
    setDemo((current) => ({
      ...current,
      commercialCoiRecords: current.commercialCoiRecords.map((record: CommercialCoiRecord) =>
        record.id === coiId ? { ...record, lastRequestedAt: new Date().toISOString() } : record,
      ),
    }));
    void syncPersistedAction(`/api/resident-loyalty/commercial/cois/${coiId}/request`);
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-stone-950">
      <header className="border-b border-stone-200 bg-[#fbf9f3]/95 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-950 text-[#f6c451]">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black">Living Rewards PropertyOps</p>
              <p className="text-xs text-stone-600">Residential and commercial property operations MVP</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild className="border-stone-300 bg-white">
              <Link href="/resident-loyalty/setup">
                Residential onboarding
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button className="bg-stone-950 text-white hover:bg-stone-800" asChild>
              <Link href="/resident-loyalty/resident-demo">
                Resident portal
                <WalletCards className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-lg bg-stone-950 p-5 text-white shadow-xl md:p-8">
            <img
              src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80"
              alt="Managed property exterior"
              className="absolute inset-0 h-full w-full object-cover opacity-22"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/92 to-stone-950/70" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[#f6c451] text-stone-950 hover:bg-[#f6c451]">C+ product sprint</Badge>
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                  Fresh Living Rewards repo
                </Badge>
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                  {isDatabaseBacked ? 'Database-backed pilot' : 'Frontend demo'}
                </Badge>
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-none md:text-6xl">
                A property operations cockpit, not a rewards dashboard.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/72 md:text-lg">
                This demo now shows the real jobs a property manager opens every morning: work orders, notice gaps,
                move-in records, renewal signals, COIs, lease critical dates, vendor SLAs, and incentives tied to
                operating outcomes.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                  <Wrench className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-2xl font-black">{totalOpenWork}</p>
                  <p className="text-sm text-white/65">open service items</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                  <FileWarning className="h-5 w-5 text-[#f6c451]" />
                  <p className="mt-3 text-2xl font-black">{totalRiskItems}</p>
                  <p className="text-sm text-white/65">lease, renewal, or compliance risks</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/10 p-4">
                  <BadgeCheck className="h-5 w-5 text-sky-300" />
                  <p className="mt-3 text-2xl font-black">{residentialStats.estimatedFollowUpsAvoided + 9}</p>
                  <p className="text-sm text-white/65">estimated follow-ups avoided</p>
                </div>
              </div>
              <div
                className={`mt-5 rounded-lg border p-3 text-sm leading-6 ${
                  isDatabaseBacked
                    ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-50'
                    : 'border-white/15 bg-white/10 text-white/70'
                }`}
              >
                {persistenceNote}
              </div>
            </div>
          </div>

          <Panel eyebrow="Morning queue" title="What needs manager attention today" icon={AlertTriangle}>
            <div className="space-y-3">
              {operatingQueue.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={`rounded-lg border p-3 ${item.tone}`}>
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5" />
                      <div>
                        <p className="font-black">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 opacity-80">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {(['commercial', 'residential'] as const).map((vertical) => {
            const property = vertical === 'commercial' ? commercialProperty : residentialProperty;
            const selected = activeVertical === vertical;
            const stats =
              vertical === 'commercial'
                ? `${commercialStats.openRequestCount} open requests, ${commercialStats.coiRiskCount} COI risks`
                : `${residentialStats.maintenanceRequestCount} maintenance requests, ${residentialStats.noticeAcknowledgementRate}% notice ack`;
            return (
              <button
                key={vertical}
                type="button"
                onClick={() => setActiveVertical(vertical)}
                className={`rounded-lg border p-4 text-left shadow-sm transition ${
                  selected ? 'border-stone-950 bg-white ring-2 ring-stone-950/10' : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-500">{verticalCopy[vertical].kicker}</p>
                    <p className="mt-1 text-2xl font-black text-stone-950">{property.name}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{verticalCopy[vertical].headline}</p>
                    <p className="mt-3 text-xs font-semibold text-stone-500">{stats}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${selected ? 'bg-stone-950 text-[#f6c451]' : 'bg-stone-100 text-stone-700'}`}>
                    {vertical === 'commercial' ? <Building2 className="h-5 w-5" /> : <Home className="h-5 w-5" />}
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:p-5">
          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <Badge variant="outline" className="border-stone-300 bg-stone-50 text-stone-700">
                {verticalCopy[activeVertical].label}
              </Badge>
              <h2 className="mt-3 text-3xl font-black text-stone-950">{activeProperty.name}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{activeProperty.positioning}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-stone-950 p-4 text-white">
                <p className="text-xs text-white/55">Manager</p>
                <p className="mt-1 text-xl font-black">{activeProperty.managerName}</p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase text-stone-500">Address</p>
                <p className="mt-1 text-sm font-black text-stone-950">{activeProperty.address}</p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase text-stone-500">Market</p>
                <p className="mt-1 text-sm font-black text-stone-950">{activeProperty.market}</p>
              </div>
            </div>
          </div>
        </section>

        {activeVertical === 'commercial' ? (
          <CommercialWorkspace
            state={demo}
            onAdvanceRequest={advanceCommercialRequest}
            onAcknowledgeNotice={acknowledgeNextCommercialNotice}
            onRequestCoi={requestCoi}
          />
        ) : (
          <ResidentialWorkspace
            state={demo}
            onReviewMaintenance={reviewMaintenanceRequest}
            onAcknowledgeNotice={acknowledgeNextResidentialNotice}
            onConfirmAccess={confirmResidentialAccess}
          />
        )}

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Panel eyebrow="Revenue path" title="How this could make money" icon={ReceiptText}>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Residential ops module', 'Per unit SaaS for onboarding, notices, maintenance quality, renewals, and resident engagement.'],
                ['Commercial service desk', 'Per property or square-foot band for requests, vendors, SLAs, tenant notices, and reporting.'],
                ['Compliance and critical dates', 'Paid module for COIs, lease dates, renewal options, and PM reminders.'],
                ['Setup and data import', 'One-time implementation fee for unit/suite lists, tenant records, and document setup.'],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-lg border border-stone-200 p-3">
                  <p className="font-black text-stone-950">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{detail}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel eyebrow="PMS boundary" title="What this still does not claim to be" icon={ShieldCheck}>
            <div className="space-y-3 text-sm leading-6 text-stone-600">
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />
                <p>No rent processing, card rails, security deposit custody, or banking.</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />
                <p>No general ledger, CAM reconciliation, or accounting replacement yet.</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />
                <p>No punitive resident score or public resident leaderboard.</p>
              </div>
              <div className="flex gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 text-[#8a5a00]" />
                <p>Next move is pilot-ready CRUD, auth roles, file uploads, notifications, and reporting exports.</p>
              </div>
            </div>
          </Panel>
        </section>
      </main>
    </div>
  );
}

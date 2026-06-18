# Property Ops and PMS Strategy Plan

Date: 2026-06-16

## Executive Decision

Yes, this product can expand into commercial property management. The stronger path is not to make "resident rewards" the whole company. The product should become a property operations system with a resident or tenant engagement layer on top.

Recommended positioning:

> A lightweight property operations portal that helps landlords and property managers reduce follow-up work, coordinate service, preserve tenant records, and improve retention by giving occupants a useful, branded place to complete the actions that keep buildings running.

This works for multifamily and commercial, but the workflows are different enough that the product should support two modes:

- Residential mode: residents, units, move-ins, inspections, notices, maintenance, renewal intent, reward wallet, community campaigns.
- Commercial mode: tenants, spaces, contacts, service requests, COIs, lease obligations, critical dates, vendor/SLA tracking, building notices, inspections, tenant experience.

Do not build a full PMS first. Build the operational workflows that sit around a PMS, then expand inward once pilots prove which workflow people will pay for.

## Market Signals

The current market is not short on generic PMS tools. To compete, we need sharper workflow value.

- Bilt Alliance positions itself as a housing hospitality platform with prospect, resident, and neighborhood stacks, including rent rewards, move-in/out checklists, access/packages, renewal incentives, merchant benefits, and claimed operator impact around digital payments and delinquency.
- Buildium sells an all-in-one property management platform covering accounting, payments, leasing, maintenance, screening, resident apps, integrations, and commercial support.
- Entrata emphasizes a unified data model across the resident and asset lifecycle, automation at the transaction layer, leasing, payments, maintenance, renewals, compliance, and commercial support for office, retail, and mixed-use properties.
- MRI's commercial real estate software is a full commercial leasing, finance, and operations suite. Its core areas include property management/accounting, rent and recoveries, facilities, tenant portals, lease abstraction, energy, investment management, and reporting.
- Building Engines Prism is a commercial building operations platform. Its modules include work orders, preventive maintenance, inspections, tenant compliance, building communications, visitor access, reservations, insurance, bid management, contracts, floor plans, and space/leasing tools.
- VTS covers commercial leasing and asset intelligence, but also property management workflows such as work orders, tenant communication, access/visitor management, document vaults, portfolio dashboards, lease roll, vacancy exposure, and renewal risk.
- HqO frames the commercial market around tenant experience, operations, leasing, intelligence, tenant engagement, and vendor workflows across CRE portfolios.
- Facilio and MRI facilities products show that commercial operators care about work order SLAs, vendor performance, inspections, compliance, asset registers, reporting, cost control, and real-time operational visibility.

Sources reviewed:

- https://alliance.biltrewards.com/
- https://www.buildium.com/
- https://www.entrata.com/
- https://www.mrisoftware.com/solutions/commercial-real-estate-software/
- https://www.buildingengines.com/platform/
- https://www.vts.com/
- https://www.hqo.com/
- https://facilio.com/

## What Is Wrong With The Current Product

The current MVP is useful as a proof that we can split the codebase and deploy a working standalone app. Product-wise, it is still too much like a themed dashboard:

- It explains advantages instead of solving a workflow.
- It lacks a clear primary buyer and daily user.
- It does not yet show enough real property management work.
- Rewards feel bolted on instead of tied to measurable operating outcomes.
- The manager portal does not yet feel like the place a PM would open every morning.
- The tenant/resident side does not yet feel necessary enough to earn adoption.
- Commercial PM is not represented, even though commercial may be the higher-value buyer segment.

The next work should turn the app into an operating cockpit, not a marketing page with widgets.

## Product Thesis

The money is in reducing management friction. Rewards are only one engagement mechanic.

The product should help landlords answer:

- What needs attention today?
- Which tenants or residents are blocking work?
- Which notices are unacknowledged?
- Which maintenance items are missing photos, access details, or vendor assignment?
- Which leases, renewals, insurance documents, inspections, or move-in tasks are at risk?
- Which actions saved manager time this week?
- Which properties are healthy, and which are getting noisy?

If the product cannot answer those questions quickly, it is not yet a serious PM product.

## Recommended Product Architecture

Build a shared operating core, then add residential and commercial modules.

Core records:

- Organizations
- Portfolios
- Properties
- Buildings
- Spaces: units, suites, bays, retail CRUs, parking, storage
- Occupants: residents, commercial tenants, tenant contacts
- Leases and critical dates
- Work orders and service requests
- Notices and acknowledgements
- Documents and files
- Tasks, follow-ups, nudges, and assignments
- Vendors and service providers
- Event ledger and audit trail
- Rewards, incentives, credits, and approvals

Residential module:

- Resident invite and onboarding
- Lease packet acknowledgement, without replacing legal e-signing yet
- Deposit and first-rent status confirmation, without processing money yet
- Move-in inspection and photo capture
- Maintenance request quality scoring
- Unit access confirmation
- Building notice acknowledgements
- Renewal interest and renewal campaign workflow
- Resident reward wallet and community goals

Commercial module:

- Tenant company profile and authorized contacts
- Suite/bay/CRU profile with lease summary
- Service request intake and status tracking
- After-hours HVAC/access requests
- Tenant notice acknowledgement
- COI and insurance expiry tracking
- Lease obligation and critical date tracker
- Vendor dispatch and SLA tracking
- Inspection checklist and deficiency tracking
- Tenant improvement/request log
- Property manager, engineer, vendor, and tenant portals

Future PMS module:

- Lease charges and recurring bill schedules
- AR aging snapshots
- Rent roll views
- CAM/opex estimate and reconciliation support
- Owner reporting packs
- Accounting exports or integrations
- Payment status sync from external accounting/PMS
- Full general ledger only after strong validation, not during MVP.

## Commercial PM Viability

Commercial PM is viable and may be the better revenue path because:

- Commercial leases are more complex.
- Commercial tenants often have multiple contacts and operational obligations.
- Service response, access, COIs, inspections, and critical dates create real risk.
- Owners care about NOI, recoveries, downtime, tenant satisfaction, and renewal risk.
- PM teams can justify software if it reduces manual chasing and creates defensible records.

Commercial is harder because:

- Lease structures, CAM, recoveries, tax, insurance, rights, options, and rules vary heavily.
- Accounting and billing mistakes are expensive.
- Buyers may expect integrations with MRI, Yardi, VTS, Angus, Building Engines, AppFolio, or accounting systems.
- The UI must handle office, retail, industrial, mixed-use, and medical in one model.

Recommendation:

Do not pivot completely away from multifamily today. Build a shared property ops core and add a commercial demo lane. This lets us test both markets without fracturing the codebase.

## Minimum C+ Product Target

To get from roughly 5 percent complete to a credible C+ prototype, the app needs to stop being a general pitch and become a usable daily workflow demo.

Build these screens next:

1. Portfolio Cockpit
   - Shows buildings, open issues, overdue notices, service request backlog, renewal risk, COI expiries, move-in readiness, and manager follow-ups avoided.

2. Property Detail
   - Residential view: units, residents, onboarding, notices, maintenance, renewals, rewards.
   - Commercial view: tenants, suites, service requests, COIs, critical dates, vendors, notices.

3. Work Orders / Service Desk
   - Intake quality, photos, access status, assigned vendor, SLA, status, tenant/resident communication, evidence log.

4. Notices and Acknowledgements
   - Create notice, target occupants, track delivery/acknowledgement, show audit trail.

5. Tenant / Resident Record
   - Contact info, space/unit, open tasks, lease dates, notices, maintenance history, rewards/incentives, documents.

6. Lease and Renewal Tracker
   - Residential: renewal intent, offer status, move-out risk.
   - Commercial: expiry, options, notice windows, insurance, critical obligations.

7. Rewards / Incentives Console
   - Not just gift cards. Show budget, reason, behavior, approval state, and operating value.

8. Tenant / Resident Portal
   - Submit service request, add photos, confirm access, acknowledge notices, review tasks, see approved incentives, view building updates.

Every screen must answer:

- Who owns the next step?
- What is overdue?
- What evidence do we have?
- What was the business impact?
- What should the manager do now?

## Better Reward and Incentive Strategy

Avoid weak perks that feel fake. The reward should be tied to either resident value, community value, or operational savings.

Residential incentives:

- Grocery or home essentials credits
- Internet bill credits
- Rent credits
- Transit credits
- Move-in supply credits
- Dining/coffee credits only when bundled meaningfully
- Local merchant credits in buildings with real nearby partners
- Building-wide rewards unlocked by collective actions, such as high notice acknowledgement or move-in checklist completion
- Renewal incentives funded from avoided vacancy, turnover, or concession costs

Commercial incentives:

- Service response transparency, not consumer-style points
- Tenant experience credits for building amenities, events, meeting rooms, or local services
- Faster approved requests for compliant tenants, without punitive scoring
- Portfolio relationship benefits for tenants with multiple locations
- Renewal/expansion intelligence and tenant engagement campaigns

Important: commercial tenants are not residents. Do not force a consumer rewards model onto commercial. Use "tenant experience", "service quality", "relationship health", and "operational compliance" language.

## Monetization

Start with pricing that matches the value sold.

Residential:

- Base SaaS per unit per month
- Setup/import fee
- Optional resident engagement or rewards module
- Optional notice/maintenance/onboarding automation module
- Optional managed rewards budget, with transparent markup only later

Commercial:

- Base SaaS per property or per rentable area band
- Tenant/service desk module
- COI/critical date module
- Vendor/SLA module
- Reporting and owner pack module
- Setup/import/lease abstraction services later

Avoid early:

- rent payment processing
- banking rails
- card issuing
- security deposit custody
- credit reporting
- full GL/accounting replacement
- algorithmic rent pricing

## Build Plan

### Phase 0: Strategic Refocus

Goal: make the product know what it is.

- Reframe landing page and app navigation around "Property Ops", not generic loyalty.
- Add vertical selector: Residential / Commercial.
- Keep Living Rewards as the resident engagement module, not the entire operating system.
- Replace vague advantage copy with workflow-specific outcomes.
- Add one clean demo portfolio with one multifamily building and one commercial building.

### Phase 1: C+ Demo Product

Goal: credible demo someone can click through and understand.

- Portfolio cockpit
- Property detail views
- Work order/service desk
- Notice acknowledgement center
- Tenant/resident record
- Lease/renewal/critical date tracker
- Rewards/incentives console
- Tenant/resident portal
- Better seeded demo data for real operating scenarios

Definition of done:

- A landlord can understand the product in 90 seconds.
- A PM can see what they would do every morning.
- A resident or tenant can complete useful tasks.
- Commercial PM is visible enough to discuss with a CRE landlord.
- The demo shows measurable business value, not only points and badges.

### Phase 2: Pilot-Ready Ops Layer

Goal: usable by one landlord without pretending to be enterprise PMS.

- Supabase-backed CRUD for properties, spaces, occupants, work orders, notices, tasks, documents, and events.
- Role-based access for owner/admin, property manager, engineer/vendor, resident/tenant.
- File uploads for maintenance photos, move-in inspections, COIs, and documents.
- CSV import for units/suites/residents/tenants.
- Email invite and notification flow.
- Audit trail for operational records.
- Basic reporting exports.

### Phase 3: Commercial Wedge

Goal: test whether commercial PM is the better wedge.

- Commercial tenant service desk
- COI expiry tracker
- Lease critical date tracker
- Vendor assignment and SLA dashboard
- Inspection/deficiency workflow
- Tenant communications portal
- Owner/asset manager reporting summary

Do not build CAM billing or accounting yet. Show read-only placeholders and export paths.

### Phase 4: PMS Expansion

Goal: expand only after a paying workflow exists.

- Lease abstracts and charge schedules
- Rent roll and AR snapshots
- CAM/opex estimate tracking
- Recoveries support
- Accounting exports
- PMS integrations
- Owner reporting

Only consider full accounting/general ledger after we have customer validation and accounting expertise.

## Immediate Implementation Priorities After Review

If approved, the next implementation sprint should be:

1. Add a new product shell and navigation that feels like a real PM portal.
2. Add Residential and Commercial demo modes.
3. Replace the manager dashboard with a Portfolio Cockpit.
4. Add a Commercial Building detail view.
5. Add a shared Work Orders / Service Desk screen.
6. Add a Notices center with acknowledgement tracking.
7. Add Tenant/Resident profile records.
8. Replace weak reward examples with incentive programs tied to operating outcomes.
9. Update seed data so every card/table supports a real PM conversation.
10. Polish the UI to feel launch-adjacent rather than experimental.

## Review Questions

Before implementation, decide:

- Should the next sprint target multifamily first, commercial first, or a side-by-side demo?
- Should the public brand stay "Living Rewards", or should Living Rewards become one module inside a broader property ops product?
- Is the first buyer an Edmonton multifamily landlord, a commercial landlord/PM, or a mixed-portfolio operator?
- Are we willing to avoid payments/accounting for now even if that limits the PMS story?
- Which workflow should be the hero: service requests, notices, onboarding, renewals, COIs, or lease critical dates?

## Recommendation

Move forward with a side-by-side property ops demo:

- Residential building: onboarding, maintenance photos, notices, renewals, incentives.
- Commercial building: service desk, tenant contacts, COIs, critical dates, notices, vendor/SLA tracking.

This gives us a better product story and keeps the architecture pointed toward a future PMS without taking on the riskiest accounting and payment work too early.

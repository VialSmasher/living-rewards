# C+ Product Sprint Notes

Date: 2026-06-16

## What Changed

This pass reframed Living Rewards from a resident-only loyalty concept into a broader property operations MVP.

The manager route now behaves like a daily operating cockpit:

- portfolio morning queue;
- residential and commercial mode switcher;
- residential maintenance, notice, renewal, resident record, and reward views;
- commercial tenant service desk;
- commercial tenant/company records;
- COI tracker;
- lease critical date tracker;
- vendor/SLA board;
- commercial tenant notice acknowledgements;
- commercial tenant portal preview;
- revenue path and PMS boundary sections.

The landing page now sells the broader operating layer rather than only resident rewards.

## Routes

- `/` public product landing page
- `/property-ops` property operations cockpit
- `/resident-loyalty` same cockpit, preserved for existing links
- `/resident-loyalty/resident-demo` resident wallet demo
- `/resident-loyalty/setup` residential tenant onboarding demo

## Demo Data Added

Commercial records were added to the existing demo state:

- commercial property;
- commercial suites;
- commercial tenants;
- commercial service requests;
- commercial notices;
- COI records;
- lease critical dates;
- vendors.

## Still Mocked

- no real PMS integration;
- no accounting, GL, CAM reconciliation, or rent roll engine;
- no rent payment processing;
- no banking, card rails, rewards fulfillment, or gift card integration;
- no production RBAC beyond the existing MVP wiring;
- no real vendor dispatch or email/SMS notifications yet;
- no file uploads for COIs, inspections, or maintenance photos in this UI pass.

## Recommended Next Sprint

1. Convert property, space, tenant/resident, work order, notice, COI, critical date, and vendor records into Supabase-backed CRUD.
2. Add role-specific navigation for owner/admin, PM, vendor/engineer, resident, and commercial tenant.
3. Add file uploads for maintenance photos, move-in inspection photos, COIs, and lease PDFs.
4. Add notification flows for notice acknowledgements, COI requests, access confirmations, and service request updates.
5. Add reporting exports for owner packs, PM weekly summaries, and open-risk reports.
6. Decide whether the first paid wedge is residential onboarding/engagement or commercial service desk/compliance.

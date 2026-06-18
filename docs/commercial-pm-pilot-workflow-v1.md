# Commercial PM Pilot Workflow V1

Date: 2026-06-18

## Goal

Turn the commercial side of the PropertyOps cockpit from static seed data into the first database-backed pilot workflow.

This is still not a full PMS. It is an operations layer for commercial property managers focused on:

- tenant service requests;
- COI and insurance follow-up;
- lease critical dates;
- tenant notice acknowledgements;
- vendor and SLA visibility.

## Database Work

Added a non-destructive migration:

- `drizzle/0014_commercial_property_ops.sql`

Tables added:

- `property_ops_properties`
- `property_ops_commercial_suites`
- `property_ops_commercial_tenants`
- `property_ops_vendors`
- `property_ops_commercial_service_requests`
- `property_ops_commercial_notices`
- `property_ops_commercial_notice_targets`
- `property_ops_commercial_coi_records`
- `property_ops_lease_critical_dates`

The API now runs both the existing residential migration and the new commercial migration on startup when `DATABASE_URL` is configured.

## Bootstrap Behaviour

When a database-backed owner loads `/api/resident-loyalty/state`, the backend now ensures:

- the original residential Maclaren House seed exists;
- one commercial property exists: Jasper Commerce Centre;
- commercial suites, tenants, vendors, service requests, notices, COIs, and critical dates exist.

Existing users get the commercial seed without deleting or resetting their residential records.

## API Endpoints Added

- `POST /api/resident-loyalty/commercial/service-requests/:requestId/advance`
- `POST /api/resident-loyalty/commercial/notices/:noticeId/acknowledge-next`
- `POST /api/resident-loyalty/commercial/cois/:coiId/request`

All endpoints:

- require the existing auth middleware;
- fall back to frontend demo mode when no database or demo mode is active;
- verify owner scope before updating records;
- return the refreshed state payload after mutation.

## Frontend Work

The PropertyOps cockpit now:

- loads persisted commercial state from `/api/resident-loyalty/state`;
- shows whether it is in frontend demo mode or database-backed pilot mode;
- optimistically updates commercial service, notice, and COI actions;
- syncs those actions to the API when database-backed mode is active.

## Still Demo-Only

- No file upload UI for COI PDFs or work order photos yet.
- No create/edit/delete forms yet.
- No role-specific commercial tenant login yet.
- No real notification delivery yet.
- No vendor dispatch integration.
- No CAM, billing, accounting, or full PMS functionality.

## Recommended Next Build

1. Add create/edit forms for commercial tenants, suites, service requests, COIs, vendors, and critical dates.
2. Add Supabase Storage uploads for COIs and service request photos.
3. Add role-based portal views for property manager and commercial tenant contact.
4. Add email notification hooks for COI requests, notice acknowledgements, and service status changes.
5. Add a simple owner report export: open service items, COI risk, critical dates, SLA risk, and tenant notice gaps.

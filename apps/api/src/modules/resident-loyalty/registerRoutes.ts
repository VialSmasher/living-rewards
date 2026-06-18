import type { Express, Request } from "express";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getUserId, requireAuth } from "../../auth";
import { hasDatabase, pool } from "../../db";
import { ensureUser } from "../../ensureUser";

type DbValue = string | number | boolean | Date | null | undefined;

function isDemoRequest(req: Request) {
  return req.headers["x-demo-mode"] === "true" || getUserId(req) === "demo-user";
}

function migrationPaths() {
  const candidates = [
    path.resolve(process.cwd(), "drizzle/0013_resident_loyalty_core.sql"),
    path.resolve(process.cwd(), "../../drizzle/0013_resident_loyalty_core.sql"),
  ];
  const commercialCandidates = [
    path.resolve(process.cwd(), "drizzle/0014_commercial_property_ops.sql"),
    path.resolve(process.cwd(), "../../drizzle/0014_commercial_property_ops.sql"),
  ];
  const core = candidates.find((candidate) => fs.existsSync(candidate));
  const commercial = commercialCandidates.find((candidate) => fs.existsSync(candidate));
  return [core, commercial].filter((file): file is string => Boolean(file));
}

async function ensureResidentLoyaltyTables() {
  const files = migrationPaths();
  if (files.length === 0) {
    throw new Error("Resident loyalty migration file was not found");
  }
  for (const file of files) {
    await pool.query(fs.readFileSync(file, "utf8"));
  }
}

function dateOnly(value: unknown) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function isoDateTime(value: unknown) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return new Date(String(value)).toISOString();
}

function shortUserSlug(userId: string) {
  return userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase() || "demo";
}

async function bootstrapCommercialPropertyIfEmpty(landlordId: string) {
  const existing = await queryOne<{ id: string }>(
    `
      SELECT id
      FROM public.property_ops_properties
      WHERE landlord_id = $1 AND vertical = 'commercial'
      LIMIT 1
    `,
    [landlordId],
  );
  if (existing) return;

  const propertyId = randomUUID();
  const suite101Id = randomUUID();
  const suite120Id = randomUUID();
  const suite150Id = randomUUID();
  const suite210Id = randomUUID();
  const suite220Id = randomUUID();
  const suite300Id = randomUUID();
  const suite310Id = randomUUID();
  const suite400Id = randomUUID();
  const tenantMapleId = randomUUID();
  const tenantNorthlineId = randomUUID();
  const tenantArcpointId = randomUUID();
  const tenantPhysioId = randomUUID();
  const tenantPrairieLawId = randomUUID();
  const tenantIronGateId = randomUUID();
  const vendorAlpineId = randomUUID();
  const vendorSecurityId = randomUUID();
  const vendorCleanId = randomUUID();
  const noticeFirePanelId = randomUUID();
  const noticeLoadingDockId = randomUUID();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
        INSERT INTO public.property_ops_properties
          (id, landlord_id, name, address, market, vertical, manager_name, suite_count, rentable_area_sf, health_score, positioning)
        VALUES ($1, $2, 'Jasper Commerce Centre', '10145 109 Street NW, Edmonton', 'Downtown Edmonton commercial',
                'commercial', 'Marcus Lee', 8, 118400, 72,
                'Tenant service desk, COIs, critical dates, notices, vendors, and SLA visibility.')
      `,
      [propertyId, landlordId],
    );

    const suites = [
      [suite101Id, "101", "Main", 2800, "expiring"],
      [suite120Id, "120", "Main", 4100, "occupied"],
      [suite150Id, "150", "Main", 3600, "vacant"],
      [suite210Id, "210", "2", 5200, "occupied"],
      [suite220Id, "220", "2", 6100, "expiring"],
      [suite300Id, "300", "3", 8700, "occupied"],
      [suite310Id, "310", "3", 7400, "occupied"],
      [suite400Id, "400", "4", 11800, "vacant"],
    ] as const;
    for (const [id, suiteNumber, floor, area, status] of suites) {
      await client.query(
        `
          INSERT INTO public.property_ops_commercial_suites
            (id, property_id, suite_number, floor, rentable_area_sf, occupancy_status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [id, propertyId, suiteNumber, floor, area, status],
      );
    }

    const tenants = [
      [tenantNorthlineId, suite120Id, "Northline Dental Group", "Dr. Mira Bennett", "mira@northline.example", "Medical services", "2023-02-01", "2028-01-31", "low", 88],
      [tenantMapleId, suite101Id, "Maple & Rye Cafe", "Elena Moreno", "elena@maplerye.example", "Food service", "2021-09-01", "2026-08-31", "medium", 74],
      [tenantArcpointId, suite210Id, "Arcpoint Design Studio", "Julian Park", "julian@arcpoint.example", "Professional services", "2024-04-01", "2027-03-31", "low", 82],
      [tenantPhysioId, suite220Id, "River City Physio", "Nadia Chen", "nadia@rivercityphysio.example", "Medical services", "2020-11-01", "2026-10-31", "high", 61],
      [tenantPrairieLawId, suite300Id, "Prairie Law Chambers", "Graham Singh", "graham@prairielaw.example", "Legal", "2022-07-01", "2027-06-30", "low", 91],
      [tenantIronGateId, suite310Id, "Iron Gate Technology", "Priya Rao", "priya@irongate.example", "Technology", "2025-01-01", "2028-12-31", "medium", 77],
    ] as const;
    for (const [id, suiteId, companyName, contact, email, industry, leaseStart, leaseEnd, risk, health] of tenants) {
      await client.query(
        `
          INSERT INTO public.property_ops_commercial_tenants
            (id, property_id, suite_id, company_name, primary_contact, email, industry, lease_start, lease_end, renewal_risk, relationship_health)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [id, propertyId, suiteId, companyName, contact, email, industry, leaseStart, leaseEnd, risk, health],
      );
    }

    const vendors = [
      [vendorAlpineId, "Alpine Mechanical", "HVAC", 3, 86, "780-555-0141"],
      [vendorSecurityId, "Capital Security Access", "Access control", 1, 94, "780-555-0188"],
      [vendorCleanId, "River Valley Clean Co.", "Janitorial", 2, 79, "780-555-0120"],
    ] as const;
    for (const [id, name, trade, openJobs, slaPerformance, phone] of vendors) {
      await client.query(
        `
          INSERT INTO public.property_ops_vendors
            (id, property_id, name, trade, open_jobs, sla_performance, phone)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [id, propertyId, name, trade, openJobs, slaPerformance, phone],
      );
    }

    const serviceRequests = [
      [randomUUID(), tenantMapleId, suite101Id, "Cafe seating area too warm during lunch rush", "hvac", "high", "vendor_assigned", 2, vendorAlpineId, "2026-06-14T17:20:00.000Z", "2026-06-16T20:00:00.000Z", "Tenant available before 10:30 AM or after 2:30 PM."],
      [randomUUID(), tenantPhysioId, suite220Id, "After-hours access cards not working for two clinicians", "access", "urgent", "triage", 0, vendorSecurityId, "2026-06-16T13:05:00.000Z", "2026-06-16T18:00:00.000Z", "Clinic has appointments until 8 PM tonight."],
      [randomUUID(), tenantNorthlineId, suite120Id, "Ceiling tile stain near sterilization room", "plumbing", "normal", "scheduled", 4, vendorAlpineId, "2026-06-13T15:12:00.000Z", "2026-06-18T18:00:00.000Z", "Inspection approved between patients at noon."],
      [randomUUID(), tenantPrairieLawId, suite300Id, "Boardroom carpet spill after client event", "janitorial", "low", "waiting_tenant", 1, vendorCleanId, "2026-06-15T21:40:00.000Z", "2026-06-19T18:00:00.000Z", "Tenant needs to confirm room availability."],
    ] as const;
    for (const [id, tenantId, suiteId, title, category, priority, status, photoCount, vendorId, submittedAt, slaDueAt, accessNotes] of serviceRequests) {
      await client.query(
        `
          INSERT INTO public.property_ops_commercial_service_requests
            (id, property_id, tenant_id, suite_id, title, category, priority, status, photo_count, assigned_vendor_id, submitted_at, sla_due_at, access_notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `,
        [id, propertyId, tenantId, suiteId, title, category, priority, status, photoCount, vendorId, submittedAt, slaDueAt, accessNotes],
      );
    }

    const notices = [
      [noticeFirePanelId, "Fire panel inspection and audible test", "building_notice", "2026-06-12T16:00:00.000Z", "2026-06-18T23:59:00.000Z", [tenantNorthlineId, tenantMapleId, tenantArcpointId, tenantPhysioId, tenantPrairieLawId, tenantIronGateId], [tenantNorthlineId, tenantArcpointId, tenantPrairieLawId, tenantIronGateId]],
      [noticeLoadingDockId, "Loading dock resurfacing schedule", "access_notice", "2026-06-15T15:30:00.000Z", "2026-06-20T23:59:00.000Z", [tenantMapleId, tenantPhysioId, tenantNorthlineId], [tenantNorthlineId]],
    ] as const;
    for (const [id, title, type, sentAt, dueAt, targets, acknowledged] of notices) {
      await client.query(
        `
          INSERT INTO public.property_ops_commercial_notices
            (id, property_id, title, type, sent_at, due_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [id, propertyId, title, type, sentAt, dueAt],
      );
      for (const tenantId of targets) {
        await client.query(
          `
            INSERT INTO public.property_ops_commercial_notice_targets
              (notice_id, tenant_id, acknowledged_at)
            VALUES ($1, $2, $3)
          `,
          [id, tenantId, acknowledged.includes(tenantId) ? "2026-06-16T16:00:00.000Z" : null],
        );
      }
    }

    const coiRecords = [
      [tenantNorthlineId, "Aviva Canada", "2027-01-31", "current", null],
      [tenantMapleId, "Intact", "2026-07-15", "expiring", "2026-06-10T16:30:00.000Z"],
      [tenantArcpointId, "Wawanesa", "2026-11-30", "current", null],
      [tenantPhysioId, "Missing", "2026-05-31", "expired", "2026-06-03T18:00:00.000Z"],
      [tenantPrairieLawId, "Peace Hills", "2026-12-31", "current", null],
      [tenantIronGateId, "Missing", "2026-06-30", "missing", null],
    ] as const;
    for (const [tenantId, provider, expiryDate, status, lastRequestedAt] of coiRecords) {
      await client.query(
        `
          INSERT INTO public.property_ops_commercial_coi_records
            (property_id, tenant_id, provider_name, expiry_date, status, last_requested_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [propertyId, tenantId, provider, expiryDate, status, lastRequestedAt],
      );
    }

    const criticalDates = [
      [tenantMapleId, "renewal_option", "Renewal option notice window opens", "2026-07-31", "due_soon", "Marcus Lee"],
      [tenantPhysioId, "lease_expiry", "Lease expiry and relocation risk review", "2026-10-31", "upcoming", "Marcus Lee"],
      [tenantIronGateId, "rent_step", "Scheduled rent step confirmation", "2026-07-01", "due_soon", "Accounting handoff"],
      [tenantPhysioId, "coi_expiry", "Expired COI requires tenant follow-up", "2026-06-07", "overdue", "Property admin"],
    ] as const;
    for (const [tenantId, type, title, dueDate, status, owner] of criticalDates) {
      await client.query(
        `
          INSERT INTO public.property_ops_lease_critical_dates
            (property_id, tenant_id, type, title, due_date, status, owner)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [propertyId, tenantId, type, title, dueDate, status, owner],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function queryOne<T = any>(sql: string, params: DbValue[] = []) {
  const result = await pool.query(sql, params);
  return result.rows[0] as T | undefined;
}

async function bootstrapResidentLoyaltyIfEmpty(userId: string, email?: string | null) {
  await ensureUser(userId, email);

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM public.resident_loyalty_landlords WHERE owner_user_id = $1 LIMIT 1`,
    [userId],
  );
  if (existing) {
    await bootstrapCommercialPropertyIfEmpty(existing.id);
    return;
  }

  const landlordId = randomUUID();
  const buildingId = randomUUID();
  const unit101Id = randomUUID();
  const unit102Id = randomUUID();
  const ameliaId = randomUUID();
  const mateoId = randomUUID();
  const slug = `maclaren-house-${shortUserSlug(userId)}`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
        INSERT INTO public.resident_loyalty_landlords (id, owner_user_id, name, manager_name)
        VALUES ($1, $2, $3, $4)
      `,
      [landlordId, userId, "Rivergate Residential", "Priya Shah"],
    );
    await client.query(
      `
        INSERT INTO public.resident_loyalty_memberships (landlord_id, user_id, role)
        VALUES ($1, $2, 'landlord_owner')
      `,
      [landlordId, userId],
    );
    await client.query(
      `
        INSERT INTO public.resident_loyalty_buildings
          (id, landlord_id, name, address, neighbourhood, portal_slug, unit_count)
        VALUES ($1, $2, $3, $4, $5, $6, 16)
      `,
      [buildingId, landlordId, "Maclaren House", "10418 122 Street NW, Edmonton", "Oliver", slug],
    );
    await client.query(
      `
        INSERT INTO public.resident_loyalty_units
          (id, building_id, unit_number, floor, bedrooms, occupancy_status)
        VALUES
          ($1, $3, '101', 1, 2, 'occupied'),
          ($2, $3, '102', 1, 1, 'occupied')
      `,
      [unit101Id, unit102Id, buildingId],
    );
    await client.query(
      `
        INSERT INTO public.resident_loyalty_residents
          (id, building_id, unit_id, name, email, move_in_date, rent_streak_months, autopay_status, renewal_window)
        VALUES
          ($1, $3, $4, 'Amelia Wong', 'amelia.wong@example.com', '2026-06-01', 7, 'enabled', 'active'),
          ($2, $3, $5, 'Mateo Reyes', 'mateo.reyes@example.com', '2026-07-01', 2, 'interested', 'upcoming')
      `,
      [ameliaId, mateoId, buildingId, unit101Id, unit102Id],
    );
    await client.query(
      `
        INSERT INTO public.resident_loyalty_tenant_lifecycles
          (
            id, resident_id, building_id, unit_id, invite_status, portal_slug,
            lease_document_name, lease_status, lease_start_date, lease_end_date, lease_acknowledged_at,
            security_deposit_amount_label, security_deposit_status, security_deposit_confirmed_at,
            next_rent_amount_label, next_rent_due_date, next_rent_status,
            move_in_inspection_status, move_in_photo_count, move_in_issue_count, move_in_submitted_at
          )
        VALUES
          (
            $1, $3, $5, $6, 'accepted', $8,
            'Maclaren House Unit 101 Lease.pdf', 'acknowledged', '2026-06-01', '2027-05-31', '2026-05-18T18:20:00.000Z',
            '$1,250', 'confirmed', '2026-05-19T16:00:00.000Z',
            '$1,650', '2026-07-01', 'upcoming',
            'manager_review', 9, 2, '2026-05-30T20:35:00.000Z'
          ),
          (
            $2, $4, $5, $7, 'sent', $9,
            'Maclaren House Unit 102 Lease.pdf', 'uploaded', '2026-07-01', '2027-06-30', NULL,
            '$1,150', 'received', NULL,
            '$1,525', '2026-07-01', 'not_due',
            'not_started', 0, 0, NULL
          )
      `,
      [
        randomUUID(),
        randomUUID(),
        ameliaId,
        mateoId,
        buildingId,
        unit101Id,
        unit102Id,
        `${slug}/unit-101`,
        `${slug}/unit-102`,
      ],
    );

    const steps = [
      [ameliaId, unit101Id, "tenant_invite_sent", "Accept resident portal invite", "Use the property-branded portal link to start move-in.", "complete", null, null, "2026-05-18T16:10:00.000Z"],
      [ameliaId, unit101Id, "lease_acknowledged", "Acknowledge lease packet", "Confirm the lease document and key dates are visible.", "complete", null, null, "2026-05-18T18:20:00.000Z"],
      [ameliaId, unit101Id, "security_deposit_confirmed", "Confirm security deposit status", "Record that the deposit was received outside this app.", "complete", null, null, "2026-05-19T16:00:00.000Z"],
      [ameliaId, unit101Id, "move_in_inspection_completed", "Submit move-in condition inspection", "Add room-by-room notes and photos for manager review.", "manager_review", 250, "2026-06-05T23:59:00.000Z", null],
      [ameliaId, unit101Id, "building_rules_acknowledged", "Acknowledge building rules", "Confirm move-in hours, waste room, parking, and quiet hours.", "complete", 25, null, "2026-05-20T14:20:00.000Z"],
      [ameliaId, unit101Id, "utility_setup_confirmed", "Confirm utility setup", "Upload or acknowledge utility account setup status.", "submitted", null, null, null],
      [ameliaId, unit101Id, "first_rent_status_reviewed", "Review next rent due date", "Show the next due date and status without processing payment.", "complete", null, null, "2026-05-21T15:30:00.000Z"],
      [mateoId, unit102Id, "tenant_invite_sent", "Accept resident portal invite", "Use the property-branded portal link to start move-in.", "todo", null, null, null],
      [mateoId, unit102Id, "lease_acknowledged", "Acknowledge lease packet", "Confirm lease document and key dates.", "todo", null, null, null],
      [mateoId, unit102Id, "security_deposit_confirmed", "Confirm security deposit status", "Record that the deposit was received outside this app.", "manager_review", null, null, null],
      [mateoId, unit102Id, "move_in_inspection_completed", "Submit move-in condition inspection", "Add room-by-room notes and photos after keys are issued.", "todo", 250, "2026-07-03T23:59:00.000Z", null],
      [mateoId, unit102Id, "building_rules_acknowledged", "Acknowledge building rules", "Confirm move-in hours, waste room, parking, and quiet hours.", "todo", 25, null, null],
      [mateoId, unit102Id, "first_rent_status_reviewed", "Review first rent due date", "Show due date and status without processing payment.", "todo", null, null, null],
    ] as const;

    for (const [residentId, unitId, type, title, description, status, points, dueAt, completedAt] of steps) {
      await client.query(
        `
          INSERT INTO public.resident_loyalty_onboarding_steps
            (resident_id, building_id, unit_id, type, title, description, status, points, due_at, completed_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [residentId, buildingId, unitId, type, title, description, status, points, dueAt, completedAt],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  await bootstrapCommercialPropertyIfEmpty(landlordId);
}

async function loadStateForUser(userId: string) {
  const landlords = await pool.query(
    `
      SELECT id, name, manager_name
      FROM public.resident_loyalty_landlords
      WHERE owner_user_id = $1
      ORDER BY created_at ASC
    `,
    [userId],
  );
  const buildings = await pool.query(
    `
      SELECT b.id, b.landlord_id, b.name, b.address, b.neighbourhood, b.unit_count
      FROM public.resident_loyalty_buildings b
      JOIN public.resident_loyalty_landlords l ON l.id = b.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY b.created_at ASC
    `,
    [userId],
  );
  const units = await pool.query(
    `
      SELECT u.id, u.building_id, u.unit_number, u.floor, u.bedrooms, u.occupancy_status
      FROM public.resident_loyalty_units u
      JOIN public.resident_loyalty_buildings b ON b.id = u.building_id
      JOIN public.resident_loyalty_landlords l ON l.id = b.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY u.unit_number ASC
    `,
    [userId],
  );
  const residents = await pool.query(
    `
      SELECT r.id, r.building_id, r.unit_id, r.name, r.email, r.move_in_date,
             r.rent_streak_months, r.autopay_status, r.renewal_window
      FROM public.resident_loyalty_residents r
      JOIN public.resident_loyalty_buildings b ON b.id = r.building_id
      JOIN public.resident_loyalty_landlords l ON l.id = b.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY r.created_at ASC
    `,
    [userId],
  );
  const lifecycles = await pool.query(
    `
      SELECT tl.*
      FROM public.resident_loyalty_tenant_lifecycles tl
      JOIN public.resident_loyalty_buildings b ON b.id = tl.building_id
      JOIN public.resident_loyalty_landlords l ON l.id = b.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY tl.created_at ASC
    `,
    [userId],
  );
  const steps = await pool.query(
    `
      SELECT os.*
      FROM public.resident_loyalty_onboarding_steps os
      JOIN public.resident_loyalty_buildings b ON b.id = os.building_id
      JOIN public.resident_loyalty_landlords l ON l.id = b.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY os.created_at ASC
    `,
    [userId],
  );
  const commercialProperties = await pool.query(
    `
      SELECT p.*
      FROM public.property_ops_properties p
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY p.created_at ASC
    `,
    [userId],
  );
  const commercialSuites = await pool.query(
    `
      SELECT s.*
      FROM public.property_ops_commercial_suites s
      JOIN public.property_ops_properties p ON p.id = s.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY s.suite_number ASC
    `,
    [userId],
  );
  const commercialTenants = await pool.query(
    `
      SELECT t.*
      FROM public.property_ops_commercial_tenants t
      JOIN public.property_ops_properties p ON p.id = t.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY t.created_at ASC
    `,
    [userId],
  );
  const commercialServiceRequests = await pool.query(
    `
      SELECT sr.*
      FROM public.property_ops_commercial_service_requests sr
      JOIN public.property_ops_properties p ON p.id = sr.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY sr.submitted_at DESC
    `,
    [userId],
  );
  const commercialNotices = await pool.query(
    `
      SELECT n.*
      FROM public.property_ops_commercial_notices n
      JOIN public.property_ops_properties p ON p.id = n.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY n.sent_at DESC
    `,
    [userId],
  );
  const commercialNoticeTargets = await pool.query(
    `
      SELECT nt.notice_id, nt.tenant_id, nt.acknowledged_at
      FROM public.property_ops_commercial_notice_targets nt
      JOIN public.property_ops_commercial_notices n ON n.id = nt.notice_id
      JOIN public.property_ops_properties p ON p.id = n.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY nt.created_at ASC
    `,
    [userId],
  );
  const commercialCoiRecords = await pool.query(
    `
      SELECT c.*
      FROM public.property_ops_commercial_coi_records c
      JOIN public.property_ops_properties p ON p.id = c.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY c.expiry_date ASC NULLS LAST
    `,
    [userId],
  );
  const leaseCriticalDates = await pool.query(
    `
      SELECT cd.*
      FROM public.property_ops_lease_critical_dates cd
      JOIN public.property_ops_properties p ON p.id = cd.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY cd.due_date ASC
    `,
    [userId],
  );
  const vendors = await pool.query(
    `
      SELECT v.*
      FROM public.property_ops_vendors v
      JOIN public.property_ops_properties p ON p.id = v.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE l.owner_user_id = $1
      ORDER BY v.name ASC
    `,
    [userId],
  );

  const residentsByUnit = new Map<string, string>();
  for (const resident of residents.rows) {
    residentsByUnit.set(resident.unit_id, resident.id);
  }

  const tenantsBySuite = new Map<string, string>();
  for (const tenant of commercialTenants.rows) {
    tenantsBySuite.set(tenant.suite_id, tenant.id);
  }

  const noticeTargets = new Map<string, { targetTenantIds: string[]; acknowledgedTenantIds: string[] }>();
  for (const target of commercialNoticeTargets.rows) {
    const group = noticeTargets.get(target.notice_id) ?? { targetTenantIds: [], acknowledgedTenantIds: [] };
    group.targetTenantIds.push(target.tenant_id);
    if (target.acknowledged_at) {
      group.acknowledgedTenantIds.push(target.tenant_id);
    }
    noticeTargets.set(target.notice_id, group);
  }

  return {
    landlords: landlords.rows.map((row) => ({
      id: row.id,
      name: row.name,
      managerName: row.manager_name,
    })),
    buildings: buildings.rows.map((row) => ({
      id: row.id,
      landlordId: row.landlord_id,
      name: row.name,
      address: row.address || "",
      neighbourhood: row.neighbourhood || "",
      unitCount: Number(row.unit_count || 0),
    })),
    properties: [
      ...buildings.rows.map((row) => ({
        id: row.id,
        landlordId: row.landlord_id,
        name: row.name,
        address: row.address || "",
        market: `${row.neighbourhood || "Edmonton"} multifamily`,
        vertical: "residential",
        managerName: landlords.rows[0]?.manager_name || "",
        unitCount: Number(row.unit_count || 0),
        healthScore: 78,
        positioning: "Resident operations, onboarding, maintenance quality, notices, renewals, and incentives.",
      })),
      ...commercialProperties.rows.map((row) => ({
        id: row.id,
        landlordId: row.landlord_id,
        name: row.name,
        address: row.address || "",
        market: row.market || "",
        vertical: row.vertical,
        managerName: row.manager_name || "",
        unitCount: row.unit_count === null || row.unit_count === undefined ? undefined : Number(row.unit_count),
        suiteCount: row.suite_count === null || row.suite_count === undefined ? undefined : Number(row.suite_count),
        rentableAreaSf: row.rentable_area_sf === null || row.rentable_area_sf === undefined ? undefined : Number(row.rentable_area_sf),
        healthScore: Number(row.health_score || 0),
        positioning: row.positioning || "",
      })),
    ],
    units: units.rows.map((row) => ({
      id: row.id,
      buildingId: row.building_id,
      unitNumber: row.unit_number,
      floor: Number(row.floor || 0),
      bedrooms: Number(row.bedrooms || 0),
      residentId: residentsByUnit.get(row.id),
      occupancyStatus: row.occupancy_status,
    })),
    residents: residents.rows.map((row) => ({
      id: row.id,
      buildingId: row.building_id,
      unitId: row.unit_id,
      name: row.name,
      email: row.email,
      moveInDate: dateOnly(row.move_in_date) || "",
      rentStreakMonths: Number(row.rent_streak_months || 0),
      autopayStatus: row.autopay_status,
      renewalWindow: row.renewal_window,
    })),
    commercialSuites: commercialSuites.rows.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      suiteNumber: row.suite_number,
      floor: row.floor || "",
      rentableAreaSf: Number(row.rentable_area_sf || 0),
      tenantId: tenantsBySuite.get(row.id),
      occupancyStatus: row.occupancy_status,
    })),
    commercialTenants: commercialTenants.rows.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      suiteId: row.suite_id,
      companyName: row.company_name,
      primaryContact: row.primary_contact,
      email: row.email,
      industry: row.industry || "",
      leaseStart: dateOnly(row.lease_start) || "",
      leaseEnd: dateOnly(row.lease_end) || "",
      renewalRisk: row.renewal_risk,
      relationshipHealth: Number(row.relationship_health || 0),
    })),
    commercialServiceRequests: commercialServiceRequests.rows.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      tenantId: row.tenant_id,
      suiteId: row.suite_id,
      title: row.title,
      category: row.category,
      priority: row.priority,
      status: row.status,
      photoCount: Number(row.photo_count || 0),
      assignedVendorId: row.assigned_vendor_id || undefined,
      submittedAt: isoDateTime(row.submitted_at) || "",
      slaDueAt: isoDateTime(row.sla_due_at) || "",
      accessNotes: row.access_notes || "",
    })),
    commercialNotices: commercialNotices.rows.map((row) => {
      const targets = noticeTargets.get(row.id) ?? { targetTenantIds: [], acknowledgedTenantIds: [] };
      return {
        id: row.id,
        propertyId: row.property_id,
        title: row.title,
        type: row.type,
        sentAt: isoDateTime(row.sent_at) || "",
        dueAt: isoDateTime(row.due_at) || "",
        targetTenantIds: targets.targetTenantIds,
        acknowledgedTenantIds: targets.acknowledgedTenantIds,
      };
    }),
    commercialCoiRecords: commercialCoiRecords.rows.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      tenantId: row.tenant_id,
      providerName: row.provider_name || "Missing",
      expiryDate: dateOnly(row.expiry_date) || "",
      status: row.status,
      lastRequestedAt: isoDateTime(row.last_requested_at),
    })),
    leaseCriticalDates: leaseCriticalDates.rows.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      tenantId: row.tenant_id,
      type: row.type,
      title: row.title,
      dueDate: dateOnly(row.due_date) || "",
      status: row.status,
      owner: row.owner || "",
    })),
    vendors: vendors.rows.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      name: row.name,
      trade: row.trade,
      openJobs: Number(row.open_jobs || 0),
      slaPerformance: Number(row.sla_performance || 0),
      phone: row.phone || "",
    })),
    tenantLifecycles: lifecycles.rows.map((row) => ({
      id: row.id,
      residentId: row.resident_id,
      buildingId: row.building_id,
      unitId: row.unit_id,
      inviteStatus: row.invite_status,
      portalSlug: row.portal_slug,
      lease: {
        documentName: row.lease_document_name || "",
        status: row.lease_status,
        startDate: dateOnly(row.lease_start_date) || "",
        endDate: dateOnly(row.lease_end_date) || "",
        acknowledgedAt: isoDateTime(row.lease_acknowledged_at),
      },
      securityDeposit: {
        amountLabel: row.security_deposit_amount_label || "",
        status: row.security_deposit_status,
        confirmedAt: isoDateTime(row.security_deposit_confirmed_at),
      },
      nextRent: {
        amountLabel: row.next_rent_amount_label || "",
        dueDate: dateOnly(row.next_rent_due_date) || "",
        status: row.next_rent_status,
      },
      moveInInspection: {
        status: row.move_in_inspection_status,
        photoCount: Number(row.move_in_photo_count || 0),
        issueCount: Number(row.move_in_issue_count || 0),
        submittedAt: isoDateTime(row.move_in_submitted_at),
      },
    })),
    onboardingSteps: steps.rows.map((row) => ({
      id: row.id,
      residentId: row.resident_id,
      buildingId: row.building_id,
      unitId: row.unit_id,
      type: row.type,
      title: row.title,
      description: row.description || "",
      status: row.status,
      points: row.points === null || row.points === undefined ? undefined : Number(row.points),
      dueAt: isoDateTime(row.due_at),
      completedAt: isoDateTime(row.completed_at),
    })),
  };
}

async function ensureResidentOwned(userId: string, residentId: string) {
  const row = await queryOne<{ id: string }>(
    `
      SELECT r.id
      FROM public.resident_loyalty_residents r
      JOIN public.resident_loyalty_buildings b ON b.id = r.building_id
      JOIN public.resident_loyalty_landlords l ON l.id = b.landlord_id
      WHERE r.id = $1 AND l.owner_user_id = $2
      LIMIT 1
    `,
    [residentId, userId],
  );
  if (!row) {
    const error = new Error("Resident not found");
    (error as any).status = 404;
    throw error;
  }
}

async function ensureStepOwned(userId: string, stepId: string) {
  const row = await queryOne<{ id: string; resident_id: string }>(
    `
      SELECT os.id, os.resident_id
      FROM public.resident_loyalty_onboarding_steps os
      JOIN public.resident_loyalty_buildings b ON b.id = os.building_id
      JOIN public.resident_loyalty_landlords l ON l.id = b.landlord_id
      WHERE os.id = $1 AND l.owner_user_id = $2
      LIMIT 1
    `,
    [stepId, userId],
  );
  if (!row) {
    const error = new Error("Onboarding step not found");
    (error as any).status = 404;
    throw error;
  }
  return row;
}

async function ensureCommercialServiceRequestOwned(userId: string, requestId: string) {
  const row = await queryOne<{ id: string; status: string }>(
    `
      SELECT sr.id, sr.status
      FROM public.property_ops_commercial_service_requests sr
      JOIN public.property_ops_properties p ON p.id = sr.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE sr.id = $1 AND l.owner_user_id = $2
      LIMIT 1
    `,
    [requestId, userId],
  );
  if (!row) {
    const error = new Error("Commercial service request not found");
    (error as any).status = 404;
    throw error;
  }
  return row;
}

async function ensureCommercialNoticeOwned(userId: string, noticeId: string) {
  const row = await queryOne<{ id: string }>(
    `
      SELECT n.id
      FROM public.property_ops_commercial_notices n
      JOIN public.property_ops_properties p ON p.id = n.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE n.id = $1 AND l.owner_user_id = $2
      LIMIT 1
    `,
    [noticeId, userId],
  );
  if (!row) {
    const error = new Error("Commercial notice not found");
    (error as any).status = 404;
    throw error;
  }
}

async function ensureCommercialCoiOwned(userId: string, coiId: string) {
  const row = await queryOne<{ id: string }>(
    `
      SELECT c.id
      FROM public.property_ops_commercial_coi_records c
      JOIN public.property_ops_properties p ON p.id = c.property_id
      JOIN public.resident_loyalty_landlords l ON l.id = p.landlord_id
      WHERE c.id = $1 AND l.owner_user_id = $2
      LIMIT 1
    `,
    [coiId, userId],
  );
  if (!row) {
    const error = new Error("Commercial COI record not found");
    (error as any).status = 404;
    throw error;
  }
}

function nextCommercialServiceStatus(status: string) {
  const nextStatus: Record<string, string> = {
    new: "triage",
    triage: "vendor_assigned",
    vendor_assigned: "scheduled",
    scheduled: "completed",
    waiting_tenant: "scheduled",
    completed: "completed",
  };
  return nextStatus[status] || "triage";
}

async function completeStepByType(residentId: string, type: string, status = "complete") {
  await pool.query(
    `
      UPDATE public.resident_loyalty_onboarding_steps
      SET status = $3,
          completed_at = CASE WHEN $3 = 'complete' THEN now() ELSE completed_at END,
          updated_at = now()
      WHERE resident_id = $1 AND type = $2
    `,
    [residentId, type, status],
  );
}

function asyncHandler(fn: (req: Request, res: any) => Promise<void>) {
  return (req: Request, res: any, next: any) => {
    fn(req, res).catch(next);
  };
}

async function sendState(res: any, userId: string) {
  res.json({ source: "database", state: await loadStateForUser(userId) });
}

function sendFrontendDemoIfNeeded(req: Request, res: any) {
  if (isDemoRequest(req) || !hasDatabase) {
    res.json({ source: "frontend-demo", state: null });
    return true;
  }
  return false;
}

export async function registerResidentLoyaltyRoutes(app: Express): Promise<void> {
  if (hasDatabase) {
    await ensureResidentLoyaltyTables();
  }

  app.get("/api/resident-loyalty/state", requireAuth, asyncHandler(async (req, res) => {
    if (isDemoRequest(req) || !hasDatabase) {
      res.json({ source: "frontend-demo", state: null });
      return;
    }
    const userId = getUserId(req);
    await bootstrapResidentLoyaltyIfEmpty(userId, (req as any)?.user?.email || null);
    await sendState(res, userId);
  }));

  app.post("/api/resident-loyalty/residents/:residentId/invite", requireAuth, asyncHandler(async (req, res) => {
    if (sendFrontendDemoIfNeeded(req, res)) return;
    const userId = getUserId(req);
    await ensureResidentOwned(userId, req.params.residentId);
    await pool.query(
      `UPDATE public.resident_loyalty_tenant_lifecycles SET invite_status = 'sent', updated_at = now() WHERE resident_id = $1`,
      [req.params.residentId],
    );
    await completeStepByType(req.params.residentId, "tenant_invite_sent", "complete");
    await sendState(res, userId);
  }));

  app.post("/api/resident-loyalty/residents/:residentId/accept-invite", requireAuth, asyncHandler(async (req, res) => {
    if (sendFrontendDemoIfNeeded(req, res)) return;
    const userId = getUserId(req);
    await ensureResidentOwned(userId, req.params.residentId);
    await pool.query(
      `UPDATE public.resident_loyalty_tenant_lifecycles SET invite_status = 'accepted', updated_at = now() WHERE resident_id = $1`,
      [req.params.residentId],
    );
    await sendState(res, userId);
  }));

  app.post("/api/resident-loyalty/residents/:residentId/lease-acknowledged", requireAuth, asyncHandler(async (req, res) => {
    if (sendFrontendDemoIfNeeded(req, res)) return;
    const userId = getUserId(req);
    await ensureResidentOwned(userId, req.params.residentId);
    await pool.query(
      `
        UPDATE public.resident_loyalty_tenant_lifecycles
        SET lease_status = 'acknowledged', lease_acknowledged_at = now(), updated_at = now()
        WHERE resident_id = $1
      `,
      [req.params.residentId],
    );
    await completeStepByType(req.params.residentId, "lease_acknowledged", "complete");
    await sendState(res, userId);
  }));

  app.post("/api/resident-loyalty/residents/:residentId/deposit-confirmed", requireAuth, asyncHandler(async (req, res) => {
    if (sendFrontendDemoIfNeeded(req, res)) return;
    const userId = getUserId(req);
    await ensureResidentOwned(userId, req.params.residentId);
    await pool.query(
      `
        UPDATE public.resident_loyalty_tenant_lifecycles
        SET security_deposit_status = 'confirmed', security_deposit_confirmed_at = now(), updated_at = now()
        WHERE resident_id = $1
      `,
      [req.params.residentId],
    );
    await completeStepByType(req.params.residentId, "security_deposit_confirmed", "complete");
    await sendState(res, userId);
  }));

  app.post("/api/resident-loyalty/residents/:residentId/inspection-submit", requireAuth, asyncHandler(async (req, res) => {
    if (sendFrontendDemoIfNeeded(req, res)) return;
    const userId = getUserId(req);
    await ensureResidentOwned(userId, req.params.residentId);
    await pool.query(
      `
        UPDATE public.resident_loyalty_tenant_lifecycles
        SET move_in_inspection_status = 'manager_review',
            move_in_photo_count = GREATEST(move_in_photo_count, 8),
            move_in_issue_count = GREATEST(move_in_issue_count, 1),
            move_in_submitted_at = COALESCE(move_in_submitted_at, now()),
            updated_at = now()
        WHERE resident_id = $1
      `,
      [req.params.residentId],
    );
    await completeStepByType(req.params.residentId, "move_in_inspection_completed", "manager_review");
    await sendState(res, userId);
  }));

  app.post("/api/resident-loyalty/residents/:residentId/inspection-approve", requireAuth, asyncHandler(async (req, res) => {
    if (sendFrontendDemoIfNeeded(req, res)) return;
    const userId = getUserId(req);
    await ensureResidentOwned(userId, req.params.residentId);
    await pool.query(
      `
        UPDATE public.resident_loyalty_tenant_lifecycles
        SET move_in_inspection_status = 'completed', updated_at = now()
        WHERE resident_id = $1
      `,
      [req.params.residentId],
    );
    await completeStepByType(req.params.residentId, "move_in_inspection_completed", "complete");
    await sendState(res, userId);
  }));

  app.post("/api/resident-loyalty/onboarding-steps/:stepId/complete", requireAuth, asyncHandler(async (req, res) => {
    if (sendFrontendDemoIfNeeded(req, res)) return;
    const userId = getUserId(req);
    await ensureStepOwned(userId, req.params.stepId);
    await pool.query(
      `
        UPDATE public.resident_loyalty_onboarding_steps
        SET status = 'complete', completed_at = now(), updated_at = now()
        WHERE id = $1
      `,
      [req.params.stepId],
    );
    await sendState(res, userId);
  }));

  app.post("/api/resident-loyalty/commercial/service-requests/:requestId/advance", requireAuth, asyncHandler(async (req, res) => {
    if (sendFrontendDemoIfNeeded(req, res)) return;
    const userId = getUserId(req);
    const request = await ensureCommercialServiceRequestOwned(userId, req.params.requestId);
    await pool.query(
      `
        UPDATE public.property_ops_commercial_service_requests
        SET status = $2, updated_at = now()
        WHERE id = $1
      `,
      [req.params.requestId, nextCommercialServiceStatus(request.status)],
    );
    await sendState(res, userId);
  }));

  app.post("/api/resident-loyalty/commercial/notices/:noticeId/acknowledge-next", requireAuth, asyncHandler(async (req, res) => {
    if (sendFrontendDemoIfNeeded(req, res)) return;
    const userId = getUserId(req);
    await ensureCommercialNoticeOwned(userId, req.params.noticeId);
    await pool.query(
      `
        UPDATE public.property_ops_commercial_notice_targets
        SET acknowledged_at = now(), updated_at = now()
        WHERE id = (
          SELECT nt.id
          FROM public.property_ops_commercial_notice_targets nt
          WHERE nt.notice_id = $1 AND nt.acknowledged_at IS NULL
          ORDER BY nt.created_at ASC
          LIMIT 1
        )
      `,
      [req.params.noticeId],
    );
    await sendState(res, userId);
  }));

  app.post("/api/resident-loyalty/commercial/cois/:coiId/request", requireAuth, asyncHandler(async (req, res) => {
    if (sendFrontendDemoIfNeeded(req, res)) return;
    const userId = getUserId(req);
    await ensureCommercialCoiOwned(userId, req.params.coiId);
    await pool.query(
      `
        UPDATE public.property_ops_commercial_coi_records
        SET last_requested_at = now(), updated_at = now()
        WHERE id = $1
      `,
      [req.params.coiId],
    );
    await sendState(res, userId);
  }));
}

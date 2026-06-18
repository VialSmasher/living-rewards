CREATE TABLE IF NOT EXISTS public.property_ops_properties (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  landlord_id varchar NOT NULL REFERENCES public.resident_loyalty_landlords(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  address text,
  market varchar,
  vertical varchar NOT NULL DEFAULT 'commercial',
  manager_name varchar,
  unit_count integer,
  suite_count integer,
  rentable_area_sf integer,
  health_score integer NOT NULL DEFAULT 70,
  positioning text NOT NULL DEFAULT '',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_ops_commercial_suites (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id varchar NOT NULL REFERENCES public.property_ops_properties(id) ON DELETE CASCADE,
  suite_number varchar NOT NULL,
  floor varchar,
  rentable_area_sf integer NOT NULL DEFAULT 0,
  occupancy_status varchar NOT NULL DEFAULT 'vacant',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_ops_commercial_tenants (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id varchar NOT NULL REFERENCES public.property_ops_properties(id) ON DELETE CASCADE,
  suite_id varchar NOT NULL REFERENCES public.property_ops_commercial_suites(id) ON DELETE CASCADE,
  company_name varchar NOT NULL,
  primary_contact varchar NOT NULL,
  email varchar NOT NULL,
  industry varchar NOT NULL DEFAULT '',
  lease_start date,
  lease_end date,
  renewal_risk varchar NOT NULL DEFAULT 'medium',
  relationship_health integer NOT NULL DEFAULT 75,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_ops_vendors (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id varchar NOT NULL REFERENCES public.property_ops_properties(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  trade varchar NOT NULL,
  open_jobs integer NOT NULL DEFAULT 0,
  sla_performance integer NOT NULL DEFAULT 80,
  phone varchar NOT NULL DEFAULT '',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_ops_commercial_service_requests (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id varchar NOT NULL REFERENCES public.property_ops_properties(id) ON DELETE CASCADE,
  tenant_id varchar NOT NULL REFERENCES public.property_ops_commercial_tenants(id) ON DELETE CASCADE,
  suite_id varchar NOT NULL REFERENCES public.property_ops_commercial_suites(id) ON DELETE CASCADE,
  title text NOT NULL,
  category varchar NOT NULL DEFAULT 'other',
  priority varchar NOT NULL DEFAULT 'normal',
  status varchar NOT NULL DEFAULT 'new',
  photo_count integer NOT NULL DEFAULT 0,
  assigned_vendor_id varchar REFERENCES public.property_ops_vendors(id) ON DELETE SET NULL,
  submitted_at timestamp NOT NULL DEFAULT now(),
  sla_due_at timestamp NOT NULL DEFAULT now(),
  access_notes text NOT NULL DEFAULT '',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_ops_commercial_notices (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id varchar NOT NULL REFERENCES public.property_ops_properties(id) ON DELETE CASCADE,
  title text NOT NULL,
  type varchar NOT NULL DEFAULT 'building_notice',
  sent_at timestamp NOT NULL DEFAULT now(),
  due_at timestamp NOT NULL DEFAULT now(),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_ops_commercial_notice_targets (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  notice_id varchar NOT NULL REFERENCES public.property_ops_commercial_notices(id) ON DELETE CASCADE,
  tenant_id varchar NOT NULL REFERENCES public.property_ops_commercial_tenants(id) ON DELETE CASCADE,
  acknowledged_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_ops_commercial_coi_records (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id varchar NOT NULL REFERENCES public.property_ops_properties(id) ON DELETE CASCADE,
  tenant_id varchar NOT NULL REFERENCES public.property_ops_commercial_tenants(id) ON DELETE CASCADE,
  provider_name varchar NOT NULL DEFAULT 'Missing',
  expiry_date date,
  status varchar NOT NULL DEFAULT 'missing',
  last_requested_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_ops_lease_critical_dates (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id varchar NOT NULL REFERENCES public.property_ops_properties(id) ON DELETE CASCADE,
  tenant_id varchar NOT NULL REFERENCES public.property_ops_commercial_tenants(id) ON DELETE CASCADE,
  type varchar NOT NULL,
  title text NOT NULL,
  due_date date NOT NULL,
  status varchar NOT NULL DEFAULT 'upcoming',
  owner varchar NOT NULL DEFAULT '',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_property_ops_properties_landlord"
  ON public.property_ops_properties(landlord_id);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_properties_vertical"
  ON public.property_ops_properties(vertical);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_suites_property"
  ON public.property_ops_commercial_suites(property_id);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_property_ops_suites_number"
  ON public.property_ops_commercial_suites(property_id, suite_number);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_tenants_property"
  ON public.property_ops_commercial_tenants(property_id);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_tenants_suite"
  ON public.property_ops_commercial_tenants(suite_id);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_property_ops_tenants_suite_email"
  ON public.property_ops_commercial_tenants(suite_id, email);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_vendors_property"
  ON public.property_ops_vendors(property_id);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_service_property"
  ON public.property_ops_commercial_service_requests(property_id);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_service_tenant"
  ON public.property_ops_commercial_service_requests(tenant_id);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_service_status"
  ON public.property_ops_commercial_service_requests(status);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_notices_property"
  ON public.property_ops_commercial_notices(property_id);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_notice_targets_notice"
  ON public.property_ops_commercial_notice_targets(notice_id);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_property_ops_notice_targets"
  ON public.property_ops_commercial_notice_targets(notice_id, tenant_id);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_coi_property"
  ON public.property_ops_commercial_coi_records(property_id);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_coi_status"
  ON public.property_ops_commercial_coi_records(status);
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_property_ops_coi_tenant"
  ON public.property_ops_commercial_coi_records(tenant_id);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_critical_dates_property"
  ON public.property_ops_lease_critical_dates(property_id);
CREATE INDEX IF NOT EXISTS "IDX_property_ops_critical_dates_status"
  ON public.property_ops_lease_critical_dates(status);

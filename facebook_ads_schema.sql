-- This is the DB schema ad_observatory_api_backend.
-- Note: clustering, topic modelling, ad type classfication implementations are not provided in this repo.

CREATE TABLE pages (
  page_id bigint NOT NULL,
  page_name character varying NOT NULL,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (page_id)
);
CREATE TABLE ads (
  archive_id bigint NOT NULL,
  ad_creative_body character varying,
  ad_creation_time date,
  ad_delivery_start_time date,
  ad_delivery_stop_time date,
  page_id bigint,
  currency character varying (4),
  ad_creative_link_caption character varying,
  ad_creative_link_title character varying,
  ad_creative_link_description character varying,
  ad_snapshot_url character varying,
  funding_entity character varying,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (archive_id),
  CONSTRAINT page_id_fk FOREIGN KEY (page_id) REFERENCES pages (page_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE TABLE ad_countries(
  archive_id bigint,
  country_code character varying,
  PRIMARY KEY (archive_id, country_code),
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE TABLE impressions (
  archive_id bigint,
  ad_status bigint,
  min_spend decimal(10, 2),
  max_spend decimal(10, 2),
  min_impressions integer,
  max_impressions integer,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  potential_reach_min bigint,
  potential_reach_max bigint,
  spend_estimate numeric(9,2)
  PRIMARY KEY (archive_id),
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE funder_metadata (
  funder_id SERIAL,
  funder_name character varying,
  funder_type character varying,
  legal_entity_id character varying,
  legal_entity_name character varying,
  funder_country character varying,
  parent_id bigint,
  partisan_lean character varying,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (funder_id)
);
CREATE TABLE ad_metadata (
  archive_id bigint,
  funder_id bigint,
  ad_type character varying,
  ad_id bigint,
  ad_score decimal(8, 6),
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (archive_id),
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT funder_id_fk FOREIGN KEY (funder_id) REFERENCES funder_metadata (funder_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE TABLE page_metadata (
  page_id bigint NOT NULL,
  page_url character varying,
  page_type character varying,
  country_code_list character varying,
  -- Page owner is parent page_id
  page_owner bigint,
  page_status character varying,
  advertiser_score decimal(8, 6),
  partisan_lean character varying,
  party character varying,
  fec_id character varying,
  candidate_full_name character varying,
  candidate_last_name character varying,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (page_id),
  CONSTRAINT page_id_fk FOREIGN KEY (page_id) REFERENCES pages (page_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE TABLE deprecated_page_names (
  page_id bigint NOT NULL,
  page_name character varying NOT NULL,
  deprecated_on date DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT page_id_fk FOREIGN KEY (page_id) REFERENCES pages (page_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_id_name_deprecated_on UNIQUE(page_id, page_name, deprecated_on)
);
CREATE TABLE ad_snapshot_metadata (
  archive_id bigint NOT NULL,
  needs_scrape boolean DEFAULT TRUE,
  snapshot_fetch_time timestamp with timezone,
  snapshot_fetch_status int,
  snapshot_fetch_batch_id bigint,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (archive_id),
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT batch_id_fk FOREIGN KEY (snapshot_fetch_batch_id) REFERENCES snapshot_fetch_batches (batch_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE SET NULL
);
CREATE TABLE ad_creatives (
  ad_creative_id bigserial PRIMARY KEY,
  archive_id bigint NOT NULL,
  ad_creative_body character varying,
  ad_creative_link_url character varying,
  ad_creative_link_caption character varying,
  ad_creative_link_title character varying,
  ad_creative_link_description character varying,
  -- TODO(macpd): how to store/differentiate videos?
  text_sim_hash character varying,
  text_sha256_hash character varying,
  image_downloaded_url character varying,
  image_bucket_path character varying,
  image_sim_hash character varying,
  image_sha256_hash character varying,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_creative_per_archive_id UNIQUE(archive_id, text_sha256_hash, image_sha256_hash)
);
CREATE TABLE demo_impressions (
  archive_id bigint,
  age_group character varying,
  gender character varying,
  spend_percentage decimal(5, 2),
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT spend_is_percentage check (
    spend_percentage >= 0
    AND spend_percentage <= 100
  ),
  CONSTRAINT unique_demos_per_ad UNIQUE(archive_id, age_group, gender)
);
CREATE TABLE region_impressions (
  archive_id bigint,
  region character varying,
  spend_percentage decimal(5, 2),
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT spend_is_percentage check (
    spend_percentage >= 0
    AND spend_percentage <= 100
  ),
  CONSTRAINT unique_regions_per_ad UNIQUE(archive_id, region)
);
CREATE TABLE demo_impression_results (
  archive_id bigint,
  age_group character varying,
  gender character varying,
  min_spend decimal(10, 2),
  max_spend decimal(10, 2),
  min_impressions integer,
  max_impressions integer,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  spend_estimate numeric(10,2),
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_demo_results UNIQUE(archive_id, age_group, gender)
);
CREATE TABLE region_impression_results (
  archive_id bigint,
  region character varying,
  min_spend decimal(10, 2),
  max_spend decimal(10, 2),
  min_impressions integer,
  max_impressions integer,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  spend_estimate numeric(10,2),
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_region_results UNIQUE(archive_id, region)
);
CREATE TABLE snapshot_fetch_batches (
  batch_id bigserial PRIMARY KEY,
  time_started timestamp with time zone,
  time_completed timestamp with time zone,
  last_modified_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
);


CREATE TABLE ad_creative_body_recognized_entities_json (
  text_sha256_hash character varying PRIMARY KEY,
  named_entity_recognition_json jsonb NOT NULL
);
CREATE TABLE ad_clusters (
  archive_id bigint PRIMARY KEY,
  ad_cluster_id bigint NOT NULL,
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_creative_per_cluster UNIQUE(archive_id, ad_cluster_id)
);
CREATE TABLE ad_cluster_metadata (
  ad_cluster_id bigint PRIMARY KEY,
  min_spend_sum decimal(12, 2),
  max_spend_sum decimal(12, 2),
  min_impressions_sum bigint,
  max_impressions_sum bigint,
  min_ad_creation_time date,
  max_ad_creation_time date,
  min_ad_delivery_start_time date,
  max_last_active_date date,
  canonical_archive_id bigint,
  -- Number of archive_id in cluster
  cluster_size bigint,
  -- Number of unique pages associated with the ads in a cluster.
  num_pages bigint,
  CONSTRAINT archive_id_fk FOREIGN KEY (canonical_archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE TABLE ad_cluster_topics (
  ad_cluster_id bigint,
  topic_id bigint,
  percent_by_min_spend decimal (5, 4),
  percent_by_max_spend decimal (5, 4),
  CONSTRAINT ad_cluster_id_fk FOREIGN KEY (ad_cluster_id) REFERENCES ad_cluster_metadata (ad_cluster_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT topic_id_fk FOREIGN KEY (topic_id) REFERENCES topics (topic_id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY (ad_cluster_id, topic_id)
);
CREATE TABLE ad_cluster_pages (
  ad_cluster_id bigint,
  page_id bigint,
  CONSTRAINT ad_cluster_id_fk FOREIGN KEY (ad_cluster_id) REFERENCES ad_cluster_metadata (ad_cluster_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT page_id_fk FOREIGN KEY (page_id) REFERENCES pages (page_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_ad_cluster_and_page_id UNIQUE(ad_cluster_id, page_id)
);
CREATE TABLE ad_cluster_demo_impression_results (
  ad_cluster_id bigint,
  age_group character varying,
  gender character varying,
  min_spend_sum decimal(10, 2),
  max_spend_sum decimal(10, 2),
  min_impressions_sum bigint,
  max_impressions_sum bigint,
  CONSTRAINT ad_cluster_id_fk FOREIGN KEY (ad_cluster_id) REFERENCES ad_cluster_metadata (ad_cluster_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_ad_cluster_demo_results UNIQUE(ad_cluster_id, age_group, gender)
);
CREATE TABLE ad_cluster_region_impression_results (
  ad_cluster_id bigint,
  region character varying,
  min_spend_sum decimal(10, 2),
  max_spend_sum decimal(10, 2),
  min_impressions_sum bigint,
  max_impressions_sum bigint,
  CONSTRAINT ad_cluster_id_fk FOREIGN KEY (ad_cluster_id) REFERENCES ad_cluster_metadata (ad_cluster_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_ad_cluster_region_results UNIQUE(ad_cluster_id, region)
);
CREATE TABLE ad_cluster_types (
  ad_cluster_id bigint,
  ad_type character varying,
  CONSTRAINT ad_cluster_id_fk FOREIGN KEY (ad_cluster_id) REFERENCES ad_cluster_metadata (ad_cluster_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_ad_cluster_id_per_ad_type UNIQUE(ad_cluster_id, ad_type)
);
CREATE TABLE ad_cluster_recognized_entities (
  ad_cluster_id bigint,
  entity_id bigint NOT NULL,
  CONSTRAINT ad_cluster_id_fk FOREIGN KEY (ad_cluster_id) REFERENCES ad_cluster_metadata (ad_cluster_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT entity_id_fk FOREIGN KEY (entity_id) REFERENCES recognized_entities (entity_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_ad_cluster_id_per_recoginized_entity UNIQUE(ad_cluster_id, entity_id)
);
CREATE TABLE recognized_entities (
  entity_id bigserial PRIMARY KEY,
  entity_name character varying NOT NULL,
  entity_type character varying NOT NULL,
  CONSTRAINT unique_name_and_type UNIQUE(entity_name, entity_type)
);
CREATE TABLE ad_creative_to_recognized_entities (
  ad_creative_id bigint NOT NULL,
  entity_id bigint NOT NULL,
  CONSTRAINT ad_creative_id_fk FOREIGN KEY (ad_creative_id) REFERENCES ad_creatives (ad_creative_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT entity_id_fk FOREIGN KEY (entity_id) REFERENCES recognized_entities (entity_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_ad_creative_id_and_entity_id UNIQUE(ad_creative_id, entity_id)
);
CREATE TABLE topics (
  topic_id bigserial PRIMARY_KEY,
  topic_name character varying NOT NULL UNIQUE
);
-- Add sentinel 'Uncategorized' value used for uncategorized ads;
INSERT INTO topics (topic_id, topic_name) VALUES (0, 'Uncategorized');

CREATE TABLE ad_topics (
  archive_id bigint NOT NULL,
  topic_id bigint NOT NULL,
  CONSTRAINT archive_id_fk FOREIGN KEY (archive_id) REFERENCES ads (archive_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT topic_id_fk FOREIGN KEY (topic_id) REFERENCES topics (topic_id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY (archive_id, topic_id)
);
CREATE TABLE ad_ids (
  ad_id bigint PRIMARY KEY,
  archive_id bigint NOT NULL,
  CONSTRAINT unique_ad_id_archive_id UNIQUE(ad_id, archive_id)
);


-- Indices to increase ad_screener_backend performance
CREATE INDEX ad_clusters_ad_cluster_id_idx ON public.ad_clusters USING btree (ad_cluster_id);
CREATE INDEX ad_clusters_archive_id_idx ON public.ad_clusters USING btree (archive_id);
CREATE INDEX ad_cluster_metadata_min_ad_creation_time_idx ON public.ad_cluster_metadata USING btree (min_ad_creation_time);
CREATE INDEX ad_cluster_metadata_max_ad_creation_time_idx ON public.ad_cluster_metadata USING btree (max_ad_creation_time);
CREATE INDEX ad_cluster_metadata_min_ad_delivery_start_time_idx ON public.ad_cluster_metadata USING btree (min_ad_delivery_start_time);
CREATE INDEX ad_cluster_metadata_max_last_active_date_idx ON public.ad_cluster_metadata USING btree (max_last_active_date);
CREATE INDEX ad_cluster_pages_ad_cluster_id_idx ON public.ad_cluster_pages USING btree (ad_cluster_id);
CREATE INDEX ad_cluster_pages_page_id_idx ON public.ad_cluster_pages USING btree (page_id);
CREATE INDEX ad_topics_topic_id ON public.ad_topics USING btree (topic_id);
CREATE INDEX ad_topics_archive_id ON public.ad_topics USING btree (archive_id);
CREATE INDEX ad_cluster_topics_ad_cluster_id_idx ON public.ad_cluster_topics USING btree (ad_cluster_id);
CREATE INDEX ads_ads_creation_time_idx ON public.ads USING btree (ad_creation_time);
CREATE INDEX ads_ad_delivery_start_time_idx ON public.ads USING btree (ad_delivery_start_time);
CREATE INDEX ads_page_id_idx ON public.ads USING btree (page_id);
CREATE INDEX impressions_last_active_date_idx ON public.impressions USING btree(last_active_date);
CREATE INDEX region_impression_results_archive_id_idx ON public.region_impression_results USING btree(archive_id);
CREATE INDEX region_impression_results_region_idx ON public.region_impression_results USING btree(region);
-- Indices to increase last_modified_time lookup for sync
CREATE INDEX ads_last_modified_time_idx ON public.ads USING btree (last_modified_time);
CREATE INDEX impressions_last_modified_time_idx ON public.impressions USING btree(last_modified_time);
CREATE INDEX region_impressions_last_modified_time_idx ON public.region_impressions USING btree(last_modified_time);
CREATE INDEX demo_impressions_last_modified_time_idx ON public.demo_impressions USING btree(last_modified_time);

-- ad library report tables
create table ad_library_reports (
  ad_library_report_id serial PRIMARY KEY,
  report_date date,
  kind text,
  csv_fn text,
  zip_url text,
  loaded boolean default false,
  geography text,
  CONSTRAINT unique_report_date_kind_geography UNIQUE(report_date, kind, geography)
);
create table ad_library_report_pages (ad_library_report_page_id serial primary key, ad_library_report_id int, page_id bigint, disclaimer text, amount_spent int, ads_count int, manual_correction_amount_spent int);
CREATE INDEX ad_library_reports_ad_library_report_id_idx ON public.ad_library_reports USING btree (ad_library_report_id);
CREATE INDEX ad_library_report_pages_ad_library_report_id_idx ON public.ad_library_report_pages USING btree (ad_library_report_id);
CREATE INDEX ad_library_report_pages_disclaimer_page_id_idx ON public.ad_library_report_pages USING btree (page_id, disclaimer);
CREATE INDEX ad_library_report_pages_page_id_idx ON public.ad_library_report_pages USING btree (page_id);

-- race data tables
CREATE TABLE races (race_id varchar(4), state text,  office text);
CREATE INDEX races_race_id_idx on races (race_id);
CREATE INDEX races_state_idx on races (state);
CREATE TABLE race_pages (race_id varchar(4), page_id bigint);
CREATE INDEX race_pages_race_id_idx on race_pages (race_id);

-- population data for calculating per-capita spend and impressions
-- the data is loaded from a CSV (taken from Wikipedia) by Jeremy on ccs1.
create table region_populations (region text, population int);


-- MATERIALIZED VIEWs and INDEXES for ad_observatory API
CREATE OR REPLACE FUNCTION array_distinct(anyarray) RETURNS anyarray AS $f$
  SELECT array_agg(DISTINCT x) FROM unnest($1) t(x);
$f$ LANGUAGE SQL IMMUTABLE;

CREATE MATERIALIZED VIEW IF NOT EXISTS page_spend_by_region_ad_library_yesterday_reports AS
  SELECT report_date, page_name, page_owner, page_metadata.page_id, disclaimer, geography, sum(COALESCE(manual_correction_amount_spent, amount_spent)) AS amount_spent
  FROM ad_library_reports JOIN ad_library_report_pages USING(ad_library_report_id)
  JOIN page_metadata USING(page_id) JOIN pages ON page_metadata.page_owner = pages.page_id
  WHERE COALESCE(manual_correction_amount_spent, amount_spent) > 0 AND kind = 'yesterday'
  GROUP BY report_date, geography, page_owner, page_name, page_metadata.page_id, disclaimer;

CREATE INDEX IF NOT EXISTS page_spend_by_region_ad_library_yesterday_reports_geography_idx ON public.page_spend_by_region_ad_library_yesterday_reports USING btree (geography);
CREATE INDEX IF NOT EXISTS page_spend_by_region_ad_library_yesterday_reports_report_date_idx ON public.page_spend_by_region_ad_library_yesterday_reports USING btree (report_date);
CREATE INDEX IF NOT EXISTS page_spend_by_region_ad_library_yesterday_reports_page_owner_idx ON public.page_spend_by_region_ad_library_yesterday_reports USING btree (page_owner);

CREATE MATERIALIZED VIEW IF NOT EXISTS raw_page_spend_by_region_ad_library_yesterday_reports AS
  SELECT report_date, page_name, page_id, disclaimer, geography, sum(COALESCE(manual_correction_amount_spent, amount_spent)) AS amount_spent
  FROM ad_library_reports JOIN ad_library_report_pages USING(ad_library_report_id)
  JOIN pages USING(page_id)
  WHERE COALESCE(manual_correction_amount_spent, amount_spent) > 0 AND kind = 'yesterday'
  GROUP BY report_date, geography, page_id, page_name, disclaimer;

CREATE INDEX IF NOT EXISTS raw_page_spend_by_region_ad_library_yesterday_reports_geography_idx ON public.raw_page_spend_by_region_ad_library_yesterday_reports USING btree (geography);
CREATE INDEX IF NOT EXISTS raw_page_spend_by_region_ad_library_yesterday_reports_report_date_idx ON public.raw_page_spend_by_region_ad_library_yesterday_reports USING btree (report_date);
CREATE INDEX IF NOT EXISTS raw_page_spend_by_region_ad_library_yesterday_reports_page_id_idx ON public.raw_page_spend_by_region_ad_library_yesterday_reports USING btree (page_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS page_spend_by_region_us_ad_library_lifelong_reports AS
  SELECT report_date, page_name, page_owner, array_agg(DISTINCT page_metadata.page_id) AS page_ids, array_agg(DISTINCT disclaimer) AS disclaimers, geography,
  sum(COALESCE(manual_correction_amount_spent, amount_spent)) AS amount_spent
  FROM ad_library_reports JOIN ad_library_report_pages USING(ad_library_report_id)
  JOIN page_metadata USING(page_id) JOIN pages ON page_metadata.page_owner = pages.page_id
  WHERE COALESCE(manual_correction_amount_spent, amount_spent) > 0 AND kind = 'lifelong' AND geography = 'US'
  GROUP BY report_date, geography, page_owner, page_name;

CREATE INDEX IF NOT EXISTS page_spend_by_region_us_ad_library_lifelong_reports_geography_idx ON public.page_spend_by_region_us_ad_library_lifelong_reports USING btree (geography);
CREATE INDEX IF NOT EXISTS page_spend_by_region_us_ad_library_lifelong_reports_report_date_idx ON public.page_spend_by_region_us_ad_library_lifelong_reports USING btree (report_date);
CREATE INDEX IF NOT EXISTS page_spend_by_region_us_ad_library_lifelong_reports_page_owner_idx ON public.page_spend_by_region_us_ad_library_lifelong_reports USING btree (page_owner);

CREATE MATERIALIZED VIEW IF NOT EXISTS raw_page_spend_by_region_us_ad_library_lifelong_reports AS
  SELECT report_date, page_name, page_id, array_agg(DISTINCT disclaimer) AS disclaimers, geography, sum(COALESCE(manual_correction_amount_spent, amount_spent)) AS amount_spent
  FROM ad_library_reports JOIN ad_library_report_pages USING(ad_library_report_id)
  JOIN pages USING(page_id)
  WHERE COALESCE(manual_correction_amount_spent, amount_spent) > 0 AND kind = 'lifelong' AND geography = 'US'
  GROUP BY report_date, geography, page_id, page_name;

CREATE INDEX IF NOT EXISTS raw_page_spend_by_region_us_ad_library_lifelong_reports_geography_idx ON public.raw_page_spend_by_region_us_ad_library_lifelong_reports USING btree (geography);
CREATE INDEX IF NOT EXISTS raw_page_spend_by_region_us_ad_library_lifelong_reports_report_date_idx ON public.raw_page_spend_by_region_us_ad_library_lifelong_reports USING btree (report_date);
CREATE INDEX IF NOT EXISTS raw_page_spend_by_region_us_ad_library_lifelong_reports_page_id_idx ON public.raw_page_spend_by_region_us_ad_library_lifelong_reports USING btree (page_id);

--  CREATE MATERIALIZED VIEW IF NOT EXISTS page_spend_in_region_us_ad_library_lifelong_reports_daily_delta AS
  --  SELECT report_date, page_name, page_owner, page_id, disclaimer, amount_spent_delta AS amount_spent FROM (
    --  SELECT report_date, page_name, page_owner, page_metadata.page_id, disclaimer,
    --  COALESCE(manual_correction_amount_spent, amount_spent) - lag(COALESCE(manual_correction_amount_spent, amount_spent)) OVER page_and_geography_sorted_by_report_date AS amount_spent_delta
    --  FROM ad_library_reports JOIN ad_library_report_pages USING(ad_library_report_id)
    --  JOIN page_metadata USING(page_id) JOIN pages ON page_metadata.page_owner = pages.page_id
    --  WHERE kind = 'lifelong' AND page_owner != 0 AND geography = 'US'
    --  WINDOW page_and_geography_sorted_by_report_date AS (
      --  PARTITION BY page_owner, page_name, page_metadata.page_id, disclaimer ORDER BY report_date)
  --  ) AS page_spend_by_region_daily_deltas WHERE amount_spent_delta > 0;

--  CREATE INDEX IF NOT EXISTS page_spend_in_region_us_ad_library_lifelong_reports_daily_delta_report_date_idx ON public.page_spend_in_region_us_ad_library_lifelong_reports_daily_delta USING btree (report_date);
--  CREATE INDEX IF NOT EXISTS page_spend_in_region_us_ad_library_lifelong_reports_daily_delta_page_owner_idx ON public.page_spend_in_region_us_ad_library_lifelong_reports_daily_delta USING btree (page_owner);

--  CREATE MATERIALIZED VIEW IF NOT EXISTS raw_page_spend_in_region_us_ad_library_lifelong_reports_daily_delta AS
  --  SELECT report_date, page_name, page_id, disclaimer, amount_spent_delta AS amount_spent FROM (
    --  SELECT report_date, page_name, page_id, disclaimer,
    --  COALESCE(manual_correction_amount_spent, amount_spent) - lag(COALESCE(manual_correction_amount_spent, amount_spent)) OVER page_and_geography_sorted_by_report_date AS amount_spent_delta
    --  FROM ad_library_reports JOIN ad_library_report_pages USING(ad_library_report_id)
    --  JOIN pages USING(page_id)
    --  WHERE kind = 'lifelong' AND page_id != 0 AND geography = 'US'
    --  WINDOW page_and_geography_sorted_by_report_date AS (
      --  PARTITION BY page_id, page_name, disclaimer ORDER BY report_date)
  --  ) AS page_spend_by_region_daily_deltas WHERE amount_spent_delta > 0;

--  CREATE INDEX IF NOT EXISTS raw_page_spend_in_region_us_ad_library_lifelong_reports_daily_delta_report_date_idx ON public.raw_page_spend_in_region_us_ad_library_lifelong_reports_daily_delta USING btree (report_date);
--  CREATE INDEX IF NOT EXISTS raw_page_spend_in_region_us_ad_library_lifelong_reports_daily_delta_page_id_idx ON public.raw_page_spend_in_region_us_ad_library_lifelong_reports_daily_delta USING btree (page_id);


CREATE MATERIALIZED VIEW IF NOT EXISTS page_spend_by_region_ad_library_last_7_days_reports AS
  SELECT report_date, page_name, page_owner, page_metadata.page_id, disclaimer, geography, sum(COALESCE(manual_correction_amount_spent, amount_spent)) AS amount_spent
  FROM ad_library_reports JOIN ad_library_report_pages USING(ad_library_report_id)
  JOIN page_metadata USING(page_id) JOIN pages ON page_metadata.page_owner = pages.page_id
  WHERE COALESCE(manual_correction_amount_spent, amount_spent) > 0 AND kind = 'last_7_days'
  GROUP BY report_date, geography, page_owner, page_name, page_metadata.page_id, disclaimer;

CREATE INDEX IF NOT EXISTS page_spend_by_region_7_day_reports_geography_idx ON public.page_spend_by_region_ad_library_last_7_days_reports USING btree (geography);
CREATE INDEX IF NOT EXISTS page_spend_by_region_7_day_reports_report_date_idx ON public.page_spend_by_region_ad_library_last_7_days_reports USING btree (report_date);
CREATE INDEX IF NOT EXISTS page_spend_by_region_7_day_reports_page_owner_idx ON public.page_spend_by_region_ad_library_last_7_days_reports USING btree (page_owner);

CREATE MATERIALIZED VIEW IF NOT EXISTS spend_for_topics_in_region AS
  SELECT region, sum(region_impression_results.spend_estimate) AS region_impression_results_spend_estimate,
  sum((region_impression_results.min_spend + region_impression_results.max_spend)/2) AS region_impression_results_midpoint_spend,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date, topic_id
  FROM ads JOIN impressions USING(archive_id) JOIN ad_topics USING(archive_id) JOIN region_impression_results USING(archive_id)
  GROUP BY region, ad_delivery_start_time, last_active_date, topic_id;

CREATE INDEX IF NOT EXISTS spend_for_topics_in_region_region_idx ON public.spend_for_topics_in_region USING btree (region);

CREATE MATERIALIZED VIEW IF NOT EXISTS spend_for_topics_in_region_us AS
  SELECT sum(spend_estimate) AS spend_estimate,
  sum((min_spend + max_spend)/2) AS midpoint_spend,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date, topic_id
  FROM ads JOIN impressions USING(archive_id) JOIN ad_topics USING(archive_id)
  GROUP BY ad_delivery_start_time, last_active_date, topic_id;

CREATE MATERIALIZED VIEW IF NOT EXISTS total_spend_by_type_in_region AS
  SELECT region, sum(region_impression_results.spend_estimate) AS region_impression_results_spend_estimate,
  sum((region_impression_results.min_spend + region_impression_results.max_spend)/2) AS region_impression_results_midpoint_spend,
  ad_type,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date
  FROM ads JOIN ad_metadata USING(archive_id) JOIN impressions USING (archive_id) JOIN region_impression_results USING (archive_id)
  GROUP BY region, ad_delivery_start_time, last_active_date, ad_type;

CREATE INDEX IF NOT EXISTS total_spend_by_type_in_region_region_idx ON public.total_spend_by_type_in_region USING btree (region);

CREATE MATERIALIZED VIEW IF NOT EXISTS total_spend_by_type_in_region_us AS
  SELECT sum(spend_estimate) AS spend_estimate,
  sum((min_spend + max_spend)/2) AS midpoint_spend,
  ad_type,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date
  FROM ads JOIN ad_metadata USING(archive_id) JOIN impressions USING (archive_id)
  GROUP BY ad_delivery_start_time, last_active_date, ad_type;

CREATE MATERIALIZED VIEW IF NOT EXISTS total_spend_by_page_of_type_in_region AS
  SELECT region, sum(region_impression_results.spend_estimate) AS region_impression_results_spend_estimate,
  sum((region_impression_results.min_spend + region_impression_results.max_spend)/2) AS region_impression_results_midpoint_spend,
  ad_type, page_owner,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date
  FROM ads JOIN ad_metadata USING(archive_id) JOIN impressions USING (archive_id) JOIN region_impression_results USING (archive_id) JOIN page_metadata USING (page_id)
  GROUP BY region, ad_delivery_start_time, last_active_date, ad_type, page_owner;

CREATE INDEX IF NOT EXISTS total_spend_by_page_of_type_in_region_region_idx ON public.total_spend_by_page_of_type_in_region USING btree (region);
CREATE INDEX IF NOT EXISTS total_spend_by_page_of_type_in_region_page_owner_idx ON public.total_spend_by_page_of_type_in_region USING btree (page_owner);

CREATE MATERIALIZED VIEW IF NOT EXISTS total_spend_by_page_of_type_in_region_us AS
  SELECT sum(spend_estimate) AS spend_estimate,
  sum((min_spend + max_spend)/2) AS midpoint_spend,
  ad_type, page_owner,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date
  FROM ads JOIN ad_metadata USING(archive_id) JOIN impressions USING (archive_id) JOIN page_metadata USING (page_id)
  GROUP BY ad_delivery_start_time, last_active_date, ad_type, page_owner;

CREATE INDEX IF NOT EXISTS total_spend_by_page_of_type_in_region_us_page_owner_idx ON public.total_spend_by_page_of_type_in_region_us USING btree (page_owner);

CREATE MATERIALIZED VIEW IF NOT EXISTS total_page_spend_by_type AS
  SELECT sum(spend_estimate) AS spend_estimate,
  sum((min_spend + max_spend)/2) AS midpoint_spend,
  ad_type,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date, page_owner
  FROM ads JOIN ad_metadata USING(archive_id) JOIN impressions USING (archive_id) JOIN page_metadata USING(page_id) JOIN pages ON page_metadata.page_owner = pages.page_id
  GROUP BY page_owner, ad_delivery_start_time, last_active_date, ad_type;

CREATE INDEX IF NOT EXISTS total_page_spend_by_type_page_owner_idx ON public.total_page_spend_by_type USING btree(page_owner);
CREATE INDEX IF NOT EXISTS total_page_spend_by_type_ad_delivery_start_time_idx ON public.total_page_spend_by_type USING btree(ad_delivery_start_time);
CREATE INDEX IF NOT EXISTS total_page_spend_by_type_last_active_date_idx ON public.total_page_spend_by_type USING btree(last_active_date);

CREATE MATERIALIZED VIEW IF NOT EXISTS total_spend_by_page_of_topic AS
  SELECT sum(spend_estimate) AS spend_estimate, sum((min_spend+max_spend)/2) AS midpoint_spend,
  topic_name,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date, page_owner
  FROM impressions JOIN ads USING(archive_id)
  JOIN ad_topics USING(archive_id)
  JOIN topics USING(topic_id)
  JOIN page_metadata USING(page_id)
  GROUP BY topic_name, ad_delivery_start_time, last_active_date, page_owner;

CREATE INDEX IF NOT EXISTS total_spend_by_page_of_topic_page_owner_idx ON public.total_spend_by_page_of_topic USING btree(page_owner);

CREATE MATERIALIZED VIEW IF NOT EXISTS total_spend_of_topic_in_region AS
  SELECT region, sum(region_impression_results.spend_estimate) AS region_impression_results_spend_estimate,
  sum((region_impression_results.min_spend + region_impression_results.max_spend)/2) AS region_impression_results_midpoint_spend,
  topic_id,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date,
  COALESCE(sum(region_impression_results.spend_estimate), sum((region_impression_results.min_spend + region_impression_results.max_spend)/2))/(GREATEST(ad_delivery_start_time, last_active_date) - LEAST(ad_delivery_start_time, last_active_date) + 1) as spend_per_day
  FROM ads
  JOIN impressions USING (archive_id)
  JOIN ad_topics USING (archive_id)
  JOIN region_impression_results USING (archive_id)
  GROUP BY topic_id, region, ad_delivery_start_time, last_active_date;

CREATE INDEX IF NOT EXISTS total_spend_of_topic_in_region_region_idx ON public.total_spend_of_topic_in_region USING btree (region);

CREATE MATERIALIZED VIEW IF NOT EXISTS total_spend_of_topic_in_region_us AS
  SELECT sum(spend_estimate) AS spend_estimate, sum((min_spend+max_spend)/2) AS midpoint_spend,
  topic_id,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date,
  COALESCE(sum(spend_estimate), sum((min_spend + max_spend)/2))/(GREATEST(ad_delivery_start_time, last_active_date) - LEAST(ad_delivery_start_time, last_active_date) + 1) as spend_per_day
  FROM ads
  JOIN impressions USING (archive_id)
  JOIN ad_topics USING (archive_id)
  GROUP BY topic_id, ad_delivery_start_time, last_active_date;
--

CREATE MATERIALIZED VIEW IF NOT EXISTS total_spend_by_page_of_topic_in_region AS
  SELECT region, sum(region_impression_results.spend_estimate) AS region_impression_results_spend_estimate,
  sum((region_impression_results.min_spend + region_impression_results.max_spend)/2) AS region_impression_results_midpoint_spend,
  topic_id, topic_name,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date, page_owner, page_name,
  COALESCE(sum(region_impression_results.spend_estimate), sum((region_impression_results.min_spend + region_impression_results.max_spend)/2))/(GREATEST(ad_delivery_start_time, last_active_date) - LEAST(ad_delivery_start_time, last_active_date) + 1) as spend_per_day
  FROM ads
  JOIN page_metadata USING (page_id)
  JOIN pages ON page_metadata.page_owner = pages.page_id
  JOIN impressions USING (archive_id)
  JOIN ad_topics USING (archive_id)
  JOIN topics USING (topic_id)
  JOIN region_impression_results USING (archive_id)
  GROUP BY topic_id, topic_name, region, page_owner, page_name, ad_delivery_start_time, last_active_date;

CREATE INDEX IF NOT EXISTS total_spend_by_page_of_topic_in_region_region_idx ON public.total_spend_by_page_of_topic_in_region USING btree (region);

CREATE MATERIALIZED VIEW IF NOT EXISTS total_spend_by_page_of_topic_in_region_us AS
  SELECT sum(spend_estimate) AS spend_estimate, sum((min_spend+max_spend)/2) AS midpoint_spend,
  topic_id, topic_name,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date, page_owner, page_name,
  COALESCE(sum(spend_estimate), sum((min_spend + max_spend)/2))/(GREATEST(ad_delivery_start_time, last_active_date) - LEAST(ad_delivery_start_time, last_active_date) + 1) as spend_per_day
  FROM ads
  JOIN page_metadata USING (page_id)
  JOIN pages ON page_metadata.page_owner = pages.page_id
  JOIN impressions USING (archive_id)
  JOIN ad_topics USING (archive_id)
  JOIN topics USING (topic_id)
  GROUP BY topic_id, topic_name, page_owner, page_name, ad_delivery_start_time, last_active_date;

CREATE MATERIALIZED VIEW IF NOT EXISTS targetings_for_region AS
  SELECT region, sum(region_impression_results.spend_estimate) as region_impression_results_spend_estimate,
  sum((region_impression_results.min_spend + region_impression_results.max_spend)/2) AS region_impression_results_midpoint_spend,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date,
  count(observations.ad_id) as ad_count,
  waist_ui_type AS category,
  CASE waist_ui_type
    WHEN 'ACTIONABLE_INSIGHTS' THEN jsonb_build_object('description', description)
    WHEN 'AGE_GENDER' THEN jsonb_build_object('age_min', age_min, 'age_max', age_max, 'gender', gender)
    WHEN 'BCT' THEN jsonb_build_object('name', name)
    WHEN 'CONNECTION' THEN jsonb_build_object('name', name)
    WHEN 'CUSTOM_AUDIENCES_DATAFILE' THEN jsonb_build_object('match_keys', dfca_data#>'{match_keys}', 'ca_owner_name', dfca_data#>'{ca_owner_name}')
    WHEN 'CUSTOM_AUDIENCES_LOOKALIKE' THEN jsonb_build_object('ca_owner_name', dfca_data#>'{ca_owner_name}')
    WHEN 'ED_STATUS' THEN jsonb_build_object('edu_status', edu_status)
    WHEN 'EDU_SCHOOLS' THEN array_to_json(school_names)::jsonb
    WHEN 'FRIENDS_OF_CONNECTION' THEN jsonb_build_object('name', name)
    WHEN 'INTERESTS' THEN interests
    WHEN 'LOCALE' THEN jsonb_build_object('locales', locales)
    WHEN 'LOCATION' THEN jsonb_build_object('location_name', location_name, 'location_type', location_type)
    WHEN 'RELATIONSHIP_STATUS' THEN jsonb_build_object('name', relationship_status)
    WHEN 'WORK_JOB_TITLES' THEN jsonb_build_object('name', job_title)
    WHEN 'WORK_EMPLOYERS' THEN jsonb_build_object('name', employer_name)
    WHEN 'COLLABORATIVE_AD' THEN jsonb_build_object('name', merchant_name)
    WHEN 'COLLABORATIVE_ADS_STORE_VISITS' THEN jsonb_build_object('name', merchant_name)
    WHEN 'COLLABORATIVE_ADS_STORE_SALES' THEN jsonb_build_object('name', merchant_name)
    ELSE NULL
  END AS subcategory_json,
  CASE waist_ui_type
    WHEN 'ACTIONABLE_INSIGHTS' THEN description
    WHEN 'AGE_GENDER' THEN concat(age_min, '-', age_max, ' ', gender)
    WHEN 'BCT' THEN name
    WHEN 'CONNECTION' THEN name
    WHEN 'CUSTOM_AUDIENCES_DATAFILE' THEN jsonb_build_object('match_keys', dfca_data#>'{match_keys}', 'ca_owner_name', dfca_data#>'{ca_owner_name}')#>>'{}'
    WHEN 'CUSTOM_AUDIENCES_LOOKALIKE' THEN dfca_data#>>'{ca_owner_name}'
    WHEN 'ED_STATUS' THEN edu_status
    WHEN 'EDU_SCHOOLS' THEN array_to_string(school_names, ',')
    WHEN 'FRIENDS_OF_CONNECTION' THEN name
    WHEN 'INTERESTS' THEN interests#>> '{}'
    WHEN 'LOCALE' THEN array_to_string(locales, ',', 'null')
    WHEN 'LOCATION' THEN concat(location_name, ' (', location_type, ')')
    WHEN 'RELATIONSHIP_STATUS' THEN relationship_status
    WHEN 'WORK_JOB_TITLES' THEN job_title
    WHEN 'WORK_EMPLOYERS' THEN employer_name
    WHEN 'COLLABORATIVE_AD' THEN merchant_name
    WHEN 'COLLABORATIVE_ADS_STORE_VISITS' THEN merchant_name
    WHEN 'COLLABORATIVE_ADS_STORE_SALES' THEN merchant_name      
    ELSE NULL
  END AS subcategory
  FROM ad_ids
  JOIN impressions USING (archive_id)
  JOIN region_impression_results USING (archive_id)
  JOIN ads USING(archive_id)
  JOIN observations.observations USING(ad_id)
  JOIN observations.targetings USING(ad_id)
  GROUP BY region, ad_delivery_start_time, last_active_date, waist_ui_type, subcategory, subcategory_json;

CREATE INDEX IF NOT EXISTS targetings_for_region_region_idx ON public.targetings_for_region USING btree(region);

CREATE MATERIALIZED VIEW IF NOT EXISTS targetings_for_region_us AS
  SELECT sum(spend_estimate) AS spend_estimate, sum((min_spend+max_spend)/2) AS midpoint_spend,
  LEAST(ad_delivery_start_time, last_active_date) AS ad_delivery_start_time,
  GREATEST(ad_delivery_start_time, last_active_date) AS last_active_date,
  count(observations.ad_id) as ad_count,
  waist_ui_type AS category,
  CASE waist_ui_type
    WHEN 'ACTIONABLE_INSIGHTS' THEN jsonb_build_object('description', description)
    WHEN 'AGE_GENDER' THEN jsonb_build_object('age_min', age_min, 'age_max', age_max, 'gender', gender)
    WHEN 'BCT' THEN jsonb_build_object('name', name)
    WHEN 'CONNECTION' THEN jsonb_build_object('name', name)
    WHEN 'CUSTOM_AUDIENCES_DATAFILE' THEN jsonb_build_object('match_keys', dfca_data#>'{match_keys}', 'ca_owner_name', dfca_data#>'{ca_owner_name}')
    WHEN 'CUSTOM_AUDIENCES_LOOKALIKE' THEN jsonb_build_object('ca_owner_name', dfca_data#>'{ca_owner_name}')
    WHEN 'ED_STATUS' THEN jsonb_build_object('edu_status', edu_status)
    WHEN 'EDU_SCHOOLS' THEN array_to_json(school_names)::jsonb
    WHEN 'FRIENDS_OF_CONNECTION' THEN jsonb_build_object('name', name)
    WHEN 'INTERESTS' THEN interests
    WHEN 'LOCALE' THEN jsonb_build_object('locales', locales)
    WHEN 'LOCATION' THEN jsonb_build_object('location_name', location_name, 'location_type', location_type)
    WHEN 'RELATIONSHIP_STATUS' THEN jsonb_build_object('name', relationship_status)
    WHEN 'WORK_JOB_TITLES' THEN jsonb_build_object('name', job_title)
    WHEN 'WORK_EMPLOYERS' THEN jsonb_build_object('name', employer_name)
    WHEN 'COLLABORATIVE_AD' THEN jsonb_build_object('name', merchant_name)
    WHEN 'COLLABORATIVE_ADS_STORE_VISITS' THEN jsonb_build_object('name', merchant_name)
    WHEN 'COLLABORATIVE_ADS_STORE_SALES' THEN jsonb_build_object('name', merchant_name)
    ELSE NULL
  END AS subcategory_json,
  CASE waist_ui_type
    WHEN 'ACTIONABLE_INSIGHTS' THEN description
    WHEN 'AGE_GENDER' THEN concat(age_min, '-', age_max, ' ', gender)
    WHEN 'BCT' THEN name
    WHEN 'CONNECTION' THEN name
    WHEN 'CUSTOM_AUDIENCES_DATAFILE' THEN jsonb_build_object('match_keys', dfca_data#>'{match_keys}', 'ca_owner_name', dfca_data#>'{ca_owner_name}')#>>'{}'
    WHEN 'CUSTOM_AUDIENCES_LOOKALIKE' THEN dfca_data#>>'{ca_owner_name}'
    WHEN 'ED_STATUS' THEN edu_status
    WHEN 'EDU_SCHOOLS' THEN array_to_string(school_names, ',')
    WHEN 'FRIENDS_OF_CONNECTION' THEN name
    WHEN 'INTERESTS' THEN interests#>> '{}'
    WHEN 'LOCALE' THEN array_to_string(locales, ',', 'null')
    WHEN 'LOCATION' THEN concat(location_name, ' (', location_type, ')')
    WHEN 'RELATIONSHIP_STATUS' THEN relationship_status
    WHEN 'WORK_JOB_TITLES' THEN job_title
    WHEN 'WORK_EMPLOYERS' THEN employer_name
    WHEN 'COLLABORATIVE_AD' THEN merchant_name
    WHEN 'COLLABORATIVE_ADS_STORE_VISITS' THEN merchant_name
    WHEN 'COLLABORATIVE_ADS_STORE_SALES' THEN merchant_name      
    ELSE NULL
  END AS subcategory
  FROM ad_ids
  JOIN impressions USING (archive_id)
  JOIN ads USING(archive_id)
  JOIN observations.observations USING(ad_id)
  JOIN observations.targetings USING(ad_id)
  GROUP BY ad_delivery_start_time, last_active_date, waist_ui_type, subcategory, subcategory_json;

CREATE MATERIALIZED VIEW IF NOT EXISTS targetings_for_page AS
  SELECT sum(spend_estimate) AS spend_estimate, sum(midpoint_spend) AS midpoint_spend,
  page_owner, COALESCE(archive_id_known_ads.page_id, observations_by_page.page_id) AS page_id,
  LEAST(min(ad_delivery_start_time), min(observations_by_page.last_active_date)) AS ad_delivery_start_time,
  GREATEST(max(archive_id_known_ads.last_active_date), max(observations_by_page.last_active_date)) AS last_active_date,
  category, subcategory, sum(ad_count) AS ad_count FROM
  (
    SELECT observations.ads.id AS ad_id, page_id, DATE(max(observations.observations.observed_at)) as last_active_date,
    count(observations.ad_id) as ad_count,
    waist_ui_type AS category,
    CASE waist_ui_type
      WHEN 'ACTIONABLE_INSIGHTS' THEN jsonb_build_object('description', description)
      WHEN 'AGE_GENDER' THEN jsonb_build_object('age_min', age_min, 'age_max', age_max, 'gender', gender)
      WHEN 'BCT' THEN jsonb_build_object('name', name)
      WHEN 'CONNECTION' THEN jsonb_build_object('name', name)
      WHEN 'CUSTOM_AUDIENCES_DATAFILE' THEN jsonb_build_object('match_keys', dfca_data#>'{match_keys}', 'ca_owner_name', dfca_data#>'{ca_owner_name}')
      WHEN 'CUSTOM_AUDIENCES_LOOKALIKE' THEN jsonb_build_object('ca_owner_name', dfca_data#>'{ca_owner_name}')
      WHEN 'ED_STATUS' THEN jsonb_build_object('edu_status', edu_status)
      WHEN 'EDU_SCHOOLS' THEN serialized_data
      WHEN 'FRIENDS_OF_CONNECTION' THEN jsonb_build_object('name', name)
      WHEN 'INTERESTS' THEN interests
      WHEN 'LOCALE' THEN jsonb_build_object('locales', locales)
      WHEN 'LOCATION' THEN jsonb_build_object('location_name', location_name, 'location_type', location_type)
      WHEN 'RELATIONSHIP_STATUS' THEN serialized_data
      WHEN 'WORK_JOB_TITLES' THEN serialized_data
      ELSE NULL
    END AS subcategory_json,
    CASE waist_ui_type
      WHEN 'ACTIONABLE_INSIGHTS' THEN description
      WHEN 'AGE_GENDER' THEN concat(age_min, '-', age_max, ' ', gender)
      WHEN 'BCT' THEN name
      WHEN 'CONNECTION' THEN name
      WHEN 'CUSTOM_AUDIENCES_DATAFILE' THEN jsonb_build_object('match_keys', dfca_data#>'{match_keys}', 'ca_owner_name', dfca_data#>'{ca_owner_name}')#>>'{}'
      WHEN 'CUSTOM_AUDIENCES_LOOKALIKE' THEN dfca_data#>>'{ca_owner_name}'
      WHEN 'ED_STATUS' THEN edu_status
      WHEN 'EDU_SCHOOLS' THEN serialized_data#>> '{}'
      WHEN 'FRIENDS_OF_CONNECTION' THEN name
      WHEN 'INTERESTS' THEN interests#>> '{}'
      WHEN 'LOCALE' THEN array_to_string(locales, ',', 'null')
      WHEN 'LOCATION' THEN concat(location_name, ' (', location_type, ')')
      WHEN 'RELATIONSHIP_STATUS' THEN serialized_data#>> '{}'
      WHEN 'WORK_JOB_TITLES' THEN serialized_data#>> '{}'
      ELSE NULL
    END AS subcategory
    FROM observations.ads
    JOIN observations.observations ON observations.ads.id = observations.observations.ad_id
    JOIN observations.targetings USING (ad_id)
    GROUP BY observations.ads.id, observations.ads.page_id, category, subcategory, subcategory_json) AS observations_by_page
  LEFT OUTER JOIN (
    SELECT ad_ids.ad_id, sum(spend_estimate) AS spend_estimate, sum(min_spend+max_spend)/2 AS midpoint_spend, page_id,
    LEAST(min(ad_delivery_start_time), min(last_active_date)) AS ad_delivery_start_time,
    GREATEST(max(ad_delivery_start_time), max(last_active_date)) AS last_active_date
    FROM ad_ids
    JOIN ads USING (archive_id)
    JOIN impressions USING (archive_id)
    GROUP BY ad_ids.ad_id, page_id
  ) AS archive_id_known_ads
  USING (ad_id, page_id)
  JOIN page_metadata USING(page_id)
  GROUP BY page_owner, archive_id_known_ads.page_id, observations_by_page.page_id, category, subcategory, subcategory_json;

CREATE INDEX IF NOT EXISTS targetings_for_page_page_owner_idx ON public.targetings_for_page USING btree(page_owner);

CREATE MATERIALIZED VIEW IF NOT EXISTS raw_targetings_for_page AS
  SELECT page_owner, page_id, observed_at, count(observations.ad_id) as ad_count,
    waist_ui_type AS category,
    CASE waist_ui_type
      WHEN 'ACTIONABLE_INSIGHTS' THEN jsonb_build_object('description', description)
      WHEN 'AGE_GENDER' THEN jsonb_build_object('age_min', age_min, 'age_max', age_max, 'gender', gender)
      WHEN 'BCT' THEN jsonb_build_object('name', name)
      WHEN 'CONNECTION' THEN jsonb_build_object('name', name)
      WHEN 'CUSTOM_AUDIENCES_DATAFILE' THEN jsonb_build_object('match_keys', dfca_data#>'{match_keys}', 'ca_owner_name', dfca_data#>'{ca_owner_name}')
      WHEN 'CUSTOM_AUDIENCES_LOOKALIKE' THEN jsonb_build_object('ca_owner_name', dfca_data#>'{ca_owner_name}')
      WHEN 'ED_STATUS' THEN jsonb_build_object('edu_status', edu_status)
      WHEN 'EDU_SCHOOLS' THEN serialized_data
      WHEN 'FRIENDS_OF_CONNECTION' THEN jsonb_build_object('name', name)
      WHEN 'INTERESTS' THEN interests
      WHEN 'LOCALE' THEN jsonb_build_object('locales', locales)
      WHEN 'LOCATION' THEN jsonb_build_object('location_name', location_name, 'location_type', location_type)
      WHEN 'RELATIONSHIP_STATUS' THEN serialized_data
      WHEN 'WORK_JOB_TITLES' THEN serialized_data
      ELSE NULL
    END AS subcategory_json,
    CASE waist_ui_type
      WHEN 'ACTIONABLE_INSIGHTS' THEN description
      WHEN 'AGE_GENDER' THEN concat(age_min, '-', age_max, ' ', gender)
      WHEN 'BCT' THEN name
      WHEN 'CONNECTION' THEN name
      WHEN 'CUSTOM_AUDIENCES_DATAFILE' THEN jsonb_build_object('match_keys', dfca_data#>'{match_keys}', 'ca_owner_name', dfca_data#>'{ca_owner_name}')#>>'{}'
      WHEN 'CUSTOM_AUDIENCES_LOOKALIKE' THEN dfca_data#>>'{ca_owner_name}'
      WHEN 'ED_STATUS' THEN edu_status
      WHEN 'EDU_SCHOOLS' THEN serialized_data#>> '{}'
      WHEN 'FRIENDS_OF_CONNECTION' THEN name
      WHEN 'INTERESTS' THEN interests#>> '{}'
      WHEN 'LOCALE' THEN array_to_string(locales, ',', 'null')
      WHEN 'LOCATION' THEN concat(location_name, ' (', location_type, ')')
      WHEN 'RELATIONSHIP_STATUS' THEN serialized_data#>> '{}'
      WHEN 'WORK_JOB_TITLES' THEN serialized_data#>> '{}'
      ELSE NULL
    END AS subcategory
    FROM observations.ads
    JOIN observations.observations ON observations.ads.id = observations.observations.ad_id
    JOIN observations.targetings USING (ad_id)
    LEFT OUTER JOIN page_metadata USING (page_id)
    GROUP BY observations.ads.id, page_id, category, subcategory, subcategory_json, page_owner, observed_at;

CREATE INDEX IF NOT EXISTS raw_targetings_for_page_page_owner_idx ON public.raw_targetings_for_page USING btree(page_owner);

CREATE MATERIALIZED VIEW IF NOT EXISTS owned_page_info AS
  SELECT page_owner, page_name, page_id, array_agg(DISTINCT disclaimer) AS disclaimers
  FROM ad_library_report_pages JOIN pages USING(page_id) JOIN page_metadata USING(page_id)
  GROUP BY page_owner, page_id, page_name;

CREATE INDEX IF NOT EXISTS owned_page_info_page_owner_idx ON public.owned_page_info USING btree(page_owner);

CREATE MATERIALIZED VIEW IF NOT EXISTS races_total_spend_estimate_more_than_2k_since_2020_07_01 AS
  SELECT race_id, GREATEST((current.amount_spent - COALESCE(previous.amount_spent, 0)), 0) as amount_spent
  FROM (SELECT race_id, sum(COALESCE(manual_correction_amount_spent, amount_spent)) AS amount_spent FROM ad_library_reports JOIN
    ad_library_report_pages USING(ad_library_report_id) JOIN race_pages
    USING(page_id) WHERE report_date = (SELECT max(report_date) FROM ad_library_reports WHERE geography = 'US' AND kind = 'lifelong')
    AND geography = 'US' AND kind = 'lifelong' GROUP BY race_id) AS current
  LEFT OUTER JOIN (SELECT race_id, sum(COALESCE(manual_correction_amount_spent, amount_spent)) as amount_spent FROM ad_library_reports
    JOIN ad_library_report_pages USING(ad_library_report_id) JOIN race_pages
    USING(page_id) WHERE report_date = '2020-07-01' AND geography = 'US' AND kind = 'lifelong'
    GROUP BY race_id) AS previous
  USING(race_id) WHERE GREATEST((current.amount_spent - COALESCE(previous.amount_spent, 0)), 0) > 2000;

CREATE INDEX IF NOT EXISTS races_total_spend_estimate_more_than_2k_since_2020_07_01_race_id_idx ON public.races_total_spend_estimate_more_than_2k_since_2020_07_01 USING btree(race_id);

CREATE MATERIALIZED VIEW ad_cluster_languages AS
  SELECT DISTINCT ad_cluster_id, ad_creative_body_language AS language FROM ad_clusters JOIN ad_creatives USING(archive_id);

CREATE INDEX IF NOT EXISTS ad_cluster_languages_language ON public.ad_cluster_languages USING btree(language);

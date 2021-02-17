CREATE TABLE users (
  id character varying(256) PRIMARY KEY,
  username character varying NOT NULL,
  session_expires_at integer,
  access_token character varying
);

CREATE TABLE api_keys (
  id serial PRIMARY KEY,
  api_key character varying(256) NOT NULL,
  name character varying NOT NULL,
  is_active boolean NOT NULL DEFAULT FALSE,
  CONSTRAINT unique_api_key UNIQUE(api_key)
);

CREATE TABLE is_this_ad_problematic_label_names (
  id serial PRIMARY KEY,
  name character varying NOT NULL,
  CONSTRAINT unique_is_this_ad_problematic_label_name UNIQUE(name)
);

INSERT INTO is_this_ad_problematic_label_names (id, name) VALUES (0, '(No Answer)'), (1, 'No'), (2, 'Misinformation'), (3, 'Scam'), (4, 'Miscategorized'), (5, 'Other');

CREATE TABLE ad_cluster_is_this_ad_problematic_labels (
  feedback_id bigserial PRIMARY KEY,
  user_id character varying(256) NOT NULL,
  ad_cluster_id bigint NOT NULL,
  label_id integer NOT NULL,
  CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT label_id_fk FOREIGN KEY (label_id) REFERENCES is_this_ad_problematic_label_names (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_user_id_ad_cluster_id UNIQUE(user_id, ad_cluster_id)
);

-- Table of an ad cluster's constituent archive IDs at the time feedback/label is submitted.
CREATE TABLE feedback_clusters (
  feedback_id bigint NOT NULL,
  archive_id bigint NOT NULL,
  CONSTRAINT feedback_id_fk FOREIGN KEY (feedback_id) REFERENCES ad_cluster_is_this_ad_problematic_labels (feedback_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE ad_cluster_user_topic_suggestions (
  feedback_id bigserial PRIMARY KEY,
  user_id character varying(256) NOT NULL,
  ad_cluster_id bigint NOT NULL,
  topic_name character varying NOT NULL,
  comments character varying,
  CONSTRAINT user_id_fk_topic_suggestion FOREIGN KEY (user_id) REFERENCES users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT unique_user_id_ad_cluster_id_topic_suggestion UNIQUE(user_id, ad_cluster_id, topic_name)
);

CREATE TABLE feedback_clusters_for_ad_cluster_user_topic_suggestions (
  feedback_id bigint NOT NULL,
  archive_id bigint NOT NULL,
  CONSTRAINT feedback_id_fk_topic_suggestion FOREIGN KEY (feedback_id) REFERENCES ad_cluster_user_topic_suggestions (feedback_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE user_suggested_topics (
  user_id character varying(256),
  topic_name character varying
);
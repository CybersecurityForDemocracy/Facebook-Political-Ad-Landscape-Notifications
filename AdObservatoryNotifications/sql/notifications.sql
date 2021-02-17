-- Table: public.notification_types

-- DROP TABLE public.notification_types;

CREATE TABLE public.notification_types
(
    type_name character varying COLLATE pg_catalog."default",
    type_id integer,
    fields json
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

-- Table: public.notifications

-- DROP TABLE public.notifications;

CREATE TABLE public.notifications
(
    email character varying COLLATE pg_catalog."default",
    page_id bigint,
    race character varying COLLATE pg_catalog."default",
    topic integer,
    region character varying COLLATE pg_catalog."default",
    count integer,
    type_id integer,
    time_window character varying COLLATE pg_catalog."default",
    fire_frequency character varying COLLATE pg_catalog."default"
    id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.notifications
    OWNER to nyufbpolads;

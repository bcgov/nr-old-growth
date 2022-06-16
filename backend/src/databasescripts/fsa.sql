--
-- ER/Studio Data Architect SQL Code Generation
-- Project :      FSA_OldGrowth.DM1
-- Author :       Maria Martinez
--
-- Date Created : Friday, May 06, 2022 16:31:29
-- Target DBMS : PostgreSQL 9.x
--

drop table if exists deferral_category;
drop table if exists natural_resource_dist;

drop table if exists subm_data_grid_dfr_cat_xref;
drop table if exists cutblock_submission_details;
drop table if exists attachment;
drop table if exists submission;
drop table if exists submission_log;
drop table if exists deferral_category_code;
drop table if exists natural_resource_dist_code;

-- 
-- TABLE: attachment
--

create table attachment(
    attachment_id     int4           not null,
    submission_id     int4           not null,
    create_timestamp  timestamp      default current_timestamp not null,
    update_timestamp  timestamp      default current_timestamp,
    create_user       varchar(60)    not null,
    update_user       varchar(60)
)
;


comment on column attachment.attachment_id is 'A sequential id assigned to an attachment.'
;
comment on column attachment.submission_id is 'Incremental id generated from a submission of the Old Growth Field Verification form.'
;
comment on column attachment.create_timestamp is 'The date and time the record was created.'
;
comment on column attachment.update_timestamp is 'The date and time the record was created or last updated.'
;
comment on column attachment.create_user is 'The user or proxy account that created the record.'
;
comment on column attachment.update_user is 'The user or proxy account that created or last updated the record.'
;
comment on table attachment is 'Professional rationale (Use the naming convention: Professional_Rationale_ForestFileID_CP), PDF map file (Use the naming convention: PDF_Map_file_ForestFileID_CP), Spatial file (accepted formats: SHAPE, KML, KMZ, GDB) (Use the naming convention: Spatialfile_ForestFileID_CP)'
;

-- 
-- TABLE: cutblock_submission_details
--

create table cutblock_submission_details(
    cutblock_submission_details_id  int4             not null,
    submission_id                   int4             not null,
    cut_block_id                    varchar(10)      not null,
    total_block_ha                  decimal(5, 2)    not null,
    ha_org_mapped_def_area          decimal(5, 2)    not null,
    ha_kept_org_mapping             decimal(5, 2),
    ha_added_org_mapping            decimal(5, 2),
    ha_deleted_org_mapping          decimal(5, 2),
    create_timestamp                timestamp        default current_timestamp not null,
    update_timestamp                timestamp        default current_timestamp,
    create_user                     varchar(60)      not null,
    update_user                     varchar(60)
)
;


comment on column cutblock_submission_details.cutblock_submission_details_id is 'Details about individual blocks in the submission. Also known as the data grid on the form.'
;
comment on column cutblock_submission_details.submission_id is 'Incremental id generated from a submission of the Old Growth Field Verification form'
;
comment on column cutblock_submission_details.cut_block_id is 'Identifier for a cut block of a harvesting tenure (within a cutting permit for tenures with cp''s).'
;
comment on column cutblock_submission_details.total_block_ha is 'Area of the total size of the block in hectares'
;
comment on column cutblock_submission_details.ha_org_mapped_def_area is 'Mapped refers to polygons identified as priority deferral areas in the operational (vector) mapping version of map 1 priority deferral areas.  Area is in hectares.'
;
comment on column cutblock_submission_details.ha_kept_org_mapping is 'Area of the unchanged portion for a specific cut block submission in hectares. Maintaining deferral or non-deferral status as mapped.'
;
comment on column cutblock_submission_details.ha_added_org_mapping is 'Area of the additional portion for a specific cut block submission in hectares'
;
comment on column cutblock_submission_details.ha_deleted_org_mapping is 'Area of the removed portion for a specific cutblock submission in hectares. areas that were mapped as deferrals but do not meet criteria.'
;
comment on column cutblock_submission_details.create_timestamp is 'The date and time the record was created.'
;
comment on column cutblock_submission_details.update_timestamp is 'The date and time the record was created or last updated.'
;
comment on column cutblock_submission_details.create_user is 'The user or proxy account that created the record.'
;
comment on column cutblock_submission_details.update_user is 'The user or proxy account that created or last updated the record.'
;

-- 
-- TABLE: deferral_category_code
--

create table deferral_category_code (
    deferral_category_code  varchar(5)      not null,
    description             varchar(100)    not null,
    effective_date          date            not null,
    expiry_date             date            default to_date('99991231','YYYYMMDD') not null,
    create_timestamp        timestamp       default current_timestamp not null,
    update_timestamp        timestamp       default current_timestamp,
    create_user             varchar(60)     not null,
    update_user             varchar(60)
)
;


comment on column deferral_category_code.deferral_category_code is 'Deferral category selects by the submitter. Multiple deferral categories are possible.'
;
comment on column deferral_category_code.description is 'The display quality description of the code value.'
;
comment on column deferral_category_code.effective_date is 'The date that the code value has become or is expected to become effective. Default is the data that the code value is created.'
;
comment on column deferral_category_code.expiry_date is 'The date on which the code value has expired or is expected to expire. Default 9999-12-31'
;
comment on column deferral_category_code.create_timestamp is 'The date and time the record was created.'
;
comment on column deferral_category_code.update_timestamp is 'The date and time the record was created or last updated.'
;
comment on column deferral_category_code.create_user is 'The user or proxy account that created the record.'
;
comment on column deferral_category_code.update_user is 'The user or proxy account that created or last updated the record.'
;
comment on table deferral_category_code is 'Deferral category selects by the submitter. Multiple deferral categories are possible.'
;

-- 
-- TABLE: natural_resource_dist_code
--

create table natural_resource_dist_code (
    natural_resource_dist_code  varchar(5)      not null,
    description                 varchar(100)    not null,
    email_address               varchar(100)    not null,
    effective_date              date            not null,
    expiry_date                 date            default to_date('99991231','YYYYMMDD') not null,
    create_timestamp            timestamp       default current_timestamp not null,
    update_timestamp            timestamp       default current_timestamp,
    create_user                 varchar(60)     not null,
    update_user                 varchar(60)
)
;


comment on column natural_resource_dist_code.natural_resource_dist_code is 'A code representing an administrative area established by the ministry, within natural resource regions.'
;
comment on column natural_resource_dist_code.description is 'The display quality description of the code value.'
;
comment on column natural_resource_dist_code.email_address is 'The email address provided as a generic email contact for a natural resource district.'
;
comment on column natural_resource_dist_code.effective_date is 'The date that the code value has become or is expected to become effective. Default is the data that the code value is created.'
;
comment on column natural_resource_dist_code.expiry_date is 'The date on which the code value has expired or is expected to expire. Default 9999-12-31'
;
comment on column natural_resource_dist_code.create_timestamp is 'The date and time the record was created.'
;
comment on column natural_resource_dist_code.update_timestamp is 'The date and time the record was created or last updated.'
;
comment on column natural_resource_dist_code.create_user is 'The user or proxy account that created the record.'
;
comment on column natural_resource_dist_code.update_user is 'The user or proxy account that created or last updated the record.'
;
comment on table natural_resource_dist_code is 'An administrative area established by the ministry, within natural resource regions'
;

-- 
-- TABLE: subm_data_grid_dfr_cat_xref
--

create table subm_data_grid_dfr_cat_xref(
    cutblock_submission_details_id  int4          not null,
    deferral_category_code          varchar(5)    not null
)
;


comment on column subm_data_grid_dfr_cat_xref.cutblock_submission_details_id is 'Details about individual blocks in the submission. Also known as the data grid on the form.'
;
comment on column subm_data_grid_dfr_cat_xref.deferral_category_code is 'Deferral category selects by the submitter. Multiple deferral categories are possible.'
;

-- 
-- TABLE: submission
--

create table submission(
    submission_id               int4            not null,
    submitter_id                int4            not null,
    licensee_name               varchar(100)    not null,
    first_name                  varchar(40)     not null,
    last_name                   varchar(100)    not null,
    phone_number                varchar(10)     not null,
    email_address               varchar(50)     not null,
    natural_resource_dist_code  varchar(5)      not null,
    forest_file_id              varchar(10),
    cutting_permit_id           varchar(3),
    submission_date             timestamp       not null,
    update_timestamp            timestamp       default current_timestamp,
    create_user                 varchar(60)     not null,
    update_user                 varchar(60)
)
;


comment on column submission.submission_id is 'Incremental id generated from a submission of the Old Growth Field Verification form'
;
comment on column submission.licensee_name is 'The name of the licensee, agreement holder, or bcts office.'
;
comment on column submission.first_name is 'First or given name for the individual submitting.'
;
comment on column submission.last_name is 'Last name, surname, or mononym for the individual doing the submission'
;
comment on column submission.phone_number is 'Ten digit phone number for the individual performing the submission'
;
comment on column submission.email_address is 'Submitters email address in the format: name@example.com mailto:name@example.com. A valid address contains a single @ and a suffix like .com, .ca, .net etc.'
;
comment on column submission.natural_resource_dist_code is 'A code representing an administrative area established by the ministry, within natural resource regions.'
;
comment on column submission.forest_file_id is 'File identification assigned to provincial forest use files. assigned file number. Usually the licence, tenure or private mark number. also know as forest file id.'
;
comment on column submission.cutting_permit_id is 'Identifier for a cutting permit associated with a quota type harvesting tenure. This can also include a timber sale licence  '
;
comment on column submission.submission_date is 'This is the date and time that the submission record was created. Also doubles as the create timestamp.'
;
comment on column submission.update_timestamp is 'The date and time the record was created or last updated.'
;
comment on column submission.create_user is 'The user or proxy account that created the record.'
;
comment on column submission.update_user is 'The user or proxy account that created or last updated the record.'
;
comment on table submission is 'A single submission for an old growth field observation.'
;

-- 
-- TABLE: attachment
--

alter table attachment add 
    constraint attachment_pk primary key (attachment_id)
;

-- 
-- TABLE: cutblock_submission_details
--

alter table cutblock_submission_details add 
    constraint submission_data_grid_pk primary key (cutblock_submission_details_id)
;

-- 
-- TABLE: deferral_category_code
--

alter table deferral_category_code add 
    constraint deferral_category_pk primary key (deferral_category_code)
;

-- 
-- TABLE: natural_resource_dist_code
--

alter table natural_resource_dist_code add 
    constraint natural_resource_dist_pk primary key (natural_resource_dist_code)
;

-- 
-- TABLE: subm_data_grid_dfr_cat_xref
--

alter table subm_data_grid_dfr_cat_xref add 
    constraint subm_data_grid_dfr_cat_xref_pk primary key (cutblock_submission_details_id, deferral_category_code)
;

-- 
-- TABLE: submission
--

alter table submission add 
    constraint submssion_id primary key (submission_id)
;

-- 
-- TABLE: attachment
--

alter table attachment add constraint attachment_submission 
    foreign key (submission_id)
    references submission(submission_id)
;

-- 
-- TABLE: cutblock_submission_details
--

alter table cutblock_submission_details add constraint submission_cut_block_xref_submission 
    foreign key (submission_id)
    references submission(submission_id)
;

-- 
-- TABLE: subm_data_grid_dfr_cat_xref
--

alter table subm_data_grid_dfr_cat_xref add constraint submission_cut_block_def_cat_xref_deferral_category 
    foreign key (deferral_category_code)
    references deferral_category_code(deferral_category_code)
;

alter table subm_data_grid_dfr_cat_xref add constraint submission_cut_block_def_cat_xref_submission_cut_block_xref 
    foreign key (cutblock_submission_details_id)
    references cutblock_submission_details(cutblock_submission_details_id)
;

-- 
-- TABLE: submission
--

alter table submission add constraint submission_natural_resource_dist 
    foreign key (natural_resource_dist_code)
    references natural_resource_dist_code(natural_resource_dist_code)
;

-- 
-- TABLE: submission_log
--

create table submission_log (
    submission_log_id     serial          not null,
    code                        varchar(10)     not null,
    exception_log               varchar(500)    null,
    confirmation_id             varchar(10)     null,
    form_id                     varchar(50)     null,
    form_version_id             varchar(50)     null,
    create_timestamp            timestamp       default current_timestamp not null
)
;

alter table submission_log add 
    constraint submission_log_id primary key (submission_log_id)
;

--
-- Insert statements to code tables
---

INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DMH', '100 Mile House Natural Resource District', 'FLNR.100MileHouseDistrict@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DCR', 'Campbell River Natural Resource District', 'FTA.DCR@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DCC', 'Cariboo-Chilcotin Natural Resource District', 'DCC.Tenures@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DCS', 'Cascades Natural Resource District', 'Forests.CascadesDistrictOffice@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DCK', 'Chilliwack Natural Resource District', 'FTA.DCKDSQ@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DKM', 'Coast Mountains Natural Resource District', 'DCM.Tenures@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DFN', 'Fort Nelson Natural Resource District', 'Forests.FortNelsonDistrictOffice@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DQC', 'Haida Gwaii Natural Resource District', 'FrontCounterHaidaGwaii@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DMK', 'Mackenzie Natural Resource District', 'Forests.MackenzieDistrictOffice@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DND', 'Nadina Natural Resource District', 'Forests.NadinaDistrictOffice@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DNI', 'North Island - Central Coast Natural Resource District', 'FTA.DIC@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DOS', 'Okanagan Shuswap Natural Resource District', 'DOS.CPRP@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DPC', 'Peace Natural Resource District', 'PeaceDistrict.Tenures@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DPG', 'Prince George Natural Resource District', 'Forests.PrinceGeorgeDistrictOffice@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DQU', 'Quesnel Natural Resource District', 'Forests.QuesnelDistrictOffice@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DRM', 'Rocky Mountain Natural Resource District', 'FORESTS.rockymountaindistrictoffice@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DSQ', 'Sea to Sky Natural Resource District', 'FTA.DCKDSQ@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DSE', 'Selkirk Natural Resource District', 'Resources.Nelson@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DSS', 'Skeena Stikine Natural Resource District', 'Forests.SkeenaStikineDistrictOffice@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DSI', 'South Island Natural Resource District', 'FTA.DSI@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DVA', 'Stuart Nechako Natural Resource District', 'dsn.submissions@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DSC', 'Sunshine Coast Natural Resource District', 'FTA.DSC@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
INSERT INTO NATURAL_RESOURCE_DIST_CODE (NATURAL_RESOURCE_DIST_CODE, DESCRIPTION, EMAIL_ADDRESS, EFFECTIVE_DATE, CREATE_USER) VALUES ('DKA', 'Thompson Rivers Natural Resource District', 'DTR.Tenures@gov.bc.ca', CURRENT_TIMESTAMP, 'mariamar');
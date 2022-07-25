-- 
-- TABLE: email_submision_log
--
drop table if exists email_submision_log;

drop table if exists email_submission_log;

create table email_submission_log(
    email_submission_log_id     serial          not null,
    code                        varchar(10)     not null,
    exception_log               varchar(500)    null,
    confirmation_id             varchar(10)     null,
    form_id                     varchar(50)     null,
    form_version_id             varchar(50)     null,
    create_timestamp            timestamp       default current_timestamp not null
)
;

alter table email_submission_log add 
    constraint email_submission_log_id primary key (email_submission_log_id)
;

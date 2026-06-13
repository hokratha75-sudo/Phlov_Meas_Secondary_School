#!/bin/bash
# ------------------------------------------------------------------------------
# Phlov Meas Secondary School - Rollback Procedures & Triggers
# ------------------------------------------------------------------------------
# WARNING: This removes all stored procedures, triggers, and the audit log!

DB_NAME=${DB_NAME:-"phlov_meas"}
DB_USER=${DB_USER:-"postgres"}

read -p "⚠️  Are you sure you want to drop all Phase 3 & 4 Triggers/Procedures from '$DB_NAME'? (y/N): " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Aborted."
    exit 0
fi

echo "Rolling back database logic..."

psql -U "$DB_USER" -d "$DB_NAME" -c "
-- 1. Drop Triggers
DROP TRIGGER IF EXISTS trg_audit_students ON students;
DROP TRIGGER IF EXISTS trg_audit_grades ON student_grades;
DROP TRIGGER IF EXISTS trg_audit_library ON library_logs;
DROP TRIGGER IF EXISTS trg_audit_leaves ON teacher_leaves;

DROP TRIGGER IF EXISTS trg_generate_student_code ON students;
DROP TRIGGER IF EXISTS trg_validate_score ON student_monthly_scores;
DROP TRIGGER IF EXISTS trg_prevent_duplicate_borrow ON library_logs;
DROP TRIGGER IF EXISTS trg_check_class_capacity ON students;
DROP TRIGGER IF EXISTS trg_check_student_age ON students;
DROP TRIGGER IF EXISTS trg_prevent_delete_student_with_books ON students;
DROP TRIGGER IF EXISTS trg_validate_leave_dates ON teacher_leaves;
DROP TRIGGER IF EXISTS trg_notify_grade_update ON student_monthly_scores;
DROP TRIGGER IF EXISTS trg_notify_leave_approved ON teacher_leaves;

-- 2. Drop Functions
DROP FUNCTION IF EXISTS fn_audit_trigger();
DROP FUNCTION IF EXISTS fn_generate_student_code();
DROP FUNCTION IF EXISTS fn_validate_score_range();
DROP FUNCTION IF EXISTS fn_prevent_duplicate_borrow();
DROP FUNCTION IF EXISTS fn_check_class_capacity();
DROP FUNCTION IF EXISTS fn_check_student_age();
DROP FUNCTION IF EXISTS fn_prevent_delete_student_with_books();
DROP FUNCTION IF EXISTS fn_validate_leave_dates();
DROP FUNCTION IF EXISTS fn_notify_grade_update();
DROP FUNCTION IF EXISTS fn_notify_leave_approved();

DROP FUNCTION IF EXISTS fn_calculate_gpa(INT, VARCHAR);
DROP FUNCTION IF EXISTS fn_generate_report_card(INT, VARCHAR);
DROP FUNCTION IF EXISTS fn_class_rank(INT, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS fn_attendance_report(INT, TEXT);
DROP FUNCTION IF EXISTS sp_check_absence_warnings();
DROP FUNCTION IF EXISTS fn_return_book(INT);
DROP FUNCTION IF EXISTS fn_overdue_books();
DROP FUNCTION IF EXISTS fn_annual_school_report(TEXT);
DROP FUNCTION IF EXISTS fn_get_site_settings();

-- 3. Drop Procedures
DROP PROCEDURE IF EXISTS sp_enroll_student(TEXT, TEXT, TEXT, TEXT, INT, TEXT, INT, DATE, TEXT, TEXT, TEXT);
DROP PROCEDURE IF EXISTS sp_promote_students(TEXT, TEXT, INT);
DROP PROCEDURE IF EXISTS sp_transfer_student(INT, TEXT, INT);
DROP PROCEDURE IF EXISTS sp_graduate_students();
DROP PROCEDURE IF EXISTS sp_import_monthly_scores(JSONB);
DROP PROCEDURE IF EXISTS sp_mark_class_attendance(INT, TEXT, TEXT, TEXT, TEXT, JSONB);
DROP PROCEDURE IF EXISTS sp_borrow_book(INT, TEXT, TEXT, TIMESTAMP);
DROP PROCEDURE IF EXISTS sp_submit_leave(INT, TEXT, INT, TEXT, TEXT, TEXT, TEXT);
DROP PROCEDURE IF EXISTS sp_approve_leave(INT, TEXT);
DROP PROCEDURE IF EXISTS sp_init_leave_balances(TEXT);
DROP PROCEDURE IF EXISTS sp_archive_old_records(INT, INT);

-- 4. Drop Tables
DROP TABLE IF EXISTS audit_log;
"

echo "✅ Rollback completed. (Note: The 'dob' column added to 'students' was NOT dropped to prevent data loss)."

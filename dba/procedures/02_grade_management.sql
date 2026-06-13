-- ============================================================================
-- 02. GRADE MANAGEMENT PROCEDURES
-- ============================================================================

-- Calculate GPA
CREATE OR REPLACE FUNCTION fn_calculate_gpa(p_student_id INT, p_academic_year VARCHAR(20)) RETURNS DECIMAL(5,2) LANGUAGE plpgsql AS $$
DECLARE v_gpa DECIMAL(5,2);
BEGIN
    SELECT COALESCE(AVG(score), 0) INTO v_gpa 
    FROM student_monthly_scores 
    WHERE student_id = p_student_id AND academic_year = p_academic_year;
    RETURN v_gpa;
END; $$;

-- Generate report card JSON
CREATE OR REPLACE FUNCTION fn_generate_report_card(p_student_id INT, p_academic_year VARCHAR(20)) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'student', (SELECT jsonb_build_object('name_kh', name_kh, 'grade', grade) FROM students WHERE id = p_student_id),
        'scores', COALESCE((SELECT jsonb_agg(jsonb_build_object('month', month, 'subject', subject, 'score', score)) FROM student_monthly_scores WHERE student_id = p_student_id AND academic_year = p_academic_year), '[]'::jsonb),
        'gpa', fn_calculate_gpa(p_student_id, p_academic_year)
    ) INTO v_result;
    RETURN v_result;
END; $$;

-- Import monthly scores (Batch Upsert)
CREATE OR REPLACE PROCEDURE sp_import_monthly_scores(p_data JSONB) LANGUAGE plpgsql AS $$
DECLARE item JSONB;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(p_data) LOOP
        INSERT INTO student_monthly_scores (student_id, class_id, academic_year, month, subject, score, created_at, updated_at)
        VALUES ((item->>'student_id')::INT, (item->>'class_id')::INT, item->>'academic_year', item->>'month', item->>'subject', (item->>'score')::NUMERIC, NOW(), NOW())
        ON CONFLICT (student_id, academic_year, month, subject) DO UPDATE SET score = EXCLUDED.score, updated_at = NOW();
    END LOOP;
END; $$;

-- Calculate class rank
CREATE OR REPLACE FUNCTION fn_class_rank(p_student_id INT, p_exam_period VARCHAR(50), p_academic_year VARCHAR(20)) RETURNS INT LANGUAGE plpgsql AS $$
DECLARE v_rank INT;
BEGIN
    WITH RankedGrades AS (
        SELECT student_id, RANK() OVER (PARTITION BY classroom_id ORDER BY total_score DESC) as calculated_rank
        FROM student_grades WHERE academic_year = p_academic_year AND exam_period = p_exam_period
    )
    SELECT calculated_rank INTO v_rank FROM RankedGrades WHERE student_id = p_student_id;
    RETURN COALESCE(v_rank, 0);
END; $$;

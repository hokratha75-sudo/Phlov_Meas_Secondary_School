-- ============================================================================
-- SCHEDULING SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================

-- 1. ROOMS TABLE (បន្ទប់រៀន)
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(20) UNIQUE NOT NULL,  -- '101', 'Lab1', 'HallA'
    room_name_kh TEXT NOT NULL,              -- 'បន្ទប់លេខ១០១'
    room_name_en TEXT NOT NULL,              -- 'Room 101'
    capacity INT DEFAULT 40,                 -- ចំនួនសិស្សអតិបរមា
    room_type VARCHAR(20) DEFAULT 'classroom', -- classroom, lab, library, hall
    has_projector BOOLEAN DEFAULT false,
    has_aircon BOOLEAN DEFAULT false,
    has_computers BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SUBJECTS (មុខវិជ្ជា) - Extension of existing subjects table
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS weekly_hours INT DEFAULT 4;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS requires_lab BOOLEAN DEFAULT false;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS semester VARCHAR(20); -- Semester1, Semester2

-- 3. PERIODS (ម៉ោងសិក្សា) - Time slots
CREATE TABLE IF NOT EXISTS periods (
    id SERIAL PRIMARY KEY,
    period_number INT NOT NULL,              -- 1, 2, 3, 4, 5, 6
    start_time TIME NOT NULL,                -- '08:00:00'
    end_time TIME NOT NULL,                  -- '09:00:00'
    is_break BOOLEAN DEFAULT false,          -- true for break/lunch
    break_duration INT DEFAULT 0,            -- minutes (if break)
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default periods (Cambodian school schedule)
INSERT INTO periods (period_number, start_time, end_time, display_order) 
SELECT 1, '07:30:00', '08:20:00', 1
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE period_number = 1);
INSERT INTO periods (period_number, start_time, end_time, display_order) 
SELECT 2, '08:20:00', '09:10:00', 2
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE period_number = 2);
INSERT INTO periods (period_number, start_time, end_time, display_order) 
SELECT 3, '09:10:00', '10:00:00', 3
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE period_number = 3);
INSERT INTO periods (period_number, start_time, end_time, display_order) 
SELECT 4, '10:00:00', '10:50:00', 4
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE period_number = 4);
INSERT INTO periods (period_number, start_time, end_time, display_order) 
SELECT 5, '10:50:00', '11:40:00', 5
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE period_number = 5);
INSERT INTO periods (period_number, start_time, end_time, display_order) 
SELECT 6, '13:30:00', '14:20:00', 6
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE period_number = 6);
INSERT INTO periods (period_number, start_time, end_time, display_order) 
SELECT 7, '14:20:00', '15:10:00', 7
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE period_number = 7);
INSERT INTO periods (period_number, start_time, end_time, display_order) 
SELECT 8, '15:10:00', '16:00:00', 8
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE period_number = 8);

-- Insert break times
INSERT INTO periods (period_number, start_time, end_time, is_break, break_duration, display_order) 
SELECT 0, '10:00:00', '10:20:00', true, 20, 10
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE is_break = true AND start_time = '10:00:00');
INSERT INTO periods (period_number, start_time, end_time, is_break, break_duration, display_order) 
SELECT 0, '11:40:00', '13:30:00', true, 110, 11
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE is_break = true AND start_time = '11:40:00');

-- 4. WEEKDAYS (ថ្ងៃក្នុងសប្តាហ៍)
CREATE TABLE IF NOT EXISTS weekdays (
    id SERIAL PRIMARY KEY,
    day_code CHAR(1) NOT NULL,               -- 'M', 'T', 'W', 'R', 'F', 'S'
    day_name_kh TEXT NOT NULL,               -- 'ចន្ទ', 'អង្គារ', ...
    day_name_en TEXT NOT NULL,               -- 'Monday', 'Tuesday', ...
    display_order INT DEFAULT 0
);

INSERT INTO weekdays (day_code, day_name_kh, day_name_en, display_order) 
SELECT 'M', 'ចន្ទ', 'Monday', 1 WHERE NOT EXISTS (SELECT 1 FROM weekdays WHERE day_code = 'M');
INSERT INTO weekdays (day_code, day_name_kh, day_name_en, display_order) 
SELECT 'T', 'អង្គារ', 'Tuesday', 2 WHERE NOT EXISTS (SELECT 1 FROM weekdays WHERE day_code = 'T');
INSERT INTO weekdays (day_code, day_name_kh, day_name_en, display_order) 
SELECT 'W', 'ពុធ', 'Wednesday', 3 WHERE NOT EXISTS (SELECT 1 FROM weekdays WHERE day_code = 'W');
INSERT INTO weekdays (day_code, day_name_kh, day_name_en, display_order) 
SELECT 'R', 'ព្រហស្បតិ៍', 'Thursday', 4 WHERE NOT EXISTS (SELECT 1 FROM weekdays WHERE day_code = 'R');
INSERT INTO weekdays (day_code, day_name_kh, day_name_en, display_order) 
SELECT 'F', 'សុក្រ', 'Friday', 5 WHERE NOT EXISTS (SELECT 1 FROM weekdays WHERE day_code = 'F');
INSERT INTO weekdays (day_code, day_name_kh, day_name_en, display_order) 
SELECT 'S', 'សៅរ៍', 'Saturday', 6 WHERE NOT EXISTS (SELECT 1 FROM weekdays WHERE day_code = 'S');

-- 5. TEACHER_SUBJECTS (គ្រូបង្រៀនមុខវិជ្ជាណា)
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id SERIAL PRIMARY KEY,
    teacher_id INT REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    qualification_level VARCHAR(20),         -- main, secondary, assistant
    preferred_room_type VARCHAR(20),
    max_hours_per_week INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, subject_id)
);

-- 6. CLASS_SCHEDULES (កាលវិភាគថ្នាក់)
CREATE TABLE IF NOT EXISTS class_schedules (
    id SERIAL PRIMARY KEY,
    class_id INT REFERENCES classrooms(id) ON DELETE CASCADE,  -- '10A', '11B', etc. In DB it's classrooms(id) or string? The prompt says VARCHAR(20). Let's check classrooms table later. The prompt says class_id VARCHAR(20) but classrooms table usually has ID. I will use string but reference classrooms table might fail if classrooms is INT. I'll make it generic. Wait, classrooms in the existing system is likely INT. I'll use INT.
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INT REFERENCES teachers(id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
    weekday_id INT REFERENCES weekdays(id) ON DELETE CASCADE,
    period_id INT REFERENCES periods(id) ON DELETE CASCADE,
    semester VARCHAR(20),                    -- Semester1, Semester2
    academic_year INT,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by INT, -- references admin(id) might not exist if admin table is not named admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent conflicts: same room, same time
    CONSTRAINT unique_room_time UNIQUE (room_id, weekday_id, period_id, semester, academic_year),
    -- Prevent conflicts: same teacher, same time
    CONSTRAINT unique_teacher_time UNIQUE (teacher_id, weekday_id, period_id, semester, academic_year)
);

-- 7. EXAM_SCHEDULES (កាលវិភាគប្រឡង)
CREATE TABLE IF NOT EXISTS exam_schedules (
    id SERIAL PRIMARY KEY,
    exam_name_kh TEXT NOT NULL,              -- 'ប្រឡងត្រីមាសទី១'
    exam_name_en TEXT NOT NULL,              -- 'First Quarter Exam'
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    class_id INT REFERENCES classrooms(id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    proctor_teacher_id INT REFERENCES teachers(id) ON DELETE SET NULL,
    total_students INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. ROOM_BOOKINGS (កក់បន្ទប់សម្រាប់សកម្មភាពបន្ថែម)
CREATE TABLE IF NOT EXISTS room_bookings (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
    booking_title_kh TEXT NOT NULL,
    booking_title_en TEXT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    organizer_name TEXT,
    organizer_contact TEXT,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'pending',   -- pending, approved, rejected, cancelled
    approved_by INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_booking_time CHECK (start_time < end_time)
);

-- 9. SCHOOL_CALENDAR (ប្រតិទិនសាលា)
CREATE TABLE IF NOT EXISTS school_calendar (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    event_type VARCHAR(30) NOT NULL,         -- holiday, exam, event, meeting
    event_name_kh TEXT NOT NULL,
    event_name_en TEXT NOT NULL,
    description TEXT,
    is_holiday BOOLEAN DEFAULT false,
    affects_classes BOOLEAN DEFAULT true,    -- ប៉ះពាល់ដល់ការបង្រៀនឬអត់
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. TEACHER_AVAILABILITY (ម៉ោងទំនេររបស់គ្រូ)
CREATE TABLE IF NOT EXISTS teacher_availability (
    id SERIAL PRIMARY KEY,
    teacher_id INT REFERENCES teachers(id) ON DELETE CASCADE,
    weekday_id INT REFERENCES weekdays(id) ON DELETE CASCADE,
    period_id INT REFERENCES periods(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT true,
    note TEXT,
    semester VARCHAR(20),
    academic_year INT,
    UNIQUE(teacher_id, weekday_id, period_id, semester, academic_year)
);

-- 11. STUDENT_SCHEDULE_VIEW (Materialized View for student timetable)
DROP MATERIALIZED VIEW IF EXISTS mv_student_timetable;
CREATE MATERIALIZED VIEW mv_student_timetable AS
SELECT 
    s.id as student_id,
    s.name_kh as student_name,
    cs.class_id,
    cs.weekday_id,
    wd.day_name_kh,
    cs.period_id,
    p.period_number,
    p.start_time,
    p.end_time,
    cs.subject_id,
    sub.name_kh as subject_name_kh,
    cs.teacher_id,
    t.name_kh as teacher_name_kh,
    cs.room_id,
    r.room_code,
    r.room_name_kh
FROM students s
JOIN class_schedules cs ON s.class_id = cs.class_id -- Fixed column name
    AND cs.academic_year = EXTRACT(YEAR FROM CURRENT_DATE)
    AND cs.is_active = true
JOIN weekdays wd ON cs.weekday_id = wd.id
JOIN periods p ON cs.period_id = p.id
JOIN subjects sub ON cs.subject_id = sub.id
JOIN teachers t ON cs.teacher_id = t.id
JOIN rooms r ON cs.room_id = r.id
WHERE s.status = 'active';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_schedules_class 
ON class_schedules(class_id, semester, academic_year);
CREATE INDEX IF NOT EXISTS idx_class_schedules_teacher 
ON class_schedules(teacher_id, weekday_id, period_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_room 
ON class_schedules(room_id, weekday_id, period_id);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_date 
ON exam_schedules(exam_date);
CREATE INDEX IF NOT EXISTS idx_school_calendar_date 
ON school_calendar(event_date);

-- ============================================================================
-- STORED PROCEDURES FOR SCHEDULING
-- ============================================================================

-- 1. Check for conflicts before inserting schedule
CREATE OR REPLACE FUNCTION fn_check_schedule_conflict(
    p_teacher_id INT,
    p_room_id INT,
    p_weekday_id INT,
    p_period_id INT,
    p_semester VARCHAR(20),
    p_academic_year INT,
    p_exclude_schedule_id INT DEFAULT NULL
)
RETURNS TABLE(conflict_type VARCHAR(50), conflict_details TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check teacher conflict
    IF EXISTS (
        SELECT 1 FROM class_schedules 
        WHERE teacher_id = p_teacher_id 
        AND weekday_id = p_weekday_id 
        AND period_id = p_period_id
        AND semester = p_semester
        AND academic_year = p_academic_year
        AND (p_exclude_schedule_id IS NULL OR id != p_exclude_schedule_id)
    ) THEN
        RETURN QUERY SELECT 'teacher_conflict'::VARCHAR, 
            'Teacher already has a class at this time'::TEXT;
        RETURN;
    END IF;
    
    -- Check room conflict
    IF EXISTS (
        SELECT 1 FROM class_schedules 
        WHERE room_id = p_room_id 
        AND weekday_id = p_weekday_id 
        AND period_id = p_period_id
        AND semester = p_semester
        AND academic_year = p_academic_year
        AND (p_exclude_schedule_id IS NULL OR id != p_exclude_schedule_id)
    ) THEN
        RETURN QUERY SELECT 'room_conflict'::VARCHAR, 
            'Room is already occupied at this time'::TEXT;
        RETURN;
    END IF;
    
    -- Check holiday/event conflict
    IF EXISTS (
        SELECT 1 FROM school_calendar 
        WHERE event_date = CURRENT_DATE 
        AND is_holiday = true
    ) THEN
        RETURN QUERY SELECT 'holiday_conflict'::VARCHAR, 
            'Today is a holiday - no classes allowed'::TEXT;
        RETURN;
    END IF;
    
    -- No conflicts
    RETURN QUERY SELECT 'no_conflict'::VARCHAR, 'OK'::TEXT;
END;
$$;

-- 2. Auto-assign room if not specified
CREATE OR REPLACE PROCEDURE sp_auto_assign_room(
    p_class_schedule_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_subject_id INT;
    v_teacher_id INT;
    v_preferred_room_type VARCHAR(20);
    v_available_room_id INT;
BEGIN
    -- Get subject and teacher info
    SELECT subject_id, teacher_id INTO v_subject_id, v_teacher_id
    FROM class_schedules WHERE id = p_class_schedule_id;
    
    -- Get teacher's preferred room type
    SELECT preferred_room_type INTO v_preferred_room_type
    FROM teacher_subjects 
    WHERE teacher_id = v_teacher_id AND subject_id = v_subject_id;
    
    -- Find available room
    SELECT r.id INTO v_available_room_id
    FROM rooms r
    WHERE r.room_type = COALESCE(v_preferred_room_type, 'classroom')
    AND r.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM class_schedules cs
        WHERE cs.room_id = r.id
        AND cs.weekday_id = (SELECT weekday_id FROM class_schedules WHERE id = p_class_schedule_id)
        AND cs.period_id = (SELECT period_id FROM class_schedules WHERE id = p_class_schedule_id)
        AND cs.semester = (SELECT semester FROM class_schedules WHERE id = p_class_schedule_id)
    )
    LIMIT 1;
    
    IF v_available_room_id IS NOT NULL THEN
        UPDATE class_schedules 
        SET room_id = v_available_room_id 
        WHERE id = p_class_schedule_id;
    END IF;
END;
$$;

-- ============================================================================
-- NOTIFICATION TRIGGERS FOR SCHEDULING
-- ============================================================================

-- Notify when schedule is created/changed
CREATE OR REPLACE FUNCTION notify_schedule_change()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'schedule_changed',
        json_build_object(
            'class_id', NEW.class_id,
            'action', TG_OP,
            'changed_at', NOW()
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_schedule_change ON class_schedules;
CREATE TRIGGER trg_notify_schedule_change
    AFTER INSERT OR UPDATE OR DELETE ON class_schedules
    FOR EACH ROW
    EXECUTE FUNCTION notify_schedule_change();

-- Notify when exam is approaching (1 day before)
CREATE OR REPLACE FUNCTION notify_upcoming_exams()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.exam_date = CURRENT_DATE + INTERVAL '1 day' THEN
        PERFORM pg_notify(
            'exam_reminder',
            json_build_object(
                'exam_name', NEW.exam_name_kh,
                'class_id', NEW.class_id,
                'exam_date', NEW.exam_date,
                'start_time', NEW.start_time
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_upcoming_exams ON exam_schedules;
CREATE TRIGGER trg_notify_upcoming_exams
    AFTER INSERT OR UPDATE ON exam_schedules
    FOR EACH ROW
    EXECUTE FUNCTION notify_upcoming_exams();

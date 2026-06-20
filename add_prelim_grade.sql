-- ============================================================
--  EduTrack — Add Prelim Grade
--  Adds a prelim_grade column to fmgrades so grading periods
--  become Prelim / Midterm / Final instead of just Midterm / Final.
-- ============================================================

ALTER TABLE fmgrades
  ADD COLUMN IF NOT EXISTS prelim_grade NUMERIC(5,2);

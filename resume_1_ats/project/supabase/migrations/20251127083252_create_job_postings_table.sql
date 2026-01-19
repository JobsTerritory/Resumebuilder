/*
  # Create Job Postings Table

  1. New Tables
    - `job_postings`
      - `id` (uuid, primary key)
      - `resume_id` (uuid, foreign key to resumes)
      - `title` (text) - Job title
      - `company` (text) - Company name
      - `description` (text) - Full job description
      - `match_score` (integer) - Match percentage (0-100)
      - `matched_skills` (text[]) - Array of matched skills
      - `missing_skills` (text[]) - Array of missing skills
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `job_postings` table
    - Add policy for authenticated users to manage their own job postings
*/

CREATE TABLE IF NOT EXISTS job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid REFERENCES resumes(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  description text NOT NULL,
  match_score integer DEFAULT 0,
  matched_skills text[] DEFAULT '{}',
  missing_skills text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job postings"
  ON job_postings FOR SELECT
  TO authenticated
  USING (
    resume_id IN (
      SELECT id FROM resumes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own job postings"
  ON job_postings FOR INSERT
  TO authenticated
  WITH CHECK (
    resume_id IN (
      SELECT id FROM resumes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own job postings"
  ON job_postings FOR UPDATE
  TO authenticated
  USING (
    resume_id IN (
      SELECT id FROM resumes WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    resume_id IN (
      SELECT id FROM resumes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own job postings"
  ON job_postings FOR DELETE
  TO authenticated
  USING (
    resume_id IN (
      SELECT id FROM resumes WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_job_postings_resume_id ON job_postings(resume_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC);

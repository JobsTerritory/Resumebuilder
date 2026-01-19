/*
  # Create Resumes Table

  1. New Tables
    - `resumes`
      - `id` (uuid, primary key) - Unique identifier for each resume
      - `user_id` (uuid) - Reference to the user who owns this resume
      - `title` (text) - Title/name of the resume
      - `personal_info` (jsonb) - Personal information (name, email, phone, location, etc.)
      - `summary` (text) - Professional summary
      - `experience` (jsonb) - Array of work experience entries
      - `education` (jsonb) - Array of education entries
      - `skills` (jsonb) - Array of skills
      - `projects` (jsonb) - Array of project entries
      - `certifications` (jsonb) - Array of certifications
      - `languages` (jsonb) - Array of languages
      - `template` (text) - Selected template name
      - `section_order` (jsonb) - Order of sections in the resume
      - `created_at` (timestamptz) - When the resume was created
      - `updated_at` (timestamptz) - When the resume was last updated

  2. Security
    - Enable RLS on `resumes` table
    - Add policy for users to read their own resumes
    - Add policy for users to insert their own resumes
    - Add policy for users to update their own resumes
    - Add policy for users to delete their own resumes
*/

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL DEFAULT 'Untitled Resume',
  personal_info jsonb DEFAULT '{}'::jsonb,
  summary text DEFAULT '',
  experience jsonb DEFAULT '[]'::jsonb,
  education jsonb DEFAULT '[]'::jsonb,
  skills jsonb DEFAULT '[]'::jsonb,
  projects jsonb DEFAULT '[]'::jsonb,
  certifications jsonb DEFAULT '[]'::jsonb,
  languages jsonb DEFAULT '[]'::jsonb,
  template text DEFAULT 'modern',
  section_order jsonb DEFAULT '["summary", "experience", "education", "skills", "projects", "certifications", "languages"]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own resumes"
  ON resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow anonymous read for demo"
  ON resumes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert for demo"
  ON resumes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update for demo"
  ON resumes FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete for demo"
  ON resumes FOR DELETE
  TO anon
  USING (true);
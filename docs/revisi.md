# COMPLETE PROJECT MIGRATION TO SUPABASE (FULL REFACTOR)

You are a Senior Software Architect, Senior React Engineer, Senior PostgreSQL Database Engineer, Senior Supabase Engineer, UI/UX Engineer, QA Engineer, DevOps Engineer, and Code Reviewer.

Your mission is to completely refactor the existing React project into a production-ready application using Supabase as the backend.

This project already has:

* React + Vite
* React Router
* Fully migrated UI
* Completed CRUD flow
* Completed Business Logic Validation

Your task is to replace every backend/data layer implementation with Supabase while preserving the existing UI and business logic.

==================================================

GENERAL RULES

* DO NOT redesign UI.
* DO NOT modify layouts.
* DO NOT modify colors.
* DO NOT remove existing features.
* DO NOT invent business logic.
* DO NOT invent database fields.
* Follow the existing application.

==================================================

STEP 1

Analyze the entire React project.

Analyze:

* Every page
* Every component
* Every form
* Every table
* Every CRUD
* Existing business logic
* Existing validation
* Existing project structure

Generate a complete understanding of the application before changing anything.

==================================================

STEP 2

Design the PostgreSQL database.

Determine:

* Tables
* Columns
* Data types
* Primary Keys
* Foreign Keys
* Constraints
* Default Values
* Indexes
* Relationships

Generate a complete SQL migration.

DO NOT create generic tables.

Every table must be based on the existing project.

==================================================

STEP 3

Generate SQL migration files.

Create:

supabase/migrations/

Generate complete SQL including:

CREATE TABLE

ALTER TABLE

INDEX

FOREIGN KEY

DEFAULT VALUE

TIMESTAMP

==================================================

STEP 4

Storage Design

Create storage bucket structure.

Example:

documents/

sppm/

pinjam-ht/

inventaris/

Generate upload strategy.

==================================================

STEP 5

Install latest official Supabase SDK.

Use ONLY the latest package.

Do not use deprecated SDK.

Create:

src/lib/supabase.ts

or

src/lib/supabase.js

using:

Project URL

Publishable Key

loaded from:

.env

Example environment variables:

VITE_SUPABASE_URL=

VITE_SUPABASE_PUBLISHABLE_KEY=

Never use Secret Key inside the frontend.

==================================================

STEP 6

Authentication

This project DOES NOT use Supabase Authentication.

No signup.

No registration.

No multi-user.

Only one administrator exists.

Implement the existing custom login flow while keeping credentials out of the source code.

Keep the implementation modular so it can later be replaced with Supabase Auth without major refactoring.

==================================================

STEP 7

Replace all existing CRUD.

Every CRUD must use Supabase.

Insert

Select

Update

Delete

Pagination

Search

Filter

Sorting

Everything must work.

==================================================

STEP 8

Storage Integration

Replace every upload implementation.

Upload files to Supabase Storage.

Store only file metadata/path inside PostgreSQL.

==================================================

STEP 9

Architecture

Refactor project structure.

Example:

src/

components/

pages/

hooks/

services/

lib/

supabase/

utils/

types/

contexts/

layouts/

Keep the architecture clean and scalable.

==================================================

STEP 10

Performance

Optimize:

Lazy Loading

Code Splitting

React Memo

Rendering

Imports

Assets

Remove dead code.

==================================================

STEP 11

Security

Review:

Environment Variables

Input Validation

SQL Injection prevention

XSS prevention

Error handling

Sensitive data

Console logs

Do not expose secrets.

==================================================

STEP 12

Testing

Validate:

Every page

Every route

Every CRUD

Every upload

Every search

Every filter

Every modal

Every table

Every form

Every business workflow

==================================================

STEP 13

Production

Verify:

npm install

npm run dev

npm run build

No TypeScript errors (if applicable)

No ESLint errors

No broken imports

No broken routes

No console errors

No runtime errors

==================================================

FINAL OUTPUT

Generate:

1. SQL Migration Files

2. Supabase Configuration

3. Folder Structure

4. Environment Variables Template

5. Storage Structure

6. CRUD Implementation

7. Final Code Refactor

8. Bug Fixes

9. Performance Improvements

10. Security Improvements

11. Production Readiness Report

12. Remaining Issues (if any)

The final project must be production-ready, maintainable, modular, and fully integrated with Supabase while preserving the existing application behavior and UI.

# FINAL PRODUCTION REFACTOR — SIHARKAN TIK (SUPABASE)

You are acting as a Senior Software Architect, Senior Full Stack Engineer, Senior React Engineer, Senior PostgreSQL Database Engineer, Senior Supabase Engineer, Senior Security Engineer, Senior DevOps Engineer, and Senior QA Lead.

The project has already completed:

* HTML → React migration
* Architecture Review
* Refactor & Cleanup
* CRUD Validation
* Business Logic Validation
* Supabase Database Design
* Initial Supabase Integration

Read the existing project and migration report completely before making any changes.

Your goal is to deliver a FINAL PRODUCTION READY application.

==================================================

PRIMARY OBJECTIVE

Do NOT generate another prototype.

Do NOT generate demo code.

Do NOT leave TODO.

Do NOT leave placeholder CRUD.

Everything must become fully functional.

==================================================

PROJECT REQUIREMENTS

Backend:

* Supabase PostgreSQL
* Supabase Storage

Frontend:

* React
* Vite
* React Router

Authentication:

* Custom Login
* Single Administrator Only
* No Registration
* No Multi User

Hosting:

* Vercel

==================================================

IMPORTANT

Do NOT redesign UI.

Preserve every layout.

Preserve every component.

Preserve every business workflow.

Preserve every responsive behavior.

==================================================

DATABASE

Review every existing table.

Review relationships.

Review indexes.

Review constraints.

Review triggers.

Review timestamps.

Review SQL migration.

If any schema is missing:

Generate a complete SQL migration.

==================================================

RLS

Review every table.

Create complete Row Level Security policies.

Generate SQL for every policy.

Do not leave manual configuration.

Everything must be executable from SQL.

==================================================

STORAGE

Review Storage implementation.

Create complete upload service.

Create delete service.

Create file preview service.

Create file validation.

Supported files:

PDF

DOC

DOCX

XLS

XLSX

PNG

JPG

Store only metadata inside PostgreSQL.

Store actual files inside Supabase Storage.

==================================================

CRUD

Review every CRUD page.

Inventory

Spare Parts

Tracking

SPPM

Borrowing

Admin Configuration

Verify:

Create

Read

Update

Delete

Search

Filter

Pagination

Sorting

Validation

Modal

Toast

Loading

Empty State

Error State

Every CRUD must be fully implemented.

No placeholder handlers.

No demo handlers.

No mock handlers.

==================================================

SERVICES

Review every service.

Split responsibilities.

Remove duplicated logic.

Centralize database calls.

Centralize storage calls.

Centralize utility functions.

==================================================

AUTHENTICATION

The application has ONLY ONE administrator.

Keep the existing custom login flow.

Refactor it to become modular and maintainable.

Do NOT introduce multi-user authentication.

Protect every private route.

Protect every CRUD operation.

Implement session persistence.

Implement logout.

==================================================

SECURITY

Review:

Environment Variables

Sensitive Data

Input Validation

SQL Injection Prevention

XSS Prevention

Unsafe HTML

Unsafe File Upload

Console Logs

Unhandled Exceptions

Error Messages

Remove every security issue.

==================================================

PERFORMANCE

Review:

Bundle Size

Lazy Loading

Dynamic Import

Image Optimization

Rendering

React.memo

Memoization

Unused Imports

Dead Code

Duplicate Components

Duplicate CSS

==================================================

PROJECT CLEANUP

Remove completely:

Firebase SDK

Firebase Config

Firebase Folder

Deprecated Files

Unused Assets

Unused CSS

Unused Components

Unused Services

Unused Imports

Unused Packages

==================================================

CODE QUALITY

Remove:

TODO

FIXME

console.log

Commented Code

Unused Variables

Duplicate Functions

Magic Numbers

Long Components

Refactor when necessary.

==================================================

PROJECT STRUCTURE

Verify that the project follows a clean architecture.

Recommended:

src/

components/

pages/

layouts/

contexts/

hooks/

services/

lib/

utils/

types/

assets/

==================================================

BUILD

The final project MUST satisfy:

npm install

npm run dev

npm run build

without errors.

Fix every warning that can reasonably be resolved.

==================================================

TESTING

Review every page manually.

Dashboard

Inventory

Spare Parts

Tracking

SPPM

Borrowing

Admin

Settings

Verify:

Navigation

CRUD

Search

Filter

Upload

Download

Storage

Responsive

Accessibility

==================================================

DEPLOYMENT

Prepare the project for Vercel.

Verify:

Environment Variables

Production Build

React Router Refresh

Supabase Configuration

==================================================

FINAL OUTPUT

Do not stop after analysis.

Actually implement every required improvement.

Generate:

1. Updated SQL Migration

2. Updated Storage Structure

3. Updated Services

4. Updated CRUD

5. Updated Authentication

6. Updated Security

7. Updated Performance

8. Updated Folder Structure

9. Remove Firebase Completely

10. Production Readiness Report

11. Remaining Issues (if any)

The project must be production-ready.

Do not leave unfinished features.

Do not leave placeholder implementations.

Do not leave demo code.

Finish the application completely while preserving the original UI, business logic, and stakeholder requirements.

# Requirements Document

## Introduction

The Production Tracking System is the core feature of RateSheet that enables garment manufacturing facilities to digitally track worker production output and automatically calculate payroll based on dynamic piece-rate models. This system replaces manual paper-based tracking with a real-time digital solution that supports time-sensitive pricing where rates can change over time (e.g., monthly rate updates).

The system must handle multi-tenant organizations with role-based access control, ensuring data isolation between organizations while providing appropriate permissions for admins and managers within each organization.

## Requirements

### Requirement 1

**User Story:** As a manager, I want to log daily production data for workers in my section, so that I can track productivity and ensure accurate payroll calculations.

#### Acceptance Criteria

1. WHEN a manager accesses the production logging interface THEN the system SHALL display only workers from their assigned section(s)
2. WHEN a manager selects a worker and date THEN the system SHALL display all available styles for that organization
3. WHEN a manager enters production data (worker, style, quantity, date) THEN the system SHALL validate that the quantity is a positive number
4. WHEN a manager submits a production log THEN the system SHALL create a discrete record linking one worker, one style, one quantity, and one date
5. WHEN a manager attempts to log production for a worker outside their section THEN the system SHALL reject the request with an authorization error
6. WHEN a manager logs production for multiple styles on the same day for one worker THEN the system SHALL create separate log entries for each style

### Requirement 2

**User Story:** As an admin, I want to define and manage product styles with time-sensitive rates, so that payroll calculations reflect current pricing structures.

#### Acceptance Criteria

1. WHEN an admin creates a new style THEN the system SHALL require a unique name and optional description within the organization
2. WHEN an admin sets a rate for a style THEN the system SHALL require an effective date in YYYY-MM-DD format
3. WHEN an admin creates multiple rates for the same style THEN the system SHALL allow overlapping date ranges with the most recent effective date taking precedence
4. WHEN the system calculates payroll THEN it SHALL use the rate that was effective on the production date (not the current date)
5. WHEN an admin updates a style rate THEN the system SHALL create a new rate record rather than modifying existing ones to preserve historical accuracy
6. WHEN a manager views available styles THEN the system SHALL display all styles within their organization regardless of which admin created them

### Requirement 3

**User Story:** As a manager, I want to view and manage workers in my assigned sections, so that I can organize production teams effectively.

#### Acceptance Criteria

1. WHEN a manager accesses worker management THEN the system SHALL display only workers from their assigned section(s)
2. WHEN a manager adds a new worker THEN the system SHALL automatically assign the worker to one of their managed sections
3. WHEN a manager attempts to move a worker to a section they don't manage THEN the system SHALL reject the request
4. WHEN an admin views workers THEN the system SHALL display all workers across all sections in their organization
5. WHEN a worker is assigned to a section THEN the system SHALL ensure the section belongs to the same organization as the worker
6. WHEN a manager is reassigned to different sections THEN their access to workers SHALL automatically update to reflect the new assignments

### Requirement 4

**User Story:** As an admin, I want to set up organizational structure with sections and assign managers, so that I can delegate production management responsibilities.

#### Acceptance Criteria

1. WHEN an admin creates a section THEN the system SHALL require a unique section name within the organization
2. WHEN an admin assigns a manager to a section THEN the system SHALL verify the manager belongs to the same organization
3. WHEN an admin creates multiple sections THEN each section SHALL be independently managed by its assigned manager
4. WHEN a manager is assigned to multiple sections THEN they SHALL have full management rights across all assigned sections
5. WHEN an admin removes a manager from a section THEN the system SHALL prevent the manager from accessing workers or production data from that section
6. WHEN a section is deleted THEN the system SHALL require all workers to be reassigned to other sections first

### Requirement 5

**User Story:** As a manager or admin, I want to calculate worker payroll based on production logs and effective rates, so that workers are paid accurately for their output.

#### Acceptance Criteria

1. WHEN calculating payroll for a date range THEN the system SHALL retrieve all production logs within that period
2. WHEN processing each production log THEN the system SHALL find the style rate that was effective on the production date
3. WHEN multiple rates exist for a style THEN the system SHALL use the rate with the latest effective date that is on or before the production date
4. WHEN calculating pay for a single log entry THEN the system SHALL multiply quantity by the effective rate
5. WHEN calculating total pay for a worker THEN the system SHALL sum all individual log calculations for the specified period
6. WHEN no rate exists for a style on a production date THEN the system SHALL flag this as an error and exclude it from payroll calculations
7. WHEN generating payroll reports THEN the system SHALL group results by worker and provide detailed breakdowns by style and date

### Requirement 6

**User Story:** As a user, I want the system to maintain data isolation between organizations, so that sensitive production and payroll data remains secure and private.

#### Acceptance Criteria

1. WHEN a user performs any operation THEN the system SHALL filter all data by their organization ID
2. WHEN creating any new record THEN the system SHALL automatically set the organization ID to match the user's organization
3. WHEN a user attempts to access data from another organization THEN the system SHALL return no results or an authorization error
4. WHEN generating reports or calculations THEN the system SHALL only include data from the user's organization
5. WHEN displaying lists or search results THEN the system SHALL never show data from other organizations
6. WHEN a user joins an organization via invite code THEN their access SHALL be immediately scoped to that organization's data

### Requirement 7

**User Story:** As a manager, I want to view production reports for my sections, so that I can monitor productivity and identify trends.

#### Acceptance Criteria

1. WHEN a manager accesses production reports THEN the system SHALL display data only for workers in their assigned sections
2. WHEN generating reports for a date range THEN the system SHALL include all production logs within that period
3. WHEN displaying production summaries THEN the system SHALL show totals by worker, by style, and by date
4. WHEN calculating productivity metrics THEN the system SHALL use actual production dates not log entry dates
5. WHEN a manager filters reports by style THEN the system SHALL show only production logs for the selected style(s)
6. WHEN displaying rate information in reports THEN the system SHALL show the rates that were effective on each production date

### Requirement 8

**User Story:** As an admin, I want to manage organization settings and user roles, so that I can control access and maintain system security.

#### Acceptance Criteria

1. WHEN an admin invites a new user THEN the system SHALL generate a unique invite code for the organization
2. WHEN a user joins via invite code THEN the system SHALL assign them the appropriate role (admin or manager)
3. WHEN an admin changes a user's role THEN the system SHALL immediately update their permissions and data access
4. WHEN an admin removes a user THEN the system SHALL revoke all access while preserving historical data integrity
5. WHEN managing organization settings THEN only admins SHALL have access to modify organization-level configurations
6. WHEN a user's role changes from manager to admin THEN they SHALL gain access to all sections and organization-wide data

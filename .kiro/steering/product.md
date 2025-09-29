# Product Overview

**RateSheet** is a full-stack web application for tracking daily production output of workers in garment/manufacturing facilities. The system replaces manual tracking with a digital, real-time solution for accurate piece-rate payroll calculations.

## Core Purpose

- Digitize production tracking for manufacturing workers
- Automate salary calculations based on dynamic piece-rate models
- Provide role-based access control (Admins vs Managers)
- Create centralized data management for production and payroll

## Key Business Logic

- **Dynamic Pricing**: Style rates can change over time (e.g., monthly rate updates)
- **Granular Tracking**: Each production log records one worker + one style + one day
- **Independent Rates**: Every style has its own rate schedule, completely independent of other styles
- **Role Separation**: Admins have system-wide control, Managers control their assigned sections

## Data Model

The system revolves around 6 core entities: Users, Sections, Workers, Styles, Style Rates, and Production Logs. The relationship between Styles and Style Rates enables time-sensitive pricing, while Production Logs capture discrete work events for accurate payroll calculation.

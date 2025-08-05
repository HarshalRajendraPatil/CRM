# Company Management System

The Company Management System is a comprehensive solution for managing company data within the CRM platform. It allows users to create, view, edit, and delete company records, as well as track company-related metrics and activities.

## Features

- **Company Listing**: View all companies with filtering, sorting, and search capabilities
- **Company Details**: View comprehensive information about each company
- **Company Creation/Editing**: Add new companies or edit existing ones
- **Company Statistics**: View aggregated statistics about companies (by status, industry, etc.)
- **Notes Management**: Add and view notes related to companies
- **Tags Management**: Add and remove tags for better organization
- **Custom Fields**: Support for custom fields to store additional company data

## Components

- `Companies.jsx`: Main component for listing and managing companies
- `CompanyDetail.jsx`: Component for viewing and editing company details
- `CompanySidebar.jsx`: Sidebar component for creating/editing companies
- `CompanyListItem.jsx`: Component for rendering individual company items in the list
- `CompanyFilters.jsx`: Component for filtering companies by various criteria
- `CompanyStatsCards.jsx`: Component for displaying company statistics

## Integration

The Company Management System integrates with:

- Redux store via `companySlice.js` for state management
- API services via `companyService.js` for data fetching
- CRM Dashboard via `CompanyOverviewCard.jsx` for quick stats overview

## Usage

Access the Company Management System through the CRM navigation by clicking on "Companies" in the sidebar menu. From there, you can:

1. View all companies in list or grid view
2. Search for specific companies
3. Filter companies by status, industry, or tags
4. Sort companies by various fields
5. Click on a company to view its details
6. Add notes to companies
7. Edit company information
8. Delete companies

## Data Structure

Companies have the following main attributes:

- Name
- Industry
- Website
- Email
- Phone
- Address
- Status
- Size
- Annual Revenue
- Description
- Tags
- Custom Fields
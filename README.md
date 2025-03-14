# NEM12 CSV Parser

A web application for parsing, visualizing, and analyzing NEM12 format CSV files used in the Australian energy market.

## Overview

This application allows users to:

- Upload and parse NEM12 CSV files
- Visualize consumption data through charts
- Generate SQL insert statements
- View summary statistics of the parsed data

## Technical Implementation

The application is built using:

- **Next.js**: React framework for the frontend
- **Web Workers**: For non-blocking parsing of large CSV files
- **TailwindCSS and Shadcn**: For styling

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd nem12
   ```

2. Install dependencies:

   ```bash
   # need force flag because of react 19
   npm install --force
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

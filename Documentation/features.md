Features:

File Upload:

Accepts bank statement CSV
Accepts YNAB export CSV
Validates file formats


Transaction Matching:

Matches transactions by amount and date
Handles multiple identical transactions
Accounts for withdrawals/deposits vs outflows/inflows


Display:

Shows matched transactions
Highlights unmatched transactions
Provides daily summaries
Shows running totals



Input Requirements:

Bank CSV needs:

Date column
Withdrawal/deposit columns
Description/memo column


YNAB CSV needs:

Date column
Outflow/inflow columns
Payee/description column



Usage Flow:

User exports transactions from their bank
User exports account register from YNAB
User uploads both files to the app
App processes and compares transactions
User reviews discrepancies
User updates YNAB based on findings

Technical Notes:

Runs entirely in browser (no server required)
Processes files locally for security
Uses modern React hooks and functional components
Implements responsive design for all screen sizes

Future Features Planned:

Stats dashboard
Reports generation
Multiple bank format support
Transaction categorization
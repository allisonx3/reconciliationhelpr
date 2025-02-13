# ReconciliationHelpr

A locally-run tool to help YNAB users who are as bad at reconciling as I am to identify discrepancies between their bank statements and YNAB transactions. This isn't an automatic reconciliation tool - rather, it's a helper that makes it easier to spot where things don't match up.

> **Quick Note:** Yes, we should reconcile daily/weekly/monthly/etc.It's definitely best practice. But if you're like me and sometimes forget to eat lunch because ADHD/life/whatever, well... this tool is for those months when you finally check your balance and go "oh no. why is this $40 off?" You'll get no judgement from me - you're doing your best <3


## Why Use This?

- Don't have the attention span to remember to reconcile every day/week? Same.
- Tired of squinting at spreadsheets or bank UIs trying to find that one missing transaction? Same.
- Frustrated with split transactions making reconciliation difficult because they're not perfectly the same on your exports? Same. But this tool won't help with that, lol.
- Want to make sure your YNAB matches your bank statement without tedious manual checking? Same. But if that was true I'd reconcile daily/weekly. I don't have the attention span. So now you're manually checking.

ReconciliationHelpr makes this process a little faster and less error-prone. (At least for me!)

## Features

- 🔄 Simple CSV file upload for both bank statements and YNAB exports
- 🔍 Clear view of matched and unmatched transactions
- 📅 Date-based filtering
- 💰 Daily totals and difference calculations
- 🚦 Visual indicators for discrepancies
- 🔒 Completely local processing (no data leaves your computer)
- 🌓 Dark mode support with system preference detection

## Getting Started

### Prerequisites
- Node.js installed on your computer
- Git installed on your computer
- CSV files from your bank and YNAB

### Installation

```bash
git clone https://github.com/allisonx3/reconciliation-helpr.git
cd reconciliation-helpr
npm install
npm start
```

### How to Use

1. Export your bank statement as CSV
2. Export your YNAB account register as CSV
    - In YNAB, go to the account you want to reconcile
    - Select all transactions for that account for whatever date range you want
    - Click the "Export" button in the top right
    - Choose "CSV" format
3. Open ReconciliationHelpr in your browser (it'll run on `localhost:3000` by default)
4. Upload both files
5. Review the comparison
6. Fix any mismatches in YNAB
    - I personally use this tool to check that the dates align first. 
    - I manually update the dates in YNAB to match the bank statement, 
    - & then reupload a new, updated YNAB CSV to get my "official" mismatches - which is where I find the REAL disrepency. 
7. Repeat when you inevitably do not change your habits & forget to reconcile for 2 months, like me (oops)

## Important Usage Notes

### Split Transactions
Since YNAB shows split transactions as separate entries in the CSV export while your bank shows them as one transaction:
- They'll appear in the "unmatched" section
- Look for multiple YNAB transactions that add up to the bank amount
- Check transactions on the same date
- You can leave these as unmatched as long as you know they really do match
    - For me, I have a repeating student loan payment every month that I have "split" to each individual loan 
    - I leave these unmatched because I just... know what that is

### Date Mismatches
Dates often don't match between YNAB and your bank statement, especially if you:
- Manually enter transactions
- Schedule transactions in advance
- Enter transactions before they clear your bank

I found that using this tool to identify which dates don't match works well, & then reuploading once I do get the dates aligned to check for real mismatches.

### Recommended Workflow
1. First Pass:
   - Upload both CSV files
   - Identify date mismatches
   - Fix dates in YNAB
2. Second Pass:
   - Get new YNAB CSV with aligned dates
   - Re-upload both files
   - Look for genuine missing transactions
   - Account for split transactions
3. Update YNAB as needed

## Technical Details

### Built With
- React (UI framework)
- Papaparse (CSV parsing)
- Lodash (data manipulation)

### Project Structure
- Plz visit documentation/filestructure.md for more info

## Known Limitations

- No automatic handling of split transactions (sorry I am just a girl)
- Manual date fixing required in YNAB 
    - This would be super cool to do automatically but that's way above this paygrade here
- Matches based on amount and date only
- Limited to standard CSV formats
    - I am sure we could do other file types, I just did not try

## Future Plans

- [ ] Improved split transaction handling
- [ ] Working on myself to reconcile daily/weekly <3 

## 🔧 Troubleshooting  

### **I can't figure out how to run this app on my computer!!**  
No worries! Here's a quick checklist:  
✅ **Make sure Node.js is installed** – Run `node -v` in your terminal. If it errors, [install Node.js](https://nodejs.org/).  
✅ **Check that dependencies are installed** – Run:  
   ```sh
   npm install
   ```  
✅ **Start the app** – Use:  
   ```sh
   npm start
   ```  
   This should open the tool in your browser at `http://localhost:3000`.  

---

### **I uploaded both CSVs, but the reconciliator didn't work!**  
🔹 **Ensure your CSVs have the right column headers** – The app looks for standard bank fields - but only the ones I thought of off the top of my head. 

🔹 **Headers not listed?** Update `src/utils/csvProcessor.js` to include them:  
   ```js
   const bankMapping = findRelevantColumns(bankHeaders, {
     date: ['date', 'transaction date', 'posted date'],
     withdrawal: ['withdrawal', 'debit', 'amount', 'payment', 'charge'],
     deposit: ['deposit', 'credit', 'amount'],
     description: ['description', 'payee', 'memo', 'details', 'transaction', 'name']
   });
   ```  
   Add missing headers, save, and restart the app.  

---

### **My CSV won't upload!**  
✅ **Check the file format** – It must be a `.csv` file. Some banks export as `.xlsx` instead—convert it by opening in Excel or Google Sheets and selecting **File → Save As → CSV**.  
✅ **Make sure it's UTF-8 encoded** – If your file contains strange characters or won't upload, re-save it as **CSV UTF-8 (Comma Delimited)** in Excel or a text editor like VS Code.  
✅ **Confirm the file isn't empty** – Open the CSV in a text editor to check.  

Still stuck? Drop an issue on GitHub, and I'll take a look! 🚀  

---


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- How to submit changes
- Bug reporting

## License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for details.

## Acknowledgments

- YNAB for their excellent budgeting software 
- My bank for not doing a good job exporting internal transfers to YNAB ((idk whose fault that is, (mine, for not manually importing my YNAB transactions...) but that was the issue!))
- Anthropic for their claude-sonnet-3.5 model
- Cursor for their "AI-powered" coding assistant

## Questions or Issues?

Feel free to:
1. Open an issue
2. Submit a pull request
3. Use & adapt to your needs


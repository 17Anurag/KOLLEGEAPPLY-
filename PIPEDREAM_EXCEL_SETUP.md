# 📊 Pipedream + Excel Integration Guide

## Overview
This guide shows you how to automatically save all form submissions to an Excel file using Pipedream workflows. You have multiple options for Excel integration.

## 🚀 Quick Setup Options

### Option 1: Google Sheets (Recommended - Free & Easy)
### Option 2: Microsoft Excel Online (OneDrive)
### Option 3: Airtable (Database-like Excel)
### Option 4: CSV Export to Excel

---

## 📋 Option 1: Google Sheets Integration (RECOMMENDED)

### Step 1: Create Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "University Leads Database"
4. Set up headers in Row 1:

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Lead ID | Full Name | Email | Phone | State | Course | Intake Year | University | Timestamp | Source | Status | Follow Up Date |

### Step 2: Pipedream Workflow Setup
1. Create new workflow in Pipedream
2. **Trigger**: HTTP/Webhook (copy the URL)
3. **Step 2**: Add "Google Sheets" action

#### Google Sheets Configuration:
```javascript
// Step 2: Google Sheets - Add Single Row
export default defineComponent({
  async run({ steps, $ }) {
    const formData = steps.trigger.event.body;
    
    // Generate Lead ID
    const leadId = `LEAD_${Date.now()}`;
    
    // Prepare data for Google Sheets
    const rowData = [
      leadId,                           // Lead ID
      formData.fullName,               // Full Name
      formData.email,                  // Email
      formData.phone,                  // Phone
      formData.state,                  // State
      formData.course,                 // Course
      formData.intake,                 // Intake Year
      formData.university,             // University
      new Date().toISOString(),        // Timestamp
      formData.source || 'Landing Page', // Source
      'New',                           // Status
      new Date(Date.now() + 24*60*60*1000).toISOString() // Follow Up (24h later)
    ];
    
    // Return the data to be added to Google Sheets
    return {
      values: [rowData],
      leadId: leadId
    };
  },
})
```

### Step 3: Configure Google Sheets Action
1. **Action**: "Add Single Row"
2. **Spreadsheet**: Select your "University Leads Database"
3. **Worksheet**: Sheet1
4. **Values**: Use the array from Step 2: `{{steps.step_2.$return_value.values}}`

---

## 📊 Option 2: Microsoft Excel Online Integration

### Step 1: Create Excel File in OneDrive
1. Go to [office.com](https://office.com)
2. Create new Excel workbook
3. Name it "University_Leads_Database.xlsx"
4. Set up the same headers as Google Sheets

### Step 2: Pipedream Workflow
1. Add "Microsoft Excel Online" action
2. Connect your Microsoft account
3. Configure the action:

```javascript
// Step 2: Process Data for Excel
export default defineComponent({
  async run({ steps, $ }) {
    const formData = steps.trigger.event.body;
    
    return {
      "Lead ID": `LEAD_${Date.now()}`,
      "Full Name": formData.fullName,
      "Email": formData.email,
      "Phone": formData.phone,
      "State": formData.state,
      "Course": formData.course,
      "Intake Year": formData.intake,
      "University": formData.university,
      "Timestamp": new Date().toISOString(),
      "Source": "Landing Page",
      "Status": "New"
    };
  },
})
```

### Step 3: Excel Online Action
- **Action**: "Add Row to Table"
- **Workbook**: Select your workbook
- **Worksheet**: Sheet1
- **Table**: Create a table in Excel first, then select it

---

## 🗃️ Option 3: Airtable Integration (Database + Excel Export)

### Step 1: Create Airtable Base
1. Go to [airtable.com](https://airtable.com)
2. Create new base: "University Leads"
3. Set up fields:
   - Lead ID (Single line text)
   - Full Name (Single line text)
   - Email (Email)
   - Phone (Phone number)
   - State (Single select)
   - Course (Single select)
   - Intake Year (Single select)
   - University (Single select)
   - Timestamp (Date & time)
   - Status (Single select: New, Contacted, Qualified, Enrolled)

### Step 2: Pipedream Airtable Integration
```javascript
// Step 2: Airtable - Create Record
export default defineComponent({
  async run({ steps, $ }) {
    const formData = steps.trigger.event.body;
    
    return {
      "Lead ID": `LEAD_${Date.now()}`,
      "Full Name": formData.fullName,
      "Email": formData.email,
      "Phone": formData.phone,
      "State": formData.state,
      "Course": formData.course,
      "Intake Year": formData.intake,
      "University": formData.university,
      "Timestamp": new Date().toISOString(),
      "Status": "New"
    };
  },
})
```

**Airtable Benefits:**
- Easy Excel export (CSV/Excel format)
- Advanced filtering and views
- Collaboration features
- API access for advanced integrations

---

## 📄 Option 4: CSV Generation + Email

### Pipedream Workflow for CSV
```javascript
// Step 2: Generate CSV Data
export default defineComponent({
  async run({ steps, $ }) {
    const formData = steps.trigger.event.body;
    
    // CSV format
    const csvRow = [
      `LEAD_${Date.now()}`,
      formData.fullName,
      formData.email,
      formData.phone,
      formData.state,
      formData.course,
      formData.intake,
      formData.university,
      new Date().toISOString(),
      'Landing Page',
      'New'
    ].map(field => `"${field}"`).join(',');
    
    return {
      csvData: csvRow,
      headers: '"Lead ID","Full Name","Email","Phone","State","Course","Intake Year","University","Timestamp","Source","Status"'
    };
  },
})
```

### Step 3: Email CSV Data
```javascript
// Step 3: Email CSV
export default defineComponent({
  async run({ steps, $ }) {
    const csvData = steps.step_2.$return_value;
    
    await $.send.email({
      subject: `New Lead Data - ${new Date().toLocaleDateString()}`,
      text: `New lead submitted. CSV data:\n\n${csvData.headers}\n${csvData.csvData}`,
      to: "admin@university.com"
    });
  },
})
```

---

## 🔧 Complete Pipedream Workflow Example (Google Sheets)

Here's a complete workflow that includes Excel integration:

### Step 1: HTTP Trigger
- **Trigger Type**: HTTP/Webhook
- **Method**: POST

### Step 2: Data Processing & Validation
```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const formData = steps.trigger.event.body;
    
    // Validate required fields
    const requiredFields = ['fullName', 'email', 'phone', 'state', 'course', 'intake'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      $.flow.exit(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Generate unique Lead ID
    const leadId = `LEAD_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Process and enrich data
    const processedData = {
      leadId,
      fullName: formData.fullName.trim(),
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone.replace(/\D/g, ''), // Remove non-digits
      state: formData.state,
      course: formData.course,
      intake: formData.intake,
      university: formData.university,
      timestamp: new Date().toISOString(),
      source: 'University Landing Page',
      status: 'New',
      followUpDate: new Date(Date.now() + 24*60*60*1000).toISOString(),
      userAgent: formData.userAgent || 'Unknown',
      referrer: formData.referrer || 'Direct'
    };
    
    return processedData;
  },
})
```

### Step 3: Google Sheets - Add Row
- **Action**: Add Single Row
- **Spreadsheet**: Your spreadsheet
- **Values**: Map each field from Step 2

### Step 4: Send Confirmation Email
```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const leadData = steps.data_processing.$return_value;
    
    // Send email to admissions team
    await $.send.email({
      subject: `🎓 New Lead: ${leadData.fullName} - ${leadData.university}`,
      html: `
        <h2>New University Lead Received</h2>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr><td><strong>Lead ID:</strong></td><td>${leadData.leadId}</td></tr>
          <tr><td><strong>Name:</strong></td><td>${leadData.fullName}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${leadData.email}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${leadData.phone}</td></tr>
          <tr><td><strong>State:</strong></td><td>${leadData.state}</td></tr>
          <tr><td><strong>Course:</strong></td><td>${leadData.course}</td></tr>
          <tr><td><strong>Intake:</strong></td><td>${leadData.intake}</td></tr>
          <tr><td><strong>University:</strong></td><td>${leadData.university}</td></tr>
          <tr><td><strong>Submitted:</strong></td><td>${new Date(leadData.timestamp).toLocaleString()}</td></tr>
        </table>
        <p><strong>Follow up by:</strong> ${new Date(leadData.followUpDate).toLocaleDateString()}</p>
      `,
      to: "admissions@university.com"
    });
    
    return { emailSent: true };
  },
})
```

### Step 5: Return Success Response
```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const leadData = steps.data_processing.$return_value;
    
    await $.respond({
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: {
        status: "success",
        message: "Application submitted successfully! We will contact you within 24 hours.",
        leadId: leadData.leadId,
        timestamp: leadData.timestamp
      }
    });
  },
})
```

---

## 📊 Excel File Structure

### Recommended Column Headers:
| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | Lead ID | Text | Unique identifier |
| B | Full Name | Text | Student's full name |
| C | Email | Email | Contact email |
| D | Phone | Text | 10-digit phone number |
| E | State | Text | Indian state |
| F | Course | Text | Course of interest |
| G | Intake Year | Number | Year of admission |
| H | University | Text | MIT/Stanford |
| I | Timestamp | DateTime | Submission time |
| J | Source | Text | Landing page source |
| K | Status | Text | New/Contacted/Qualified |
| L | Follow Up Date | DateTime | When to follow up |
| M | User Agent | Text | Browser info |
| N | Referrer | Text | Traffic source |

---

## 🔍 Testing Your Excel Integration

### Test Data to Send:
```json
{
  "fullName": "Test Student",
  "email": "test@example.com",
  "phone": "9876543210",
  "state": "Maharashtra",
  "course": "B.Tech Computer Science",
  "intake": "2025",
  "university": "MIT University",
  "consent": true
}
```

### Verification Steps:
1. ✅ Check if new row appears in Excel/Sheets
2. ✅ Verify all data is correctly formatted
3. ✅ Test email notifications
4. ✅ Check error handling for invalid data

---

## 🚀 Go Live Checklist

- [ ] Excel/Sheets file created with proper headers
- [ ] Pipedream workflow configured and tested
- [ ] Email notifications working
- [ ] Error handling implemented
- [ ] Webhook URL updated in website
- [ ] Test submissions completed successfully

Your form data will now automatically save to Excel! 📊✨
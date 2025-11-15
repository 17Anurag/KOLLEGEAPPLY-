# Pipedream Workflow Setup Guide

## Step 1: Create Pipedream Account
1. Go to [pipedream.com](https://pipedream.com)
2. Sign up for a free account
3. Verify your email

## Step 2: Create New Workflow
1. Click "New Workflow" in your dashboard
2. Choose "HTTP / Webhook" as the trigger
3. Copy the webhook URL (it will look like: `https://eodne8ixqhqhqhq.m.pipedream.net`)

## Step 3: Configure the Workflow

### Trigger Configuration
- **Trigger Type**: HTTP / Webhook
- **HTTP Method**: POST
- **Authentication**: None (for this demo)

### Step 2: Add Data Processing
Add a new step and choose "Run Node.js Code":

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    // Get the form data from the HTTP trigger
    const formData = steps.trigger.event.body;
    
    // Log the received data
    console.log("Received lead data:", formData);
    
    // Validate required fields
    const requiredFields = ['fullName', 'email', 'phone', 'state', 'course', 'intake'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      $.flow.exit(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Process and enrich the data
    const processedData = {
      ...formData,
      leadId: `LEAD_${Date.now()}`,
      source: 'University Landing Page',
      status: 'new',
      createdAt: new Date().toISOString(),
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours later
    };
    
    // Return processed data for next steps
    return processedData;
  },
})
```

### Step 3: Add Email Notification (Optional)
Add another step and choose "Email" service:

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const leadData = steps.data_processing.$return_value;
    
    // Send email to admissions team
    await $.send.email({
      subject: `New Lead: ${leadData.fullName} - ${leadData.university}`,
      text: `
New lead received from ${leadData.university} landing page:

Name: ${leadData.fullName}
Email: ${leadData.email}
Phone: ${leadData.phone}
State: ${leadData.state}
Course: ${leadData.course}
Intake Year: ${leadData.intake}
University: ${leadData.university}

Lead ID: ${leadData.leadId}
Submitted: ${leadData.createdAt}
      `,
      to: "admissions@university.com" // Replace with actual email
    });
    
    return { emailSent: true };
  },
})
```

### Step 4: Add Database Storage (Optional)
You can add steps to store data in:
- Google Sheets
- Airtable
- MySQL/PostgreSQL
- MongoDB

Example for Google Sheets:
1. Add "Google Sheets" step
2. Choose "Add Single Row"
3. Connect your Google account
4. Select spreadsheet and worksheet
5. Map the form fields to columns

### Step 5: Return Response
Add a final step with "HTTP Response":

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const leadData = steps.data_processing.$return_value;
    
    // Return success response
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
        message: "Application submitted successfully",
        leadId: leadData.leadId,
        timestamp: leadData.createdAt
      }
    });
  },
})
```

## Step 4: Test the Workflow
1. Save your workflow
2. Use the "Send Test Event" feature
3. Send sample JSON data:

```json
{
  "fullName": "Test User",
  "email": "test@example.com",
  "phone": "9876543210",
  "state": "Maharashtra",
  "course": "B.Tech Computer Science",
  "intake": "2025",
  "university": "MIT University",
  "consent": true
}
```

## Step 5: Update Your Website
1. Copy your webhook URL from Pipedream
2. Update the `PIPEDREAM_ENDPOINT` in `script.js`
3. Deploy your website

## Advanced Features

### Error Handling
Add error handling in your workflow:

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    try {
      // Your processing logic here
      const result = await processLead(steps.trigger.event.body);
      return result;
    } catch (error) {
      console.error("Error processing lead:", error);
      await $.respond({
        status: 400,
        body: {
          status: "error",
          message: "Failed to process application",
          error: error.message
        }
      });
    }
  },
})
```

### Rate Limiting
Add rate limiting to prevent spam:

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const email = steps.trigger.event.body.email;
    const phone = steps.trigger.event.body.phone;
    
    // Check if this email/phone submitted recently
    // (You'd need to implement storage for this)
    
    // Continue with processing...
  },
})
```

### Integration with CRM
Connect to popular CRMs:
- Salesforce
- HubSpot
- Pipedrive
- Zoho CRM

## Security Best Practices
1. Validate all input data
2. Sanitize data before storage
3. Use HTTPS only
4. Implement rate limiting
5. Add authentication for sensitive operations
6. Log all activities for audit

## Monitoring
- Check Pipedream dashboard for execution logs
- Set up alerts for failed executions
- Monitor response times
- Track conversion rates

Your webhook URL will be something like:
`https://eodne8ixqhqhqhq.m.pipedream.net`

Replace this URL in your `script.js` file to connect your forms to Pipedream!

## 📊 Excel Integration
For automatic Excel file integration, see the detailed guide: `PIPEDREAM_EXCEL_SETUP.md`

**Quick Excel Setup:**
1. Create Google Sheets with headers: Lead ID, Full Name, Email, Phone, State, Course, Intake Year, University, Timestamp
2. Add "Google Sheets - Add Single Row" step to your Pipedream workflow
3. Map form fields to spreadsheet columns
4. Test with sample data

This will automatically save all form submissions to your Excel/Google Sheets file!
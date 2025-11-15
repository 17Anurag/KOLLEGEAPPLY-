# 🚀 SIMPLIFIED PIPEDREAM WORKFLOW

## 📋 Quick Setup Instructions

### Step 1: Create Pipedream Account & Workflow
1. Go to [pipedream.com](https://pipedream.com) and sign up
2. Click "New Workflow"
3. Choose "HTTP / Webhook" trigger
4. **COPY THE WEBHOOK URL** - You'll need this!

---

## 🔧 STEP 1: HTTP TRIGGER (Already Created)
- **Trigger Type**: HTTP / Webhook
- **Method**: POST
- **No additional configuration needed**

---

## 🔧 STEP 2: BASIC VALIDATION (Optional)

**Add Step → Run Node.js Code**

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const formData = steps.trigger.event.body;
    
    console.log("Received form data:", formData);
    
    // Just pass through the data with timestamp and status
    const processedData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      state: formData.state,
      course: formData.course,
      intake: formData.intake,
      university: formData.university,
      timestamp: new Date().toISOString(),
      status: 'New'
    };
    
    return processedData;
  },
})
```

---

## 🔧 STEP 3: GOOGLE SHEETS INTEGRATION

**Add Step → Google Sheets → Add Single Row**

### First, Create Your Google Sheet:
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create new spreadsheet: "University Leads Database"
3. In Row 1, add these headers exactly:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Full Name | Email | Phone | State | Course | Intake | University | Timestamp | Status |

### Then Configure the Google Sheets Step:
1. **Connect Google Account** (Click "Connect Account")
2. **Spreadsheet**: Select your "University Leads Database"
3. **Worksheet**: Sheet1
4. **Values**: Use this array (copy exactly):

```javascript
[
  steps.data_processing.$return_value.fullName,
  steps.data_processing.$return_value.email,
  steps.data_processing.$return_value.phone,
  steps.data_processing.$return_value.state,
  steps.data_processing.$return_value.course,
  steps.data_processing.$return_value.intake,
  steps.data_processing.$return_value.university,
  steps.data_processing.$return_value.timestamp,
  steps.data_processing.$return_value.status
]
```

---

## 🔧 STEP 4: SUCCESS RESPONSE

**Add Step → HTTP Response**

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
        "Access-Control-Allow-Headers": "Content-Type, X-Requested-With"
      },
      body: {
        status: "success",
        message: "Application submitted successfully! Data saved to Excel.",
        university: leadData.university,
        course: leadData.course,
        timestamp: leadData.timestamp
      }
    });
    
    return { success: true };
  },
})
```

---

## 🎯 FINAL SETUP STEPS

### 1. Save Your Workflow
- Click "Save" in Pipedream
- Make sure workflow is **Active/Enabled**

### 2. Copy Your Webhook URL
- Copy the webhook URL from Step 1 (HTTP Trigger)
- It looks like: `https://eoxyz123abc.m.pipedream.net`

### 3. Update Your Website
Replace the URL in your `script.js` file:

```javascript
const API_CONFIG = {
    PIPEDREAM_ENDPOINT: 'YOUR_ACTUAL_WEBHOOK_URL_HERE', // Paste your URL here
    USE_TEST_MODE: false // Set to false to use real Pipedream
};
```

### 4. Test Everything
1. Submit a test form on your website
2. Check your Google Sheet for new data
3. Verify the success message appears

---

## 📊 Your Excel File Will Look Like This:

| Full Name | Email | Phone | State | Course | Intake | University | Timestamp | Status |
|-----------|-------|-------|-------|--------|--------|------------|-----------|--------|
| John Doe | john@email.com | 9876543210 | Maharashtra | B.Tech CS | 2025 | MIT University | 2024-12-21T... | New |
| Jane Smith | jane@email.com | 9876543211 | Karnataka | MBA | 2025 | Stanford University | 2024-12-21T... | New |

## 🎉 DONE! 

Your simplified system includes:
- ✅ **Essential Data Only** - 9 clean columns
- ✅ **Automatic Excel Integration** - Real-time data saving
- ✅ **Data Validation** - Clean, validated data
- ✅ **Simple Setup** - Just 4 steps!

**Ready to go live!** 🚀
# 🚀 COMPLETE SETUP GUIDE - DO EVERYTHING

## ✅ **STEP 1: CREATE GOOGLE SHEET (2 minutes)**

### **Go to Google Sheets:**
1. **Open new tab:** [sheets.google.com](https://sheets.google.com)
2. **Click "Blank" to create new spreadsheet**
3. **Name it:** "University Leads Database" (click on "Untitled spreadsheet" at top)

### **Add Column Headers in Row 1:**
Copy and paste these headers exactly in Row 1:

| A1 | B1 | C1 | D1 | E1 | F1 | G1 | H1 | I1 |
|---|---|---|---|---|---|---|---|---|
| Full Name | Email | Phone | State | Course | Intake | University | Timestamp | Status |

**Type each header in the corresponding cell (A1, B1, C1, etc.)**

---

## ✅ **STEP 2: COMPLETE PIPEDREAM WORKFLOW (5 minutes)**

### **Go back to your Pipedream workflow:**
Your webhook URL: `https://eoqg8odwa0fnqnn.m.pipedream.net`

### **Add Step 2: Data Processing**
1. **Click the "+" button** below your HTTP trigger
2. **Choose "Code" or "Run Node.js Code"**
3. **Delete any existing code and paste this:**

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const formData = steps.trigger.event.body;
    
    console.log("Received form data:", formData);
    
    // Just pass through the data with timestamp and status
    const processedData = {
      fullName: formData.fullName || '',
      email: formData.email || '',
      phone: formData.phone || '',
      state: formData.state || '',
      course: formData.course || '',
      intake: formData.intake || '',
      university: formData.university || '',
      timestamp: new Date().toISOString(),
      status: 'New'
    };
    
    return processedData;
  },
})
```

4. **Click "Save"**

### **Add Step 3: Google Sheets Integration**
1. **Click the "+" button** below Step 2
2. **Search for "Google Sheets"**
3. **Choose "Google Sheets" → "Add Single Row"**
4. **Click "Connect Account"** and sign in with your Google account
5. **Select your spreadsheet:** "University Leads Database"
6. **Select worksheet:** "Sheet1"
7. **In the "Values" field, paste this array:**

```javascript
[
  steps.step_2.$return_value.fullName,
  steps.step_2.$return_value.email,
  steps.step_2.$return_value.phone,
  steps.step_2.$return_value.state,
  steps.step_2.$return_value.course,
  steps.step_2.$return_value.intake,
  steps.step_2.$return_value.university,
  steps.step_2.$return_value.timestamp,
  steps.step_2.$return_value.status
]
```

8. **Click "Save"**

### **Add Step 4: Success Response**
1. **Click the "+" button** below Step 3
2. **Choose "HTTP Response"**
3. **Delete any existing code and paste this:**

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const leadData = steps.step_2.$return_value;
    
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

4. **Click "Save"**

### **Activate Your Workflow:**
1. **Look for the toggle switch** at the top of your workflow
2. **Make sure it's ON/Active** (should be green)
3. **If it's off, click it to turn it on**

---

## ✅ **STEP 3: TEST EVERYTHING (2 minutes)**

### **Test Your Form:**
1. **Go to your MIT University page** (`mit-university.html`)
2. **Fill out the form with test data:**
   - Full Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - State: Maharashtra
   - Course: B.Tech Computer Science
   - Intake Year: 2025
   - ✅ Check the consent checkbox

3. **Click "Submit Application"**

### **Check Results:**
1. **You should see:** "Application submitted successfully! Data saved to Excel."
2. **Go to your Google Sheet** - you should see a new row with your test data!
3. **If it worked:** 🎉 **YOU'RE DONE!**

---

## ✅ **STEP 4: TROUBLESHOOTING (if needed)**

### **If Form Shows Error:**
1. **Check Pipedream workflow logs:**
   - Go to your workflow
   - Click "Executions" tab
   - Look for error messages

2. **Common Issues:**
   - Workflow not active (turn on the toggle)
   - Google account not connected
   - Wrong spreadsheet selected
   - Missing step in workflow

### **If No Data in Google Sheet:**
1. **Check Google Sheets step:**
   - Make sure correct spreadsheet is selected
   - Verify the values array is correct
   - Check if Google account has permissions

### **Test Pipedream Directly:**
1. **In your workflow, click "Test"**
2. **Send sample data to see if it works**

---

## 🎯 **FINAL CHECKLIST**

- [ ] Google Sheet created with 9 column headers
- [ ] Pipedream workflow has 4 steps (Trigger + 3 custom steps)
- [ ] Workflow is Active/On
- [ ] Google account connected to Pipedream
- [ ] Test form submission successful
- [ ] Data appears in Google Sheet
- [ ] Success message shows on website

## 🎉 **WHEN EVERYTHING WORKS:**

Your system will:
- ✅ **Accept form submissions** from your website
- ✅ **Save data to Google Sheets** in real-time
- ✅ **Show success message** to users
- ✅ **Track all leads** with timestamp and status

**Your university landing pages are now live with real-time Excel integration!** 🚀

---

## 📊 **Your Excel Data Will Look Like:**

| Full Name | Email | Phone | State | Course | Intake | University | Timestamp | Status |
|-----------|-------|-------|-------|--------|--------|------------|-----------|--------|
| Test User | test@example.com | 9876543210 | Maharashtra | B.Tech Computer Science | 2025 | MIT University | 2024-12-21T10:30:00Z | New |

**Ready to capture real leads!** 🎯
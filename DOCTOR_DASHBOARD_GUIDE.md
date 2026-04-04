# How to View Doctor Dashboard POV

## Option 1: Manual Registration (Recommended)

### Step 1: Go to Doctor Signup
1. Open your app at `http://localhost:5174`
2. Click on the **"↻ Back to Home"** link or navigate to `/`
3. Click **"Doctor"** button (purple/indigo colored)
4. Click **"Sign Up"** tab

### Step 2: Register First Doctor - Dr. Priya Mehta
Fill in these details:
- **Full Name:** Dr. Priya Mehta
- **Email:** priya.mehta@apollo.com
- **Phone:** 9876543210
- **Password:** Doctor@123
- **Years of Experience:** 8
- **Specialty:** Cardiology
- **Hospital/Clinic:** Apollo Clinic
- **License Number:** MED-PRIYA-001

Click **"Sign Up as Doctor"** button

### Step 3: Repeat for Other Doctors

**Dr. Rohit Sharma:**
- Full Name: Dr. Rohit Sharma
- Email: rohit.sharma@skincare.com
- Phone: 9876543211
- Password: Doctor@456
- Years of Experience: 6
- Specialty: Dermatology
- Hospital/Clinic: Skin Care Hub
- License Number: MED-ROHIT-001

**Dr. Anita Kapoor:**
- Full Name: Dr. Anita Kapoor
- Email: anita.kapoor@bonecenter.com
- Phone: 9876543212
- Password: Doctor@789
- Years of Experience: 10
- Specialty: Orthopedics
- Hospital/Clinic: Bone & Joint Centre
- License Number: MED-ANITA-001

### Step 4: Login as Doctor
1. Go to login page
2. Select **"Doctor"** role
3. Enter email and password
4. Click **"Sign In"**
5. You'll be redirected to **Doctor Dashboard**

---

## Option 2: Automated Setup (Via Script)

If you want to set up all doctors at once:

```bash
node setup-test-doctors.js
```

This will:
- Create authentication accounts
- Register doctor profiles in database
- Make them immediately ready to login

---

## Doctor Dashboard Features

Once logged in as a doctor, you can:

### 📊 Dashboard
- View today's appointment summary
- See upcoming appointments with predictions
- Check queue metrics
- Monitor your performance

### 📅 My Schedule
- View your calendar
- See all booked appointments
- Check AI-predicted durations
- Monitor no-show risk levels

### 🔴 Live Queue
- Real-time patient queue visualization
- Current wait times
- Patient details in queue
- Queue health metrics

### 📋 Appointments
- Full appointment history
- Filter by status (confirmed, completed, cancelled, no-show)
- See patient details
- Review appointment reasons

### 👥 Patient Records
- Access patient medical history
- View past consultations
- Check patient demographics

### 💊 Prescriptions
- Manage patient prescriptions
- View prescription history

### 📈 Analytics
- Queue performance metrics
- Doctor utilization
- Average consultation time
- No-show analysis

### ⚙️ Settings
- Manage availability
- Set working hours
- Update profile information
- Configure notifications

---

## Sample Test Data

The appointments created during testing will show:
- Patient name
- Appointment time with **AI-predicted duration**
- Consultation reason
- **No-show risk assessment** (Low/Medium/High)
- Current queue status
- Patient demographics for risk calculation

---

## Troubleshooting

### Doctor not appearing in patient booking list?
- Make sure the doctor account is set to `is_active: true`
- Doctor must have at least one availability slot configured

### Can't login?
- Double-check the email and password
- Confirm you're clicking the "Doctor" button (not Patient)
- Clear browser cache and try again

### No appointments showing?
- Appointments appear when a patient books with this doctor
- Use a patient account to book an appointment first
- Then login as the doctor to see it

---

## Quick Links

- **App URL:** http://localhost:5174
- **Patient Login:** Select "Patient" → Enter patient credentials
- **Doctor Login:** Select "Doctor" → Enter doctor credentials

Good luck exploring the doctor POV! 🏥✨

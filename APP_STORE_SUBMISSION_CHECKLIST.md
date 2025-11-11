# App Store Submission Checklist

## ✅ Completed Items

- [x] Bundle identifier updated: `com.athletica.sports`
- [x] Info.plist configured with privacy policy URL
- [x] Network security settings configured
- [x] Encryption declaration added
- [x] Duplicate UIRequiredDeviceCapabilities fixed
- [x] Icon configuration file created
- [x] Privacy policy template created
- [x] Performance optimizations implemented

## 🔴 Critical: Must Complete Before Submission

### 1. Generate App Icons (2-3 hours)
**Status**: Configuration ready, need to generate images

**Action Required:**
1. Use your 1024x1024 source icon
2. Follow `ICON_GENERATION_GUIDE.md` to generate all sizes
3. Copy all PNG files to: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
4. Verify in Xcode that all icons are present

**Quick Method:**
- Visit https://www.appicon.co/
- Upload your 1024x1024 icon
- Download iOS icons
- Extract to the AppIcon.appiconset folder

### 2. Create & Host Privacy Policy (4-6 hours)
**Status**: Template created, needs customization and hosting

**Action Required:**
1. Open `PRIVACY_POLICY.md`
2. Replace placeholders:
   - `[DATE]` → Current date
   - `[YOUR_EMAIL]` → Your contact email
   - `[YOUR_ADDRESS]` → Your business address (optional)
3. Customize content for your specific data practices
4. Host at: `https://athleticasports.app/privacy`
   - Or update Info.plist line 69 with your actual URL

**Alternative**: If you don't have a website yet, you can:
- Use GitHub Pages (free)
- Use a simple hosting service
- Update Info.plist URL once hosted

### 3. Test on Physical Device (2 hours)
**Action Required:**
1. Connect iPhone to Mac
2. Open Xcode: `ios/App/App.xcodeproj`
3. Select your device
4. Build and run (⌘R)
5. Test all major features:
   - [ ] Login/Registration
   - [ ] Create team
   - [ ] Join team
   - [ ] Create event
   - [ ] Log activity
   - [ ] View feed
   - [ ] Settings
6. Check for crashes or UI issues
7. Test on different iOS versions if possible

## 🟡 Important: App Store Connect Setup

### Apple Developer Account
- [ ] Enroll in Apple Developer Program ($99/year)
  - Visit: https://developer.apple.com/programs/
  - Complete enrollment (can take 24-48 hours)

### App Store Connect
- [ ] Create App Store Connect account
- [ ] Register Bundle ID: `com.athletica.sports`
- [ ] Create new app listing
- [ ] Fill in basic information:
  - App Name: "Athletica"
  - Primary Language: English
  - Bundle ID: `com.athletica.sports`
  - SKU: (unique identifier, e.g., "athletica-001")

## 🟢 App Store Metadata (Complete in App Store Connect)

### Required Information
- [ ] **App Description** (up to 4000 characters)
  - What your app does
  - Key features
  - Target audience
  - Example:
    ```
    Athletica is a community platform designed to empower women in sports. 
    Connect with teammates, track your activities, organize events, and 
    build lasting relationships in the world of women's athletics.
    
    Features:
    • Create and join teams
    • Track your sports activities
    • Organize and attend events
    • Connect with other athletes
    • View team performance metrics
    ```

- [ ] **Keywords** (up to 100 characters)
  - Example: "sports, fitness, women, team, community, athletics, training, match"

- [ ] **Support URL**
  - Your support/help page
  - Can be same as privacy policy page with support section

- [ ] **Marketing URL** (optional)
  - Your main website

- [ ] **Category**
  - Primary: Sports
  - Secondary: Health & Fitness

- [ ] **Age Rating**
  - Complete questionnaire in App Store Connect
  - Likely: 4+ (no objectionable content)

- [ ] **Pricing**
  - Free or Paid
  - If paid, set price tier

### Screenshots (Required)
- [ ] **iPhone 6.7"** (iPhone 14 Pro Max, 15 Pro Max)
  - Need: 3-10 screenshots
  - Resolution: 1290 x 2796 pixels
  - Capture key screens: Home, Teams, Events, Profile

- [ ] **iPhone 6.5"** (iPhone 11 Pro Max, XS Max)
  - Need: 3-10 screenshots
  - Resolution: 1242 x 2688 pixels

- [ ] **iPhone 5.5"** (iPhone 8 Plus)
  - Need: 3-10 screenshots
  - Resolution: 1242 x 2208 pixels

- [ ] **iPad Pro 12.9"** (if supporting iPad)
  - Need: 3-10 screenshots
  - Resolution: 2048 x 2732 pixels

**Screenshot Tips:**
- Show your best features
- Use real data (not placeholders)
- Ensure text is readable
- Highlight unique features
- First screenshot is most important

### App Preview Video (Optional but Recommended)
- [ ] Create 15-30 second video showcasing app
- [ ] Show key features and user flow
- [ ] Upload to App Store Connect

## 🔵 Build & Upload Process

### 1. Archive Build in Xcode
- [ ] Open `ios/App/App.xcodeproj` in Xcode
- [ ] Select "Any iOS Device" as target
- [ ] Product → Archive
- [ ] Wait for archive to complete

### 2. Validate Archive
- [ ] In Organizer window, click "Validate App"
- [ ] Sign in with Apple Developer account
- [ ] Select your team
- [ ] Wait for validation (checks for common issues)
- [ ] Fix any validation errors

### 3. Upload to App Store Connect
- [ ] In Organizer, click "Distribute App"
- [ ] Select "App Store Connect"
- [ ] Choose distribution method
- [ ] Select your team and certificates
- [ ] Upload build
- [ ] Wait for processing (15-30 minutes)

### 4. Submit for Review
- [ ] Go to App Store Connect
- [ ] Select your app
- [ ] Go to "App Store" tab
- [ ] Complete all required metadata
- [ ] Select the uploaded build
- [ ] Add screenshots
- [ ] Submit for review
- [ ] Answer any export compliance questions

## 📋 Pre-Submission Testing Checklist

### Functionality
- [ ] App launches without crashes
- [ ] All navigation works
- [ ] Login/Registration works
- [ ] Core features function correctly
- [ ] Offline behavior is acceptable
- [ ] Error handling works properly

### UI/UX
- [ ] Safe area handling on notched devices
- [ ] Text is readable at all sizes
- [ ] Buttons meet 44x44pt minimum touch target
- [ ] No UI elements cut off
- [ ] Dark mode works (if supported)
- [ ] Landscape orientation works (if supported)

### Performance
- [ ] App loads in reasonable time
- [ ] No lag or stuttering
- [ ] Images load properly
- [ ] Network requests complete successfully

### Compliance
- [ ] Privacy policy is accessible
- [ ] All required Info.plist keys are present
- [ ] No prohibited content
- [ ] Age rating is appropriate

## ⏱️ Estimated Timeline

### Fast Track (TestFlight Beta)
- **Day 1**: Generate icons + Privacy policy (6-8 hours)
- **Day 2**: Test on device + Fix issues (4-6 hours)
- **Day 3**: Upload to TestFlight (2-3 hours)
- **Total**: 3 days to beta testing

### Full App Store Release
- **Week 1**: Icons, Privacy policy, Screenshots, Metadata (15-20 hours)
- **Week 2**: Build, Upload, Submit, Review (5-10 hours + wait time)
- **Total**: 1-2 weeks to public release

## 🚨 Common Issues & Solutions

### Issue: "Missing App Icon"
**Solution**: Ensure all icon sizes are in AppIcon.appiconset folder

### Issue: "Privacy Policy URL not accessible"
**Solution**: Verify URL is live and returns 200 status code

### Issue: "Invalid Bundle Identifier"
**Solution**: Ensure bundle ID matches exactly in Xcode and App Store Connect

### Issue: "Missing Compliance Information"
**Solution**: Answer export compliance questions in App Store Connect

### Issue: "App Preview Rejected"
**Solution**: Ensure preview shows actual app functionality, not just marketing

## 📞 Support Resources

- **Apple Developer Support**: https://developer.apple.com/support/
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **App Store Connect Help**: https://help.apple.com/app-store-connect/

## 🎯 Next Steps (Priority Order)

1. **TODAY**: Generate app icons
2. **TODAY**: Create and host privacy policy
3. **TOMORROW**: Test on physical device
4. **THIS WEEK**: Set up Apple Developer account (if not done)
5. **THIS WEEK**: Capture screenshots
6. **NEXT WEEK**: Build, upload, and submit

---

**Remember**: You can start with TestFlight beta testing to gather feedback before public release. This is faster and allows you to iterate based on real user feedback!


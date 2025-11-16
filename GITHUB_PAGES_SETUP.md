# GitHub Pages Setup Instructions

The privacy policy has been prepared and is ready to be published on GitHub Pages.

## Files Created

- `docs/privacy.html` - Formatted HTML version of the privacy policy
- `docs/index.html` - Redirect page

## Setup Steps

### 1. Commit and Push Files

```bash
# Add the docs folder
git add docs/

# Commit the changes
git commit -m "Add privacy policy for GitHub Pages"

# Push to GitHub
git push origin main
```

### 2. Enable GitHub Pages

1. **Go to your GitHub repository**: https://github.com/Pascale-1/athleticasports
2. **Click on "Settings"** (top menu)
3. **Scroll down to "Pages"** (left sidebar)
4. **Under "Source"**, select:
   - **Branch**: `main`
   - **Folder**: `/docs`
5. **Click "Save"**

### 3. Wait for Deployment

- GitHub Pages will take 1-2 minutes to deploy
- You'll see a green checkmark when it's ready
- The URL will be displayed in the Pages settings

### 4. Your Privacy Policy URL

Once enabled, your privacy policy will be available at:

**Primary URL**: `https://pascale-1.github.io/athleticasports/privacy.html`

**Alternative**: `https://pascale-1.github.io/athleticasports/privacy.html`

### 5. Update Info.plist (If Needed)

If you want to use the GitHub Pages URL, update the iOS Info.plist:

```xml
<key>NSPrivacyPolicyURL</key>
<string>https://pascale-1.github.io/athleticasports/privacy.html</string>
```

**OR** keep the current URL (`https://athleticasports.app/privacy`) if you plan to set up a custom domain later.

## Custom Domain (Optional)

If you want to use `athleticasports.app` instead of the GitHub Pages URL:

1. **Set up DNS** for your domain:
   - Add a CNAME record pointing to `pascale-1.github.io`
2. **In GitHub Pages settings**:
   - Enter your custom domain: `athleticasports.app`
3. **Create a CNAME file** in the `docs` folder:
   ```
   athleticasports.app
   ```

## Verification

After setup, verify the privacy policy is accessible:

```bash
curl -I https://pascale-1.github.io/athleticasports/privacy.html
```

Should return: `HTTP/2 200`

## Troubleshooting

### Issue: 404 Not Found
- **Solution**: Wait 2-3 minutes for GitHub Pages to deploy
- Check that `/docs` folder is selected in Pages settings

### Issue: Page not updating
- **Solution**: Clear browser cache or wait a few minutes
- GitHub Pages can take up to 10 minutes to update

### Issue: Custom domain not working
- **Solution**: Verify DNS settings
- Check CNAME file in docs folder
- Wait 24-48 hours for DNS propagation

---

**Status**: Files are ready! Just commit, push, and enable GitHub Pages in settings.


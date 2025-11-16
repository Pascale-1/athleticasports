# Custom Domain Setup for GitHub Pages

Your privacy policy will be accessible at: `https://athleticasports.app/privacy`

## DNS Configuration Required

To use your custom domain `athleticasports.app` with GitHub Pages, you need to configure DNS records.

### Step 1: Configure DNS Records

Go to your domain registrar (where you purchased `athleticasports.app`) and add these DNS records:

#### Option A: Apex Domain (Recommended)
Add **4 A records** pointing to GitHub Pages IPs:

```
Type: A
Name: @ (or leave blank)
Value: 185.199.108.153
TTL: 3600

Type: A
Name: @ (or leave blank)
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @ (or leave blank)
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @ (or leave blank)
Value: 185.199.111.153
TTL: 3600
```

#### Option B: CNAME Record (Alternative)
If your DNS provider supports CNAME for apex domains:

```
Type: CNAME
Name: @ (or leave blank)
Value: pascale-1.github.io
TTL: 3600
```

**Note**: Not all DNS providers support CNAME for apex domains. If yours doesn't, use Option A.

### Step 2: Enable Custom Domain in GitHub

1. **Go to**: https://github.com/Pascale-1/athleticasports/settings/pages
2. **Under "Custom domain"**, enter: `athleticasports.app`
3. **Check**: "Enforce HTTPS" (recommended)
4. **Click**: "Save"

### Step 3: Wait for DNS Propagation

- DNS changes can take **24-48 hours** to propagate
- You can check status at: https://dnschecker.org
- Enter: `athleticasports.app` and check for the A records

### Step 4: Verify SSL Certificate

GitHub Pages will automatically provision an SSL certificate for your domain. This usually takes:
- **5-10 minutes** after DNS is configured
- You'll see a green checkmark in GitHub Pages settings when ready

## Verification

Once DNS is configured and SSL is ready, verify:

```bash
curl -I https://athleticasports.app/privacy.html
```

Should return: `HTTP/2 200`

## Troubleshooting

### Issue: "Domain not verified"
- **Solution**: Wait for DNS propagation (can take up to 48 hours)
- Check DNS records are correct using: `dig athleticasports.app`

### Issue: "SSL certificate pending"
- **Solution**: Wait 5-10 minutes after DNS is configured
- GitHub automatically provisions SSL certificates

### Issue: "Site not loading"
- **Solution**: 
  - Verify DNS records are correct
  - Check DNS propagation status
  - Ensure GitHub Pages is enabled for `/docs` folder

### Issue: "Mixed content warnings"
- **Solution**: Ensure "Enforce HTTPS" is checked in GitHub Pages settings

## Current Status

✅ CNAME file created in `docs/` folder  
✅ Info.plist updated to use `https://athleticasports.app/privacy`  
⏳ Waiting for: DNS configuration and GitHub Pages custom domain setup

## Quick Checklist

- [ ] Add DNS A records (or CNAME) at domain registrar
- [ ] Enter custom domain in GitHub Pages settings
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Wait for SSL certificate (5-10 minutes after DNS)
- [ ] Verify privacy policy is accessible
- [ ] Test in iOS app

---

**Note**: The privacy policy will work with the GitHub Pages URL (`https://pascale-1.github.io/athleticasports/privacy.html`) immediately, but the custom domain will take 24-48 hours to be fully configured.


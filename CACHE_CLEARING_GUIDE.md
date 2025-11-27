# Cache Clearing Guide for Firebase Hosting

## 🔄 The Issue

After deploying code changes to Firebase Hosting, you might still see the old version due to aggressive caching at multiple levels:

1. **Browser Cache** - Your browser stores old files
2. **Service Worker Cache** - Progressive Web Apps cache aggressively
3. **CDN Cache** - Firebase's CDN caches files globally
4. **DNS Cache** - Your computer caches DNS lookups

## ✅ Step-by-Step Cache Clearing

### Method 1: Hard Refresh (Try This First)

#### Windows/Linux
```
Ctrl + Shift + R
```
or
```
Ctrl + F5
```

#### Mac
```
Cmd + Shift + R
```

### Method 2: Clear Browser Cache Completely

#### Chrome
1. Press `F12` to open DevTools
2. Right-click the **Refresh** button (while DevTools is open)
3. Select **"Empty Cache and Hard Reload"**

Or:
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"

#### Firefox
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cache"
3. Click "Clear Now"

#### Safari
1. Press `Cmd + Option + E` to empty caches
2. Then `Cmd + R` to reload

### Method 3: Incognito/Private Window

Open the site in an incognito/private window:
- **Chrome**: `Ctrl + Shift + N` (Windows) or `Cmd + Shift + N` (Mac)
- **Firefox**: `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac)
- **Safari**: `Cmd + Shift + N`

This bypasses all browser caches.

### Method 4: Clear Site Data (Nuclear Option)

#### Chrome
1. Click the **lock icon** or **info icon** in the address bar
2. Click **"Site settings"**
3. Scroll down and click **"Clear data"**
4. Confirm

#### Firefox
1. Click the **lock icon** in the address bar
2. Click **"Clear cookies and site data"**
3. Confirm

### Method 5: Disable Cache in DevTools

1. Open DevTools (`F12`)
2. Go to **Network** tab
3. Check **"Disable cache"** checkbox
4. Keep DevTools open while testing
5. Refresh the page

## 🔍 Verify the Deployed Code

### Check if New Code is Deployed

1. Open DevTools (`F12`)
2. Go to **Sources** tab
3. Look for your JavaScript files (usually in `assets/` folder)
4. Search for `getTenantIdFromUrl` function
5. Verify it contains the new code:

```javascript
// NEW CODE (Should see this):
const queryTenantId = urlParams.get('tenant');
if (queryTenantId) {
    return queryTenantId; // This should be FIRST
}

// OLD CODE (Should NOT see this):
if (hostname.includes('localhost') || parts.length <= 2) {
    const urlParams = new URLSearchParams(window.location.search);
    // ...
}
```

### Check Console for Tenant ID

1. Open DevTools (`F12`)
2. Go to **Console** tab
3. Type:
```javascript
window.location.search
```
Should show: `"?tenant=tenant-a"`

4. Type:
```javascript
new URLSearchParams(window.location.search).get('tenant')
```
Should show: `"tenant-a"`

## ⏱️ Firebase Deployment Timeline

After pushing to GitHub:

| Time | Status |
|------|--------|
| 0-30 seconds | GitHub receives push |
| 30-60 seconds | Firebase detects change |
| 1-3 minutes | Build starts |
| 3-5 minutes | Build completes |
| 5-7 minutes | Deploy to CDN starts |
| 7-10 minutes | **Fully deployed globally** |

**Wait at least 10 minutes** after pushing before testing.

## 🧪 Testing Checklist

After clearing cache:

- [ ] Hard refresh (`Ctrl + Shift + R`)
- [ ] Check DevTools Network tab shows new files
- [ ] Verify `getTenantIdFromUrl` code in Sources
- [ ] Test URL: `?tenant=tenant-a` shows "TENANT-A"
- [ ] Test URL: `?tenant=tenant-b` shows "TENANT-B"
- [ ] Test URL: `?tenant=demo` shows "DEMO"

## 🚨 If Still Not Working

### Check Firebase Hosting Status

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to **Hosting** section
4. Check **"Release history"**
5. Verify latest deployment shows "Success"

### Check Build Output

Look at the GitHub Actions logs:
1. Go to your GitHub repository
2. Click **"Actions"** tab
3. Click the latest workflow run
4. Check for build errors

### Force a New Deployment

If Firebase didn't auto-deploy:

```bash
# In your project directory
npm run build
firebase deploy --only hosting
```

### Add Cache-Busting Query Parameter

As a temporary workaround, add a random parameter:
```
https://volunteer-connection-479402.web.app/?tenant=tenant-a&v=2
```

Change `v=2` to `v=3`, `v=4`, etc. to force cache bypass.

## 📝 Current Deployment

**Latest Code Version:**
- Query parameter is checked FIRST
- Safe fallback to `'tenant-a'` instead of project ID
- No more `'volunteer-connection-479402'` showing up

**Expected Behavior:**
```
URL: ?tenant=tenant-a
Display: "Tenant: TENANT-A" ✅

URL: ?tenant=tenant-b  
Display: "Tenant: TENANT-B" ✅

URL: (no query param)
Display: "Tenant: TENANT-A" ✅ (safe fallback)
```

## 🎯 Quick Test Commands

Open DevTools Console and run:

```javascript
// Test 1: Check URL parameter
console.log('Query param:', new URLSearchParams(window.location.search).get('tenant'));

// Test 2: Check what getTenantIdFromUrl returns (if accessible)
// This might not work if the function is in a module, but try:
console.log('Hostname:', window.location.hostname);

// Test 3: Check localStorage (tenant might be cached)
console.log('Stored user:', localStorage.getItem('user'));
```

If `localStorage` shows old tenant data, clear it:
```javascript
localStorage.clear();
location.reload();
```

---

## ✅ Final Checklist

Before concluding the cache is the issue:

1. [ ] Waited 10+ minutes after push
2. [ ] Tried hard refresh (Ctrl+Shift+R)
3. [ ] Tried incognito window
4. [ ] Cleared all site data
5. [ ] Verified code in DevTools Sources
6. [ ] Checked Firebase deployment status
7. [ ] Cleared localStorage

If ALL of these are done and it still shows the wrong tenant, there may be a code logic issue that needs debugging.

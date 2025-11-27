# Debugging Tenant Detection - Console Logging Guide

## 🔍 What Was Added

I've added **console logging** to the `getTenantIdFromUrl()` function so you can see exactly which logic path is being executed.

## 📋 How to Debug

### Step 1: Open Browser Console

1. Visit: `https://volunteer-connection-479402.web.app/?tenant=tenant-a`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab

### Step 2: Look for Tenant Detection Logs

You should see one of these messages:

```
[TENANT] Using build-time tenant ID: tenant-a
[TENANT] Using query param tenant ID: tenant-a
[TENANT] Using localhost default: tenant-a
[TENANT] Using subdomain: volunteer-connection-479402
[TENANT] Using emergency fallback: tenant-a
```

### Step 3: Interpret the Results

| Message | Meaning | Action |
|---------|---------|--------|
| `Using build-time tenant ID` | Environment variable is set (good for testing) | ✅ Working as intended |
| `Using query param tenant ID` | Query parameter detected | ✅ Should show correct tenant |
| `Using localhost default` | Running on localhost | ✅ Normal for local dev |
| `Using subdomain` | Reading from hostname | ⚠️ If shows project ID, this is the issue |
| `Using emergency fallback` | All other methods failed | ⚠️ Should default to tenant-a |

## 🧪 Test Scenarios

### Test 1: Query Parameter
```
URL: ?tenant=tenant-a
Expected Log: [TENANT] Using query param tenant ID: tenant-a
Expected Display: Tenant: TENANT-A
```

### Test 2: Query Parameter (Different Tenant)
```
URL: ?tenant=tenant-b
Expected Log: [TENANT] Using query param tenant ID: tenant-b
Expected Display: Tenant: TENANT-B
```

### Test 3: No Query Parameter
```
URL: (no query param)
Expected Log: [TENANT] Using subdomain: volunteer-connection-479402
OR: [TENANT] Using emergency fallback: tenant-a
Expected Display: Tenant: VOLUNTEER-CONNECTION-479402 or Tenant: TENANT-A
```

## 🐛 If Still Showing Wrong Tenant

### Check 1: Verify Console Logs

If the console shows:
```
[TENANT] Using query param tenant ID: tenant-a
```

But the display still shows `VOLUNTEER-CONNECTION-479402`, then:
- The tenant ID is being detected correctly
- But something else is overriding it later
- Check `localStorage` for cached data:
  ```javascript
  localStorage.getItem('user')
  ```

### Check 2: Clear localStorage

```javascript
// In console:
localStorage.clear();
location.reload();
```

### Check 3: Verify URL Parameter

```javascript
// In console:
new URLSearchParams(window.location.search).get('tenant')
// Should return: "tenant-a"
```

### Check 4: Check if Code is Updated

```javascript
// In console, check if the function has console.log statements:
getTenantIdFromUrl.toString()
// Should contain: console.log('[TENANT]
```

## 📊 Current Deployment Status

**Latest Changes:**
- ✅ Added console logging to all detection paths
- ✅ Query parameter is checked FIRST
- ✅ Safe fallback to `tenant-a`
- ✅ Pushed to GitHub

**Deployment Timeline:**
- Code pushed: Just now
- Build starts: ~1 minute
- Deploy completes: ~5-7 minutes
- **Test after: 10 minutes**

## 🎯 Next Steps

1. **Wait 10 minutes** for deployment
2. **Hard refresh** (`Ctrl + Shift + R`)
3. **Open Console** (`F12`)
4. **Check logs** for `[TENANT]` messages
5. **Report back** which log message you see

## 💡 Understanding the Logs

The console logs will tell us EXACTLY where the issue is:

- If you see `Using query param` but wrong display → localStorage issue
- If you see `Using subdomain` → Query param not being read
- If you see `Using emergency fallback` → All detection failed
- If you see NO logs → Old code still cached

## 🔧 Manual Override (If Needed)

If nothing works, you can manually set the tenant in console:

```javascript
// Force tenant-a
localStorage.setItem('user', JSON.stringify({
  id: 1,
  email: 'test@example.com',
  role: 'admin',
  tenantId: 'tenant-a'
}));
location.reload();
```

---

**The console logs will give us definitive proof of what's happening!** 🎯

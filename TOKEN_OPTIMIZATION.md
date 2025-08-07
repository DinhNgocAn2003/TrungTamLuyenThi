# Authentication & Token Optimization

## Current Changes Made:

### 1. Reduced Token Information
- `getUserProfileById()` now only selects essential fields: `id, user_id, role, full_name, email, phone`
- Removed `select('*')` to prevent unnecessary data in userProfile

### 2. Role Source Verification
- Added debug logs to confirm role is fetched from `user_profiles` table
- Added console logs to show full userProfile object
- Clarified error messages to specify "user_profiles table"

### 3. Debug Information Added
- Login.jsx now logs full userProfile to verify data source
- AuthContext logs user token payload to inspect what's in the JWT
- Better error messages specifying data source

## Current Flow:
```
1. User enters credentials
2. signInWithEmailOrPhone() calls Supabase auth (minimal token)
3. AuthContext triggers refreshUserProfile()
4. getUserProfileById() fetches from user_profiles table (limited fields)
5. Login page waits for userProfile.role
6. Redirect based on role from user_profiles
```

## To Test:
1. Login and check console for token payload
2. Verify role comes from user_profiles table
3. Check if userProfile contains only essential fields
4. Confirm redirect works with role from database

## Next Steps if Token Still Too Heavy:
1. Implement Supabase Auth Hooks to customize JWT claims
2. Use Edge Functions to minimize token payload
3. Store minimal identifiers only, fetch everything from DB
4. Implement custom token refresh logic

## Debug Commands:
- Check token: `console.log('Token:', session.access_token)`
- Decode JWT: Use jwt.io to inspect token contents
- Check user_profiles: Verify role field exists and has correct values

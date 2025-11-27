/**
 * Extracts the tenant ID, checking query params first for testing,
 * then falling back to the subdomain for production use.
 */
export const getTenantIdFromUrl = (): string => {
    // 1. Check for BUILD-TIME OVERRIDE (For testing/verification)
    // This is set during the build process via VITE_TESTING_TENANT_ID
    const buildTenantId = import.meta.env.VITE_TESTING_TENANT_ID;
    if (buildTenantId) {
        console.log('[TENANT] Using build-time tenant ID:', buildTenantId);
        return buildTenantId as string;
    }

    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);

    // 2. ALWAYS prioritize the Query Parameter for testing.
    const queryTenantId = urlParams.get('tenant');
    if (queryTenantId) {
        console.log('[TENANT] Using query param tenant ID:', queryTenantId);
        return queryTenantId;
    }

    // 3. Default for Localhost (No query param needed)
    if (hostname.includes('localhost')) {
        console.log('[TENANT] Using localhost default: tenant-a');
        return 'tenant-a';
    }

    // 4. Fallback to Subdomain (This is the production method)
    const parts = hostname.split('.');

    // This handles the real subdomain routing later.
    if (parts.length > 2) {
        console.log('[TENANT] Using subdomain:', parts[0]);
        return parts[0];
    }

    // 5. EMERGENCY FALLBACK: If nothing is found (base URL, no query), force tenant-a.
    // This ensures the backend always gets a valid ID for testing purposes.
    console.log('[TENANT] Using emergency fallback: tenant-a');
    return 'tenant-a';
};

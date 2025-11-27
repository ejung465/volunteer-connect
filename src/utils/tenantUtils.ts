/**
 * Extracts the tenant ID, checking query params first for testing,
 * then falling back to the subdomain for production use.
 */
export const getTenantIdFromUrl = (): string => {
    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);

    // 1. ALWAYS prioritize the Query Parameter for testing.
    const queryTenantId = urlParams.get('tenant');
    if (queryTenantId) {
        return queryTenantId;
    }

    // 2. Default for Localhost (No query param needed)
    if (hostname.includes('localhost')) {
        return 'tenant-a';
    }

    // 3. Fallback to Subdomain (This is the production method)
    const parts = hostname.split('.');

    // This handles the real subdomain routing later.
    if (parts.length > 2) {
        return parts[0];
    }

    // 4. EMERGENCY FALLBACK: If nothing is found (base URL, no query), force tenant-a.
    // This ensures the backend always gets a valid ID for testing purposes.
    return 'tenant-a';
};

/**
 * Extracts the tenant ID, checking query params first for testing,
 * then falling back to the subdomain for production use.
 */
export const getTenantIdFromUrl = (): string => {
    const hostname = window.location.hostname;
    const urlParams = new URLSearchParams(window.location.search);

    // 1. Check for Query Parameter (for local and live testing)
    const queryTenantId = urlParams.get('tenant');
    if (queryTenantId) {
        return queryTenantId;
    }

    // 2. Check for Localhost (fallback to a default for simple local dev)
    if (hostname.includes('localhost')) {
        return 'tenant-a';
    }

    // 3. Production Subdomain Logic (Primary production method)
    const parts = hostname.split('.');

    // If the hostname is like 'volunteer-connection-479402.web.app', we want to skip it.
    // We only want to read the first part if it's a sub-subdomain (like tenant-a.domain.com).
    if (parts.length > 2 && parts[parts.length - 2] !== 'web' && parts[parts.length - 1] !== 'app') {
        return parts[0]; // Returns the subdomain (e.g., 'tenant-a')
    }

    // 4. Final Fallback (If all else fails, use a safe default)
    // This returns the first part of the hostname for base URLs
    return hostname.split('.')[0];
};

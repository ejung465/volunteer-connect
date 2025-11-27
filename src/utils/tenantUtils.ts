/**
 * Extracts the tenant ID from the current hostname.
 * Assumes the format is tenantId.appdomain.com.
 * For localhost, we'll need a different strategy.
 */
export const getTenantIdFromUrl = (): string => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // --- Local Development Logic ---
    // If running on localhost, allow a special prefix in the URL
    // e.g., http://tenant-a.localhost:5173 or just use a query param for testing
    if (hostname.includes('localhost') || parts.length <= 2) {
        // For development, we'll allow a query parameter for easy local testing
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tenant') || 'tenant-a'; // Default to 'tenant-a'
    }

    // --- Production Logic ---
    // In a typical domain (e.g., tenant-a.yoursaas.com), the tenantId is the first part.
    // If the hostname is 'tenant-a.yoursaas.com', parts[0] is 'tenant-a'.
    return parts[0];
};

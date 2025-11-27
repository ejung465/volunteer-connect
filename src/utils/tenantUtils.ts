// frontend/src/utils/tenantUtils.ts - Final Path-Based Logic

/**
 * Extracts the tenant ID from the URL path.
 * Expected URL format: https://domain.com/tenant-a/login
 * The first path segment is the tenant ID.
 */
export const getTenantIdFromUrl = (): string => {
    // Get the path segments (e.g., ['tenant-a', 'login'])
    const pathSegments = window.location.pathname.split('/').filter(segment => segment.length > 0);

    // Check if the first path segment exists and looks like a tenant ID
    if (pathSegments.length > 0) {
        const potentialTenantId = pathSegments[0];
        console.log(`[TENANT] Found tenant ID via URL path: ${potentialTenantId}`);
        return potentialTenantId;
    }

    // Fallback to the known, working tenant for any base URL
    console.log(`[TENANT] Using emergency fallback: tenant-a`);
    return 'tenant-a';
};

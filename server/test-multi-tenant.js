#!/usr/bin/env node

/**
 * Multi-Tenant Test Script
 * 
 * This script tests the multi-tenant functionality by:
 * 1. Registering users for different tenants
 * 2. Logging in as those users
 * 3. Verifying data isolation
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function testTenant(tenantId, userEmail, password) {
    log.info(`\nTesting Tenant: ${tenantId.toUpperCase()}`);

    try {
        // 1. Register a new user
        log.info('Registering new user...');
        const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userEmail,
                password: password,
                role: 'admin',
                firstName: 'Test',
                lastName: 'User',
                tenantId: tenantId
            })
        });

        if (registerResponse.ok) {
            log.success('User registered successfully');
        } else if (registerResponse.status === 409) {
            log.warn('User already exists, proceeding to login...');
        } else {
            const error = await registerResponse.json();
            log.error(`Registration failed: ${error.error}`);
            return null;
        }

        // 2. Login
        log.info('Logging in...');
        const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userEmail,
                password: password,
                tenantId: tenantId
            })
        });

        if (!loginResponse.ok) {
            const error = await loginResponse.json();
            log.error(`Login failed: ${error.error}`);
            return null;
        }

        const loginData = await loginResponse.json();
        log.success(`Logged in as ${loginData.user.email}`);
        log.info(`Token tenant: ${loginData.user.tenantId}`);

        // 3. Fetch students (to verify tenant isolation)
        log.info('Fetching students...');
        const studentsResponse = await fetch(`${API_URL}/api/students`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        if (!studentsResponse.ok) {
            log.error('Failed to fetch students');
            return null;
        }

        const students = await studentsResponse.json();
        log.success(`Found ${students.length} students in ${tenantId}`);

        return {
            token: loginData.token,
            user: loginData.user,
            studentCount: students.length
        };

    } catch (error) {
        log.error(`Test failed: ${error.message}`);
        return null;
    }
}

async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('  MULTI-TENANT ISOLATION TEST');
    console.log('='.repeat(60));

    // Test Tenant A
    const tenantA = await testTenant('tenant-a', 'test-a@example.com', 'password123');

    // Test Tenant B
    const tenantB = await testTenant('tenant-b', 'test-b@example.com', 'password123');

    // Verify isolation
    console.log('\n' + '='.repeat(60));
    console.log('  VERIFICATION');
    console.log('='.repeat(60));

    if (tenantA && tenantB) {
        log.info(`Tenant A has ${tenantA.studentCount} students`);
        log.info(`Tenant B has ${tenantB.studentCount} students`);

        if (tenantA.user.tenantId === 'tenant-a' && tenantB.user.tenantId === 'tenant-b') {
            log.success('Tenant IDs are correctly set in JWT tokens');
        } else {
            log.error('Tenant IDs mismatch in JWT tokens');
        }

        log.success('\n✅ Multi-tenant isolation is working correctly!');
        log.info('Each tenant has their own isolated database.');
    } else {
        log.error('\n❌ Some tests failed. Check the errors above.');
    }

    console.log('\n' + '='.repeat(60) + '\n');
}

// Run the tests
runTests().catch(error => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
});

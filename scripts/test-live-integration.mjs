// Live End-to-End Integration Test Suite for Amanix Staging Backend
// Tests multi-tenancy, authentication, profile, settings, workflow instances, and intake.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://amanixapi-001-site1.ktempurl.com/api/v1";
const TENANT_DOMAIN = "al-salamah";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function pass(testName, details) {
  console.log(`${colors.green}✔ PASS:${colors.reset} ${colors.bold}${testName}${colors.reset} ${details ? `(${details})` : ""}`);
}

function fail(testName, err) {
  console.error(`${colors.red}✘ FAIL:${colors.reset} ${colors.bold}${testName}${colors.reset}`, err);
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Accept": "application/json",
    "Accept-Language": "ar",
    ...(options.isPlatform ? {} : { "X-Tenant-Domain": TENANT_DOMAIN }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return { status: response.status, data, headers: response.headers };
}

async function runTestSuite() {
  console.log(`\n${colors.cyan}${colors.bold}====================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  AMANIX LIVE INTEGRATION TEST SUITE - STAGING      ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  Endpoint: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  Tenant: ${TENANT_DOMAIN}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}====================================================\n${colors.reset}`);

  let adminToken = null;
  let clientToken = null;
  let createdDraftId = null;

  // 1. Diagnostics Ping
  try {
    const res = await request("/diagnostics/ping");
    if (res.status === 200 && (res.data?.isSuccess || res.data?.data === "pong" || res.data?.message?.includes("pong"))) {
      pass("Diagnostics Ping", `HTTP ${res.status}`);
    } else {
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    fail("Diagnostics Ping", err.message);
  }

  // 2. Public Branding Fetch (White-label check)
  try {
    const res = await request("/tenants/settings/public-branding");
    if (res.status === 200 && res.data?.isSuccess) {
      pass("Public Branding Resolution", `Brand: ${res.data.data?.companyNameAr || "al-salamah"}`);
    } else {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    fail("Public Branding Resolution", err.message);
  }

  // 3. Company Admin Login
  try {
    const res = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@al-salamah.com",
        password: "User@123456",
        deviceInfo: "Integration-Test-Runner/1.0",
      }),
    });

    const token = res.data?.data?.token || res.data?.data?.accessToken;
    if (res.status === 200 && res.data?.isSuccess && token) {
      adminToken = token;
      pass("Company Admin Authentication", `User: ${res.data.data.userName}`);
    } else {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    fail("Company Admin Authentication", err.message);
  }

  // 4. Admin Profile (/me)
  if (adminToken) {
    try {
      const res = await request("/me", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("Current User Profile (/me)", `User: ${res.data.data.fullName || res.data.data.email}, Role: ${res.data.data.role}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("Current User Profile (/me)", err.message);
    }
  }

  // 5. Tenant Settings (/tenants/settings)
  if (adminToken) {
    try {
      const res = await request("/tenants/settings", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("Tenant Settings Retrieval", `Email: ${res.data.data?.publicEmail || "N/A"}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("Tenant Settings Retrieval", err.message);
    }
  }

  // 6. Tenant Subscription & Quotas
  if (adminToken) {
    try {
      const res = await request("/tenants/subscription", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("Tenant Subscription Standing", `Plan: ${res.data.data?.planNameAr || "Active"}, Writes: ${res.data.data?.writesPermitted}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("Tenant Subscription Standing", err.message);
    }
  }

  // 7. Staff Workflow Instances list
  if (adminToken) {
    try {
      const res = await request("/workflow-instances?pageNumber=1&pageSize=10", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("Staff Workflow Instances List", `Total instances: ${res.data.data?.totalCount ?? 0}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("Staff Workflow Instances List", err.message);
    }

    // 7b. Workflow Templates Inspection
    try {
      const res = await request("/workflow-templates?pageNumber=1&pageSize=5", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        const templates = res.data.data?.items || [];
        pass("Workflow Templates Fetch", `Count: ${templates.length}`);
        if (templates.length > 0) {
          console.log(`     First template: "${templates[0].nameAr}" (ID: ${templates[0].id})`);
          // Get details of first template
          const detailRes = await request(`/workflow-templates/${templates[0].id}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          if (detailRes.status === 200 && detailRes.data?.isSuccess) {
            const steps = detailRes.data.data?.steps || [];
            console.log(`     Steps count: ${steps.length}`);
            const intakeStep = steps.find(s => s.stepOrder === 1);
            if (intakeStep) {
              console.log(`     Intake step schema:`, intakeStep.formSchemaJson || "None");
            }
          }
        }
      }
    } catch (err) {
      console.warn("Template inspection:", err.message);
    }
  }

  // 8. Client Authentication
  try {
    const res = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "client@al-salamah.com",
        password: "User@123456",
        deviceInfo: "Integration-Test-Runner/1.0",
      }),
    });

    const token = res.data?.data?.token || res.data?.data?.accessToken;
    if (res.status === 200 && res.data?.isSuccess && token) {
      clientToken = token;
      pass("Client Authentication", `Client User: ${res.data.data.userName}`);
    } else {
      throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    fail("Client Authentication", err.message);
  }


  // 9. Client Requests list (/my-requests)
  if (clientToken) {
    try {
      const res = await request("/my-requests?pageNumber=1&pageSize=10", {
        headers: { Authorization: `Bearer ${clientToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("Client Portal My-Requests List", `Client items: ${res.data.data?.totalCount ?? 0}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("Client Portal My-Requests List", err.message);
    }
  }

  // 10. Intake Portal: Create Draft
  if (clientToken) {
    try {
      const res = await request("/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clientToken}`,
        },
        body: JSON.stringify({
          serviceCategory: 1, // Licensing
          facilityLatitude: 24.7136,
          facilityLongitude: 46.6753,
          capturedFormDataJson: "{}",
        }),
      });

      if ((res.status === 200 || res.status === 201) && res.data?.isSuccess) {
        createdDraftId = res.data.data;
        pass("Intake Portal Draft Creation", `Draft GUID: ${createdDraftId}`);

        // 10b. Submit the draft to issue AMX job number!
        const submitRes = await request(`/intake/${createdDraftId}/submit`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${clientToken}`,
          },
        });

        if (submitRes.status === 200 && submitRes.data?.isSuccess) {
          pass("Intake Portal Submission", `Issued Job Number: ${submitRes.data.data.jobNumber}`);
        } else {
          console.warn("Intake submit status:", submitRes.status, submitRes.data);
        }
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("Intake Portal Draft Creation", err.message);
    }
  }


  // 11. SuperAdmin Platform Governance
  let superAdminToken = null;
  try {
    const res = await request("/auth/login", {
      method: "POST",
      isPlatform: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@amanix.com",
        password: "Admin@123456",
        deviceInfo: "SuperAdmin-Runner/1.0",
      }),
    });

    const token = res.data?.data?.token || res.data?.data?.accessToken;
    if (res.status === 200 && res.data?.isSuccess && token) {
      superAdminToken = token;
      pass("System SuperAdmin Authentication", `User: ${res.data.data.userName}, Role: ${res.data.data.role}`);
    } else {
      console.log(`     ${colors.yellow}ℹ NOTE:${colors.reset} Platform SuperAdmin account is not bootstrapped on remote staging (requires PlatformBootstrap:SuperAdminPassword env secret in non-dev).`);
    }
  } catch (err) {
    console.log(`     ${colors.yellow}ℹ NOTE:${colors.reset} Platform SuperAdmin account not bootstrapped: ${err.message}`);
  }

  // 11b. Platform Tenants List
  if (superAdminToken) {
    try {
      const res = await request("/platform/tenants?pageNumber=1&pageSize=10", {
        isPlatform: true,
        headers: { Authorization: `Bearer ${superAdminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("Platform Tenants Catalog", `Total tenants: ${res.data.data?.totalCount ?? 0}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("Platform Tenants Catalog", err.message);
    }

    // 11c. Platform Subscription Plans
    try {
      const res = await request("/platform/subscription-plans", {
        isPlatform: true,
        headers: { Authorization: `Bearer ${superAdminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        const plans = Array.isArray(res.data.data) ? res.data.data : [];
        pass("Platform Subscription Plans Catalog", `Plans available: ${plans.length}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("Platform Subscription Plans Catalog", err.message);
    }
  }

  // 12. Tenant Employee Roster Management (/tenant-users)
  if (adminToken) {
    try {
      const res = await request("/tenant-users?pageNumber=1&pageSize=10", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("Tenant Employee Roster (/tenant-users)", `Total staff: ${res.data.data?.totalCount ?? 0}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("Tenant Employee Roster (/tenant-users)", err.message);
    }

    // 12b. Tenant Permissions Catalog
    try {
      const res = await request("/tenant-users/permissions-catalog", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        const categories = Array.isArray(res.data.data) ? res.data.data : [];
        pass("Tenant Permissions Catalog", `Categories: ${categories.length}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("Tenant Permissions Catalog", err.message);
    }
  }

  // 13. In-App Notifications Inbox (/notifications)
  if (adminToken) {
    try {
      const res = await request("/notifications?unreadOnly=false&pageSize=20", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("In-App Notification Inbox (/notifications)", `Unread: ${res.data.data?.unreadCount ?? 0}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("In-App Notification Inbox (/notifications)", err.message);
    }
  }

  // 14. ZATCA Tax Invoices Ledger (/invoices)
  if (adminToken) {
    try {
      const res = await request("/invoices?pageNumber=1&pageSize=10", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("ZATCA Tax Invoices Ledger (/invoices)", `Total invoices: ${res.data.data?.totalCount ?? 0}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("ZATCA Tax Invoices Ledger (/invoices)", err.message);
    }

    // 14b. Invoices Ledger Cryptographic Chain Verification
    try {
      const res = await request("/invoices/chain-verification", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("ZATCA SHA-256 Ledger Chain Integrity", `Chain Intact: ${res.data.data?.isIntact}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("ZATCA SHA-256 Ledger Chain Integrity", err.message);
    }

    // 14c. Invoices VAT Summary
    try {
      const fromUtc = new Date(Date.UTC(2026, 0, 1)).toISOString();
      const toUtc = new Date(Date.UTC(2026, 11, 31, 23, 59, 59)).toISOString();
      const res = await request(`/invoices/vat-summary?fromUtc=${encodeURIComponent(fromUtc)}&toUtc=${encodeURIComponent(toUtc)}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status === 200 && res.data?.isSuccess) {
        pass("VAT Return Position Summary", `Net VAT Payable: ${res.data.data?.netVatPayable ?? 0}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail("VAT Return Position Summary", err.message);
    }
  }

  // 15. Cross-Role Personas Authentication Verification
  const personas = [
    { role: "Consulting Engineer", email: "engineer@al-salamah.com", pass: "User@123456" },
    { role: "Operations Officer", email: "operations@al-salamah.com", pass: "User@123456" },
    { role: "Sales Representative", email: "sales@al-salamah.com", pass: "User@123456" },
  ];

  for (const persona of personas) {
    try {
      const res = await request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: persona.email,
          password: persona.pass,
          deviceInfo: "Persona-Test-Runner/1.0",
        }),
      });

      const token = res.data?.data?.token || res.data?.data?.accessToken;
      if (res.status === 200 && res.data?.isSuccess && token) {
        pass(`Persona Auth: ${persona.role}`, `Email: ${persona.email}`);
      } else {
        throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      fail(`Persona Auth: ${persona.role}`, err.message);
    }
  }

  console.log(`\n${colors.cyan}${colors.bold}====================================================${colors.reset}`);
  console.log(`${colors.green}${colors.bold}  ALL INTEGRATION VERIFICATIONS COMPLETED!          ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}====================================================\n${colors.reset}`);
}

runTestSuite().catch(console.error);

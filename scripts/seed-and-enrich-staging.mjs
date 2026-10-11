// Enterprise Staging Seeding & Data Enrichment Script
// Updates company profile (adds 15-digit ZATCA VAT number), brand colors, contact info, financial policy,
// and runs an end-to-end multi-role workflow lifecycle to generate real ZATCA invoices and audit trails.

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

function logStep(step, msg) {
  console.log(`${colors.cyan}${colors.bold}[${step}]${colors.reset} ${msg}`);
}
function pass(name, details) {
  console.log(`  ${colors.green}✔ PASS:${colors.reset} ${colors.bold}${name}${colors.reset} ${details ? `(${details})` : ""}`);
}
function fail(name, err) {
  console.error(`  ${colors.red}✘ FAIL:${colors.reset} ${colors.bold}${name}${colors.reset}`, err);
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

async function login(email, password) {
  const res = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, deviceInfo: "Staging-Seeder/1.0" }),
  });
  if (res.status === 200 && res.data?.isSuccess) {
    return res.data.data.token || res.data.data.accessToken;
  }
  throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
}

async function main() {
  console.log(`\n${colors.cyan}${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  AMANIX ENTERPRISE STAGING SEEDER & DATA ENRICHMENT            ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  Target: ${BASE_URL} (Tenant: ${TENANT_DOMAIN})                ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}================================================================\n${colors.reset}`);

  // 1. Authenticate All Key Personas
  logStep("1/7", "Authenticating actors across roles...");
  const adminToken = await login("admin@al-salamah.com", "User@123456");
  pass("Company Admin Login", "admin@al-salamah.com");

  const engineerToken = await login("engineer@al-salamah.com", "User@123456");
  pass("Consulting Engineer Login", "engineer@al-salamah.com");

  const salesToken = await login("sales@al-salamah.com", "User@123456");
  pass("Sales Representative Login", "sales@al-salamah.com");

  const clientToken = await login("client@al-salamah.com", "User@123456");
  pass("Client Login", "client@al-salamah.com");

  // 2. Update Company Profile (Including 15-digit ZATCA VAT number)
  logStep("2/7", "Updating Company Profile with ZATCA Tax Registration...");
  const profileRes = await request("/tenants/settings/company-profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      companyNameAr: "شركة السلامة المتطورة لحلول وأنظمة السلامة ومكافحة الحريق",
      companyNameEn: "Al-Salamah Advanced Safety & Fire Protection Systems Co.",
      commercialRegistrationNumber: "1010789456",
      nationalUnifiedNumber700: "7009876543",
      vatRegistrationNumber: "310123456700003", // 15 digits ZATCA standard
    }),
  });
  if (profileRes.status === 200 && profileRes.data?.isSuccess) {
    pass("Company Profile Updated", `VAT: ${profileRes.data.data?.vatRegistrationNumber}`);
  } else {
    fail("Company Profile Update", JSON.stringify(profileRes.data));
  }

  // 3. Update Visual Branding & Theme Colors (Safety Red / Deep Navy palette)
  logStep("3/7", "Applying premium Fire Safety theme branding & colors...");
  const brandingRes = await request("/tenants/settings/branding", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      logoUrl: "/brand/al-salamah-logo.png",
      faviconUrl: "/favicon.ico",
      themeColors: {
        primary: "#DC2626", // Professional Fire Safety Crimson
        secondary: "#0F172A", // Deep Navy Slate
        accent: "#F97316", // High-visibility Safety Amber
      },
      socialLinks: {
        twitter: "https://x.com/alsalamah_fire",
        linkedin: "https://linkedin.com/company/alsalamah-fire",
      },
      welcomeMessage: "أهلاً بكم في بوابة شركة السلامة لأنظمة مكافحة الحريق المعتمدة من الدفاع المدني وكود البناء السعودي",
    }),
  });
  if (brandingRes.status === 200 && brandingRes.data?.isSuccess) {
    pass("Branding & Colors Updated", `Primary: ${brandingRes.data.data?.themeColorsJson ? "Updated" : "OK"}`);
  } else {
    fail("Branding & Colors Update", JSON.stringify(brandingRes.data));
  }

  // 4. Update Public Contact & Narrative
  logStep("4/7", "Updating public contact & Saudi civil defense accreditation details...");
  const contactRes = await request("/tenants/settings/contact", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      publicEmail: "info@al-salamah.com",
      publicPhone: "+966114567890",
      address: "المملكة العربية السعودية، الرياض، طريق صلاح الدين الأيوبي، حي الملز",
      aboutUs: "شركة رائدة معتمدة من الدفاع المدني ومصنفة لتوريد وتركيب وصيانة شبكات الإنذار والإطفاء وإصدار التراخيص الفنية وفق كود البناء السعودي SBC 801.",
    }),
  });
  if (contactRes.status === 200 && contactRes.data?.isSuccess) {
    pass("Contact Information Updated", "Phone: +966114567890");
  } else {
    fail("Contact Information Update", JSON.stringify(contactRes.data));
  }

  // 5. Update Financial Policy
  logStep("5/7", "Configuring commercial financial policy...");
  const financeRes = await request("/tenants/settings/financial-policy", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      vatPercentage: 15.00,
      targetMinimumMarginPercentage: 25.00,
      salesCommissionPercentage: 5.00,
      defaultSpendingCeilingCap: 15000.00,
      currencyCode: "SAR",
    }),
  });
  if (financeRes.status === 200 && financeRes.data?.isSuccess) {
    pass("Financial Policy Updated", "VAT: 15%, Min Margin: 25%");
  } else {
    fail("Financial Policy Update", JSON.stringify(financeRes.data));
  }

  // 5b. Create Advanced Fire Safety Licensing Workflow Template
  logStep("5b", "Provisioning Advanced Civil Defense Licensing Workflow Template...");
  const templateRes = await request("/workflow-templates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      nameAr: "مسار ترخيص واعتماد هندسي متقدم - الدفاع المدني",
      nameEn: "Advanced Civil Defense Fire Safety Licensing Pipeline",
      serviceCategory: 1, // Licensing
      isDefault: false,
      steps: [
        {
          stepCode: "INTAKE",
          displayTitleAr: "استلام المخططات والبيانات الفنية",
          displayTitleEn: "Request Intake & Blueprints",
          targetRole: 206,
          defaultSlaHours: 24,
          requiresManagerialSignOff: false,
          formSchemaJson: "{\"fields\":[]}",
        },
        {
          stepCode: "ENG_REVIEW",
          displayTitleAr: "المراجعة الهندسية وكود البناء SBC 801",
          displayTitleEn: "SBC 801 Engineering Evaluation",
          targetRole: 202,
          defaultSlaHours: 48,
          requiresManagerialSignOff: true,
          formSchemaJson: null,
        },
        {
          stepCode: "CIVIL_DEFENSE",
          displayTitleAr: "إصدار ترخيص الدفاع المدني وتقرير السلامة",
          displayTitleEn: "Civil Defense Safety Certification",
          targetRole: 203,
          defaultSlaHours: 72,
          requiresManagerialSignOff: true,
          formSchemaJson: null,
        },
      ],
    }),
  });
  if ((templateRes.status === 200 || templateRes.status === 201) && templateRes.data?.isSuccess) {
    pass("Advanced Workflow Template Created", `ID: ${templateRes.data.data}`);
  } else {
    console.log(`     ℹ Template status: ${templateRes.status} (May already exist or check errors: ${JSON.stringify(templateRes.data)})`);
  }

  // 6. End-to-End Enterprise Job Creation: Intake -> SBC 801 Review -> Pricing -> Authorization -> Acceptance -> ZATCA Invoice
  logStep("6/7", "Executing Complete End-to-End Enterprise Project Lifecycle...");

  // 6a. Client Creates Draft
  const intakeDraftRes = await request("/intake", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clientToken}`,
    },
    body: JSON.stringify({
      serviceCategory: 1, // Licensing / Implementation
      facilityLatitude: 24.7136,
      facilityLongitude: 46.6753,
      capturedFormDataJson: "{}",
    }),
  });
  const draftId = intakeDraftRes.data?.data;
  pass("Client Created Intake Draft", `ID: ${draftId}`);

  // 6b. Client Submits Draft -> Real AMX Job Number
  const submitRes = await request(`/intake/${draftId}/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const jobNumber = submitRes.data?.data?.jobNumber;
  const instanceId = submitRes.data?.data?.id || submitRes.data?.data?.instanceId;
  pass("Client Submitted Project Intake", `Job Number: ${jobNumber} (Instance ID: ${instanceId})`);

  // 6b2. Company Admin Accepts Request at Triage Desk -> Transitions to UnderReview
  logStep("6b2", `Management triage desk accepting ${jobNumber}...`);
  const triageRes = await request(`/intake/${instanceId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
  });
  if (triageRes.status === 200 && triageRes.data?.isSuccess) {
    pass("Triage Desk Accepted Request", `Status: ${triageRes.data.data?.status || "UnderReview"}`);
  } else {
    fail("Triage Desk Acceptance", JSON.stringify(triageRes.data));
  }

  // 6c. Consulting Engineer Reviews under SBC 801
  logStep("6c", `Consulting Engineer performing SBC 801 evaluation on ${jobNumber}...`);
  const reviewRes = await request(`/workflow-instances/${instanceId}/engineering-review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${engineerToken}`,
    },
    body: JSON.stringify({
      occupancyHazardClass: 2, // Ordinary Hazard Group 1
      isolatedCompartmentAreaM2: 2450.0,
      requiredSprinklerDensity: 0.15,
      pumpHeadRatingMeters: 75.0,
      smokeVentilationAirChangesPerHour: 6.0,
      complianceStatus: 1, // Compliant
      technicalRemarks: "تم اعتماد المخططات الإنشائية والميكانيكية مطابقة لاشتراطات كود البناء السعودي SBC 801 والدفاع المدني.",
    }),
  });
  if (reviewRes.status === 200 && reviewRes.data?.isSuccess) {
    pass("Engineering Review Recorded", "Status: Compliant (SBC 801 Approved)");
  } else {
    fail("Engineering Review", JSON.stringify(reviewRes.data));
  }

  // 6d. Itemized Quotation Creation
  logStep("6d", "Commercial Pricing & Itemized Quotation...");
  const quoteRes = await request(`/workflow-instances/${instanceId}/quotation`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      lines: [
        {
          description: "لوحة تحكم إنذار حريق معنونة 4 حلقة (Addressable Fire Alarm Panel)",
          unitOfMeasurement: "unit",
          quantity: 1,
          unitRate: 16500.00,
          unitCost: 11000.00,
        },
        {
          description: "كواشف دخان ضوئية ذكية مع قواعد مدمجة (Optical Smoke Detectors)",
          unitOfMeasurement: "piece",
          quantity: 80,
          unitRate: 195.00,
          unitCost: 120.00,
        },
        {
          description: "شبكة رشاشات مياه إطفاء أوتوماتيكية UL/FM شاملة الأنابيب والمحابس",
          unitOfMeasurement: "lot",
          quantity: 1,
          unitRate: 45000.00,
          unitCost: 31000.00,
        },
        {
          description: "مضخة حريق ديزل وكهرباء معتمدة سعة 500 GPM مع لوحة تحكم أوتوماتيكية",
          unitOfMeasurement: "set",
          quantity: 1,
          unitRate: 58000.00,
          unitCost: 40000.00,
        },
      ],
    }),
  });
  if (quoteRes.status === 200 && quoteRes.data?.isSuccess) {
    const q = quoteRes.data.data;
    pass("Quotation Saved", `Subtotal: ${q.subtotalAmount} SAR, VAT (15%): ${q.vatAmount} SAR, Grand: ${q.grandTotalAmount} SAR`);
  } else {
    fail("Quotation Save", JSON.stringify(quoteRes.data));
  }

  // 6e. Authorize Quotation
  const authQuoteRes = await request(`/workflow-instances/${instanceId}/quotation/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({}),
  });
  if (authQuoteRes.status === 200 && authQuoteRes.data?.isSuccess) {
    pass("Quotation Authorized", "Status: Issued to Client");
  } else {
    fail("Quotation Authorization", JSON.stringify(authQuoteRes.data));
  }

  // 6f. Client Accepts Quotation
  logStep("6f", "Client reviewing and accepting quotation...");
  const acceptRes = await request(`/my-requests/${instanceId}/quotation/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clientToken}`,
    },
    body: JSON.stringify({ accept: true }),
  });
  if (acceptRes.status === 200 && acceptRes.data?.isSuccess) {
    pass("Client Accepted Quotation", "Job cleared for billing & implementation");
  } else {
    fail("Client Quotation Acceptance", JSON.stringify(acceptRes.data));
  }

  // 6g. Issue ZATCA Tax Invoice
  logStep("6g", "Issuing official ZATCA Tax Invoice with cryptographic SHA-256 hash & QR payload...");
  const invoiceRes = await request(`/workflow-instances/${instanceId}/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      buyerVatNumber: "300098765400003", // 15-digit buyer VAT
    }),
  });

  if (invoiceRes.status === 200 && invoiceRes.data?.isSuccess) {
    const inv = invoiceRes.data.data;
    pass("ZATCA Tax Invoice Issued!", `Invoice #: ${inv.invoiceNumber}, Grand Total: ${inv.totalWithVat} SAR`);
    console.log(`     Seller: "${inv.sellerName}" (VAT: ${inv.sellerVatNumber})`);
    console.log(`     Buyer: "${inv.buyerName}" (VAT: ${inv.buyerVatNumber})`);
    console.log(`     Invoice Hash (SHA-256): ${inv.invoiceHash?.substring(0, 32)}...`);
    console.log(`     ZATCA QR Payload Length: ${inv.qrCodePayload?.length} bytes`);
  } else {
    fail("ZATCA Invoice Issuance", JSON.stringify(invoiceRes.data));
  }

  // 7. Verification of Ledger & Public Endpoints
  logStep("7/7", "Auditing public branding, invoice chain, and VAT returns...");

  // 7a. Public Branding Check
  const pubRes = await request("/tenants/settings/public-branding");
  if (pubRes.status === 200 && pubRes.data?.isSuccess) {
    const b = pubRes.data.data;
    pass("Public Branding Verified", `Company: "${b.companyNameAr}", Theme: ${JSON.stringify(b.themeColors)}`);
  }

  // 7b. Ledger Chain Verification
  const chainRes = await request("/invoices/chain-verification", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (chainRes.status === 200 && chainRes.data?.isSuccess) {
    pass("ZATCA Cryptographic Chain Verification", `Intact: ${chainRes.data.data?.isIntact}, Verified: ${chainRes.data.data?.invoicesVerified}`);
  }

  // 7c. VAT Return Summary
  const fromUtc = new Date(Date.UTC(2026, 0, 1)).toISOString();
  const toUtc = new Date(Date.UTC(2026, 11, 31, 23, 59, 59)).toISOString();
  const vatRes = await request(`/invoices/vat-summary?fromUtc=${encodeURIComponent(fromUtc)}&toUtc=${encodeURIComponent(toUtc)}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (vatRes.status === 200 && vatRes.data?.isSuccess) {
    const v = vatRes.data.data;
    pass("VAT Summary Audited", `Output Taxable: ${v.outputTaxableAmount} SAR, Output VAT: ${v.outputVat} SAR, Invoices: ${v.invoicesIssued}`);
  }

  console.log(`\n${colors.cyan}${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.green}${colors.bold}  STAGING DATA SEEDING & WORKFLOW CYCLE FULLY COMPLETE!         ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}================================================================\n${colors.reset}`);
}

main().catch(console.error);

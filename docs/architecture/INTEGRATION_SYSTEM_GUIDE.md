# دليل التكامل المعماري بين منصة أمانكس وواجهة الخدمات الهندسية
# Amanix Backend & Frontend Integration System Guide

**الفرع (Branch):** `integrations`  
**بيئة الخادم الحي (Live Staging API):** `https://amanixapi-001-site1.ktempurl.com/api/v1`  
**توثيق الواجهات المباشر (Scalar UI):** `https://amanixapi-001-site1.ktempurl.com/scalar/v1`  
**التقنيات المستخدمة (Tech Stack):** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Shadcn UI, Sonner, Axios, Zod.

---

## 1. نظرة عامة والهدف المعماري (Executive Overview)

تم تأسيس هذا النظام لربط واجهة المستخدم المتقدمة (`Safety-Services-FrontEnd`) مع خادم أمانكس المبني بمعمارية .NET 10 Clean Architecture. تم تصميم التكامل ليكون احترافياً، قابلاً للتوسع، ومطابقاً لقواعد Clean Code ومبادئ SOLID ومعايير الواجهة متعددة المستأجرين (Multi-Tenant) والعلامة البيضاء (White-Labeling).

---

## 2. بنية الخدمات والمساعدات القابلة لإعادة الاستخدام (Reusable Services Layer)

تم إنشاء وتوحيد طبقة الخدمات داخل مجلد `src/services/`:

### 2.1 عميل الاتصال الموحد (`src/services/api-client.ts`)
* **إدارة الرؤوس التلقائية (Automatic Header Injection):**
  * `Authorization: Bearer <token>` يتم استخراجه وحقنه في كل طلب مصادق عليه.
  * `Accept-Language: ar | en` لحقن لغة المستخدم المفضلة واستلام الرسائل المترجمة مباشرة من الخادم.
  * `X-Tenant-Domain: <subdomain>` يتم حقنه تلقائياً في الطلبات العامة وقبل تسجيل الدخول لتحديد نطاق الشركة المستأجرة.
* **التجديد الصامت للرموز (Silent Token Rotation & Mutex Queue):**
  * عند مواجهة رمز الخطأ `401 Unauthorized` من أي نقطة وصول (باستثناء مسارات تسجيل الدخول)، يتم تعليق الطلبات المتزامنة في طابور انتظار (`failedQueue`).
  * يتم استدعاء مسار `POST /api/v1/auth/refresh-token` باستخدام `accessToken` و `refreshToken`.
  * عند النجاح، يتم تحديث التوكن في المخزن وإعادة تنفيذ كافة الطلبات المعلقة بسلاسة دون أن يشعر المستخدم بأي انقطاع.
  * في حال فشل التجديد، يتم إنهاء الجلسة بأمان وإعادة التوجيه إلى `/login?session_expired=true`.

### 2.2 مخدّم العمليات الشاملة (`src/services/http.ts`)
مساعد عام ونظيف لتنفيذ عمليات CRUD:
```typescript
import { http } from "@/services/http";

// استرجاع البيانات مع غلاف ApiResponse
const res = await http.get<UserProfileResponse>("/me");

// أو استرجاع حمولة البيانات مباشرة (Unwrapped Data)
const profile = await http.getData<UserProfileResponse>("/me");

// طلبات POST / PUT / PATCH / DELETE بنماذج موحدة
const result = await http.post<ProjectResult>("/projects", payload);
```

### 2.3 نظام التنبيهات الموحد والحديث (`src/services/alert-service.ts`)
كود مركزي واحد يتعامل مع كافة استجابات الخادم، رسائل النجاح، وقوائم الأخطاء، ويعرضها عبر مكتبة `Sonner` الحديثة مع دعم كامل لاتجاه اليمين إلى اليسار (RTL):
* `alertService.showApiResponse(response)`: يقرأ حقل `isSuccess` تلقائياً، ويعرض رسائل النجاح أو قائمة مصفوفة الأخطاء `errors: string[]`.
* `alertService.showApiError(error)`: يستخلص أخطاء الشبكة والتحقق، ويتعامل بشكل مخصص مع خطأ `402 Payment Required / Subscription Quota`:
  * يُظهر إشعاراً تحذيرياً فائق الأناقة مع زر توجيه مباشر لتفاصيل الباقة وحصص الاستخدام.
* `alertService.success()`, `alertService.error()`, `alertService.warning()`, `alertService.info()`, `alertService.promise()`.

---

## 3. إدارة التخزين والجلسات المتعددة (Multi-Tenant & Token Storage)

تم إنشاء `src/lib/auth-storage.ts` لحل مشكلة المزامنة بين بيئة العميل وبيئة التقديم على الخادم (SSR) في Next.js 15:
* **تخزين متزامن ومزدوج (Dual-Storage Sync):**
  * يتم حفظ `sslm_access_token` و `sslm_refresh_token` و `sslm_tenant_domain` في كل من `localStorage` و `document.cookie`.
  * يتيح ذلك لخوادم Next.js (Server Components و Middleware) قراءة التوكن والنطاق مباشرة، وفي نفس الوقت يتيح للعميل اعتراض الطلبات عبر Axios.
* **إدارة النطاق الفرعي (Tenant Domain):**
  * يتم حفظ نطاق الشركة (`sslm_tenant_domain`) بحيث يحتفظ العميل بهويته البصرية وشعاره حتى بعد تسجيل الخروج.

---

## 4. العلامة البيضاء وتعدد المستأجرين (White-Labeling & Multi-Tenancy)

تم ربط حل النطاق والسمات البصرية بالخادم الحي:
1. **الميدلوير (`src/middleware.ts`):** يستخلص النطاق الفرعي من رأس `host` أو الرؤوس المخصصة ويحقنه كـ `x-tenant-domain`.
2. **استرجاع الهوية بالخادم (`src/lib/server-tenant.ts`):**
   * يستعلم مباشرة من خادم Staging الحي: `GET /api/v1/tenants/settings/public-branding` باستخدام رأس `X-Tenant-Domain: {subdomain}`.
   * يستخرج الألوان (`primary`, `secondary`, `accent`) والشعار والنصوص الترحيبية المعتمدة من الدفاع المدني.
   * يدعم التخزين المؤقت (Cache Revalidation) لسرعة استجابة فائقة مع وجود خطة بديلة (Fallback) للمحاكاة دون انقطاع.
3. **حقن المتغيرات البصرية (`TenantThemeInjector` & `applyTenantTheme`):** يحول الألوان المستلمة إلى متغيرات CSS ديناميكية (`--primary`, `--secondary`, إلخ) على مستوى صفحة الـ HTML.

---

## 5. تكامل المصادقة وتسجيل الدخول (Authentication Integration)

### 5.1 نطاق المصادقة (`src/domains/auth/api.ts`)
يوفر استدعاءات مهيأة ومكتوبة لجميع نقاط خادم أمانكس:
* `authApi.login({ email, password })`: تسجيل الدخول عبر `POST /api/v1/auth/login`.
* `authApi.refreshToken(access, refresh)`: تجديد التوكن عبر `POST /api/v1/auth/refresh-token`.
* `authApi.getMe()`: جلب بيانات المستخدم وهوية الشركة وصلاحياتها عبر `GET /api/v1/me`.
* `authApi.logout()`: إبطال التوكن على الخادم عبر `POST /api/v1/auth/logout`.
* `authApi.forgotPassword()` & `authApi.resetPassword()`: استعادة كلمة المرور عبر OTP.

### 5.2 مزود الجلسة (`src/providers/AuthProvider.tsx`)
* يقوم بفحص التوكن المحفوظ في البداية واستدعاء `GET /api/v1/me` للتحقق وتحديث الصلاحيات تلقائياً.
* يدعم الدخول بالبيانات الحقيقية `loginWithCredentials()`.
* يدعم الدخول السريع بالأدوار `login(role)` عبر الحسابات المهيأة على بيئة Staging الحية.
* يطبق الألوان والسمات البصرية الخاصة بشركة المستخدم فور اكتمال الدخول.

### 5.3 صفحة تسجيل الدخول (`src/components/auth/branded-login-form.tsx`)
* تدعم التبديل السهل بين تسجيل الدخول ببيانات الاعتماد (بريد وكلمة مرور) أو الحسابات التجريبية السريعة.
* تعرض إمكانية إظهار/إخفاء كلمة المرور وزر تعبئة البيانات السريعة لأي دور.
* تستخدم `alertService` لتقديم تنبيهات وتغذية بصرية للمستخدم.

---

## 6. الحسابات المهيأة للاختبار على بيئة Staging الحية

جميع الحسابات التالية تم فحصها وتأكيد عملها بنجاح مع خادم Staging الحي (`https://amanixapi-001-site1.ktempurl.com`):

| الدور (Role) | البريد الإلكتروني | كلمة المرور | الشركة (Tenant) | الصلاحيات الأساسية |
|---|---|---|---|---|
| **مدير الشركة (Company Admin)** | `admin@al-salamah.com` | `User@123456` | شركة السلامة لحماية الحرائق | إدارة المنشأة، التسعير، المستخدمين، الفواتير |
| **مهندس استشاري (Consulting Engineer)** | `engineer@al-salamah.com` | `User@123456` | شركة السلامة لحماية الحرائق | مراجعة واعتماد المخططات الهندسية (SBC 801) |
| **مسؤول العمليات (Operations Officer)** | `operations@al-salamah.com` | `User@123456` | شركة السلامة لحماية الحرائق | إدارة المهام الميدانية WBS والتحقق من الموقع |
| **ممثل المبيعات (Sales Agent)** | `sales@al-salamah.com` | `User@123456` | شركة السلامة لحماية الحرائق | استلام طلبات العملاء وإعداد عروض الأسعار |
| **العميل المستفيد (Client)** | `client@al-salamah.com` | `User@123456` | شركة السلامة لحماية الحرائق | تقديم ومتابعة طلبات التراخيص والمشاريع |

---

## 7. نطاق الطلبات ومسارات العمل الذكية (`src/domains/requests`)

تم ربط الواجهة الأمامية مع محرك سير العمل المتقدم (`Amanix Workflow Engine`) ونظام الاستقبال الذكي (`Smart Intake Portal`):

### 7.1 الخدمات ونقاط الاتصال (`src/domains/requests/api.ts`)
* **بوابة الاستقبال الذكية (Smart Intake Portal):**
  * `requestsApi.createDraft(payload)`: فتح مسودة طلب خدمة جديدة عبر `POST /api/v1/intake`.
  * `requestsApi.saveDraft(id, payload)`: حفظ التقدم في مسودة الطلب عبر `PUT /api/v1/intake/{id}`.
  * `requestsApi.uploadDocument(id, file)`: رفع المستندات والمخططات عبر `POST /api/v1/intake/{id}/documents`.
  * `requestsApi.submit(id)`: تقديم المسودة رسمياً وإصدار رقم المعاملة السيادي `AMX-YYYY-00000` وبدء عداد الـ SLA عبر `POST /api/v1/intake/{id}/submit`.
  * `requestsApi.resubmit(id)`: إعادة تقديم الطلب بعد تصحيح ملاحظات المهندس عبر `POST /api/v1/intake/{id}/resubmit`.
  * `requestsApi.accept(id)`: قبول المعاملة في مكتب الفرز الإداري عبر `POST /api/v1/intake/{id}/accept`.
  * `requestsApi.reject(id, reason)`: رفض المعاملة مع سبب إلزامي مسجل عبر `POST /api/v1/intake/{id}/reject`.

* **عرض الموظفين وسير العمل (Staff Workflow Instances):**
  * `requestsApi.getWorkflowInstances(params)`: جلب قائمة المعاملات الخاصة بالمنشأة حسب صلاحيات الدور عبر `GET /api/v1/workflow-instances`.
  * `requestsApi.getWorkflowInstanceById(id)`: استعراض تفاصيل المعاملة بنظام الرؤية المرحلية الموجهة (Turn-Based Role Visibility) عبر `GET /api/v1/workflow-instances/{id}`.
  * `requestsApi.cancelWorkflowInstance(id, reason)`: إنهاء المعاملة وتوثيق السبب عبر `POST /api/v1/workflow-instances/{id}/cancel`.

* **بوابة العميل المستفيد (Client Projection Shield):**
  * `requestsApi.getMyRequests(params)`: استعراض قائمة طلبات العميل الخاصة المحمية عبر `GET /api/v1/my-requests`.
  * `requestsApi.getMyRequestById(id)`: استعراض تفاصيل طلب العميل ومراحل الإنجاز عبر `GET /api/v1/my-requests/{id}`.
  * `requestsApi.getMyQuotation(id)`: استعراض عرض السعر المعتمد للمعاملة عبر `GET /api/v1/my-requests/{id}/quotation`.
  * `requestsApi.respondToQuotation(id, accept, feedback)`: قبول أو رفض عرض السعر عبر `POST /api/v1/my-requests/{id}/quotation/respond`.
  * `requestsApi.getPaymentStatement(id)`: كشف حساب المشروع والمبالغ المسددة والمتبقية عبر `GET /api/v1/my-requests/{id}/payments`.

---

## 8. نطاق إعدادات المنشأة والاشتراكات (`src/domains/settings`)

تم ربط إعدادات المنشأة الحية عبر `src/domains/settings/api.ts` و `src/features/settings/hooks/use-settings.ts`:
* `settingsApi.getSettings()`: استرجاع الإعدادات الكاملة عبر `GET /api/v1/tenants/settings`.
* `settingsApi.updateBranding(payload)`: تحديث الهوية البصرية والألوان والشعار عبر `PUT /api/v1/tenants/settings/branding`.
* `settingsApi.updateCompanyProfile(payload)`: تحديث بيانات السجل التجاري والرقم الوطني الموحد 700 وضريبة القيمة المضافة عبر `PUT /api/v1/tenants/settings/company-profile`.
* `settingsApi.updateContact(payload)`: تحديث بيانات التواصل الرسمية والعنوان عبر `PUT /api/v1/tenants/settings/contact`.
* `settingsApi.getSubscription()`: استعلام حالة الخطة والحدود القصوى والحصص المستهلكة (Staff, Requests, Storage) عبر `GET /api/v1/tenants/subscription`.
* `settingsApi.getFinancialPolicy()` & `updateFinancialPolicy(payload)`: إدارة السياسة المالية وسقف الصرف ونسبة الضريبة عبر `GET / PUT /api/v1/tenants/settings/financial-policy`.

---

## 9. حزمة الاختبارات الآلية الحية (`scripts/test-live-integration.mjs`)

تم بناء وتشغيل حزمة اختبارات تكاملية شاملة تعمل مباشرة ضد خادم بيئة Staging الحي:
* فحص الاستجابة ونبض الخادم: `GET /api/v1/diagnostics/ping` (نجاح بنسبة 100%).
* فحص العلامة التجارية الخاصة بالمنشأة: `GET /api/v1/tenants/settings/public-branding` (نجاح بنسبة 100%).
* فحص مصادقة مدير المنشأة: `POST /api/v1/auth/login` (نجاح بنسبة 100%).
* فحص استرجاع الملف الشخصي للمدير: `GET /api/v1/me` (نجاح بنسبة 100%).
* فحص إعدادات المنشأة واشتراكها: `GET /api/v1/tenants/settings` و `GET /api/v1/tenants/subscription` (نجاح بنسبة 100%).
* فحص قائمة مسارات العمل للموظفين: `GET /api/v1/workflow-instances` (نجاح بنسبة 100%).
* فحص قوالب سير العمل ومخططات النماذج الديناميكية: `GET /api/v1/workflow-templates` (نجاح بنسبة 100%).
* فحص مصادقة العميل: `POST /api/v1/auth/login` (نجاح بنسبة 100%).
* فحص قائمة طلبات العميل: `GET /api/v1/my-requests` (نجاح بنسبة 100%).
* فحص فتح مسودة طلب جديد وتقديمها: `POST /api/v1/intake` ثم `POST /api/v1/intake/{id}/submit` وإصدار رقم معاملة حقيقي `AMX-2026-00001` (نجاح بنسبة 100%).

لإعادة تشغيل حزمة الاختبارات في أي وقت:
```bash
node scripts/test-live-integration.mjs
```

---

## 10. نطاقات الكادر الإداري، الملف الشخصي، والمراجعة الهندسية الحية (Phase 12)

### 10.1 إدارة الكادر الإداري والهندسي الحية (`src/features/staff-admin`)
* تم ربط دليل الموظفين مباشرة بـ `usersApi.getUsers()` لاستعراض كادر المنشأة الحقيقي (185 موظفاً على بيئة Staging).
* دعم تفعيل وتعطيل الحسابات الحية عبر `usersApi.toggleUserStatus(id, isActive)`.
* دعم تعديل الأدوار الوظيفية عبر `usersApi.updateUser(id, payload)`.
* دعم إرسال دعوات الانضمام للمهندسين والإداريين عبر `usersApi.createUser(...)` وإصدار رمز الدعوة الفوري.
* إضافة مؤشر نبضي حي في واجهة المستخدم `StaffDirectoryView` يوضح حالة المزامنة اللحظية مع الخادم.

### 10.2 الخدمة الذاتية للملف الشخصي وتعديل البيانات (`src/features/profile`)
* تكامل حوار `EditProfileDialog` لحفظ وتحديث الاسم الكامل، ورقم الهاتف، ولغة الواجهة المفضلة مباشرة عبر `PUT /api/v1/me`.
* استدعاء `refreshProfile()` تلقائياً بعد الحفظ لمزامنة الجلسة وإعادة ضبط السمات البصرية.
* ربط بطاقة المستخدم في الشريط الجانبي بكافة التخطيطات (`AdminLayout`, `OperationsLayout`, `ClientLayout`) برابط مباشر إلى `/profile`.
* ترقية حارس المسارات (`src/app/(dashboard)/layout.tsx`) لضمان إتاحة `/profile` و `/notifications` لجميع الأدوار دون استثناء.

### 10.3 تكامل عروض الأسعار ومراجعة المخططات الهندسية (`Quotations & Blueprint Review`)
* ربط واجهة بناء عرض السعر `src/app/(dashboard)/quotations/[jobNumber]/page.tsx` بحفظ البنود مباشرة على الخادم عبر `quotationsApi.saveQuotation(instanceId, lines)`.
* ربط طابور مراجعة المخططات الهندسية `useBlueprintReviewQueue` بجلب المعاملات الحية من `requestsApi.getWorkflowInstances()` ومطابقتها مع كود البناء السعودي SBC 801.
* ترقية وظيفة تبديل الأدوار `switchRole(role)` لتقوم بمصادقة الحساب الحي تلقائياً وجلب توكن JWT الحقيقي للمهندس، المشرف، وممثل المبيعات.

---

## 11. لوحات القيادة الحية ودعم الروابط المباشرة للمعاملات (Phase 13)

### 11.1 حل المعاملات بالروابط العميقة (`Dynamic Deep-Linking Request Resolution`)
* ترقية صفحة تفاصيل المعاملة `src/app/(dashboard)/requests/[jobNumber]/page.tsx` للبحث الفوري على الخادم في حال عدم وجود المعاملة في التخزين المحلي.
* يتيح ذلك للمستخدمين أو المسؤولين النقر على أي رابط مباشر لأي معاملة منشأة حديثاً على بيئة Staging (مثل `AMX-2026-00016`) وفتح تفاصيلها كاملة دون أي انقطاع أو ظهور شاشة "المعاملة غير موجودة".

### 11.2 مزامنة لوحات التحكم الرئيسية بالأرقام الحية (`Live Multi-Persona Dashboards`)
* **لوحة تحكم مدير المنشأة (`CompanyAdminDashboard`):**
  * مزامنة المعاملات النشطة وفواتير ضريبة القيمة المضافة ZATCA الحية عبر `Promise.allSettled([requestsApi.getWorkflowInstances(), invoicesApi.getInvoices()])`.
  * إظهار المؤشرات الحقيقية للمعاملات وعدد الفواتير الصادرة والإيرادات المحققة.
* **لوحة تحكم المهندس الاستشاري (`ConsultingEngineerDashboard`):**
  * مزامنة المعاملات الهندسية المحتاجة لاعتماد أو مراجعة مخططات من الخادم الحي.
* **لوحة تحكم العميل المستفيد (`ClientDashboard`):**
  * مزامنة فورية لقائمة طلبات العميل عبر `requestsApi.getMyRequests()` مع تحديث بطاقات الحالة وسجل الإنجاز.

---

## 12. العمليات الميدانية، الإغلاق القانوني، العقود الدورية، وبوابة الدفع (Phase 14)

### 12.1 مجمع الموارد والعمليات الميدانية (`src/domains/field-ops/api.ts`)
* **سجل العمال الميدانيين (`/field-workers`):**
  * استعراض وتحديث قائمة العمال (`getWorkers`, `createWorker`, `updateWorker`, `retireWorker`).
  * حساب التكلفة المباشرة للعمالة (`calculateWorkerCost`).
  * ربط الحسابات الوظيفية بالدخول الميداني (`linkWorkerAccount`).
* **سجل المعدات والآلات (`/equipment`):**
  * استعراض وإدارة معدات المنشأة وتصنيف الملكية (`CompanyOwned`, `Rented`, `NewlyPurchased`).
  * تحويل الأصول المشتراة حديثاً إلى ملكية المنشأة (`transitionEquipmentToCompanyOwned`).
* **طابور موافقات الموارد (`/resource-approvals`):**
  * اعتماد طلبات إضافة العمال والمعدات المرفوعة من الميدان (`approveResource`).
* **خطة التنفيذ والمهام والصور الموثقة (`Execution Plan & Geotagged Tasks`):**
  * خطة العمل والمسارات الزمنية (`getExecutionPlan`, `applyStandardSections`, `completeExecutionPlan`).
  * مهام الميدان وتوثيق البداية والإنهاء (`startTask`, `submitTask`, `reviewTask`).
  * توثيق الأدلة الميدانية بالصور وفحص بصمة EXIF والإحداثيات الجغرافية مع التبرير الإداري (`uploadTaskPhoto`, `justifyPhoto`).

### 12.2 مراسم الإغلاق القانوني وقائمة الفحص والتشميع (`src/domains/closure/api.ts`)
* **فحص الجاهزية للإغلاق (`getReadiness`):**
  * فحص البوابات الفنية والحواجز المانعة للتشميع في إجابة موحدة (`CanSeal`, `Blockers`).
* **قائمة الفحص المسبق للإغلاق SBC 801 (`getPunchList`, `applyStandardPunchList`, `inspectPunchListItem`):**
  * إدراج بنود الفحص المعتمدة من كود البناء السعودي واعتماد كل بند بقرار المفتش الميداني الموثق.
* **مراسم التوقيع الثنائي والشهادة الرسمية (`openCertificate`, `signAsClient`, `signAsManager`, `sealProject`):**
  * فتح الشهادة وإصدار رقم الاعتماد السيادي `CRT-YYYY-NNNNN`.
  * تسجيل توقيع العميل (الطرف الأول) وختم المنشأة المصور.
  * تسجيل توقيع المدير العام للشركة (الطرف الثاني) كاعتماد نهائي.
  * تشميع المشروع في خزانة الحصانة الرقمية وإقفال أي تعديل مالي أو فني في قاعدة البيانات.

### 12.3 عقود الصيانة الدورية وجدول الزيارات (`src/domains/maintenance/api.ts`)
* استعراض وإدارة عقود الصيانة الدورية (`getContracts`, `getContractById`, `openContract`, `cancelContract`).
* لوحة التخطيط وجدول الزيارات المجدولة تلقائياً على مدى الأشهر القادمة (`getCalendar`).
* إعادة جدولة الزيارات غير المرفوعة بعد (`rescheduleVisit`).

### 12.4 دفتر الأستاذ لتكاليف المشاريع وبوابة سداد العملاء (`src/domains/payments/api.ts`)
* **دفتر التكاليف المباشرة (`getProjectLedger`):**
  * تتبع المصاريف، الفواتير الموردة، تكاليف المقاولين من الباطن، وهامش الربح الصافي.
  * تسجيل فواتير الموردين وفحص سقف الصرف المعتمد (`recordExpense`, `clearExpense`).
  * تقييد ساعات عمل العمال الميدانيين (`recordLabor`).
* **بوابة سداد العملاء ومراجعة التحويلات (`Project Payments Gateway`):**
  * كشف حساب المشروع المالي وحالة سداد الدفعة المقدمة (`getProjectPayments`, `getClientPaymentStatement`).
  * السداد ببطاقات مدى/فيزا عبر ميسار والتأكيد الآلي (`payByCard`, `confirmCardPayment`).
  * رفع إيصال التحويل البنكي للمراجعة الإدارية (`payByBankTransfer`).
  * تحصيل المبالغ النقدية في الموقع واعتمادها فورياً (`recordCashPayment`, `reviewPayment`).

### 12.5 سجل التدقيق والامتثال الرقابي (`src/domains/audit/api.ts`)
* استعلام سجل التدقيق الموثق للحركات والعمليات والتغييرات (`getAuditLogs`, `getAuditLogById`).
* تصدير سجل التدقيق إلى ملف CSV للأرشفة الرقابية (`exportAuditLogs`).

---

## 13. بوابة الصيانة الدورية الحية ومزامنة الكادر والزيارات الميدانية (Phase 15)

### 13.1 بوابة عقود وزيارات الصيانة التفاعلية (`src/features/maintenance`)
* **لوحة المؤشرات التشغيلية (Maintenance KPIs):**
  * إجمالي العقود، العقود النشطة السارية، الزيارات المجدولة القادمة، والزيارات المنجزة.
* **جدول الزيارات الميدانية التفاعلي (Planning Board Calendar):**
  * عرض متسلسل لزيارات الصيانة الميدانية المستحقة مع رقم العقد، اسم العميل، المعاملة المربوطة، وشارات الحالة.
  * حوار إعادة الجدولة المباشر (`RescheduleVisitDialog`) لحفظ التعديل فورياً على الخادم عبر `PUT /api/v1/maintenance/visits/{id}/schedule`.
* **سجل عقود الصيانة المعتمدة (Contracts Roster):**
  * استعراض العقود السارية، دورية الزيارات (ربع سنوي، نصف سنوي، شهري)، ونسبة اكتمال الزيارات الميدانية.
  * حوار تأسيس عقد جديد (`OpenContractDialog`) يربط المعاملة المعتمدة ويوزع الزيارات تلقائياً وفق كود البناء السعودي.
* **إتاحة الوصول في شريط التنقل:**
  * إضافة رابط صفحة الصيانة `/maintenance` وأيقونة الصيانة الفنية (`Wrench`) في القائمة الجانبية والقائمة المتنقلة لأدوار المدير العام (`Company Admin`) ومسؤول العمليات (`Operations Officer`).

### 13.2 المزامنة اللحظية لكادر الموظفين (`src/features/employees`)
* ترقية خطاف `useEmployeeList` ليقوم بمزامنة طاقم المنشأة الحي من `usersApi.getUsers()` (185 موظفاً معتمداً) ودمجهم بسلاسة مع التخزين المحلي.
* إظهار شارة النبض الخضراء (`مزامنة حية مع أمانكس`) في ترويسة قائمة الموظفين لتأكيد الاتصال اللحظي.

### 13.3 المزامنة اللحظية للزيارات الميدانية (`src/features/site-visits`)
* ترقية خطاف `useSiteVisitsList` ليقوم بربط الزيارات المستحقة دورياً من `maintenanceApi.getCalendar()` وتحويلها إلى بطاقات زيارات وتقويم تفاعلي.
* إظهار شارة المزامنة الحية في ترويسة صفحة الزيارات الميدانية.



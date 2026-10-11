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

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

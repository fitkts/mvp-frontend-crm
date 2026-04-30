```markdown
# AwareFit CRM: 회원 관리(MembersPage) API Specification

## 1. 👩‍💼 비개발자를 위한 쉬운 설명
- **데이터 흐름 및 목적**: 헬스장 데스크의 '회원 관리 파일 철'과 같습니다. 왼쪽에는 전체 회원의 이름과 남은 횟수를 빠르게 훑어볼 수 있는 목록이, 오른쪽에는 특정 회원의 결제 내역, PT 일지, 체력 변화 등을 모아둔 상세 보드가 표시됩니다.
- **백엔드 역할**: 직원이 회원을 조회할 때 우리 헬스장(테넌트) 손님만 정확히 골라주고, 알바생에게는 전화번호를 `010-12**-****`처럼 가려서 보여줍니다. 또한 원장님만 회원 파일을 엑셀로 받을 수 있게 보안 문을 지키고, 남은 PT 횟수를 차감할 때 시스템 오류로 횟수가 두 번 깎이지 않도록 은행 출금처럼 엄격하게 숫자를 계산합니다.

---

## 2. 🏗 Data Models (DB 스키마 설계)
*멀티테넌트 구조에 따라 모든 테이블에는 `tenant_id`가 포함되어야 합니다.*
*(기존 User, Tenant, Trainer 모델이 존재한다고 가정, 이번 페이지를 위해 확장/추가된 핵심 모델 위주로 설명합니다.)*

| 테이블명 | 컬럼명 (필드명) | 타입 | 설명 | 제약조건 / 인덱스 | 기본값 |
|---|---|---|---|---|---|
| **Member** | `id` | UUID | 회원 고유 식별자 | PK | `uuid_generate_v4()` |
| (회원자본) | `tenant_id` | UUID | 테넌트 격리 키 | FK (Tenant), Index | - |
| | `trainer_id` | UUID | 담당 트레이너 식별자 | FK (Trainer), Nullable | NULL |
| | `name` | VARCHAR(50) | 회원 이름 | Index | - |
| | `phone_encrypted`| TEXT | 전화번호 (양방향 암호화 보관) | Index | - |
| | `status` | ENUM | 상태 (ACTIVE, PAUSED, EXPIRED) | - | 'ACTIVE' |
| **Membership** | `id` | UUID | 수강권 고유 식별자 | PK | `uuid_generate_v4()` |
| (수강권) | `tenant_id` | UUID | 테넌트 격리 키 | FK (Tenant), Index | - |
| | `member_id` | UUID | 소유 회원 식별자 | FK (Member) | - |
| | `package_name` | VARCHAR(100) | 상품명 (예: PT 10회권) | - | - |
| | `total_count` | INTEGER | 전체 제공 횟수 | - | - |
| | `used_count` | INTEGER | 사용 횟수 | `used_count <= total_count` | 0 |
| **Payment** | `id` | UUID | 결제 식별자 | PK | `uuid_generate_v4()` |
| (결제내역) | `tenant_id` | UUID | 테넌트 격리 키 | FK (Tenant), Index | - |
| | `amount` | INTEGER | 결제 금액 | - | - |
| | `unpaidAmount` | INTEGER | 미수금 | - | 0 |
| **AuditLog** | `id` | UUID | 로그 식별자 | PK | `uuid_generate_v4()` |
| (감사 기록) | `tenant_id` | UUID | 테넌트 격리 키 | FK (Tenant), Index | - |
| | `action` | VARCHAR(50) | 행위 (예: CSV_EXPORT, COUNT_EDIT)| - | - |
| | `details` | JSONB | 당시 상태 스냅샷 및 변경값 | - | - |

---

## 3. 💎 Prisma Schema
*(요청에 따라 기존 기본 모델 골격에 본 페이지에 필요한 릴레이션과 신규 모델을 연결하여 완성한 코드입니다.)*

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ---------------------------------------------------------
// [기존/필수 베이스 모델]
// ---------------------------------------------------------
model Tenant {
  id          String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String
  users       User[]
  trainers    Trainer[]
  members     Member[]
  memberships Membership[]
  payments    Payment[]
  auditLogs   AuditLog[]
}

model User {
  id        String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId  String     @db.Uuid
  tenant    Tenant     @relation(fields: [tenantId], references: [id])
  email     String     @unique
  role      Role
  trainer   Trainer?
  auditLogs AuditLog[] // 누가 어떤 행동을 했는지 기록
}

enum Role {
  ADMIN
  TRAINER
  MEMBER
}

model Trainer {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId  String   @db.Uuid
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  userId    String   @unique @db.Uuid
  user      User     @relation(fields: [userId], references: [id])
  members   Member[]
}

// ---------------------------------------------------------
// [MembersPage 신규/확장 모델]
// ---------------------------------------------------------
model Member {
  id              String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId        String       @db.Uuid
  tenant          Tenant       @relation(fields: [tenantId], references: [id])
  trainerId       String?      @db.Uuid
  trainer         Trainer?     @relation(fields: [trainerId], references: [id])
  name            String
  phoneEncrypted  String       // DB 단에는 암호화되어 저장됨
  email           String?
  status          MemberStatus @default(ACTIVE)
  
  memberships     Membership[]
  payments        Payment[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([tenantId, name]) // 검색 성능을 위한 복합 인덱스
}

enum MemberStatus {
  ACTIVE
  PAUSED
  EXPIRED
}

model Membership {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @db.Uuid
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  memberId    String   @db.Uuid
  member      Member   @relation(fields: [memberId], references: [id])
  packageName String
  totalCount  Int
  usedCount   Int      @default(0)
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Payment {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String   @db.Uuid
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  memberId      String   @db.Uuid
  member        Member   @relation(fields: [memberId], references: [id])
  amount        Int
  unpaidAmount  Int      @default(0)
  paymentMethod String   // "CREDIT_CARD", "TRANSFER" 등
  paymentDate   DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId  String   @db.Uuid
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id])
  action    String   // "EXPORT_MEMBER_CSV", "MANUAL_COUNT_DEDUCT" 등
  targetId  String?  @db.Uuid // 변경 대상 Member ID 또는 Membership ID 등
  details   Json     @db.JsonB
  createdAt DateTime @default(now())
}
```

---

## 4. 🔌 API Endpoints
*모든 API는 JWT 디코딩을 통해 서버에서 가져온 `tenantId`로 Prisma Client Extension을 통해 자동 격리됩니다.*

### 4.1. 회원 목록 조회 (좌측 패널용 - 필수 페이징 및 마스킹 적용)
- **Method / Path:** `GET /api/v1/members`
- **권한 (Role):** `ADMIN`, `TRAINER` (TRAINER는 자신이 담당하는 회원만 조회 - Extension 또는 Service 로직에서 분기)
- **Tenant Isolation:** Request JWT의 `tenantId` 기반으로 쿼리 시 자동 `where: { tenantId }` 주입.
- **Request Parameters:**
  ```json
  {
    "cursor": "uuid-string-or-null", 
    "limit": 50,
    "search": "김지석",
    "status": "ACTIVE",
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
  ```
- **Response (Success - 200 OK):**
  > **보안 처리 (마스킹 적용):** 접속한 유저의 권한이 `ADMIN`이 아닐 경우 전화번호 중간 자리를 `*`로 바꿔서 반환합니다. DB 복호화 후 메모리에서 변환 처리.
  ```json
  {
    "data": [
      {
        "id": "member-uuid-1",
        "name": "김지석",
        "phone": "010-12**-*456", 
        "status": "ACTIVE",
        "membershipInfo": {
          "totalRemaining": 5, // 활성화된 수강권의 잔여 합계
          "attendanceRate": 75 
        }
      }
    ],
    "nextCursor": "member-uuid-50"
  }
  ```

### 4.2. 회원 상세 조회 (우측 패널 및 각 탭 데이터 요약)
- **Method / Path:** `GET /api/v1/members/:id`
- **권한 (Role):** `ADMIN`, `TRAINER` (단, 본인 담당 회원인지 검증 필요)
- **Tenant Isolation:** 해당 회원(:id)이 로그인한 유저와 동일한 `tenantId`를 소유했는지 검증.
- **Response (Success - 200 OK):**
  ```json
  {
    "id": "member-uuid-1",
    "name": "김지석",
    "phone": "010-1234-5678", // ADMIN일 경우 평문 노출
    "activeMemberships": [
      {
        "id": "membership-uuid",
        "packageName": "개인 PT 10회",
        "totalCount": 10,
        "usedCount": 5
      }
    ],
    "summary": { "totalPayment": 1500000, "unpaidAmount": 0 },
    "recentMemo": "스쿼트 시 무릎 간격 주의"
  }
  ```

### 4.3. 수강권 차감 및 결제 변경 (안전장치: DB 트랜잭션 및 Audit Log)
- **Method / Path:** `POST /api/v1/memberships/:id/deduct`
- **권한 (Role):** `ADMIN`, `TRAINER`
- **Tenant Isolation:** 수강권 ID 기반으로 `tenantId` 소유권 강제 확인.
- **Request Body:**
  ```json
  {
    "amountToDeduct": 1,
    "reason": "MANUAL_DEDUCTION_BY_TRAINER_MISTAKE_FIX"
  }
  ```
- **Response (Success - 200 OK):**
  ```json
  {
    "membershipId": "membership-uuid",
    "previousCount": 5,
    "newUsedCount": 6,
    "remainingCount": 4
  }
  ```

### 4.4. 🚨 데이터 엑셀 내보내기 (보안 통제 API)
- **Method / Path:** `GET /api/v1/members/export`
- **권한 (Role):** 오직 `ADMIN`만 가능
- **Tenant Isolation:** JWT `tenantId`로 격리.
- **Response:** CSV 파일 다운로드 Stream 반환. 
- **비즈니스 로직 연동:** 
  - 요청 성공 시 백엔드는 즉시 `AuditLog` 테이블에 `{ action: "EXPORT_MEMBER_CSV", userId: request_user_id }` 레코드를 Insert 해야만 합니다.

---

## 5. 🛡️ 비즈니스 로직 및 예외 처리

### 1) 차감 트랜잭션 (Atomic Operation)
- 횟수 차감 API(`POST /deduct`) 호출 시, 반드시 DB Transaction 안에서 1) 현재 잔여 횟수 조회, 2) 차감(-1) Update, 3) 출석/히스토리 로그 생성이 **묶여서 동시에 처리**되어야 합니다. (Race Condition 방지)
  ```typescript
  // Prisma 로직 예시
  await prisma.$transaction(async (tx) => {
     // 1. 유효성 검사 (0회 이하 차감 불가 등)
     // 2. Used Count 증가
     // 3. Audit Log 기록
  });
  ```

### 2) 데이터 마스킹 미들웨어
- Service 계층에서 데이터 반환 직전 `role !== 'ADMIN'` 인 경우, DTO 변환 시 `phone = maskPhone(phone)` 로직이 강제로 통과되도록 설계합니다.

### 3) 표준 예외 시스템 (Error Cases)
모든 에러는 표준 에러 응답 형식 `{ code, message, httpStatus }` 에 맞춰 던집니다.

| 코드 | HTTP 상태 | 발생 상황 예시 (메시지 포함) |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 필수 파라미터(cursor 등) 누락 혹은 잘못된 데이터 형식 입력 |
| `EXCEEDED_COUNT` | 400 | 잔여 수강권 횟수가 0인데 출석/차감을 시도했을 경우 |
| `UNAUTHORIZED` | 401 | 헤더에 Access Token이 없거나 만료됨 |
| `ROLE_FORBIDDEN` | 403 | 알바생(TRAINER)이 엑셀 내보내기(CSV Export) API를 호출한 경우 |
| `RESOURCE_NOT_FOUND` | 404 | 조회하려는 회원이 존재하지 않거나, 다른 헬스장(타 테넌트) 회원일 경우 |
| `CONCURRENCY_ERROR` | 409 | 동시에 횟수 차감 요청이 발생하여 트랜잭션 충돌, 재조회 요망 |
| `INTERNAL_ERROR` | 500 | DB 암호화 키 분실 또는 예기치 못한 내부 서버 오류 |

---

## 6. 💡 아키텍트의 조언 (SoL 설계 철학 기반)

1. **전화번호 양방향 암호화 (Security & Privacy):**
   - 회원의 개인정보인 이메일과 전화번호는 DB 침해 시 심각한 타격입니다. DB 저장 전에 애플리케이션 단에서 `AES-256-GCM` 같은 알고리즘을 사용해 암호화(Encrypt)하여 저장하세요.
   - 단, 검색을 위해 "이름"은 일방향 해시가 아닌 평문 또는 인덱스화 가능한 형태로 저장해야 검색 성능(`LIKE %name%`)을 살릴 수 있습니다. 전화번호 검색이 잦다면, 전화번호 뒷자리(4자리)만 별도의 평문 컬럼형태로 저장해 검색 조건으로 활용하는 하이브리드 전략을 추천합니다.
   
2. **Cursor-based Pagination (Performance):**
   - 헬스장 회원은 점점 누적됩니다. 데이터가 5,000건 이상 넘어갈 경우 기존 `OFFSET / LIMIT` 방식은 DB 부하(Full Scan 가능성)를 초래합니다. `id` 또는 `createdAt`을 기준으로 한 **커서 기반 페이징(Cursor Pagination)**을 반드시 도입하세요.

3. **Prisma Client Extension을 활용한 테넌트 격리 자동화 (Productivity & Safety):**
   - 백엔드 개발자가 매 쿼리마다 `where: { tenantId: user.tenantId }`를 손으로 적는 것은 Human Error(데이터 유출 사고)의 주범입니다. Prisma Extension 기능의 `$allModels.$query`를 후킹하거나 NestJS의 `Request-Scoped` 프로바이더를 응용하여, **데이터 액세스 계층에서 무조건 Tenant 필터가 덧씌워지도록 강제**하는 구조를 잡는 것이 이 SaaS의 핵심 보안 축입니다.

4. **N+1 문제 주의 (Optimization):**
   - 좌측 회원 리스트를 불러올 때, 회원의 활성 수강권 합계를 각각 루프를 돌며 DB에서 다시 꺼내오는 N+1 쿼리가 발생하기 매우 쉽습니다. Prisma의 `include` 또는 별도의 Aggregation View를 만들어 한 쿼리로 조인해서 가져오도록 프론트 반환 DTO 구조를 매핑하세요.
```

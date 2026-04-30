# LockerManagement_API_Specification

## 1. 👩‍💼 비개발자를 위한 쉬운 설명
사물함 관리 페이지는 헬스장 내의 "가상의 사물함 지도"를 만들고, 회원들에게 자물쇠를 하나씩 배정해 주는 작업과 같습니다. 
백엔드는 이 지도의 생김새(배열, 갯수)를 기억하고, 어느 사물함을 누가 언제까지 쓰는지, 돈은 냈는지 철저하게 기록(히스토리 및 결제 장부)하여 프론트엔드 화면에 현재 헬스장의 사물함 현황을 실시간으로 뿌려주는 역할을 합니다. 매일 자정이 되면 이용 기간이 끝난 사물함에 빨간 딱지(만료 처리)를 자동으로 붙이는 작업도 백엔드가 대신 수행합니다.

---

## 2. 🏗 Data Models (DB 스키마 설계)

사물함 기능을 위해 신규로 필요한 테이블 구조입니다.

### 2.1 LockerConfig (사물함 구역 및 배열 설정)
| 필드명 | 타입 | 설명 | 제약조건 | 기본값 |
|---|---|---|---|---|
| id | UUID | 구역 고유 ID | PK | uuid_generate_v4() |
| tenantId | UUID | 테넌트 고유 식별자 | FK, Not Null | - |
| name | VARCHAR | 구역명 (예: A구역, 남자탈의실) | Not Null | - |
| totalCount | INTEGER | 총 사물함 갯수 | Not Null | 0 |
| gridCols | INTEGER | 가로 열(Column) 갯수 | Not Null | 1 |
| gridRows | INTEGER | 세로 행(Row) 갯수 | Not Null | 1 |
| direction | ENUM | 번호 부여 방향 ('HORIZONTAL', 'VERTICAL') | Not Null | 'HORIZONTAL' |

### 2.2 Locker (개별 사물함)
| 필드명 | 타입 | 설명 | 제약조건 | 기본값 |
|---|---|---|---|---|
| id | UUID | 사물함 고유 ID | PK | uuid_generate_v4() |
| tenantId | UUID | 테넌트 고유 식별자 | FK, Not Null | - |
| lockerConfigId| UUID | 소속 구역 ID | FK, Not Null | - |
| lockerNumber | VARCHAR | 사물함 표시 번호 (예: A-01) | Not Null | - |
| status | ENUM | 상태 ('AVAILABLE', 'IN_USE', 'EXPIRED', 'MAINTENANCE') | Not Null | 'AVAILABLE' |
| memberId | UUID | 배정된 회원 ID | FK, Nullable | null |
| productId | UUID | 배정에 사용된 상품 ID | FK, Nullable | null |
| startDate | TIMESTAMPTZ | 이용 시작일 | Nullable | null |
| endDate | TIMESTAMPTZ | 이용 종료일 (만료일) | Nullable | null |
| memo | TEXT | 관리자 메모 | Nullable | null |

### 2.3 LockerHistory (사물함 상태 변경 이력)
| 필드명 | 타입 | 설명 | 제약조건 | 기본값 |
|---|---|---|---|---|
| id | UUID | 히스토리 고유 ID | PK | uuid_generate_v4() |
| lockerId | UUID | 대상 사물함 ID | FK, Not Null | - |
| actionType | VARCHAR | 액션 유형 ('ASSIGN', 'RETURN', 'EXPIRE_AUTO', 'MEMO', 'MAINTENANCE') | Not Null | - |
| description | TEXT | 처리 상세 내용 | Not Null | - |
| actorId | UUID/VARCHAR | 처리자 ID (자동화 스케줄러의 경우 'SYSTEM') | Not Null | - |
| createdAt | TIMESTAMPTZ | 이력 발생 시간 | Not Null | now() |

---

## 3. 💎 Prisma Schema

> **참고**: 제공해주신 기존 스키마 블록이 비어있어, 최소한의 기준이 되는 `Tenant`, `Member`, `Product`, `PaymentLog` 모델을 가상으로 선언하고 이들과의 관계(Relation)를 정의했습니다. 실제 프로젝트의 모델명과 일치시켜 사용하시기 바랍니다.

```prisma
// --- 기준 모델 (기존 코드와 병합 시 참고) ---
// model Tenant { ... }
// model User { ... }
// model Member { ... }
// model Product { ... }
// model PaymentLog { ... }

// --- 사물함 관리를 위한 신규 및 확장 스키마 ---

enum LockerStatus {
  AVAILABLE
  IN_USE
  EXPIRED
  MAINTENANCE
}

enum LockerDirection {
  HORIZONTAL
  VERTICAL
}

model LockerConfig {
  id          String          @id @default(uuid())
  tenantId    String
  // tenant      Tenant          @relation(fields: [tenantId], references: [id])
  name        String
  totalCount  Int             @default(0)
  gridCols    Int             @default(1)
  gridRows    Int             @default(1)
  direction   LockerDirection @default(HORIZONTAL)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  lockers     Locker[]
  
  @@index([tenantId])
}

model Locker {
  id             String       @id @default(uuid())
  tenantId       String
  // tenant         Tenant       @relation(fields: [tenantId], references: [id])
  lockerConfigId String
  lockerConfig   LockerConfig @relation(fields: [lockerConfigId], references: [id], onDelete: Cascade)
  
  lockerNumber   String
  status         LockerStatus @default(AVAILABLE)
  
  memberId       String?
  // member         Member?      @relation(fields: [memberId], references: [id])
  productId      String?
  // product        Product?     @relation(fields: [productId], references: [id])
  
  startDate      DateTime?    @db.Timestamptz
  endDate        DateTime?    @db.Timestamptz
  memo           String?      @db.Text
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  histories      LockerHistory[]

  @@unique([tenantId, lockerConfigId, lockerNumber])
  @@index([tenantId, status])
}

model LockerHistory {
  id          String   @id @default(uuid())
  lockerId    String
  locker      Locker   @relation(fields: [lockerId], references: [id], onDelete: Cascade)
  
  actionType  String
  description String   @db.Text
  actorId     String   // JWT userId OR 'SYSTEM'
  
  createdAt   DateTime @default(now())

  @@index([lockerId])
}
```

---

## 4. 🔌 API Endpoints

모든 API는 `Prisma Client Extension`을 통해 Authorization 헤더의 JWT에서 디코딩된 `tenantId`를 추출하여 자동으로 쿼리에 `{ where: { tenantId } }` 필터가 주입됩니다. `request body`나 `params`에 `tenantId`를 포함하지 않습니다.

### 4.1 대시보드 오버뷰 (상태별 집계)
- **Method & Path** : `GET /api/lockers/dashboard`
- **Role** : `ADMIN`, `TRAINER`
- **Tenant Isolation** : JWT의 tenantId 기준으로 그룹화(Count) 조회
- **Response (Success)**
```json
{
  "total": 120,
  "available": 80,
  "inUse": 35,
  "expired": 5
}
```

### 4.2 사물함 목록 조회 (+페이징, 필터링)
- **Method & Path** : `GET /api/lockers`
- **Role** : `ADMIN`, `TRAINER`
- **Tenant Isolation** : JWT의 tenantId 기준 Locker 조회
- **Query Params** : 
  - `status` : (선택) `AVAILABLE`, `IN_USE`, `EXPIRED`, `MAINTENANCE`
  - `cursor` : (선택) 마지막으로 조회된 사물함 ID (페이징용)
  - `limit` : (선택) 기본 50
- **Response (Success)**
```json
{
  "data": [
    {
      "id": "locker-uuid-1",
      "lockerNumber": "A-01",
      "status": "IN_USE",
      "member": { "id": "m-uuid-1", "name": "김철수" },
      "startDate": "2024-05-01T00:00:00.000Z",
      "endDate": "2024-08-01T00:00:00.000Z"
    }
  ],
  "nextCursor": "locker-uuid-50"
}
```

### 4.3 사물함 회원 배정 (결제 연동 트랜잭션)
- **Method & Path** : `PUT /api/lockers/:id/assign`
- **Role** : `ADMIN`
- **Tenant Isolation** : JWT tenantId 기준 개별 Locker 업데이트 가능 여부 검증
- **Request (Body)**
```json
{
  "memberId": "member-uuid",
  "productId": "product-uuid",
  "startDate": "2024-05-01T00:00:00.000Z",
  "paymentStatus": "COMPLETED",
  "paymentMethod": "CARD",
  "amount": 50000,
  "memo": "신규 회원 배정"
}
```
- **Response (Success)**
```json
{
  "id": "locker-uuid",
  "status": "IN_USE",
  "message": "사물함 배정 및 결제 내역 등록 완료"
}
```

### 4.4 사물함 상세 상태 변경 (회수, 수리 등) 및 메모
- **Method & Path** : `PATCH /api/lockers/:id`
- **Role** : `ADMIN`
- **Request (Body)**
```json
{
  "status": "AVAILABLE",
  "memo": "회수 후 청소 완료"
}
```

### 4.5 락커 구역(결합) 배열 환경설정 조회 및 수정
- **Method & Path** : `GET /api/locker-configs` / `PUT /api/locker-configs/:id`
- **Role** : `ADMIN` (수정), `ADMIN|TRAINER` (조회)
- **Request (Body - PUT)**
```json
{
  "name": "남자탈의실",
  "totalCount": 100,
  "gridCols": 10,
  "gridRows": 10,
  "direction": "HORIZONTAL"
}
```

### 4.6 사물함 히스토리 조회
- **Method & Path** : `GET /api/lockers/:id/histories`
- **Role** : `ADMIN`, `TRAINER`
- **Response (Success)**
```json
{
  "data": [
    {
      "actionType": "ASSIGN",
      "description": "김철수 회원 배정 (결제완료)",
      "actorName": "김관리",
      "createdAt": "2024-05-01T10:00:00.000Z"
    }
  ]
}
```

---

## 5. 🛡️ 비즈니스 로직 및 예외 처리

### 5.1 사물함 배정/결제 처리 흐름 (DB Transaction 연동)
`PUT /api/lockers/:id/assign` API는 프론트엔드의 요구사항에 따라 3개의 작업을 단일 DB 트랜잭션으로 처리해야 합니다. (\$transaction)
1. **유효성 검증**: 회원(Member) 존재 여부, 상품(Product) 존재 여부 확인. 사물함의 상태가 `AVAILABLE` 또는 `EXPIRED` 인지 확인.
2. **Locker Update**: `memberId`, `productId`, `startDate`, 자동 계산된 `endDate`, 상태를 `IN_USE`로 업데이트.
3. **PaymentLog Insert**: 입력받은 금액과 결제 수단으로 결제 로그(장부) 적재.
4. **LockerHistory Insert**: 누가 배정했는지, 어떤 상품으로 며칠간 배정했는지 기록.
하나라도 실패할 경우 Rollback 됨을 보장해야 합니다.

### 5.2 자정 Expiration 스케줄링 (CronJob)
백엔드 서버 내 (혹은 서버리스 이벤트 트리거) `node-cron` 등을 사용하여 매일 자정(00:00) 동작 로직 구현:
1. `endDate`가 현재 시간(`now()`)을 지난 모든 사물함(단, 상태가 `IN_USE` 인 것들) 조회.
2. 상태를 일괄 `EXPIRED`로 `updateMany`.
3. 업데이트된 각 사물함 ID에 대하여 `LockerHistory`에 `{ actionType: 'EXPIRE_AUTO', actorId: 'SYSTEM', description: '이용 기한 만료로 자동 상태 전환' }` 기록 로직을 비동기 Bulk Insert 로 처리.

### 5.3 표준 HTTP 상태 코드 및 오류 형식 처리
| 코드 | 에러 코드 (code) | 상황 예시 및 설명 |
|------|----------------|----------------|
| 400 | `INVALID_LOCKER_STATE` | 사용 중인 사물함을 다른 회원에게 배정하려고 할 때 |
| 400 | `INVALID_MEMBER_PRODUCT` | 존재하지 않는 Member ID나 Product ID를 보냈을 때 |
| 401 | `UNAUTHORIZED_TOKEN` | JWT가 없거나 만료되었을 때 |
| 403 | `INSUFFICIENT_ROLE` | TRAINER 권한 계정이 사물함을 수정/배정 하려고 할 때 |
| 404 | `LOCKER_NOT_FOUND` | URL의 사물함 ID가 해당 테넌트에 존재하지 않을 때 |
| 500 | `INTERNAL_SERVER_ERROR` | 트랜잭션 실패, DB Timeout 등 |

**표준 에러 응답 예시 (HTTP 400)**
```json
{
  "code": "INVALID_LOCKER_STATE",
  "message": "해당 사물함은 이미 다른 회원이 사용 중입니다.",
  "httpStatus": 400
}
```

---

## 6. 💡 아키텍트의 조언

1. **상태값 조회 성능 최적화 (대시보드)**
   대시보드용 오버뷰 API(`GET /api/lockers/dashboard`)는 헬스장 특성상 스태프가 접속할 때마다 호출되며 빈도수가 높습니다. 사물함 개수가 많아질 경우 `GROUP BY status` 비용을 줄이기 위해 Redis 같은 인메모리 스토어에 테넌트별 사물함 카운트를 캐싱하고, 업데이트(PUT, PATCH) 발생 시 카운트를 갱신(Invaliding)하는 전략을 고려하면 매우 빠른 응답(Speed of Light)을 실현할 수 있습니다.
2. **락커 배열 자동 생성자 (Config 렌더링 동기화)**
   `LockerConfig` 정보가 수정되어 총 개수(totalCount)가 늘어나는 경우, 백엔드는 즉시 `AVAILABLE` 상태의 더미 데이터 사물함 객체(늘어난 갯수만큼)를 DB에 Insert 하여 프론트엔드가 페이지를 새로고침하더라도 락커 맵이 깨지지 않도록 동기화를 지원해야 합니다.
3. **만료 스케줄러 분산락 주의 (Cron)**
   만약 Node.js/NestJS 백엔드 인스턴스가 스케일아웃(2대 이상) 된 환경이라면, 동일한 자정 스케줄러가 여러 서버에서 동시에 실행되어 히스토리가 중복 적재되거나 데드락이 발생할 위험이 있습니다. Redis-based Lock(Redlock 등)을 사용하여 단 하나의 인스턴스에서만 CronJob을 점유하여 수행하도록 설계하는 것이 필수적입니다.
4. **N+1 문제 회피**
   사물함 목록 조회 시 `Member`나 `Product` 정보를 조인해야 하므로, Prisma 사용 시 `include: { member: true }`를 사용하여 단일 조인 쿼리로 풀어내어 N+1 성능 저하를 방지해야 합니다. 필요한 필드(이름 등)만 가져오도록 `select` 옵션을 활용하여 페이로드 크기도 최적화하시기 바랍니다.

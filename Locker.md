# Locker Management API Specification (사물함 관리 API 명세서)

본 문서는 프론트엔드(React)의 '사물함 관리' 페이지와 백엔드 서버가 통신하기 위한 API(Application Programming Interface) 명세서입니다. 국제적인 RESTful 표준 규격을 따르며, 해외 개발자도 즉시 이해하고 구현할 수 있도록 영문 스키마(Schema)와 명확한 JSON 구조를 포함합니다.

---

## 👩‍💼 비개발자를 위한 쉬운 설명 (For Non-Developers)

> **API가 무엇인가요?**
> 식당에서 손님(프론트엔드)이 웨이터(API)에게 메뉴를 주문하면 주방(백엔드/데이터베이스)에서 요리를 만들어 가져다주는 역할과 같습니다. 

이 문서는 "어떤 주문(요청)을 할 수 있는지", "어떤 형태의 데이터(요리)를 주고받아야 하는지"를 약속한 메뉴얼입니다.

1. **사물함 목록 불러오기**: 화면을 처음 열었을 때 전체 사물함의 상태(사용 중, 비어있음, 고장 등)를 서버에 요청합니다.
2. **구역(배열) 설정**: 5열 6행, 총 30개 등 사물함의 뼈대(그리드)를 ఎలా 놓을건지 세팅하는 데이터를 주고 받습니다.
3. **사물함 상태 변경 (등록/수정)**: 특정 사물함에 회원을 배정하거나, 결제 상태를 변경하고 메모를 남기면 서버 데이터베이스에 안전하게 저장합니다.
4. **이력(History) 자동 기록**: "언제, 누가, 무엇을 했는지" 타임라인을 기록하여 나중에 추적할 수 있게 합니다.

---

## 🏗 Data Models (데이터 구조)

### 1. Locker (사물함 상세 정보)
| Field (필드명) | Type (타입) | Description (설명) | 비고 (Notes) |
|---|---|---|---|
| `id` | String | 사물함 고유 ID (예: "A-01") | Primary Key |
| `status` | Enum | 상태 (`AVAILABLE`, `IN_USE`, `EXPIRED`, `MAINTENANCE`) | |
| `memberId` | String? | 이용 중인 회원 고유 ID | Optional |
| `memberName` | String? | 이용 중인 회원 이름 | Optional |
| `startDate` | Date? | 이용 시작일 (YYYY-MM-DD) | Optional |
| `expireDate` | Date? | 이용 만료일 (YYYY-MM-DD) | 자동 계산 결과 저장 |
| `productId` | Integer? | 등록된 상품 ID | Optional |
| `paymentStatus` | Enum? | 결제 상태 (`PAID`, `UNPAID`) | Optional |
| `paymentMethod` | Enum? | 결제 수단 (`CARD`, `TRANSFER`, `CASH`) | Optional |
| `memo` | String? | 관리자 메모 (Max 100 characters) | Optional |

### 2. Locker History (사물함 이력)
| Field (필드명) | Type (타입) | Description (설명) | 비고 (Notes) |
|---|---|---|---|
| `id` | Integer | 이력 고유 ID | Primary Key |
| `lockerId` | String | 대상 사물함 ID | Foreign Key |
| `date` | DateTime | 기록 일시 (ISO-8601) | |
| `type` | Enum | 이력 유형 (`ASSIGN`, `MAINTENANCE`, `SYSTEM`, `MEMO`) | |
| `desc` | String | 상세 내역 (예: "메모: 경첩 수리 완료") | |

### 3. Zone Settings (구역/배열 설정)
| Field (필드명) | Type (타입) | Description (설명) | 비고 (Notes) |
|---|---|---|---|
| `zoneId` | String | 구역 ID (예: "ZONE_A") | Primary Key |
| `gridCols` | Integer | 가로 배열 (열 개수) | |
| `gridRows` | Integer | 세로 배열 (행 개수) | |
| `totalLockers` | Integer | 총 사물함 개수 | |
| `numberingDirection`| Enum | 번호 부여 방향 (`horizontal`, `vertical`) | |

---

## 🔌 API Endpoints (서버 연동 주소)

### 1. Get Lockers (사물함 목록 조회)
- **Method**: `GET`
- **Path**: `/api/v1/lockers`
- **Description**: 전체 사물함의 현재 상태를 배열 형태로 가져옵니다.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "A-01",
      "status": "IN_USE",
      "memberName": "강민준",
      "startDate": "2026-04-15",
      "expireDate": "2026-07-15",
      "productId": 6,
      "paymentStatus": "PAID",
      "paymentMethod": "CARD",
      "memo": "열쇠 분실 주의"
    },
    {
      "id": "A-02",
      "status": "AVAILABLE"
    }
  ]
}
```

### 2. Update Locker (사물함 상태/메모/수납 업데이트)
- **Method**: `PUT`
- **Path**: `/api/v1/lockers/{id}`
- **Description**: 사물함에 회원을 배정하거나 정보를 수정합니다. 이 요청이 들어오면 백엔드에서는 자동으로 `History` 데이터를 하나 생성하는 것이 좋습니다.
- **Request Body**:
```json
{
  "status": "IN_USE",
  "memberName": "박서연",
  "startDate": "2026-04-20",
  "expireDate": "2026-07-20",
  "productId": 6,
  "paymentStatus": "UNPAID",
  "memo": "현금 결제 대기중"
}
```

### 3. Get Locker History (특정 사물함 타임라인 조회)
- **Method**: `GET`
- **Path**: `/api/v1/lockers/{id}/history`
- **Description**: 해당 사물함의 변경 이력(타임라인) 내역을 가져옵니다.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 105,
      "date": "2026-04-27T14:30:00Z",
      "type": "MEMO",
      "desc": "메모: 현금 결제 대기중"
    },
    {
      "id": 104,
      "date": "2026-04-27T14:29:00Z",
      "type": "ASSIGN",
      "desc": "[박서연] 배정 - 개인 사물함 3개월 (미수)"
    }
  ]
}
```

### 4. Get/Update Zone Settings (구역 및 배열 설정)
- **Method**: `GET` 및 `PUT`
- **Path**: `/api/v1/zones/{zoneId}/settings`
- **Description**: 사용자 화면의 그리드 컬럼 수, 총 갯수, 번호 부여 방향(가로/세로) 설정을 저장하고 불러옵니다.
- **Request/Response Body**:
```json
{
  "gridCols": 5,
  "gridRows": 6,
  "totalLockers": 30,
  "numberingDirection": "horizontal"
}
```

---

## 💡 백엔드 엔지니어를 위한 추가 안내 (Notes for Backend Engineers)
1. **Consistency**: When updating a locker's `paymentStatus` and `productId`, please mirror this transaction logic to the Member's Payment Log DB to ensure financial data consistency.
2. **Auto-Expiration**: A cron job/scheduler should be implemented to scan `expireDate`. If `expireDate` < `today`, update the locker `status` to `EXPIRED` and append a `SYSTEM` type log to the `LockerHistory`.
3. **Transaction**: Inserting a history log and updating a locker's status must be handled within a single DB Transaction.

---

## 💎 Prisma Schema (For Backend Implementation)

백엔드팀에서 사용 중이신 **Prisma ORM**을 바로 적용할 수 있도록 변환한 스키마(Schema)입니다. 아래의 `schema.prisma` 코드를 백엔드 프로젝트에 추가하여 데이터베이스를 손쉽게 구성하실 수 있습니다.

```prisma
// schema.prisma

// 사물함 (Locker) 메인 테이블
model Locker {
  id             String          @id // 예: "A-01"
  status         LockerStatus    @default(AVAILABLE) // 초기 상태
  
  // 사용자 정보 (회원 테이블과 연결 가능)
  memberId       String?         // 실제 User 테이블이 있다면 연동 (@relation)
  memberName     String?
  
  // 이용 기간
  startDate      DateTime?
  expireDate     DateTime?
  
  // 결제 정보
  productId      Int?            // Product 테이블 ID와 연동 가능
  paymentStatus  PaymentStatus?
  paymentMethod  PaymentMethod?
  
  // 비고
  memo           String?         @db.VarChar(100) // 100자 글자 제한
  
  // 관계 (1:N) - 하나의 사물함은 여러 히스토리를 가짐
  histories      LockerHistory[]
  
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

// 사물함 이력 (History) 테이블
model LockerHistory {
  id        Int      @id @default(autoincrement())
  
  locker    Locker   @relation(fields: [lockerId], references: [id], onDelete: Cascade)
  lockerId  String   // 연결된 사물함 ID
  
  date      DateTime @default(now()) // 이벤트 날짜
  type      HistoryType // 이력 타입
  desc      String      // 비고/상세 내용
}

// 사물함 구역/배열 설정 (ZoneSetting) 테이블
model ZoneSetting {
  zoneId             String    @id // 예: "ZONE_A"
  gridCols           Int       // 열(가로)
  gridRows           Int       // 행(세로)
  totalLockers       Int       // 총 갯수
  numberingDirection Direction @default(HORIZONTAL) // 번호 부여 방향
}

// --- Enums 정리 --- 

// 사물함 상태 값
enum LockerStatus {
  AVAILABLE   // 사용 가능
  IN_USE      // 이용 중
  EXPIRED     // 만료됨
  MAINTENANCE // 수리/점검 중
}

// 결제 진행 상태
enum PaymentStatus {
  PAID        // 결제 완료
  UNPAID      // 미수(미결제)
}

// 결제 수단 종류
enum PaymentMethod {
  CARD        // 카드
  TRANSFER    // 계좌이체
  CASH        // 현금
}

// 이력(타임라인) 종류
enum HistoryType {
  ASSIGN      // 배정 처리
  MAINTENANCE // 고장/수리 접수
  SYSTEM      // 시스템 자동 기록 (만료 등)
  MEMO        // 관리자 메모 추가
}

// 번호 부여 방향
enum Direction {
  HORIZONTAL  // 왼->오 가로 방향
  VERTICAL    // 위->아래 세로 방향
}
```

---

## 🛡️ 핵심 비즈니스 로직 및 예외 처리 (Business Logic & Exception Handling)

백엔드 개발자분들이 API를 구현할 때 반드시 체크하고 방어해야 하는 핵심 로직과 예외 상황(Error)들에 대한 규격입니다.

### 1. 사물함 상태 생명주기 (State Machine)
사물함의 `status`(상태)는 다음과 같은 흐름으로만 변경되어야 합니다. 예상치 못한 상태 변화는 백엔드에서 차단해야 합니다.
- **`AVAILABLE`(가능) ➜ `IN_USE`(이용중)**: 신규 회원 배정 시
- **`AVAILABLE`(가능) ➜ `MAINTENANCE`(고장)**: 빈 사물함 파손 발견 시
- **`IN_USE`(이용중) ➜ `EXPIRED`(만료)**: 이용 기간(`expireDate`)이 지났을 때 **(크론잡 자동 스케줄링 강력 권장)**
- **`IN_USE`, `EXPIRED` ➜ `AVAILABLE`(초기화)**: 회원이 이용을 마치고 빈 사물함으로 전환할 때 (이때 member, date 등 정보 Null 초기화 필요)

### 2. 주요 에러 코드 및 예외 상황 (Error Codes & Validation)
- **HTTP 409 Conflict (상태 충돌)**
  - 이미 `IN_USE` 상태인 사물함에 덮어쓰기 형태로 새로운 회원을 등록(배정)하려고 들어온 요청은 차단해야 합니다.
  - *Response*: `{"success": false, "message": "이미 사용 중인 사물함입니다."}`
- **HTTP 400 Bad Request (잘못된 요청/유효성 검사 실패)**
  - `status`를 `IN_USE`로 변경(PUT)하는데, `memberId`나 `startDate` 등의 필수 정보가 누락된 경우.
  - `memo`의 길이가 데이터베이스 제한 값인 100자를 초과한 경우.
  - 존재하지 않는 상품(`productId`: 999 등)으로 등록하려는 경우.

### 3. 목록 조회: 필터링과 페이징 (Search & Pagination)
현재 프론트엔드에서는 30개 단위 페이지네이션 및 필터링 기능이 작동합니다. 백엔드의 `GET /api/v1/lockers` API는 클라이언트의 요구에 맞춰 아래의 **쿼리 파라미터(Query Parameters)**를 지원해야 합니다.
- **필터 (상태별 탭)**: `GET /api/v1/lockers?status=IN_USE` 
- **검색 (회원 이름으로 사물함 찾기)**: `GET /api/v1/lockers?keyword=박서연`
- **페이징**: `GET /api/v1/lockers?page=1&size=30` (프론트엔드의 `gridRows * gridCols` 설정에 따라 size 값은 유동적으로 요청됩니다.)

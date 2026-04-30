# Staff Payroll System Specification

## 1. Overview
본 문서는 피트니스 센터 직원의 급여(Payroll)를 계산하고 명세서를 출력하기 위한 핵심 알고리즘, 데이터 모델링 및 명세서 구조를 정의합니다.
강사(트레이너), FC(안내/영업), 관리자 등 다양한 직군의 급여 체계(기본급, 수업 수수료, 매출 수수료, 공제 등)를 포괄합니다.

## 2. Core Data Modeling (핵심 데이터 모델)

급여 정산을 위해 필요한 주요 엔티티 모델링은 다음과 같습니다.

### 2.1 Staff (직원 정보)
직원의 기본 정보 및 계약된 급여 조건을 정의합니다.
- `id`: 직원의 고유 식별자 (UUID)
- `name`: 이름
- `role`: 직군 (TRAINER, FC, MANAGER)
- `employmentType`: 고용 형태 (FULL_TIME, PART_TIME, FREELANCER)
- `baseSalary`: 기본급 (월급 또는 시급)
- `classCommissionRate`: 수업 수수료율 또는 건당 수수료 (예: 차등 지급일 경우 Tier ID 참조)
- `salesCommissionRate`: 매출 수수료율 (예: 5%, 10%)
- `taxType`: 과세 유형 (REGULAR: 4대보험, FREELANCER: 3.3% 사업소득)

### 2.2 Attendance (근태 기록)
급여 산정 월의 근태 내역입니다. (기본급 차감 및 수당 지급에 활용)
- `staffId`: 직원 식별자
- `month`: 귀속 월 (YYYY-MM)
- `totalWorkHours`: 총 근무 시간
- `overtimeHours`: 연장 근무 시간
- `tardinessCount`: 지각 횟수
- `absenceCount`: 결근 횟수

### 2.3 Performance (실적 기록)
수업 진행 및 매출 발생 내역입니다.
- `staffId`: 직원 식별자
- `month`: 귀속 월
- `totalSalesAmount`: 당월 총 발생 매출액
- `completedClasses`: 당월 총 진행 수업 횟수 (또는 종류별 수업 횟수 Array)

### 2.4 PayrollRecord (급여 명세 레코드)
최종 계산된 월별 급여 정산 결과입니다.
- `id`: 급여 명세 고유 식별자
- `staffId`: 직원 식별자
- `month`: 귀속 월
- `grossPay`: 총 지급액
- `totalDeductions`: 총 공제액
- `netPay`: 실 수령액
- `paymentDate`: 지급 일자
- `status`: 상태 (PENDING, APPROVED, PAID)

---

## 3. Payroll Algorithm (급여 산정 알고리즘)

급여는 `[총 지급액] - [총 공제액] = [실 수령액]` 공식을 바탕으로 계산됩니다.

### 3.1 총 지급액 (Gross Pay) 계산
1. **기본급 (Base Pay)**
   - 정규직: `Staff.baseSalary`
   - 파트타임: `Attendance.totalWorkHours * Staff.baseSalary(시급)`
2. **연장 근로 수당 (Overtime Pay) - 정규직 기준**
   - `Attendance.overtimeHours * (시급 * 1.5)`
3. **수업 수수료 (Class Commission)**
   - 건당 정액제: `Performance.completedClasses * 건당 수수료`
   - 구간별 차등제 (Tiered): 예) 1~50회: 3만원, 51~100회: 3.5만원 비율로 누적 계산
4. **매출 수수료 (Sales Commission)**
   - `Performance.totalSalesAmount * Staff.salesCommissionRate`
5. **기타 수당 (Additional Allowances)**
   - 식대, 직책 수당, 교통비 등 고정 수당 합산
- **Gross Pay = 기본급 + 연장수당 + 수업수수료 + 매출수수료 + 기타수당**

### 3.2 총 공제액 (Deductions) 계산
직원의 과세 유형(`taxType`)에 따라 분기됩니다.

**A. 3.3% 프리랜서 (FREELANCER)**
- **소득세 + 지방소득세**: `Gross Pay * 0.033`

**B. 4대보험 정규직 (REGULAR)**
세전 급여(비과세 제외)를 기준으로 4대보험 및 소득세를 계산합니다.
1. **국민연금**: `과세 급여액 * 4.5%` (상한액 적용)
2. **건강보험**: `과세 급여액 * 3.545%`
3. **장기요양보험**: `건강보험료 * 12.95%`
4. **고용보험**: `과세 급여액 * 0.9%`
5. **근로소득세**: 국세청 근로소득 간이세액표에 따른 산출 (부양가족 수 고려)
6. **지방소득세**: `근로소득세 * 10%`

**C. 근태 공제 (지각/결근 등)**
- 사업장 내규에 따라 지각/결근 횟수를 금액으로 환산하여 공제 (기본급 차감)
- **Total Deductions = (세금 및 4대보험) + 근태 공제금**

### 3.3 실 수령액 (Net Pay)
- **Net Pay = Gross Pay - Total Deductions**

---

## 4. Pay Stub Output Structure (급여 명세서 출력 구조)

최종적으로 사용자(직원) 및 관리자에게 보여지는 급여 명세서의 UI/출력 데이터 구조입니다.

```json
{
  "payPeriod": "2026-04",
  "paymentDate": "2026-05-10",
  "staffInfo": {
    "name": "강민준",
    "role": "시니어 트레이너",
    "employmentType": "프리랜서(3.3%)"
  },
  "summary": {
    "grossPay": 4500000,
    "totalDeductions": 148500,
    "netPay": 4351500
  },
  "earningsDetail": [
    { "item": "기본급", "amount": 1000000, "note": "고정 기본급" },
    { "item": "수업 수수료", "amount": 2500000, "note": "50회 완료 (건당 5만)" },
    { "item": "매출 수수료", "amount": 1000000, "note": "매출 1,000만원의 10%" }
  ],
  "deductionsDetail": [
    { "item": "사업소득세(3%)", "amount": 135000 },
    { "item": "지방소득세(0.3%)", "amount": 13500 },
    { "item": "지각/결근 공제", "amount": 0, "note": "지각 0회, 결근 0회" }
  ],
  "performanceSummary": {
    "totalClasses": 50,
    "totalSales": 10000000,
    "workHours": 160
  }
}
```

### 4.1 UI 표현 방식 제안
- **상단 요약 (Hero Unit)**: 가장 중요한 **실 수령액(Net Pay)**을 크고 명확하게 배치하고, 지급일과 대상 월을 표기합니다.
- **2단 구성 (Two-Column Layout)**: 좌측에는 **지급 내역(Earnings)**, 우측 또는 하단에는 **공제 내역(Deductions)**을 배치하여 비교하기 쉽게 만듭니다.
- **실적 연동 시각화**: 수업 횟수, 발생 매출 내역이 급여에 어떻게 기여했는지 알 수 있는 작은 프로그레스 바 혹은 차트를 하단에 첨부하여 동기를 부여합니다.
- **다운로드 기능**: 이 구조를 바탕으로 PDF 형식의 명세서를 출력 및 다운로드할 수 있는 버튼을 제공합니다.

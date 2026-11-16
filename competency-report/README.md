# Competency Assessment Report Template

Template สำหรับ export รายงานผลการประเมินสมรรถนะ (PDF แนวนอน 16:9) จาก payload JSON ชุดเดียว
ใช้ได้ 5 ระดับ: **องค์กร · หน่วยงาน (Function) · แผนก (Department) · แผนกย่อย (Sub-department) · รายบุคคล**

ตัวอย่างผลลัพธ์อยู่ใน `output/competency-report-*.pdf`

---

## 1. สิ่งที่ได้มาจากรายงานต้นแบบ (Gartner Top 10 Strategic Technology Trends 2027)

| เทคนิคในรายงานต้นแบบ | นำมาใช้ใน Competency Report |
|---|---|
| **เปิดด้วยข้อสรุป** — คำนำของผู้บริหารที่บอก “ความหมาย” ก่อนตัวเลข และสรุปเป็น 3 เสาหลัก | หน้า 2 พาดหัวที่สร้างจากข้อมูล (จุดแข็ง vs ช่องว่าง) + การ์ด 3 กลุ่มสมรรถนะ พร้อม KPI ย่อ และผู้ลงนาม |
| **แผนที่ภาพรวมหน้าเดียว** — 10 trends วางในรูปพัด แบ่งวงตามช่วงเวลา Now/Near/Future | หน้า 3 “ภูมิทัศน์สมรรถนะ” 12 สมรรถนะ วางในพัด 3 กลุ่ม แบ่งวงตาม **ช่องว่างจากมาตรฐาน** (จุดแข็ง / เฝ้าระวัง / เร่งด่วน) |
| **หน้าคั่นบท (section divider)** ทำให้ผู้อ่านรู้ว่ากำลังเข้าเรื่องใหม่ | หน้าคั่นของแต่ละกลุ่มสมรรถนะ พร้อมบทสรุปอัตโนมัติ 1 ย่อหน้า |
| **โครง 2 หน้า/หัวข้อ**: หน้า “What is it? / Why trending?” + หน้า “Delivering results” | หน้า **วัดอะไร? / ทำไมจึงสำคัญ?** + หน้า **แผนพัฒนาเพื่อปิดช่องว่าง** ต่อกลุ่ม |
| **Hero number + progress bar** (“What’s next? 25%”) แล้วตามด้วยประโยคอธิบาย | % พนักงานที่ถึงมาตรฐาน (หรือ x/4 สำหรับรายบุคคล) + แถบความคืบหน้าเทียบเป้า 80% + ประโยคตีความ |
| **ตาราง Steps × Expected outcome × Action** | ตารางแผนปฏิบัติการเรียงตามความเร่งด่วน + รูปแบบการเรียนรู้ 70-20-10 |
| **Key players** (CIO / IT partners / Business partners) | ผู้มีบทบาท 3 ฝ่ายที่ **เปลี่ยนตามระดับรายงาน** (เช่น CEO/ผู้บริหารสายงาน/HR หรือ ตัวท่าน/หัวหน้า/HR) |
| **ตัวนำทาง “you are here”** — พัดจิ๋ว 3 อันมุมบน | พัดจิ๋วไฮไลต์กลุ่มที่กำลังอ่าน |
| Source line ใต้ทุก visual, running header/footer, เลขหน้า | “ภาพที่ n”, ที่มา + n ใต้ทุกกราฟ, ชั้นความลับในส่วนท้าย |

เพิ่มความเป็น **Academic**: หมายเลขภาพ, ขนาดตัวอย่าง (n), ช่วงความเชื่อมั่น 95%, Cronbach’s α, นิยามสูตร, เกณฑ์ปกปิดข้อมูล และเอกสารอ้างอิงแบบ APA ในหน้า Methodology

## 2. โครงเรื่อง (Storytelling arc) — 16 หน้า

| # | หน้า | คำถามที่หน้าตอบ | องค์กร / หน่วยงาน / แผนก / แผนกย่อย | รายบุคคล |
|---|---|---|---|---|
| 1 | ปก | นี่คือรายงานของใคร ช่วงไหน | ✓ | ✓ |
| 2 | คำนำ & ข้อสรุปหลัก | เรื่องสำคัญที่สุดคืออะไร | พาดหัวจากข้อมูล + 3 กลุ่ม | เหมือนกัน (ภาษาเชิงพัฒนาตนเอง) |
| 3 | ภูมิทัศน์สมรรถนะ | ภาพรวมทั้งหมดในหน้าเดียว | แผนภาพพัด | แผนภาพพัด |
| 4 | At a glance | อยู่ตรงไหนเทียบมาตรฐาน | KPI 4 ตัว + กราฟช่องว่าง + 3 insights | KPI ส่วนบุคคล + กราฟช่องว่าง |
| 5 | Drill-down / 360° | ช่องว่างกระจุกตัวที่ใด | **Heatmap หน่วยย่อย × สมรรถนะ** + 3 callouts | **Radar + Self vs Others** (จุดบอด/จุดแข็งที่ซ่อนอยู่) |
| 6–14 | ต่อกลุ่ม ×3: คั่นบท → รายละเอียด → แผนพัฒนา | อะไร ทำไม ทำอย่างไร ใครทำ | Dumbbell (คะแนน vs มาตรฐาน, CI 95%, รอบก่อน) + การกระจายระดับ | Dumbbell + ตารางคะแนนแยกผู้ประเมิน + ค่าเฉลี่ยทีม |
| 15 | Methodology | เชื่อถือได้แค่ไหน | สเกล, สูตร, คุณภาพข้อมูล, อ้างอิง | สเกล, สูตร, จำนวนผู้ประเมิน |
| 16 | ก้าวต่อไป | ต้องทำอะไรต่อ เมื่อไร | Timeline 4 ช่วง | Timeline IDP |

การ drill-down ของ heatmap หน้า 5 ตามระดับ: องค์กร → รายสายงาน, หน่วยงาน → รายแผนก, แผนก → รายแผนกย่อย, แผนกย่อย → รายบุคคลในทีม (แสดงเฉพาะหัวหน้าโดยตรง/HRBP)

## 3. หลักการ Data Visualization ที่ใช้

- **สีตามหน้าที่ ไม่ใช่ความสวย**: น้ำเงิน = คะแนน/สูงกว่ามาตรฐาน, แดง = ต่ำกว่ามาตรฐาน, เทากลาง = ใกล้มาตรฐาน (diverging scale), สีส้ม = ตนเอง/ลำดับ
- **สถานะไม่ใช้สีอย่างเดียว**: จุดแข็ง ✓ วงกลมเขียว, เฝ้าระวัง ▲ เหลือง, เร่งด่วน ◆ แดง พร้อมข้อความ (อ่านได้ทั้งตาบอดสีและพิมพ์ขาวดำ)
- **แกนเดียว ไม่มี dual-axis**, เส้นกริดบาง, label เฉพาะจุดสำคัญ
- **Hero number** ใช้เมื่อเรื่องคือ “ตัวเลขเดียว” แทนกราฟแท่งเดียว
- ระดับความสามารถ 1–5 ใช้ ordinal ramp น้ำเงินอ่อน→เข้ม
- ทุก mark มี tooltip (`<title>`) เมื่อเปิดใน browser

## 4. Payload schema (สิ่งที่ backend ต้องส่งให้ template)

```jsonc
{
  "meta": {
    "level": "company | function | department | subdepartment | individual",
    "entityName": "สายงานเทคโนโลยี", "entityNameEn": "Technology Function",
    "path": ["บริษัท ...", "..."],               // breadcrumb ของหน่วยแม่
    "organization": "บริษัท ตัวอย่าง จำกัด (มหาชน)",
    "cycle": "การประเมินสมรรถนะประจำปี 2569", "cycleEn": "Annual Competency Assessment 2026",
    "period": "ต.ค. – พ.ย. 2569", "reportDate": "16 พฤศจิกายน 2569",
    "confidentiality": "ลับ – ใช้ภายใน", "method": "360° (...)"
  },
  "foreword": { "signer": { "name": "...", "title": "..." } },
  "participation": { "invited": 200, "completed": 189, "reliability": 0.95 },
  "scale": [{ "level": 1, "label": "เริ่มต้น", "labelEn": "Foundational", "desc": "..." }],
  "clusters": [{ "id": "core", "name": "...", "nameEn": "...", "tagline": "...", "whatItMeasures": "...", "whyItMatters": "..." }],
  "competencies": [{
    "id": "C1", "no": 1, "cluster": "core", "name": "...", "nameEn": "...", "definition": "...",
    "score": 2.96,        // ค่าเฉลี่ยคะแนนถ่วงน้ำหนัก
    "required": 2.51,     // ค่าเฉลี่ยระดับที่ตำแหน่งกำหนด
    "sd": 0.52, "ci95": 0.07, "n": 189,
    "pctMeet": 0.93,      // สัดส่วนคนที่ score ≥ required − 0.25
    "dist": [0.01, 0.29, 0.43, 0.24, 0.03],  // สัดส่วนระดับ 1–5
    "prev": 3.00,         // คะแนนรอบก่อน (optional)
    "development": { "outcome": "...", "action": "...", "ratio": "70|20|10" },
    // เฉพาะ individual:
    "raters": { "self": 3.5, "manager": 3.2, "peer": 3.6, "subordinate": 3.5 }, "teamAvg": 2.65
  }],
  "breakdown": { "label": "รายแผนก", "rows": [{ "name": "...", "n": 22, "scores": { "C1": { "score": 3.0, "required": 2.6 } } }] },
  "keyPlayers": [{ "role": "...", "icon": "exec|lead|hr", "items": [["หัวข้อ", "รายละเอียด"]] }],
  "person": { "name": "...", "jobLevel": "...", "position": "...", "raterCounts": { "self": 1, "manager": 1, "peer": 4, "subordinate": 5 } },

  // optional overrides
  "thresholds": { "watch": 0, "priority": -0.25 },
  "privacy": { "minN": 3 },
  "narrative": { "headline": "...", "lede": "...", "insights": ["...", "...", "..."], "clusters": { "core": "..." }, "heatmap": { "hotspot": "..." } },
  "nextSteps": [["ภายใน 30 วัน", "หัวข้อ", "รายละเอียด"]]
}
```

ข้อความเล่าเรื่องทั้งหมด (พาดหัว, insights, callouts, บทสรุปหน้าคั่น) **สร้างอัตโนมัติจากข้อมูล** และแก้ทับได้ผ่าน `narrative` เช่นให้ HR เขียนพาดหัวเองก่อนส่งผู้บริหาร

`data/build-samples.mjs` คือตัวอย่างตรรกะการ aggregate (ค่าเฉลี่ย, SD, CI 95%, pctMeet, distribution, Cronbach’s α) จากคะแนนรายคน เพื่อใช้อ้างอิงตอนเขียน backend

## 5. การใช้งาน

```bash
cd competency-report
node data/build-samples.mjs          # สร้าง payload ตัวอย่าง 5 ระดับ
node export.mjs                      # export ทุกระดับ → output/*.pdf + output/preview/*.png
node export.mjs individual           # export ระดับเดียว
node export.mjs path/to/payload.json # export จาก payload จริง
```

ต้องมี Node 18+ และ Playwright (Chromium) · ฟอนต์ IBM Plex Sans Thai โหลดจาก Google Fonts (ถ้า server ไม่มีอินเทอร์เน็ต ให้ self-host ฟอนต์แล้วแก้ `@import` ใน `template/report.css`)

### เชื่อมเข้าระบบ
1. Backend สร้าง payload ตาม §4 สำหรับหน่วย/บุคคลที่ผู้ใช้เลือก
2. เรียก export service (Playwright/Puppeteer) แบบเดียวกับ `export.mjs`: inject `window.__REPORT_DATA__` → เปิด `template/report.html` → `page.pdf({ width: '1280px', height: '720px', printBackground: true })`
3. หรือแสดงในเว็บโดยตรง: `template/report.html?data=/api/reports/<id>.json` แล้วให้ผู้ใช้กด Print → Save as PDF

### ปรับแต่ง
- สี/ฟอนต์แบรนด์: ตัวแปร `:root` ใน `template/report.css`
- เกณฑ์สถานะ: `thresholds` ใน payload
- จำนวนกลุ่ม/สมรรถนะ: กำหนดใน `clusters` และ `competencies` (ออกแบบรองรับ 3 กลุ่ม × 3–5 สมรรถนะต่อกลุ่ม ได้ดีที่สุด)
- ทีมเกิน 9 คนในหน้า heatmap แผนกย่อย: ระบบลดความสูงแถวและซ่อน callouts อัตโนมัติ (รองรับได้ราว 18 แถว)

## 6. โครงสร้างไฟล์

```
competency-report/
├── template/report.html   # shell โหลดข้อมูลและเรียก renderReport()
├── template/report.css    # design system + layout ทุกหน้า
├── template/report.js     # model, narrative engine, SVG charts, page builders
├── data/build-samples.mjs # สร้างข้อมูลจำลองและ aggregate ตัวอย่าง
├── data/sample-*.json     # payload ตัวอย่าง 5 ระดับ
├── export.mjs             # HTML → PDF/PNG
└── output/                # PDF ตัวอย่าง
```

> ข้อมูลทั้งหมดในตัวอย่างเป็นข้อมูลจำลอง ชื่อบุคคลและองค์กรไม่ใช่ข้อมูลจริง

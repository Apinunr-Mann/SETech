# Volt Consumer Campaign: System Architecture (CRM / Loyalty บน LINE OA)

สไลด์ระบบสำหรับ proposal Volt (ส่ง 30 ต.ค. 2026) ทำจาก HTML แล้ว render เป็น PNG ขนาด 1760×790 @2x เพื่อวางใต้หัวสไลด์ใน Canva

| ไฟล์ | เนื้อหา |
|---|---|
| `01-pain-solution` | Pain point 12 ข้อ (V2) → ระบบแก้อย่างไร |
| `02-system-flow` | Flow Buy → Charge → Verify → Record → Burn → Learn (V2) |
| `00-concept` | ปก: Scan. Collect. Unlock Experience. |
| `03-proof-of-purchase` | ยืนยันการซื้อ B2C 3 ทาง (รหัสใต้ห่วง, ใบเสร็จ, ออนไลน์) + Shop QR เป็น B2B เสริม |
| `04-mockup` | 2 Design Options (App Style / Bento Hero) จาก Prototype จริง |
| `05-architecture` | System architecture แบบ tier + integrations + hosting (อัปเดตตาม Handoff v1.1) |
| `06-points-budget` | กติกาแต้ม · งบ 5 ถัง · Cost-per-Can Governor |
| `07-ai-governance` | AI 3 ระดับ · สิ่งที่ห้ามทำ · Kill switch |
| `08-data-api-events` | Data model · API หลัก · Events |
| `09-timeline-nfr` | Timeline · เป้าหมายประสิทธิภาพ · Security |
| `10-scope-options` | Scope: B2C หลัก + B2B Retailer Add-on (Optional) + 2 Design Options |

ธีมสไลด์ใช้ Volt CI (Option 1 palette: deep navy · electric blue · Volt yellow) ฟอนต์ Bai Jamjuree / Barlow Condensed · กล่องเส้นประม่วง = B2B เสริม

Render ใหม่: `node render.mjs` หรือ `node render.mjs 03` (เลือกบางไฟล์)

## สิ่งที่อ่านจากไวท์บอร์ด

- **ช่องทาง:** Online (Shopee, Lazada, Web, อื่น ๆ) / Offline (ใบเสร็จ, รหัส, ส่งรูป, อื่น ๆ) → **In** (LINE Rich Menu) → **Check** (AI + คน) → **DB** → **Display** (Real-time, RFM, อื่น ๆ)
- **Management** มี AI คอยดูยอดการแลกเทียบกับแผน → **รางวัล** → **Community** (+ Social)
- **Gamification:** Get point จากการซื้อและจากการทำกิจกรรม → Tier **LF1–LF5**
- **หน้ารางวัล:** Pin (เฉพาะ Tier เช่น LF2) / Top Redeem / ทั้งหมด · ปุ่ม "แลก" และ "แลก + เติมเงิน" · AI Noti แบบ Push / Pull
- **Burn Point:** Lucky Draw, ประมูล, Flash Deal · **x2** แต้มตามช่วงเวลา / โปรฯ

## ข้อเสนอหลัก: Scenario B+

เปิดปลาย ม.ค. 2027 ด้วยการยืนยันการซื้อ 3 ทาง ได้แก่ ใบเสร็จ, Shop QR Scan และออนไลน์ ร้านโชห่วยใช้กลไกเดียวกับที่เสนอ ททท. คือร้านสแกน QR ของลูกค้าแล้วระบบให้แต้มตามการซื้อจริง วิธีนี้ทำให้กระป๋อง 190 ml ร่วมได้ตั้งแต่วันแรกโดยไม่ต้องรอรหัสใต้ห่วงที่มี lead time 60+ วัน ส่วนรหัสใต้ห่วงเสียบเพิ่มทีหลังได้ เพราะทุกทางเข้า Point Ledger เดียวกัน

## คำถามที่ต้องเช็กกับลูกค้า

1. มียอดส่งของ (sell-in) รายร้านโชห่วยจากดิสทริบิวเตอร์ไหม ถ้ามีจะใช้ตั้งโควตาแต้มต่อร้าน ถ้าไม่มีจะเริ่มที่โควตาคงที่แล้วขยายตาม trust score
2. ใครเป็นคนรับสมัครและยืนยันร้านโชห่วย (เซลส์ Volt หรือยี่ปั๊ว) และให้อะไรเป็นแรงจูงใจร้าน
3. 7-Eleven จะเปิด API หรือส่งไฟล์ยืนยันใบเสร็จได้ไหม (เฟส 2)
4. "LF" บนไวท์บอร์ดจะใช้ชื่อ Tier อะไรจริง และกำหนดเกณฑ์ขึ้น Tier อย่างไร
5. "แลก + เติมเงิน" ต้องให้ Volt เปิด merchant account รับ PromptPay เอง หรือให้เราดูแล

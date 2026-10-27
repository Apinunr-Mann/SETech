/* Source: TPS Handoff volt-data.js (28 ต.ค. 2569), copied as-is. Numbers are assumptions until Procurement confirms. */
// Volt Charge Club: shared design data (TPS, 28 ต.ค. 2569)
// ตัวเลขรางวัล/ราคาเป็นสมมติฐานตั้งต้น รอฝ่ายจัดซื้อขอราคาจริงผ่าน aggregator
// หลักราคาแต้ม: 1 แต้ม = ต้นทุน 0.10 บาท · 190 ml = 10 แต้ม · 310 ml = 20 แต้ม · ใบเสร็จ 7-Eleven ที่มี 310 ml +5 แต้ม/กระป๋อง
// Merch ลดราคาแต้ม 50% (ส่วนต่างเป็นงบ Brand heat ที่อยู่ในก้อน Merch แล้ว)

const VOLT = {
  pointValue: 0.10,
  earn: [
    { act: "190 ml (ร้านโชห่วยสแกน / รหัสใต้ห่วง)", pts: 10 },
    { act: "310 ml (รหัส / ใบเสร็จ MT)", pts: 20 },
    { act: "โบนัสใบเสร็จ 7-Eleven ที่มี 310 ml", pts: 5, note: "ต่อกระป๋อง" },
    { act: "Welcome หลังส่งกระป๋องแรกผ่าน", pts: 20, note: "ครั้งเดียว" },
    { act: "Charge Profile ครบ 10 ข้อ", pts: 30, note: "ครั้งเดียว · เข้ากระเป๋าหลังส่งกระป๋องแรก" },
    { act: "Weekly Quiz 3 ข้อ", pts: 5, note: "ต่อสัปดาห์ · ต้องชาร์จใน 14 วันล่าสุด ไม่งั้นได้สิทธิ์ลุ้นแทน" },
    { act: "ครบ 3 รสใน 30 วัน", pts: 10, note: "ต่อเดือน" }
  ],

  // ข้อ 3: กลุ่มไลฟ์สไตล์ (เลือกได้ 3 กลุ่มตอนสมัคร, ปรับตามพฤติกรรมหลัง 2 สัปดาห์)
  lifestyles: [
    { id: "music",   th: "ดนตรี & คอนเสิร์ต",   en: "Music" },
    { id: "sport",   th: "กีฬา & ฟิตเนส",       en: "Sport" },
    { id: "game",    th: "เกม & อีสปอร์ต",      en: "Gaming" },
    { id: "movie",   th: "หนัง & ซีรีส์",        en: "Movies" },
    { id: "food",    th: "กิน & ทำอาหาร",       en: "Food" },
    { id: "biz",     th: "ธุรกิจ & หาเงินเสริม", en: "Hustle" },
    { id: "photo",   th: "ถ่ายรูป & ครีเอเตอร์", en: "Creator" },
    { id: "money",   th: "การเงิน & ออมเงิน",   en: "Money" },
    { id: "travel",  th: "เที่ยว & เดินทาง",     en: "Travel" },
    { id: "fashion", th: "แฟชั่น & บิวตี้",      en: "Style" },
    { id: "anime",   th: "อนิเมะ & การ์ตูน",     en: "Anime" },
    { id: "study",   th: "เรียน & พัฒนาตัวเอง",  en: "Study" }
  ],

  // ข้อ 9: งบรางวัล 4,750,000 รวมค่าจัดส่ง (ปรับจาก 4.5M เมื่อ 28 ต.ค. 2569) = Digital 65% / Merch+TMD 20% / รางวัลใหญ่ 15%
  budget: {
    total: 4750000,
    digital: 3087500,   // A1 แลกด้วยแต้ม 2,000,000 + A2 Instant Win รายวัน 645,000 + A3 รายสัปดาห์ 442,500
    merch: 950000,      // รวมค่าส่ง 60 บาท/ชิ้น
    grand: 712500,      // รวมสำรองภาษี/ใบอนุญาต/ส่งของ 52,500
    iwReserve: 15000,   // สำรอง Instant Win
    weeklyReserve: 13500 // สำรองรายสัปดาห์
  },

  // A1 แคตตาล็อกแลกด้วยแต้ม (2,000,000) · tier: T1 Spark ≤100 แต้ม, T2 Charge 101–500, T3 Boost 501–2,000
  catalog: [
    { name: "คูปอง Volt 10฿ ที่ 7-Eleven", g: "core", cost: 10, qty: 40000, pts: 100, tier: "T1" },
    { name: "ส่วนลด 3฿ Volt 310 ml ที่ 7-Eleven", g: "core", cost: 3, qty: 30000, pts: 30, tier: "T1" },
    { name: "กระป๋องฟรีที่ร้านโชห่วยใกล้บ้าน (+2฿ จ่ายที่ร้าน)", g: "core", cost: 6, qty: 20000, pts: 60, tier: "T1" },
    { name: "TrueMoney 20฿", g: "money", cost: 20, qty: 5000, pts: 200, tier: "T2" },
    { name: "บัตรเติมเงินมือถือ 50฿", g: "core", cost: 50, qty: 1000, pts: 500, tier: "T2" },
    { name: "บัตร Garena 50฿ (ROV / Free Fire)", g: "game", cost: 50, qty: 4200, pts: 500, tier: "T2" },
    { name: "บัตร Google Play 50฿ (Minecraft / Roblox)", g: "game", cost: 50, qty: 4200, pts: 500, tier: "T2" },
    { name: "Spotify Premium 1 เดือน", g: "music", cost: 139, qty: 500, pts: 1390, tier: "T3" },
    { name: "ตั๋วหนัง Major / SF 2D", g: "movie", cost: 200, qty: 300, pts: 2000, tier: "T3" },
    { name: "WeTV / Viu VIP 1 เดือน", g: "movie", cost: 119, qty: 300, pts: 1190, tier: "T3" },
    { name: "LINE MAN / GrabFood 50฿", g: "food", cost: 50, qty: 2000, pts: 500, tier: "T2" },
    { name: "Café Amazon 50฿", g: "food", cost: 50, qty: 1500, pts: 500, tier: "T2" },
    { name: "Decathlon 100฿", g: "sport", cost: 100, qty: 500, pts: 1000, tier: "T3" },
    { name: "คอร์สออนไลน์ 100฿", g: "biz", cost: 100, qty: 400, pts: 1000, tier: "T3" },
    { name: "CapCut Pro 1 เดือน", g: "photo", cost: 199, qty: 200, pts: 1990, tier: "T3" },
    { name: "TrueMoney 50฿", g: "money", cost: 50, qty: 1000, pts: 500, tier: "T2" },
    { name: "Grab Ride 50฿", g: "travel", cost: 50, qty: 1000, pts: 500, tier: "T2" },
    { name: "Shopee 50฿", g: "fashion", cost: 50, qty: 3000, pts: 500, tier: "T2" },
    { name: "Watsons 100฿", g: "fashion", cost: 100, qty: 300, pts: 1000, tier: "T3" },
    { name: "LINE Manga / Webtoon coin 50฿", g: "anime", cost: 50, qty: 600, pts: 500, tier: "T2" },
    { name: "e-book 50฿", g: "study", cost: 50, qty: 800, pts: 500, tier: "T2" }
  ],

  // T0 สิทธิ์พาร์ทเนอร์ 0 แต้ม (พาร์ทเนอร์ออกเงินเอง ไม่ใช้งบ) · ตัวอย่างประเภท รอเจรจา
  partnerPerks: [
    { name: "ส่วนลดสมัครงานวิ่ง", g: "sport" },
    { name: "ส่วนลดบัตรคอนเสิร์ต/เทศกาลดนตรี", g: "music" },
    { name: "ส่วนลดคอร์สถ่ายภาพ/ตัดต่อ", g: "photo" },
    { name: "ส่วนลดที่พัก/ทริป", g: "travel" },
    { name: "ทดลองใช้แอปการเงิน/ออมเงิน", g: "money" }
  ],

  // A2 Instant Win รายวัน: ทุกการชาร์จที่ผ่าน = 1 โอกาส · 90 วัน × 7,000 + สำรอง 15,000 = 645,000
  instantWinDaily: [
    { name: "TrueMoney 20฿", qty: 150, cost: 20 },
    { name: "Garena / Google Play 50฿", qty: 60, cost: 50 },
    { name: "Shopee 100฿", qty: 10, cost: 100 }
  ],

  // A3 รายสัปดาห์: 13 สัปดาห์ × 33,000 + สำรอง 13,500 = 442,500 · ธีมรางวัลหมุนตามกลุ่มไลฟ์สไตล์
  weekly: [
    { name: "Weekly Lifestyle Draw: บัตร 1,000฿ ตามธีมสัปดาห์", qty: 5, cost: 1000 },
    { name: "Weekly Lifestyle Draw: บัตร 100฿", qty: 110, cost: 100 },
    { name: "Top Spender สัปดาห์ อันดับ 1–10", qty: 10, cost: 500 },
    { name: "Top Spender สัปดาห์ อันดับ 11–50", qty: 40, cost: 300 }
  ],

  // B Merch + TMD (950,000 รวมค่าส่ง 60/ชิ้น) · ราคาแต้มลด 50%
  merch: [
    { name: "พวงกุญแจ Volt", cost: 45, qty: 1700, pts: 500 },
    { name: "ถุงผ้า Volt", cost: 90, qty: 1000, pts: 750 },
    { name: "เสื้อยืด Volt", cost: 220, qty: 900, pts: 1400 },
    { name: "กระบอกน้ำ Volt", cost: 150, qty: 500, pts: 1050 },
    { name: "ร่ม Volt", cost: 150, qty: 300, pts: 1050 },
    { name: "เสื้อ Volt × Three Man Down Limited (Drop)", cost: 300, qty: 400, pts: 1800 },
    { name: "ของพร้อมลายเซ็น Three Man Down", cost: 500, qty: 100, pts: null, note: "แจกผ่าน Lucky Draw เท่านั้น" }
  ],

  // C รางวัลใหญ่ (712,500 รวมสำรอง 52,500)
  grand: [
    { name: "iPhone รุ่นล่าสุด", cost: 45000, qty: 4 },
    { name: "ทริป 2 ที่นั่ง + ตั๋วเครื่องบิน", cost: 40000, qty: 2 },
    { name: "Nintendo Switch 2", cost: 17000, qty: 5 },
    { name: "iPad", cost: 15000, qty: 5 },
    { name: "กล้องสำหรับครีเอเตอร์", cost: 20000, qty: 3 },
    { name: "AirPods (รายเดือน)", cost: 6000, qty: 20 },
    { name: "ค่าเดินทาง/ที่พัก ผู้ได้ Backstage 20 คน", cost: 3000, qty: 20 }
  ],

  // ข้อ 2: Charge Profile 10 ข้อหลังสมัคร
  quizOnboarding: [
    { q: "เดือน/ปีเกิด", type: "month-year", why: "เกณฑ์อายุ + แยกกลุ่มวัย" },
    { q: "อยู่จังหวัดไหน (และเขต/อำเภอ ถ้าสะดวก)", type: "province", why: "แผนที่ความหนาแน่น + เลือกร้านใกล้บ้าน" },
    { q: "ตอนนี้ทำอะไรอยู่", opts: ["นักศึกษา", "พนักงานออฟฟิศ", "ฟรีแลนซ์/ครีเอเตอร์", "ไรเดอร์/ขับรถ", "ค้าขาย/เจ้าของกิจการ", "นักเรียน", "อื่น ๆ"], why: "แยกกลุ่มอาชีพ" },
    { q: "ไลฟ์สไตล์ที่ใช่ เลือก 3 อย่าง", type: "lifestyle", why: "จัดกลุ่มแนะนำรางวัล" },
    { q: "ปกติดื่ม Volt ช่วงไหน", opts: ["เช้าก่อนเรียน/งาน", "บ่ายง่วง ๆ", "เย็นหลังเลิก", "ดึกอ่านหนังสือ/เล่นเกม", "ตอนออกกำลัง/เล่นกีฬา", "ปาร์ตี้/คอนเสิร์ต"], multi: true, why: "โอกาสดื่ม เวลาส่งข้อความ" },
    { q: "ดื่ม Volt บ่อยแค่ไหน", opts: ["เพิ่งลองครั้งแรก", "นาน ๆ ครั้ง", "1–2 วัน/สัปดาห์", "3–5 วัน/สัปดาห์", "เกือบทุกวัน"], why: "แยกลูกค้าใหม่/เก่า + ความถี่ตั้งต้นของ RFM" },
    { q: "ซื้อครั้งละเท่าไร", opts: ["1 กระป๋อง", "2–3 กระป๋อง", "แพ็ก 4–6", "ยกแพ็ก 12 ขึ้นไป"], why: "ขนาดตะกร้า ข้อเสนอแพ็ก" },
    { q: "ซื้อที่ไหนบ่อยสุด", opts: ["7-Eleven", "ร้านโชห่วยใกล้บ้าน", "Lawson / Villa / Makro Go", "ออนไลน์", "อื่น ๆ"], why: "ช่องทางหลัก" },
    { q: "ชอบรสไหนที่สุด", opts: ["Tropical (เหลือง)", "Blueberry (ฟ้า)", "Forest Fruit (ม่วง)", "ยังลองไม่ครบ"], why: "ความชอบรส ภารกิจ 3 รส" },
    { q: "นอกจาก Volt ดื่มอะไรบ่อยที่สุด", opts: ["M-150", "คาราบาว", "กระทิงแดง / Red Bull", "Shark", "น้ำอัดลม", "กาแฟ", "ไม่มี"], why: "คู่แข่งที่แย่งโอกาสดื่ม" }
  ],

  // Weekly Quiz: 3 ข้อ/สัปดาห์ หมุนตามธีม · คลังตั้งต้น 13 สัปดาห์
  quizWeekly: [
    { wk: 1, theme: "Charge แรก", qs: ["ได้ยิน Volt ครั้งแรกจากที่ไหน", "ทำไมเลือก Volt", "ถ้าให้คะแนนรสชาติ 1–5"] },
    { wk: 2, theme: "Valentine", qs: ["ไปเดตแล้วดื่มอะไร", "ชวนใครมาชาร์จด้วยดีสุด", "ของขวัญที่อยากได้"] },
    { wk: 3, theme: "เกม", qs: ["เกมที่เล่นบ่อยสุด", "เติมเกมเดือนละเท่าไร", "เล่นตอนกี่โมง"] },
    { wk: 4, theme: "ดนตรี", qs: ["แนวเพลงที่ฟังบ่อย", "ฟังผ่านแอปไหน", "อยากให้ TMD เล่นเพลงไหน"] },
    { wk: 5, theme: "ราคาและแพ็ก", qs: ["ถ้า 310 ml ลด 2 บาท จะซื้อเพิ่มไหม", "สนใจขวด 350 ml ไหม", "ซื้อยกแพ็กตอนไหน"] },
    { wk: 6, theme: "สอบ/งานหนัก", qs: ["ช่วงไหนต้องการพลังมากสุด", "ตัวช่วยตอนอ่านหนังสือ/ทำงาน", "นอนกี่ชั่วโมง"] },
    { wk: 7, theme: "สื่อ", qs: ["เล่นโซเชียลไหนมากสุด", "ครีเอเตอร์ที่ติดตาม", "เห็นโฆษณา Volt ที่ไหน"] },
    { wk: 8, theme: "รสใหม่", qs: ["อยากได้รสอะไรเพิ่ม", "สีกระป๋องที่ชอบ", "ให้ตั้งชื่อรสใหม่"] },
    { wk: 9, theme: "กีฬา/ออกกำลัง", qs: ["ออกกำลังแบบไหน", "สัปดาห์ละกี่วัน", "ดื่มก่อนหรือหลัง"] },
    { wk: 10, theme: "คอนเสิร์ต", qs: ["ไปคอนเสิร์ตปีละกี่ครั้ง", "เดินทางไปยังไง", "อยากได้ของที่ระลึกแบบไหน"] },
    { wk: 11, theme: "Songkran", qs: ["สงกรานต์ไปไหน", "ดื่มอะไรช่วงเทศกาล", "ซื้อไปฝากใครไหม"] },
    { wk: 12, theme: "รางวัล", qs: ["รางวัลที่อยากได้ที่สุด", "ชอบแลกทันทีหรือเก็บแต้ม", "แนะนำ Volt ให้เพื่อนไหม (0–10)"] },
    { wk: 13, theme: "Wrapped", qs: ["โมเมนต์ที่ชอบที่สุดใน Season", "อยากให้ Season หน้ามีอะไร", "ศิลปิน/IP ที่อยากให้ร่วม"] }
  ],

  // ข้อ 4: RFM · R = วันนับจากชาร์จล่าสุด · F = จำนวนวันที่ชาร์จใน 60 วัน · M = ยอดซื้อที่ยืนยันแล้ว (บาท) · ให้คะแนน 1–5 ตาม quintile
  rfm: [
    { seg: "Champions", rule: "R5 F5 M4–5", push: "ชวนเข้า Drop ก่อนใคร, สิทธิ์ Backstage", pull: "Badge Fully Charged, ของ Limited", cost: "ต่ำ: ให้สิทธิ์มากกว่าแต้ม" },
    { seg: "Loyal", rule: "R3–5 F4–5", push: "ภารกิจขั้นบันไดรายเดือน", pull: "Tier progress, Squad", cost: "ต่ำ" },
    { seg: "Potential Loyalist", rule: "R4–5 F2–3", push: "Streak 2 สัปดาห์ได้สิทธิ์ลุ้น", pull: "การ์ดทำอะไรต่อดี", cost: "ต่ำ" },
    { seg: "New", rule: "สมัครไม่เกิน 14 วัน", push: "ขั้นตอนแรก + Welcome", pull: "Starter shelf, Charge Profile", cost: "Welcome 20 แต้ม" },
    { seg: "Promising", rule: "R4–5 F1", push: "ลอง 310 ml ที่ 7-Eleven ลด 3฿", pull: "Flavor Trio", cost: "3 บาท/คน" },
    { seg: "Need Attention", rule: "R3 F3 M3", push: "เตือนแต้มใกล้ถึงของที่ตั้งเป้า", pull: "Weekly Quiz", cost: "ต่ำ" },
    { seg: "About to Sleep", rule: "R2 F1–2", push: "x2 วันเดียวเฉพาะกลุ่ม", pull: "Instant Win โอกาสเพิ่ม", cost: "กลาง" },
    { seg: "At Risk", rule: "R1–2 F3–5", push: "ข้อความรายคน + ของที่เคยกดหัวใจ", pull: "แต้มใกล้หมดอายุ", cost: "กลาง" },
    { seg: "Can't Lose", rule: "R1 F5 M5", push: "ติดต่อพิเศษ สิทธิ์ลุ้นฟรี 3 สิทธิ์", pull: "Volt Stage content", cost: "สิทธิ์ลุ้น (≈0)" },
    { seg: "Hibernating", rule: "R1–2 F1–2", push: "ข้อความเดือนละครั้ง Season ใหม่", pull: "–", cost: "ต่ำมาก" },
    { seg: "Lost", rule: "R1 F1 นานกว่า 60 วัน", push: "หยุดส่ง (ประหยัดโควตา LINE)", pull: "Volt Wrapped ตอนจบ Season", cost: "0" }
  ],

  // ข้อ 6: Top Spender (นับเฉพาะยอดที่ยืนยันแล้ว) + กันเสี่ยง
  topSpender: {
    boards: ["Top Spender รายสัปดาห์ (ทั้งประเทศ)", "Top Spender รายเดือน แยกร้าน: 7-Eleven / Lawson / Villa / Makro Go / ร้านโชห่วย", "Top Spender รายจังหวัด", "Top Charger (จำนวนวันที่ชาร์จ)", "Campus Charge (มหาวิทยาลัย)"],
    rules: ["นับยอดบาทจากใบเสร็จ/รหัส/ร้านสแกนที่ผ่านตรวจแล้วเท่านั้น", "นับยอดต่อคนต่อวันได้ไม่เกินเพดานส่วนตัว ยกแพ็กนับผ่านใบเสร็จแบบเพดานรายสัปดาห์", "ตัดรายการจากร้านที่ถูกพักความเสี่ยงออกก่อนประกาศ", "ได้รางวัล Top Spender สูงสุด 1 ครั้ง/เดือน/คน", "เท่ากันให้คนที่ถึงยอดก่อนชนะ", "ประกาศพร้อมช่วงพิจารณา 3 วันก่อนส่งรางวัล"]
  },

  // ข้อ 7: Lucky Draw สร้างได้เรื่อย ๆ จากหลังบ้าน
  drawTemplates: [
    { name: "Weekly Lifestyle Draw", freq: "ทุกอาทิตย์ 20:00", entry: "ทุกการชาร์จ 1 สิทธิ์ + แลก 20 แต้ม/สิทธิ์", prize: "บัตรตามธีมสัปดาห์" },
    { name: "Retailer Draw (7-Eleven / Lawson / Villa / Makro Go)", freq: "รายเดือน", entry: "ใบเสร็จร้านนั้น", prize: "Pool ประจำร้าน" },
    { name: "Backstage Pass", freq: "ก่อนคอนเสิร์ต", entry: "ใบเสร็จ 7-Eleven ที่มี 310 ml", prize: "ถ่ายรูปหลังเวที 20 คน" },
    { name: "Monthly Mid", freq: "สิ้นเดือน", entry: "แพ็กสิทธิ์ 1 = 1, 5 = 6, 12 = 15", prize: "AirPods 5 รางวัล/เดือน" },
    { name: "Grand Fully Charged", freq: "ปิด Season", entry: "สิทธิ์สะสมทั้ง Season", prize: "iPhone, ทริป, Switch, iPad, กล้อง" },
    { name: "Flash Draw", freq: "ตั้งได้ทุกเมื่อ", entry: "เงื่อนไขกำหนดเอง (รส/ภาค/segment)", prize: "เลือกจากสต็อก" }
  ],

  // กลุ่มเป้าหมาย: เก่า = ดื่ม Volt อยู่แล้ว · ใหม่ = ยังไม่ดื่มหรือเพิ่งลอง
  // ระบบจัดกลุ่มจาก Charge Profile + พฤติกรรมการชาร์จ (ดู audienceRules)
  audiences: [
    { id: "E1", type: "เก่า", name: "คนดื่ม 190 ml ร้านโชห่วย", who: "ฐานหลัก ราว 755K กระป๋อง/เดือน ส่วนใหญ่ต่างจังหวัด", goal: "รักษาฐาน + ขยับไป 310 ml", detect: "ชาร์จ 190 ml เป็นหลัก หรือตอบซื้อที่ร้านโชห่วย", reach: "ป้ายร้านชาร์จ Volt, POSM ที่ร้าน, เซลล์ AJE" },
    { id: "E2", type: "เก่า", name: "คนดื่ม 310 ml ที่ 7-Eleven / MT", who: "ยอดผันผวนมาก (ส.ค. 2,504 → ก.ย. 43,994 แพ็ก)", goal: "ซื้อซ้ำสม่ำเสมอทุกสัปดาห์", detect: "ชาร์จ 310 ml หรือใบเสร็จ MT ≥ 50% ของรายการ", reach: "POSM 7-Eleven, LINE OA, โบนัสใบเสร็จ" },
    { id: "E3", type: "เก่า", name: "แฟน Three Man Down", who: "คนที่เข้ามาช่วงงานเปิดตัว ก.ย. และแฟนเพลง", goal: "เปลี่ยนแฟนช่วงพีกให้เป็นคนซื้อประจำ", detect: "เลือกกลุ่มดนตรี + ใช้งาน Volt Stage / ร่วม Draw Backstage", reach: "โซเชียลศิลปิน (ผ่านค่าย), Volt Stage" },
    { id: "E4", type: "เก่า", name: "สมาชิกที่เงียบไป", who: "RFM: At Risk, Can't Lose, Hibernating", goal: "ดึงกลับมาชาร์จ", detect: "RFM segment", reach: "ข้อความรายคน, ของที่เคยกดหัวใจ" },
    { id: "N1", type: "ใหม่", name: "นักศึกษามหาวิทยาลัย", who: "Gen Z 18–24 ช่วงสอบ เกม ดนตรี", goal: "ลอง Volt แล้วสมัคร", detect: "อาชีพ = นักศึกษา", reach: "University Roadshow, Campus Charge, TikTok" },
    { id: "N2", type: "ใหม่", name: "พนักงานออฟฟิศรุ่นใหม่", who: "22–35 ง่วงบ่าย ทำงานดึก", goal: "ใช้ Volt แทนเครื่องดื่มช่วงบ่าย", detect: "อาชีพ = พนักงานออฟฟิศ", reach: "LINE Ads, 7-Eleven ย่านออฟฟิศ" },
    { id: "N3", type: "ใหม่", name: "เกมเมอร์", who: "เล่นเกมมือถือ/PC ดึก", goal: "Volt เป็นเครื่องดื่มตอนเล่นเกม", detect: "กลุ่มเกม หรือดื่มช่วงดึกเล่นเกม", reach: "สตรีมเมอร์, กลุ่มเกม, Game Season" },
    { id: "N4", type: "ใหม่", name: "ครีเอเตอร์ / สายหาเงินเสริม", who: "ฟรีแลนซ์ ทำคอนเทนต์ ขายของ", goal: "สมัคร + ทำคอนเทนต์ Volt ต่อ", detect: "กลุ่มถ่ายรูป/ธุรกิจ หรืออาชีพฟรีแลนซ์", reach: "ชุมชนครีเอเตอร์, KOL ขนาดเล็ก" },
    { id: "N5", type: "ใหม่", name: "คนดื่มน้ำอัดลม / กาแฟ", who: "ยังไม่ดื่มชูกำลัง แต่ดื่มน้ำอัดลมหรือกาแฟ", goal: "ลอง Volt ในฐานะโซดาเอเนอร์จี้", detect: "Quiz ข้อ 10 = น้ำอัดลม / กาแฟ", reach: "Sampling, 7-Eleven ชั้นน้ำอัดลม" },
    { id: "N6", type: "ใหม่", name: "คนดื่มชูกำลังยี่ห้ออื่น", who: "ดื่ม M-150, คาราบาว, กระทิงแดง, Shark", goal: "เปลี่ยนมาลอง Volt (เน้นกลุ่มกระป๋อง วัยรุ่น)", detect: "Quiz ข้อ 10 = ยี่ห้อคู่แข่ง", reach: "ร้านโชห่วย, ปั๊ม, โฆษณารางวัลใหญ่" },
    { id: "N7", type: "ใหม่", name: "สายป๊อป: ซีรีส์ บิวตี้ อนิเมะ", who: "กลุ่มที่ Volt ยังเข้าไม่ถึง รวมฐานผู้หญิง", goal: "ขยายฐานนอกภาพเครื่องดื่มชูกำลัง", detect: "กลุ่มหนัง/แฟชั่น/อนิเมะ", reach: "เพจซีรีส์/อนิเมะ, ครีเอเตอร์บิวตี้" },
    { id: "N8", type: "ใหม่", name: "สายกีฬา / ฟิตเนส", who: "วิ่ง ฟุตบอล ฟิตเนส", goal: "Volt ตอนเล่นกีฬา", detect: "กลุ่มกีฬา หรือดื่มตอนออกกำลัง", reach: "งานวิ่ง, ชมรมกีฬามหาวิทยาลัย" }
  ],

  audienceRules: [
    "ลูกค้าใหม่ต่อแบรนด์: Quiz ข้อ 6 ตอบ \"เพิ่งลองครั้งแรก\" หรือ \"นาน ๆ ครั้ง\" และการชาร์จครั้งแรกอยู่ภายใน 30 วันล่าสุด",
    "ลูกค้าเก่า: Quiz ข้อ 6 ตั้งแต่ 1–2 วัน/สัปดาห์ หรือชาร์จอย่างน้อย 3 วันใน 30 วันล่าสุด",
    "ลูกค้าใหม่ที่ชาร์จต่อเนื่องครบ 4 สัปดาห์ ย้ายเป็นลูกค้าเก่า (นับเป็นผลสำเร็จของการดึงคนใหม่)",
    "1 คนอยู่ได้หลายกลุ่ม (เช่น N1 + N3) ใช้กลุ่มที่ตรงที่สุดเป็นกลุ่มหลักในการรายงาน",
    "นักเรียน ม.ปลาย ยังไม่ใช่กลุ่มเป้าหมายจนกว่าฝ่ายกฎหมายเคาะเกณฑ์อายุ รางวัลที่ผู้เล่นอายุน้อยนิยมต้องจำกัดอายุผู้แลก"
  ],

  // จับคู่รางวัล → กลุ่ม · key = หมวด:ชื่อรางวัล (cat, iw, wk, merch, grand, perk)
  // role: Acquire ดึงคนใหม่ · Activate ของชิ้นแรก · Retain ซื้อซ้ำ · Upsize 190→310/7-Eleven · Brand heat
  targeting: [
    { k: "cat:คูปอง Volt 10฿ ที่ 7-Eleven", main: ["E2","E1"], sub: ["N1"], type: "เก่า", role: "Retain", why: "แต้มวนกลับเป็นการซื้อ Volt กระป๋องถัดไป" },
    { k: "cat:ส่วนลด 3฿ Volt 310 ml ที่ 7-Eleven", main: ["E1"], sub: ["N5"], type: "เก่า", role: "Upsize", why: "ให้คนดื่ม 190 ลอง 310 ที่ 7-Eleven ในราคา 14 บาท" },
    { k: "cat:กระป๋องฟรีที่ร้านโชห่วยใกล้บ้าน (+2฿ จ่ายที่ร้าน)", main: ["E1"], sub: ["E4"], type: "เก่า", role: "Retain", why: "รักษาฐาน 190 และพาคนกลับเข้าร้านพาร์ทเนอร์" },
    { k: "cat:TrueMoney 20฿", main: ["N1","N2"], sub: ["E1"], type: "ทั้งคู่", role: "Activate", why: "ของชิ้นแรกที่ใช้ได้ทุกที่ จำกัดจำนวนกัน reward hunter" },
    { k: "cat:บัตรเติมเงินมือถือ 50฿", main: ["N1"], sub: ["E1"], type: "ใหม่", role: "Acquire", why: "นักศึกษาใช้ทุกเดือน เข้าใจทันทีว่าได้อะไร" },
    { k: "cat:บัตร Garena 50฿ (ROV / Free Fire)", main: ["N3"], sub: ["E1"], type: "ใหม่", role: "Acquire", why: "เกมมือถือหลักของวัยรุ่นต่างจังหวัด ฐานเดียวกับคนดื่ม 190" },
    { k: "cat:บัตร Google Play 50฿ (Minecraft / Roblox)", main: ["N3"], sub: [], type: "ใหม่", role: "Acquire", why: "เกมเมอร์สายสร้างสรรค์", flag: "ผู้เล่น Minecraft/Roblox จำนวนมากอายุน้อย ต้องจำกัดอายุผู้แลก" },
    { k: "cat:Spotify Premium 1 เดือน", main: ["E3","N1"], sub: [], type: "ทั้งคู่", role: "Brand heat", why: "ให้แฟนเพลงอยู่กับ Volt ระหว่างรอคอนเสิร์ต" },
    { k: "cat:ตั๋วหนัง Major / SF 2D", main: ["N2","N7"], sub: ["N1"], type: "ใหม่", role: "Acquire", why: "ไลฟ์สไตล์วันหยุดของคนทำงาน" },
    { k: "cat:WeTV / Viu VIP 1 เดือน", main: ["N7"], sub: ["N2"], type: "ใหม่", role: "Acquire", why: "ขยายไปสายซีรีส์ที่ Volt ยังเข้าไม่ถึง" },
    { k: "cat:LINE MAN / GrabFood 50฿", main: ["N2","N1"], sub: [], type: "ใหม่", role: "Activate", why: "สั่งอาหารคู่ Volt ช่วงทำงาน/อ่านหนังสือดึก" },
    { k: "cat:Café Amazon 50฿", main: ["N5","N2"], sub: [], type: "ใหม่", role: "Acquire", why: "ดึงคนดื่มกาแฟเข้า Club แล้วใช้ภารกิจช่วงบ่ายชวนลอง Volt" },
    { k: "cat:Decathlon 100฿", main: ["N8"], sub: [], type: "ใหม่", role: "Acquire", why: "เปิดโอกาสดื่มตอนเล่นกีฬา" },
    { k: "cat:คอร์สออนไลน์ 100฿", main: ["N4","N1"], sub: [], type: "ใหม่", role: "Acquire", why: "สายพัฒนาตัวเอง/หาเงินเสริม" },
    { k: "cat:CapCut Pro 1 เดือน", main: ["N4"], sub: [], type: "ใหม่", role: "Brand heat", why: "ครีเอเตอร์ได้เครื่องมือ แล้วทำคอนเทนต์ Volt ต่อ" },
    { k: "cat:TrueMoney 50฿", main: ["N6","N2"], sub: ["E1"], type: "ทั้งคู่", role: "Acquire", why: "มูลค่าชัด ใช้ชวนคนที่ดื่มยี่ห้ออื่นลองสะสม" },
    { k: "cat:Grab Ride 50฿", main: ["N2"], sub: [], type: "ใหม่", role: "Acquire", why: "คนทำงานเดินทางทุกวัน" },
    { k: "cat:Shopee 50฿", main: ["N7","N1"], sub: ["E1","E2"], type: "ทั้งคู่", role: "Activate", why: "ใช้ได้กว้าง แลกง่ายสำหรับสมาชิกใหม่" },
    { k: "cat:Watsons 100฿", main: ["N7"], sub: [], type: "ใหม่", role: "Acquire", why: "เปิดฐานผู้หญิงสายบิวตี้" },
    { k: "cat:LINE Manga / Webtoon coin 50฿", main: ["N7"], sub: ["N1"], type: "ใหม่", role: "Acquire", why: "สายอนิเมะ/การ์ตูน" },
    { k: "cat:e-book 50฿", main: ["N1"], sub: [], type: "ใหม่", role: "Acquire", why: "ใช้ช่วงสอบ คู่กับ Exam Charge" },
    { k: "iw:TrueMoney 20฿", main: ["E1","E2"], sub: [], type: "เก่า", role: "Retain", why: "ทุกการชาร์จมีลุ้น ให้เหตุผลซื้อกระป๋องถัดไป" },
    { k: "iw:Garena / Google Play 50฿", main: ["N3"], sub: ["E1"], type: "ทั้งคู่", role: "Acquire", why: "ประกาศคนได้บัตรเกมทุกวัน ใช้โปรโมตในกลุ่มเกม", flag: "จำกัดอายุผู้รับ Google Play ตามข้อด้านบน" },
    { k: "iw:Shopee 100฿", main: ["N1","N7"], sub: ["E2"], type: "ทั้งคู่", role: "Activate", why: "รางวัลทันทีที่คนทั่วไปอยากได้" },
    { k: "wk:Weekly Lifestyle Draw: บัตร 1,000฿ ตามธีมสัปดาห์", main: ["N3","N7","N8","N4"], sub: ["N1"], type: "ใหม่", role: "Acquire", why: "หมุนธีมให้แต่ละกลุ่มใหม่มีสัปดาห์ของตัวเอง" },
    { k: "wk:Weekly Lifestyle Draw: บัตร 100฿", main: ["E1","E2","N1"], sub: [], type: "ทั้งคู่", role: "Retain", why: "รางวัลจำนวนมากให้คนชาร์จทุกสัปดาห์มีโอกาสได้" },
    { k: "wk:Top Spender สัปดาห์ อันดับ 1–10", main: ["E2"], sub: ["E1"], type: "เก่า", role: "Upsize", why: "นับเป็นบาท 310 ml ได้เปรียบ ดันคนซื้อประจำไป 310" },
    { k: "wk:Top Spender สัปดาห์ อันดับ 11–50", main: ["E2","E1"], sub: [], type: "เก่า", role: "Retain", why: "ขยายผู้ได้รางวัลให้คนซื้อประจำระดับกลาง" },
    { k: "merch:พวงกุญแจ Volt", main: ["E1","E2"], sub: [], type: "เก่า", role: "Retain", why: "ของจับต้องได้ชิ้นแรกของคนชาร์จประจำ" },
    { k: "merch:ถุงผ้า Volt", main: ["N1","N2"], sub: ["E2"], type: "ทั้งคู่", role: "Brand heat", why: "ถือไปเรียน/ทำงาน เป็นสื่อเดินได้" },
    { k: "merch:เสื้อยืด Volt", main: ["E2","E1"], sub: ["N1"], type: "เก่า", role: "Brand heat", why: "ตัวตนของคนดื่ม Volt" },
    { k: "merch:กระบอกน้ำ Volt", main: ["N8","N2"], sub: [], type: "ใหม่", role: "Brand heat", why: "ใช้ที่ยิม/ออฟฟิศ" },
    { k: "merch:ร่ม Volt", main: ["E1"], sub: ["N2"], type: "เก่า", role: "Retain", why: "ใช้จริงทุกวัน กันแดดหน้าร้อน" },
    { k: "merch:เสื้อ Volt × Three Man Down Limited (Drop)", main: ["E3"], sub: ["E2"], type: "เก่า", role: "Brand heat", why: "ให้แฟนช่วงงานเปิดตัวกลับมาซื้อต่อ" },
    { k: "merch:ของพร้อมลายเซ็น Three Man Down", main: ["E3"], sub: [], type: "เก่า", role: "Brand heat", why: "รางวัลของแฟนตัวจริง" },
    { k: "grand:iPhone รุ่นล่าสุด", main: ["N6","N5","N1"], sub: ["E4"], type: "ใหม่", role: "Acquire", why: "ตัวดึงความสนใจในโฆษณาให้คนที่ยังไม่ดื่ม Volt เข้าร่วม" },
    { k: "grand:ทริป 2 ที่นั่ง + ตั๋วเครื่องบิน", main: ["N2","N1"], sub: [], type: "ใหม่", role: "Acquire", why: "รางวัลในฝันของคนทำงาน/นักศึกษา" },
    { k: "grand:Nintendo Switch 2", main: ["N3"], sub: [], type: "ใหม่", role: "Acquire", why: "ของใหญ่ของสายเกม" },
    { k: "grand:iPad", main: ["N1","N4"], sub: [], type: "ใหม่", role: "Acquire", why: "เรียนและทำคอนเทนต์" },
    { k: "grand:กล้องสำหรับครีเอเตอร์", main: ["N4"], sub: [], type: "ใหม่", role: "Brand heat", why: "ผู้ได้รางวัลทำคอนเทนต์ต่อ" },
    { k: "grand:AirPods (รายเดือน)", main: ["E3","E2"], sub: ["E4"], type: "เก่า", role: "Retain", why: "ให้คนเก่ามีเหตุผลกลับมาทุกเดือน" },
    { k: "grand:ค่าเดินทาง/ที่พัก ผู้ได้ Backstage 20 คน", main: ["E3","E2"], sub: [], type: "เก่า", role: "Upsize", why: "สิทธิ์จากใบเสร็จ 7-Eleven ที่มี 310 ml เท่านั้น" },
    { k: "perk:ส่วนลดสมัครงานวิ่ง", main: ["N8"], sub: [], type: "ใหม่", role: "Acquire", why: "พาร์ทเนอร์ออกเงิน" },
    { k: "perk:ส่วนลดบัตรคอนเสิร์ต/เทศกาลดนตรี", main: ["E3","N1"], sub: [], type: "ทั้งคู่", role: "Brand heat", why: "พาร์ทเนอร์ออกเงิน" },
    { k: "perk:ส่วนลดคอร์สถ่ายภาพ/ตัดต่อ", main: ["N4"], sub: [], type: "ใหม่", role: "Acquire", why: "พาร์ทเนอร์ออกเงิน" },
    { k: "perk:ส่วนลดที่พัก/ทริป", main: ["N2"], sub: [], type: "ใหม่", role: "Acquire", why: "พาร์ทเนอร์ออกเงิน" },
    { k: "perk:ทดลองใช้แอปการเงิน/ออมเงิน", main: ["N2","N1"], sub: [], type: "ใหม่", role: "Acquire", why: "พาร์ทเนอร์ออกเงิน", flag: "เฉพาะผู้ใช้อายุ 20 ปีขึ้นไป ห้ามสื่อเรื่องผลตอบแทน" }
  ]
};


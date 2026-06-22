# Smart Hospital Pharmacy — Web Frontend

React + Vite frontend สำหรับระบบคลังยาโรงพยาบาล เชื่อมต่อ Google Apps Script backend ผ่าน API proxy

## สถาปัตยกรรม

```
Browser → /api/gas (Vercel proxy) → GAS doPost → apiHandler()
Browser → /api/branding → GAS ?action=branding
```

## ความต้องการ

- Node.js 20+
- Google Apps Script Web App ที่ deploy แล้ว (ต้องมี `doPost` ใน `Code.gs`)

## ติดตั้งและรัน Local

```bash
cd web
npm install
cp .env.example .env
# แก้ VITE_GAS_API_URL ใน .env ให้ชี้ไปยัง GAS /exec URL
npm run dev
```

เปิด http://localhost:5173 — login เริ่มต้น: `admin` / `admin123`

## Deploy บน Vercel

1. Push โฟลเดอร์ `web/` ไปยัง GitHub repository
2. สร้างโปรเจกต์ใหม่ใน [Vercel](https://vercel.com) → Import repository
3. ตั้งค่า:
   - **Root Directory:** `web` (ถ้า repo มีทั้ง GAS และ web)
   - **Framework Preset:** Vite
4. เพิ่ม Environment Variable:

| ชื่อ | ค่า |
|------|-----|
| `GAS_API_URL` | `https://script.google.com/macros/s/YOUR_ID/exec` |

5. Deploy — Vercel จะ build ด้วย `npm run build` และ serve SPA จาก `dist/`

### ทำไมต้องใช้ Proxy?

Google Apps Script ไม่รองรับ CORS จาก domain ภายนอก — `/api/gas` และ `/api/branding` เป็น serverless functions ที่ proxy request ไปยัง GAS

## Deploy บน GitHub

```bash
cd web
git init
git add .
git commit -m "Initial React frontend for Smart Hospital Pharmacy"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

## โครงสร้างโฟลเดอร์

```
web/
├── api/              # Vercel serverless proxy
│   ├── gas.ts
│   └── branding.ts
├── src/
│   ├── components/   # Layout, Sidebar, Topbar
│   ├── contexts/     # Auth, Theme, Branding, Toast
│   ├── hooks/
│   ├── lib/          # API client, types, routes
│   ├── pages/        # หน้าหลักทุกโมดูล
│   └── styles/
├── vercel.json       # SPA rewrite + build config
├── .env.example
└── vite.config.ts    # Dev proxy สำหรับ local
```

## Environment Variables

| ตัวแปร | ใช้ที่ | คำอธิบาย |
|--------|--------|----------|
| `VITE_GAS_API_URL` | Local dev | GAS Web App URL (สำหรับ logo + dev proxy) |
| `GAS_API_URL` | Vercel | GAS Web App URL (สำหรับ serverless proxy) |

## สคริปต์

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | รัน dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview build ในเครื่อง |
| `npm run lint` | ESLint |

## หมายเหตุ GAS Backend

ก่อนใช้งาน frontend ต้อง deploy Apps Script เวอร์ชันล่าสุดที่มี `doPost()` ใน `Code.gs` แล้วอัปเดต URL ใน environment variables
# Auto Saler Frontend

Dự án Next.js với Ant Design, TypeScript, và đa ngôn ngữ (i18n).

## Tech Stack

- **Next.js 16** - React framework với App Router
- **Ant Design (antd)** - UI Component Library với Dark Mode support
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **next-intl** - Internationalization (i18n) - hỗ trợ tiếng Việt và tiếng Anh

## Getting Started

Cài đặt dependencies:

```bash
npm install
```

Chạy development server:

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Features

- ✅ Dark/Light mode với Ant Design theme
- ✅ Đa ngôn ngữ (Tiếng Việt / English)
- ✅ Code splitting với dynamic import
- ✅ Server-side rendering (SSR)
- ✅ TypeScript support

## Project Structure

```
app/              # Next.js App Router
components/       # Reusable components
features/         # Feature-based modules
libs/             # Libraries và utilities
  - antd-provider.tsx    # Ant Design configuration
  - theme-context.tsx    # Theme management
  - i18n/               # Internationalization
    - config.ts         # i18n configuration
    - request.ts        # next-intl request config
    - messages/         # Translation files
      - vi.json
      - en.json
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

<div align="center">
  <img src="public/ai-eagle-eye.png" alt="America Screener AI Logo" width="200" height="200" />
  
  # America Screener 🦅
  
  **The Freedom-Focused Token Analyzer for Solana**
</div>

## Overview

America Screener is a specialized token analytics dashboard built for the `america.fun` ecosystem on Solana. It provides real-time data, safety scoring, and detailed metrics for tokens, wrapped in a polished, OS X Yosemite-inspired interface.

## Features

- **Token Finder**: real-time list of tokens with sorting by age, price, volume, and liquidity.
- **Detailed Analytics**: Deep dive into token metrics, including transaction history (5m, 1h, 6h, 24h).
- **Security First**: Integrated RugCheck reports with easy-to-read "Safety Scores" and detailed risk breakdowns.
- **Global Stats**: Aggregated ecosystem metrics (Total Volume, Liquidity, Active Pairs).
- **Real-Time Presence**: "Live Now" visitor counter powered by Firebase Realtime Database. Tracks active connections in real-time with auto-disconnect cleanup.
- **Yosemite Aesthetics**: a retro-modern desktop interface layout.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS & Framer Motion
- **State Management**: Redux Toolkit & Sagas
- **Real-Time Database**: Firebase (for visitor counting)
- **APIs**: DexScreener, RugCheck, SolanaFM

## Setup Real-Time Features

To enable the "Live Visitor" counter:
1.  Create a **Firebase Project**.
2.  Enable **Realtime Database**.
3.  Add your credentials to `.env.local` (see `.env.example`).
4.  Add the provided `database.rules.json` to your Firebase Rules.

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/americascreener.git
    cd americascreener
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Contributing

Freedom is for everyone. Pull requests are welcome.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
<div align="center">
  <sub>Built with 🇺🇸 on Solana</sub>
</div>

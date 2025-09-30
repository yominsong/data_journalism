# Data Journalism Project

A data visualization project utilizing Kakao Maps to display elderly accident hotspots, medical institutions, traditional markets, and welfare centers across South Korea.

## Tech Stack

- **Language**: TypeScript
- **Framework**: React + Next.js 15.5.4
- **Package Manager**: pnpm
- **Map**: Kakao Map API
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Quality**: ESLint

## Features

- 🗺️ **Full-screen Interactive Map** with grayscale styling
- 📍 **4 Data Types with Custom Icons**:
  - 🔵 Elderly accident hotspots (blue markers with clustering)
  - 🏥 Medical institutions (red cross icon)
  - 🛒 Traditional markets (orange shopping cart icon)
  - 👥 Welfare centers (green people icon)
- 🎯 **Advanced Filtering System**:
  - Year filter for accident data (2012-2024)
  - Facility type toggles
- 💬 **Interactive InfoWindows** on marker/polygon clicks
- 🎨 **Color-coded Overlays** (polygons, markers, clusters)
- 📱 **Responsive Design**

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file and add your Kakao Map API key:

```bash
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
```

Get your API key from [Kakao Developers Console](https://developers.kakao.com/).

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main page with filter logic
│   └── globals.css           # Global styles
├── components/
│   ├── KakaoMap.tsx          # Kakao Map component
│   ├── DataFilter.tsx        # Unified filter component
│   └── YearFilter.tsx        # Legacy year filter
├── types/
│   ├── kakao.d.ts            # Kakao Maps API type definitions
│   └── data.ts               # Data type definitions
├── data/                     # Local JSON data files
└── public/
    └── data/                 # Public JSON data files
```

## Data Sources

- **Elderly Accident Hotspots**: ~4,000 locations with polygon boundaries
- **Medical Institutions**: ~2,500 hospitals and clinics
- **Traditional Markets**: ~1,500 markets
- **Welfare Centers**: ~469 community centers

## Key Implementation Details

### Map Styling
- Base map tiles are rendered in grayscale
- Overlays (markers, polygons, clusters) remain in full color
- Custom SVG markers for each facility type

### Clustering
- Applied only to elderly accident hotspots
- Other facilities display as individual markers
- Dynamic cluster styling based on zoom level

### Filtering Logic
- Year filter affects only accident hotspots
- Facility toggles show/hide specific types
- Real-time updates with React useMemo

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## License

This project is for educational and journalistic purposes.

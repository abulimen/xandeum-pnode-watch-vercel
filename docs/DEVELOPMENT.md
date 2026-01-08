# Development Guide

This guide covers setup, coding standards, and development workflows for the Xandeum pNode Analytics Platform.

## Prerequisites

- **Node.js**: v18.17+ or v20+
- **npm**: v9+
- **Git**: For version control

## Quick Setup

```bash
# Clone repository
git clone https://github.com/abulimen/xandeum-analytics.git
cd xandeum-analytics

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

## Environment Configuration
 
Create `.env.local` with:
 
```env
# Required: Core Infrastructure
BASE_URL=https://analytics.xandeum.network
NEXT_PUBLIC_BASE_URL=https://analytics.xandeum.network

# Required: Seed node IPs (comma-separated)
NEXT_PUBLIC_PNODE_SEED_IPS=173.212.203.145,65.109.29.154,95.216.148.118

# Required: Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Required: AI & Analytics
GEMINI_API_KEY=your-gemini-key
LONGCAT_API_KEY=your-longcat-key
JUPITER_API_KEY=your-jupiter-key

# Optional: RPC Configuration
NEXT_PUBLIC_PNODE_RPC_PORT=6000
NEXT_PUBLIC_PNODE_RPC_ENDPOINT=/rpc

# Optional: Notifications (Brevo)
BREVO_API_KEY=your-brevo-key
ALERT_FROM_EMAIL=alerts@yourdomain.com
ALERT_FROM_NAME="pNode Watch"

# Optional: Push Notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:your@email.com

# Optional: Bots
TELEGRAM_BOT_TOKEN=your-telegram-token
DISCORD_BOT_TOKEN=your-discord-token
DISCORD_APP_ID=your-app-id
DISCORD_PUBLIC_KEY=your-public-key

# Optional: Security
CRON_SECRET=your-random-secret-key
```
 
### Supabase Setup
1. Create a new Supabase project.
2. Run the migration scripts in `scripts/*.sql` in the SQL Editor.
3. Get your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Settings > API).
 
### Generating VAPID Keys
 
```bash
npx web-push generate-vapid-keys
```
 
## Project Structure
 
```
xandeum-analytics/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── alerts/           # Alert subscription endpoints
│   │   ├── cron/             # Background job endpoints
│   │   ├── history/          # Historical data
│   │   ├── node-stats/       # Individual node stats
│   │   ├── prpc/             # pRPC proxy to seed nodes
│   │   └── solana/           # Solana blockchain queries
│   ├── analytics/page.tsx    # Analytics charts page
│   ├── guide/page.tsx        # User guide page
│   ├── leaderboard/page.tsx  # Leaderboard page
│   ├── map/page.tsx          # Geographic map page
│   ├── nodes/[id]/page.tsx   # Node details page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Dashboard home
├── components/
│   ├── alerts/               # Alert subscription UI
│   ├── analytics/            # Chart components
│   ├── comparison/           # Node comparison modal
│   ├── dashboard/            # Dashboard components
│   │   ├── FilterBar.tsx     # Search and filters
│   │   ├── NetworkStats.tsx  # Stats cards
│   │   ├── NodeTable.tsx     # Main data table
│   │   └── ...
│   ├── layout/               # Header, Footer
│   ├── map/                  # Map components
│   │   └── WorldMap.tsx      # react-simple-maps wrapper
│   └── ui/                   # shadcn/ui components
├── hooks/                    # Custom React hooks
├── lib/
│   ├── db/                   # Supabase client & schemas
│   │   └── index.ts          # DB connection
│   ├── services/             # Business logic
│   └── utils.ts              # Utility functions
├── scripts/                  # SQL Migrations
├── types/                    # TypeScript definitions
│   ├── pnode.ts              # Core PNode types
│   ├── issues.ts             # Issue/alert types
│   └── filters.ts            # Filter types
└── public/                   # Static assets
```

## Coding Standards

### TypeScript

All code must be TypeScript with strict type checking:

```typescript
// ✅ Good: Explicit types
interface Props {
    nodes: PNode[];
    onSelect: (node: PNode) => void;
}

// ❌ Bad: Implicit any
function processData(data) { ... }
```

### React Components

Use functional components with hooks:

```typescript
// ✅ Good: Functional component
export function NodeCard({ node }: { node: PNode }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <Card>
            <CardHeader>{node.id}</CardHeader>
            {/* ... */}
        </Card>
    );
}

// ❌ Bad: Class components
class NodeCard extends React.Component { ... }
```

### File Naming

- **Components**: PascalCase (`NodeTable.tsx`, `FilterBar.tsx`)
- **Hooks**: camelCase with `use` prefix (`useNodes.ts`, `useFilters.ts`)
- **Services**: camelCase with `Service` suffix (`prpcService.ts`)
- **Types**: camelCase (`pnode.ts`, `filters.ts`)

### Imports

Use absolute imports with `@/` prefix:

```typescript
// ✅ Good
import { Button } from '@/components/ui/button';
import { useNodes } from '@/hooks';
import { PNode } from '@/types/pnode';

// ❌ Bad
import { Button } from '../../../components/ui/button';
```

## Creating New Features

### 1. Add a New Page

```typescript
// app/new-page/page.tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NewPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header issueCount={0} />
            <main className="flex-1 container px-4 py-6">
                {/* Page content */}
            </main>
            <Footer />
        </div>
    );
}
```

### 2. Add a New Hook

```typescript
// hooks/useNewFeature.ts
import { useQuery } from '@tanstack/react-query';

export function useNewFeature(params: Params) {
    return useQuery({
        queryKey: ['newFeature', params],
        queryFn: () => fetchNewFeature(params),
        staleTime: 30_000,
    });
}
```

### 3. Add a New API Route

```typescript
// app/api/new-route/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Handle request
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed' },
            { status: 500 }
        );
    }
}
```

### 4. Add a New Service

```typescript
// lib/services/newService.ts
export async function newOperation(params: Params): Promise<Result> {
    // Implementation
}

export const newService = {
    newOperation,
};
```

## UI Components

### Using shadcn/ui

Components are in `components/ui/`. Add new components:

```bash
npx shadcn@latest add [component-name]
```

### Custom UI Components

| Component | Purpose |
|-----------|---------|
| `StatusBadge` | Online/offline/degraded indicator |
| `VersionBadge` | Version type with warnings |
| `InfoTooltip` | Help tooltips |
| `ErrorState` | Error display with retry |
| `ProgressBar` | Storage utilization |
| `TrendIndicator` | Up/down trends |

## State Management

### TanStack Query

All async data uses TanStack Query for caching:

```typescript
const { nodes, isLoading, error, refetch } = useNodes();
```

### Local State

Use React useState for component-local state:

```typescript
const [filters, setFilters] = useState<FilterState>(initialFilters);
```

## Debugging

### Development Tools

1. **React DevTools**: Inspect component tree
2. **TanStack Query DevTools**: (add to providers.tsx)
3. **Browser DevTools**: Network, console

### Logging

```typescript
// Service logs include prefix
console.log('[prpcService] Nodes: 150 online, 5 degraded, 10 offline');
console.log('[geoService] Loaded 174 cached locations');
```

### Mock Data Mode

Enable mock data when pRPC API is unavailable:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

## Testing

### Manual Testing Checklist

- [ ] Dashboard loads with node table
- [ ] Search and filters work
- [ ] Sort by all columns
- [ ] Node details page loads
- [ ] Map shows node markers
- [ ] Analytics charts render
- [ ] Dark/light mode toggle
- [ ] Mobile responsive layout
- [ ] Alert subscription flow

## Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Troubleshooting

### Common Issues

**1. "All seed nodes failed"**
- Check `NEXT_PUBLIC_PNODE_SEED_IPS` is set
- Verify seed nodes are reachable

**2. Map not loading**
- Check for CORS errors
- Verify react-simple-maps is installed

**3. Geolocation not working**
- Check rate limits on geo APIs
- Clear localStorage cache

**4. Alerts not sending**
- Verify `BREVO_API_KEY` is set
- Check email format

### Clear Caches

```javascript
// In browser console
localStorage.removeItem('geo-cache');
```

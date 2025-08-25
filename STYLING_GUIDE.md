# Styling Guide

## 🎯 Core Rules

### Roundedness
- Always use: `rounded-lg` for cards, modals
- Always use: `rounded-sm` for buttons, inputs
- Always use: `rounded` for badges, pills

### Spacing
- Cards: `p-6` for content, `p-4` for headers
- Buttons: `px-4 py-2` (handled by size variants)
- Badges: `px-2 py-1`
- Page margins: `container mx-auto px-4 py-8`

### Backgrounds & Text
- **Page background**: `bg-background text-foreground`
- **Cards**: `bg-secondary text-secondary-foreground`
- **Badges/Pills**: `bg-muted text-muted-foreground border`
- **Buttons**: Use variant system (`secondary`, `default`, etc.)

### Typography
- Addresses: `text-xs font-mono`
- Card titles: `text-lg font-semibold`
- Labels: `text-sm text-muted-foreground`
- Values: `text-sm font-medium text-secondary-foreground`

### Borders
- Cards: `border` (uses theme border color)
- Badges: `border` for subtle definition
- Focus states: `focus:ring-2 focus:ring-ring`

### Layout
- Grid gaps: `gap-6` for card grids
- Content spacing: `space-y-2` for info items, `space-y-6` for sections
- Responsive: `md:grid-cols-2 lg:grid-cols-3`


## 📦 Install Components

Add new shadcn/ui components:
```bash
npx shadcn@latest add [component-name]
```

**Common components:**
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tooltip
```

## 📁 File Structure
- `src/components/ui/` - shadcn/ui components
- `src/components/common/` - Custom shared components
- `src/components/layout/` - Layout components
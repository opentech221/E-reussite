# 🎨 Guide de Style - E-Réussite

## 🎯 Principes de design

### 1. Clarté avant tout
- Interface intuitive et facile à naviguer
- Hiérarchie visuelle claire
- Espaces blancs généreux

### 2. Cohérence
- Palette de couleurs unifiée
- Typographie harmonieuse
- Spacing système uniforme

### 3. Performance
- Animations fluides (60fps)
- Temps de chargement < 3s
- Responsive sur tous devices

---

## 🎨 Palette de couleurs

### Couleurs principales
```css
/* Primary - Bleu */
primary: hsl(221, 83%, 53%)  /* #2563eb */
primary-hover: hsl(221, 83%, 45%)
primary-light: hsl(221, 83%, 95%)

/* Accent - Complémentaire */
accent: hsl(340, 75%, 55%)  /* Rose/Pink */
accent-hover: hsl(340, 75%, 48%)
accent-light: hsl(340, 75%, 95%)

/* Neutrals */
slate-50: #f8fafc
slate-100: #f1f5f9
slate-200: #e2e8f0
slate-300: #cbd5e1
slate-400: #94a3b8
slate-500: #64748b
slate-600: #475569
slate-700: #334155
slate-800: #1e293b
slate-900: #0f172a
```

### Couleurs sémantiques
```css
/* Success */
green-500: #22c55e
green-600: #16a34a

/* Warning */
yellow-500: #eab308
yellow-600: #ca8a04

/* Error/Danger */
red-500: #ef4444
red-600: #dc2626

/* Info */
blue-500: #3b82f6
blue-600: #2563eb
```

### Gradients signature
```css
/* Gradient primary */
bg-gradient-to-r from-primary to-accent

/* Gradient héro */
bg-gradient-to-br from-primary via-accent to-primary

/* Gradient subtil */
bg-gradient-to-r from-primary/10 to-accent/10

/* Gradients par plan */
Journalier: from-blue-500 to-cyan-500
Hebdomadaire: from-purple-500 to-pink-500
Mensuel: from-yellow-500 via-orange-500 to-red-500
```

---

## 📝 Typographie

### Font families
```css
/* Headings */
font-heading: 'Poppins', 'Inter', sans-serif

/* Body */
font-body: 'Inter', 'Roboto', sans-serif

/* Mono */
font-mono: 'JetBrains Mono', 'Fira Code', monospace
```

### Scale typographique
```css
/* Display - Héros de page */
text-7xl: 4.5rem (72px) / line-height: 1
text-6xl: 3.75rem (60px) / line-height: 1
text-5xl: 3rem (48px) / line-height: 1

/* Headings */
text-4xl: 2.25rem (36px) / line-height: 1.1
text-3xl: 1.875rem (30px) / line-height: 1.2
text-2xl: 1.5rem (24px) / line-height: 1.3
text-xl: 1.25rem (20px) / line-height: 1.4

/* Body */
text-lg: 1.125rem (18px) / line-height: 1.5
text-base: 1rem (16px) / line-height: 1.5
text-sm: 0.875rem (14px) / line-height: 1.5
text-xs: 0.75rem (12px) / line-height: 1.5
```

### Font weights
```css
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
font-black: 900
```

### Exemples d'usage
```jsx
/* Page title */
<h1 className="text-5xl md:text-6xl font-bold font-heading">

/* Section title */
<h2 className="text-3xl md:text-4xl font-bold">

/* Card title */
<h3 className="text-xl font-semibold">

/* Body text */
<p className="text-base text-slate-600">

/* Small text */
<span className="text-sm text-slate-500">
```

---

## 📐 Spacing System

### Scale
```css
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
32: 8rem (128px)
```

### Usage recommandé
```jsx
/* Entre sections */
space-y-16 ou space-y-20

/* Entre éléments d'une section */
space-y-8 ou space-y-12

/* Entre éléments d'un groupe */
space-y-4 ou space-y-6

/* Entre éléments inline */
gap-2 ou gap-3

/* Padding cards */
p-6 ou p-8 (selon importance)

/* Margin sections */
mb-12 ou mb-16
```

---

## 🎭 Effets visuels

### Shadows
```css
/* Subtile */
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)

/* Standard */
shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)

/* Élevé */
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)

/* Maximum */
shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)

/* Avec couleur */
shadow-lg shadow-primary/30
shadow-xl shadow-purple-500/20
```

### Borders
```css
/* Subtile */
border border-slate-200

/* Standard */
border-2 border-slate-300

/* Accent */
border-2 border-primary/20

/* Focus */
focus:border-primary focus:ring-2 focus:ring-primary/20
```

### Border radius
```css
rounded-none: 0px
rounded-sm: 0.125rem (2px)
rounded: 0.25rem (4px)
rounded-md: 0.375rem (6px)
rounded-lg: 0.5rem (8px)
rounded-xl: 0.75rem (12px)
rounded-2xl: 1rem (16px)
rounded-3xl: 1.5rem (24px)
rounded-full: 9999px
```

### Glassmorphism
```jsx
className="bg-white/95 backdrop-blur-xl border border-slate-200/50"
```

### Gradients avec overlay
```jsx
<div className="relative bg-gradient-to-br from-primary via-accent to-primary">
  <div className="absolute inset-0 bg-black/10"></div>
  <div className="relative">{/* Contenu */}</div>
</div>
```

---

## 🎬 Animations

### Transitions de base
```jsx
/* Standard */
transition-all duration-300

/* Rapide */
transition-all duration-150

/* Lente */
transition-all duration-500
```

### Hover effects
```jsx
/* Scale */
hover:scale-105 transition-transform duration-300

/* Shadow */
hover:shadow-xl transition-shadow duration-300

/* Couleur */
hover:text-primary transition-colors duration-300

/* Combiné */
hover:scale-105 hover:shadow-xl transition-all duration-300
```

### Framer Motion - Entrées
```jsx
/* Fade in */
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>

/* Slide from bottom */
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>

/* Slide from left */
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
>

/* Scale */
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6 }}
>
```

### Framer Motion - Interactions
```jsx
/* Hover */
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>

/* Layout animations */
<motion.div layoutId="navbar-indicator" />
```

### Framer Motion - Sorties
```jsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🧩 Composants réutilisables

### Button variants
```jsx
/* Primary */
<Button className="bg-gradient-to-r from-primary to-accent text-white">

/* Secondary */
<Button variant="outline" className="border-primary/30 text-primary">

/* Ghost */
<Button variant="ghost" className="hover:bg-primary/10">

/* Destructive */
<Button variant="destructive" className="bg-gradient-to-r from-red-500 to-pink-600">
```

### Card variants
```jsx
/* Standard */
<Card className="border-2 border-slate-200 shadow-lg">

/* Accent */
<Card className="border-2 border-primary/20 shadow-2xl">

/* Hover */
<Card className="hover:shadow-xl hover:scale-105 transition-all duration-300">
```

### Badge variants
```jsx
/* Success */
<span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">

/* Warning */
<span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">

/* Info */
<span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">

/* Gradient */
<span className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold">
```

---

## 📱 Responsive Design

### Approche Mobile-First
```jsx
/* Mobile par défaut */
<div className="text-4xl">

/* Tablet et + */
<div className="text-4xl md:text-5xl">

/* Desktop et + */
<div className="text-4xl md:text-5xl lg:text-6xl">
```

### Grilles responsive
```jsx
/* 1 col mobile, 2 cols tablet, 3 cols desktop */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

/* 1 col mobile, 3 cols desktop avec sidebar */
<div className="grid lg:grid-cols-3 gap-8">
  <div className="lg:col-span-1">{/* Sidebar */}</div>
  <div className="lg:col-span-2">{/* Main */}</div>
</div>
```

### Navigation responsive
```jsx
/* Desktop visible, mobile caché */
<div className="hidden md:flex">

/* Mobile visible, desktop caché */
<div className="md:hidden">

/* Adaptations */
<nav className="h-16 md:h-20">
<div className="text-xl md:text-2xl">
```

---

## ♿ Accessibilité

### Contraste des couleurs
- Texte normal : ratio minimum 4.5:1
- Texte large : ratio minimum 3:1
- Éléments interactifs : ratio minimum 3:1

### Exemples conformes
```jsx
/* ✅ Bon */
<p className="text-slate-700">  {/* Sur fond blanc */}
<span className="text-white">  {/* Sur fond primary */}

/* ❌ Mauvais */
<p className="text-slate-300">  {/* Sur fond blanc - trop faible */}
```

### Navigation au clavier
```jsx
/* Focus visible */
<button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">

/* Skip links */
<a href="#main-content" className="sr-only focus:not-sr-only">
  Aller au contenu principal
</a>
```

### ARIA labels
```jsx
<button aria-label="Fermer le menu">
  <X className="w-6 h-6" />
</button>

<img src="..." alt="Description détaillée" />

<nav aria-label="Navigation principale">
```

---

## 🎯 Best Practices

### Performance
1. ✅ Lazy load images : `loading="lazy"`
2. ✅ Code splitting : React.lazy()
3. ✅ Memoization : React.memo(), useMemo()
4. ✅ Debounce search inputs
5. ✅ Optimize animations : prefer transform/opacity

### SEO
1. ✅ Semantic HTML : `<nav>`, `<main>`, `<article>`
2. ✅ Helmet pour meta tags
3. ✅ Alt texts sur images
4. ✅ Heading hierarchy (h1 → h2 → h3)

### Maintenabilité
1. ✅ Composants réutilisables
2. ✅ Props bien typées (PropTypes ou TypeScript)
3. ✅ Nommage cohérent (camelCase, PascalCase)
4. ✅ Comments pour logique complexe
5. ✅ Constantes extraites (couleurs, sizes)

---

## 📚 Ressources

### Design Inspiration
- [Dribbble](https://dribbble.com)
- [Behance](https://behance.net)
- [Awwwards](https://awwwards.com)

### Outils
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Framer Motion Docs](https://framer.com/motion)
- [Lucide Icons](https://lucide.dev)
- [Coolors](https://coolors.co) - Palettes

### Accessibilité
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE](https://wave.webaim.org)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## 📝 Changelog

### v2.0.0 - 10 octobre 2025
- ✨ Modernisation complète du design
- 🎨 Nouveau système de gradients
- 🎬 Animations Framer Motion
- 📱 Responsive design optimisé
- ♿ Accessibilité WCAG AA

---

© 2025 E-Réussite - Guide de style v2.0

# HarakaPay Styling Guide

## Style Philosophy

The design for HarakaPay should feel enterprise-grade, minimal, trustworthy, and futuristic. Prioritize a strong grid layout, generous whitespace, modern sans-serif typography, and abstract data-inspired graphics. Use gradients, geometric shapes, and subtle animations instead of stock photos. Always communicate authority and innovation without overwhelming users with visuals.

## Key Principles

- **Clean, minimalistic but professional layouts**
- **Dark mode or gradient-heavy hero sections**
- **Abstract 3D/2D illustrations**: waves, spheres, geometric shapes, network diagrams
- **Trust-building design**: logos of clients, "enterprise-ready" messaging, scalability graphics
- **Product-focused**: Emphasize products, solutions, and documentation over flashy visuals
- **Apple’s Human Interface Guidelines**
- **Font**: IBM Plex
- **Lightning Design System**
- **Target Audience**: Developers, CTOs, IT managers, enterprise clients—people who value clarity and authority over playfulness
- **Layout**: Grid-based, spacious, consistent spacing system. No clutter; everything has a purpose
- **Inspirations**: Salesforce, IBM, AWS websites

## Color Palette

- **Base**: Neutral (white, light gray)
- **Primary**: Brand Color (#0080ff blue, rgba(0,128,255,255)) used sparingly

## Design Tokens Implementation

To ensure consistency and scalability, HarakaPay uses design tokens for core style values. Design tokens are named variables that store visual design attributes and can be used across code, design tools, and documentation.

### Core Tokens

- **Colors**
	- `color-base-bg`: #ffffff (white)
	- `color-base-bg-alt`: #f5f6fa (light gray)
	- `color-primary`: #0080ff (blue)
	- `color-primary-rgba`: rgba(0,128,255,1)
	- `color-text-main`: #222b45
	- `color-text-muted`: #6c757d

- **Typography**
	- `font-family-base`: 'IBM Plex', 'Helvetica Neue', Arial, sans-serif
	- `font-size-base`: 16px
	- `font-size-heading`: 2rem
	- `font-weight-normal`: 400
	- `font-weight-bold`: 700

- **Spacing**
	- `space-xs`: 4px
	- `space-sm`: 8px
	- `space-md`: 16px
	- `space-lg`: 32px
	- `space-xl`: 64px

- **Border Radius**
	- `radius-sm`: 4px
	- `radius-md`: 8px
	- `radius-lg`: 16px

- **Grid**
	- `grid-gap`: 24px
	- `grid-columns`: 12

### Usage

Design tokens should be defined in a central file (e.g., `src/styles/tokens.css`, `tokens.ts`, or a JSON file for use in both CSS and JS/TS). Use CSS custom properties, SCSS variables, or JS constants to reference tokens throughout your components and stylesheets.

Example (CSS custom properties):

```css
:root {
	--color-base-bg: #ffffff;
	--color-primary: #0080ff;
	--font-family-base: 'IBM Plex', 'Helvetica Neue', Arial, sans-serif;
	--space-md: 16px;
	--radius-md: 8px;
}
```

Tokens should be used for all UI elements, including backgrounds, text, borders, spacing, and layout. This approach enables easy theming (e.g., dark mode), rapid design changes, and consistent branding.

## Summary

HarakaPay’s styling should always prioritize clarity, scalability, and trust. The design system is built for complex product ecosystems and enterprise clients, inspired by industry leaders and best practices.

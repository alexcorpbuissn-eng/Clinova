---
name: Warm Healthcare System
colors:
  surface: '#f9faf6'
  surface-dim: '#d9dad7'
  surface-bright: '#f9faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f0'
  surface-container: '#edeeea'
  surface-container-high: '#e7e9e5'
  surface-container-highest: '#e2e3df'
  on-surface: '#1a1c1a'
  on-surface-variant: '#404943'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#f0f1ed'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#0e6c4a'
  on-secondary: '#ffffff'
  secondary-container: '#a0f4c8'
  on-secondary-container: '#19724f'
  tertiary: '#364d3c'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d6553'
  on-tertiary-container: '#c6e1ca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#a0f4c8'
  secondary-fixed-dim: '#85d7ad'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#cee9d3'
  tertiary-fixed-dim: '#b3cdb7'
  on-tertiary-fixed: '#092012'
  on-tertiary-fixed-variant: '#354c3b'
  background: '#f9faf6'
  on-background: '#1a1c1a'
  surface-variant: '#e2e3df'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  sidebar-width: 260px
---

## Brand & Style
The design system focuses on "Compassionate Efficiency," blending the warmth of a wellness retreat with the precision of a modern medical facility. It is specifically designed to reduce "white-coat hypertension" for patients while providing a low-fatigue environment for clinic staff.

The aesthetic is a hybrid of **Minimalism** and **Tactile** design. It prioritizes clarity through generous whitespace and a "soft-touch" interface. Every interaction should feel intentional and gentle, moving away from the clinical coldness often found in healthcare software. The emotional response should be one of safety, reliability, and calm.

## Colors
The palette is built on a foundation of organic greens and warm whites to evoke nature and vitality. 

- **Primary & Secondary Greens:** Used for primary actions and brand presence. They are deep enough to pass accessibility standards while maintaining a "botanical" feel.
- **Warm White:** The primary background color. It replaces standard #FFFFFF to reduce eye strain for staff looking at screens for 8+ hours.
- **Gentle Teal Accents:** Reserved for interactive highlights, active states, and specific call-to-actions like "Book Appointment."
- **Functional Colors:** Success and confirmation states use the system's natural greens. Alerts use a soft coral-terracotta rather than a harsh red to keep the environment calm even during errors.

## Typography
The typography system uses a dual-font approach to maximize both friendliness and accessibility.

1.  **Plus Jakarta Sans** is used for headlines and UI labels. Its soft, rounded terminals provide a welcoming, modern character.
2.  **Atkinson Hyperlegible Next** is used for all body text, patient records, and data-heavy tables. It is specifically engineered for high legibility, ensuring clinic staff can distinguish between similar characters (like 'I', 'l', and '1') quickly and without error.

Maintain generous line heights (1.5x for body) to ensure a comfortable reading rhythm, especially in dense medical histories or schedules.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a soft-block approach. 

- **Staff Dashboard:** Uses a 12-column grid with a persistent left sidebar. Content is organized into "White Panels" (surfaces) that sit on the warm-white background.
- **Patient Booking Flow:** Uses a centered, 6-column "Narrow Path" layout to minimize distractions and cognitive load during the booking process.
- **Rhythm:** All spacing is based on an 8px baseline. Use 16px (2 units) for internal component padding and 24px-32px (3-4 units) for sectional spacing to maintain a sense of "airiness."
- **Responsive:** On mobile, margins shrink to 16px, and multi-column forms reflow into a single column. The sidebar collapses into a bottom navigation bar for easier thumb reach.

## Elevation & Depth
This design system avoids high-contrast shadows to prevent a "heavy" or cluttered feel.

- **Tonal Layers:** Depth is primarily created through subtle shifts in background color. The base page is `Warm White`, and interactive containers use a pure white surface.
- **Ambient Shadows:** Shadows are extremely soft and tinted with the primary green (e.g., `rgba(45, 106, 79, 0.08)`). They have a large blur radius (16px+) and zero spread, making elements appear to gently float.
- **Interactive Depth:** When a card (like an appointment) is hovered, it should slightly lift (move -2px Y) and the shadow should soften further.
- **Modals:** Use a heavy backdrop blur (12px) with a semi-transparent warm-white overlay to keep the context visible but focused.

## Shapes
The shape language is consistently **Rounded**. Sharp corners are strictly avoided to maintain the "approachable" brand personality.

- **Standard Elements:** Buttons, input fields, and status badges use a `0.5rem` radius.
- **Containers:** Appointment cards and doctor profile cards use `1rem` (Large) to emphasize a soft, friendly container.
- **Selection States:** Time slot pickers and active sidebar items use `0.75rem`.
- **Icons:** Icons should feature rounded caps and corners. Avoid "razor-thin" strokes; use a consistent 2px stroke weight for better visibility.

## Components

### Appointment Cards & Status Badges
Cards use a white surface with a 1px `tertiary_green` border. Status badges are pill-shaped with low-opacity backgrounds (e.g., a "Confirmed" badge has dark green text on a light green background).

### Time Slot Pickers
Slots are presented as rounded rectangles. "Available" slots have a light green border; "Selected" slots fill with `primary_color` and use white text. Slots that are "Unavailable" are not struck out with a harsh 'X' but are simply desaturated with a 40% opacity.

### Weekly Schedule Grids
For clinic staff, the grid uses subtle 1px dividers in `tertiary_green`. Appointments are color-coded by "Visit Type" using a palette of soft pastels (Lavender, Sage, Peach) to allow for quick visual scanning without overwhelming the user.

### OTP & Login
The OTP input features large, 56px high individual character boxes with a `0.5rem` radius. Focus states use a 2px `accent_teal` ring. The "Resend Code" link is styled as a soft secondary button rather than plain text to make it easily tappable.

### Sidebar Navigation
The sidebar uses a semi-transparent treatment over the base background. Active items are indicated by a soft teal "pill" shape behind the label and icon, rather than just a text color change.

### Doctor Cards
These include a circular avatar with a 3px warm-white border. Key information (Specialty, Rating) is clearly tiered using `label-sm` for categories and `body-md` for data.
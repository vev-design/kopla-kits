/** Brand-settable gallery presentation. Mechanics remain in Carousel.tsx. */
export const carouselTheme = {
  /** Default distance between slides; shared by layout and width calculation. */
  gap: '1rem',
  /** Default slide and track corner treatment from the kit. */
  radius: 'var(--radius, 0.75rem)',
  /** Surface and ink for data-driven slides. Authored children own their contents. */
  background: 'var(--card)',
  textColor: 'var(--card-foreground)',
  /** Controls keep a 44px target; brands can change their visual treatment here. */
  controlRadius: '9999px',
  controlBackground: 'var(--background)',
  controlColor: 'var(--foreground)',
};

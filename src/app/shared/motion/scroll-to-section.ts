export function scrollToSection(document: Document, sectionId: string): void {
  const reduced = document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById(sectionId)?.scrollIntoView({
    behavior: reduced ? 'auto' : 'smooth',
    block: 'start',
  });
}

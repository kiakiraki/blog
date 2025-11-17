document.addEventListener('DOMContentLoaded', () => {
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll('h2, h3, h4');

  if (tocLinks.length === 0 || headings.length === 0) return;

  // Create intersection observer for scroll-linked highlighting
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const tocLink = document.querySelector(`[data-heading-id="${id}"]`);

        if (entry.isIntersecting) {
          // Remove active class from all links
          tocLinks.forEach(link => link.classList.remove('active'));
          // Add active class to current link
          if (tocLink) {
            tocLink.classList.add('active');
          }
        }
      });
    },
    {
      rootMargin: '-20% 0% -35% 0%',
      threshold: 0,
    }
  );

  // Observe all headings
  headings.forEach(heading => {
    if (heading.id) {
      observer.observe(heading);
    }
  });

  // Smooth scroll for TOC links
  tocLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('data-heading-id');

      if (targetId) {
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const headerOffset = 80; // Account for sticky header
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }
    });
  });
});

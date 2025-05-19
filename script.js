
document.addEventListener('DOMContentLoaded', function() {
  // Set current year for footer copyright
  document.getElementById('current-year').textContent = new Date().getFullYear();

  // Ambient audio controls
  const ambientSound = document.getElementById('ambient-sound');
  const audioToggle = document.getElementById('audio-toggle');
  let audioPlaying = false;

  audioToggle.addEventListener('click', function() {
    if (audioPlaying) {
      ambientSound.pause();
      audioToggle.style.backgroundColor = '#fff';
      audioPlaying = false;
    } else {
      ambientSound.volume = 0.2; // Set a low volume
      ambientSound.play().catch(e => console.error("Audio play failed:", e));
      audioToggle.style.backgroundColor = '#f3f2f0';
      audioPlaying = true;
    }
  });

  // Intersection Observer for animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  // For gallery items
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryItemsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  galleryItems.forEach((item, index) => {
    // Add staggered delay to each item
    item.style.transitionDelay = `${index * 0.1}s`;
    galleryItemsObserver.observe(item);
  });

  // For intro sections
  const introSections = document.querySelectorAll('.gallery-intro, .about-content');
  const introObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  introSections.forEach(section => {
    introObserver.observe(section);
  });

  // Add animation delay to about text paragraphs
  const aboutParagraphs = document.querySelectorAll('.about-text p');
  aboutParagraphs.forEach((p, index) => {
    p.style.setProperty('--index', index);
  });

  // Lightbox functionality
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-description');
  const lightboxDate = document.getElementById('lightbox-date');
  const closeLightbox = document.querySelector('.close-lightbox');
  const prevButton = document.getElementById('prev-image');
  const nextButton = document.getElementById('next-image');
  const artworks = document.querySelectorAll('.artwork');
  let currentImageIndex = 0;

  // Open lightbox when artwork is clicked
  artworks.forEach((artwork, index) => {
    artwork.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  function openLightbox(index) {
    const artwork = artworks[index];
    const image = artwork.querySelector('img');
    const title = artwork.querySelector('h3').textContent;
    const description = artwork.querySelector('.description').textContent;
    const date = artwork.querySelector('.date').textContent;

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = description;
    lightboxDate.textContent = date;
    
    currentImageIndex = index;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
  }

  function closeLightboxModal() {
    lightbox.classList.remove('active');
    setTimeout(() => {
      lightboxImage.src = '';
      document.body.style.overflow = ''; // Re-enable scrolling
    }, 500);
  }

  closeLightbox.addEventListener('click', closeLightboxModal);

  // Close lightbox when clicking outside the content
  lightbox.addEventListener('click', function(event) {
    if (event.target === lightbox) {
      closeLightboxModal();
    }
  });

  // Navigate between images
  prevButton.addEventListener('click', () => {
    let newIndex = currentImageIndex - 1;
    if (newIndex < 0) newIndex = artworks.length - 1;
    openLightbox(newIndex);
  });

  nextButton.addEventListener('click', () => {
    let newIndex = currentImageIndex + 1;
    if (newIndex >= artworks.length) newIndex = 0;
    openLightbox(newIndex);
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(event) {
    if (!lightbox.classList.contains('active')) return;
    
    if (event.key === 'Escape') {
      closeLightboxModal();
    } else if (event.key === 'ArrowLeft') {
      prevButton.click();
    } else if (event.key === 'ArrowRight') {
      nextButton.click();
    }
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 80; // Adjust based on your header height
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});

import images from '../images/*';

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Lazy loading for images
    const galleryImages = document.querySelectorAll('.gallery-image');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    galleryImages.forEach(img => {
        imageObserver.observe(img);
    });

    // Add subtle parallax effect to gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    window.addEventListener('scroll', () => {
        galleryItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
            
            if (isVisible) {
                const speed = 0.1;
                const yPos = -(window.scrollY * speed);
                item.style.transform = `translateY(${yPos}px)`;
            }
        });
    });
}); 
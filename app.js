// Photo data
const photosData = {
  "photos": [
    {
      "id": 1,
      "title": "Morning Light",
      "thumbnail": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
      "caption": "The first light of dawn through kitchen curtains, caught between sleep and waking. A moment imperfect in its blur, yet beautiful in its honesty."
    },
    {
      "id": 2,
      "title": "Forgotten Corner",
      "thumbnail": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=800&fit=crop",
      "caption": "A dusty corner where memories collect like fallen leaves. The shadows dance with stories untold, preserved in their imperfect frame."
    },
    {
      "id": 3,
      "title": "Grandmother's Hands",
      "thumbnail": "https://images.unsplash.com/photo-1559166631-ef208440c75a?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1559166631-ef208440c75a?w=1200&h=800&fit=crop",
      "caption": "Weathered hands that have held countless moments. The slight motion blur captures the constant movement of love through generations."
    },
    {
      "id": 4,
      "title": "Rain on Glass",
      "thumbnail": "https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=1200&h=800&fit=crop",
      "caption": "Droplets on window glass, distorting the world beyond. Sometimes the imperfection reveals more truth than crystal clarity ever could."
    },
    {
      "id": 5,
      "title": "Sunday Afternoon",
      "thumbnail": "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=1200&h=800&fit=crop",
      "caption": "Light streaming through old blinds, creating patterns on the wall. A quiet moment captured in imperfect exposure, yet perfect in its peace."
    },
    {
      "id": 6,
      "title": "Child's Laughter",
      "thumbnail": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=800&fit=crop",
      "caption": "Motion blur from unbridled joy. The camera couldn't keep up with pure happiness, and perhaps that's exactly as it should be."
    },
    {
      "id": 7,
      "title": "Empty Chair",
      "thumbnail": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop",
      "caption": "The chair where she used to sit, now holding only memory and afternoon shadows. Absence speaks as loudly as presence ever did."
    },
    {
      "id": 8,
      "title": "Market Day",
      "thumbnail": "https://images.unsplash.com/photo-1508424943777-48d56c5a3e18?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1508424943777-48d56c5a3e18?w=1200&h=800&fit=crop",
      "caption": "Bustling market scene, slightly overexposed but capturing the warmth of human connection. Sometimes technical imperfection preserves emotional truth."
    },
    {
      "id": 9,
      "title": "Night Walk",
      "thumbnail": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&h=800&fit=crop",
      "caption": "Street lights creating halos in the mist. The grain and blur of night photography becomes poetry in motion, beauty in imperfection."
    },
    {
      "id": 10,
      "title": "Kitchen Table",
      "thumbnail": "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=1200&h=800&fit=crop",
      "caption": "The table where a thousand meals were shared, scratched and worn but still sturdy. Every mark tells a story of gathered loved ones."
    },
    {
      "id": 11,
      "title": "Book Pages",
      "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop",
      "caption": "Yellowed pages of a beloved book, dog-eared and coffee-stained. The imperfections are love letters from countless readings."
    },
    {
      "id": 12,
      "title": "Garden Path",
      "thumbnail": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
      "fullsize": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=800&fit=crop",
      "caption": "A winding path through overgrown garden, slightly out of focus but leading somewhere beautiful. The journey matters more than perfect clarity."
    }
  ]
};

// Application state
let currentPhotoIndex = 0;
let isModalOpen = false;
let isAudioPlaying = false;

// DOM Elements
const galleryGrid = document.getElementById('gallery-grid');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalCaption = document.getElementById('modal-photo-caption');
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');
const audioToggle = document.getElementById('audio-toggle');
const ambientAudio = document.getElementById('ambient-audio');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadGallery();
    setupEventListeners();
    setupIntersectionObserver();
});

// Load gallery photos
function loadGallery() {
    const photos = photosData.photos;
    
    photos.forEach((photo, index) => {
        const galleryItem = createGalleryItem(photo, index);
        galleryGrid.appendChild(galleryItem);
    });
}

// Create gallery item element
function createGalleryItem(photo, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-index', index);
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View ${photo.title}`);
    
    // Create preview caption (first 60 characters)
    const previewCaption = photo.caption.length > 60 
        ? photo.caption.substring(0, 60) + '...' 
        : photo.caption;
    
    item.innerHTML = `
        <img 
            class="gallery-image" 
            src="${photo.thumbnail}" 
            alt="${photo.title}"
            loading="lazy"
        >
        <div class="gallery-caption">
            <h3 class="gallery-title">${photo.title}</h3>
            <p class="gallery-preview">${previewCaption}</p>
        </div>
    `;
    
    // Add click and keyboard event listeners
    item.addEventListener('click', () => openModal(index));
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(index);
        }
    });
    
    return item;
}

// Setup event listeners
function setupEventListeners() {
    // Modal event listeners
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    modalPrev.addEventListener('click', showPreviousPhoto);
    modalNext.addEventListener('click', showNextPhoto);
    
    // Audio toggle
    audioToggle.addEventListener('click', toggleAudio);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
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
}

// Intersection Observer for fade-in animations
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe gallery items for fade-in effect
    setTimeout(() => {
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(item);
        });
    }, 100);
}

// Modal functions
function openModal(index) {
    currentPhotoIndex = index;
    const photo = photosData.photos[index];
    
    isModalOpen = true;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load full-size image
    modalImage.src = photo.fullsize;
    modalImage.alt = photo.title;
    modalTitle.textContent = photo.title;
    modalCaption.textContent = photo.caption;
    
    // Update navigation buttons
    updateModalNavigation();
    
    // Focus management
    modalClose.focus();
}

function closeModal() {
    isModalOpen = false;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Return focus to the gallery item that was clicked
    const galleryItem = document.querySelector(`[data-index="${currentPhotoIndex}"]`);
    if (galleryItem) {
        galleryItem.focus();
    }
}

function showPreviousPhoto() {
    if (currentPhotoIndex > 0) {
        currentPhotoIndex--;
        updateModalContent();
    }
}

function showNextPhoto() {
    if (currentPhotoIndex < photosData.photos.length - 1) {
        currentPhotoIndex++;
        updateModalContent();
    }
}

function updateModalContent() {
    const photo = photosData.photos[currentPhotoIndex];
    
    // Add fade transition
    modalImage.style.opacity = '0';
    
    setTimeout(() => {
        modalImage.src = photo.fullsize;
        modalImage.alt = photo.title;
        modalTitle.textContent = photo.title;
        modalCaption.textContent = photo.caption;
        modalImage.style.opacity = '1';
    }, 150);
    
    updateModalNavigation();
}

function updateModalNavigation() {
    modalPrev.disabled = currentPhotoIndex === 0;
    modalNext.disabled = currentPhotoIndex === photosData.photos.length - 1;
}

// Audio functions
function toggleAudio() {
    if (isAudioPlaying) {
        ambientAudio.pause();
        audioToggle.classList.remove('active');
        isAudioPlaying = false;
    } else {
        // Create a simple ambient sound using Web Audio API fallback
        if (ambientAudio.canPlayType('audio/wav')) {
            ambientAudio.play().catch(() => {
                // Fallback if audio fails to play
                console.log('Audio playback failed - this is normal in some browsers');
            });
        }
        audioToggle.classList.add('active');
        isAudioPlaying = true;
    }
}

// Keyboard navigation
function handleKeyboardNavigation(e) {
    if (!isModalOpen) return;
    
    switch(e.key) {
        case 'Escape':
            closeModal();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            showPreviousPhoto();
            break;
        case 'ArrowRight':
            e.preventDefault();
            showNextPhoto();
            break;
    }
}

// Image lazy loading fallback for older browsers
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Smooth reveal animation for elements
function revealElements() {
    const elements = document.querySelectorAll('.gallery-item, .about-content');
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('revealed');
        }, index * 100);
    });
}

// Initialize reveal animations after page load
window.addEventListener('load', () => {
    setTimeout(revealElements, 500);
});

// Handle image loading errors
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.style.backgroundColor = '#f0f0f0';
        e.target.style.display = 'flex';
        e.target.style.alignItems = 'center';
        e.target.style.justifyContent = 'center';
        e.target.innerHTML = '<span style="color: #999; font-size: 14px;">Image unavailable</span>';
    }
}, true);

// Preload next/previous images in modal for smoother experience
function preloadAdjacentImages(index) {
    const photos = photosData.photos;
    
    // Preload previous image
    if (index > 0) {
        const prevImg = new Image();
        prevImg.src = photos[index - 1].fullsize;
    }
    
    // Preload next image
    if (index < photos.length - 1) {
        const nextImg = new Image();
        nextImg.src = photos[index + 1].fullsize;
    }
}

// Enhanced modal opening with preloading
function openModalEnhanced(index) {
    openModal(index);
    preloadAdjacentImages(index);
}

// Add touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    if (!isModalOpen) return;
    
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left - next photo
            showNextPhoto();
        } else {
            // Swiped right - previous photo
            showPreviousPhoto();
        }
    }
}

// Add touch event listeners
document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Add subtle parallax effect to header (optional enhancement)
window.addEventListener('scroll', throttle(() => {
    const scrolled = window.pageYOffset;
    const header = document.querySelector('.header');
    if (header && scrolled < window.innerHeight) {
        header.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
}, 16));
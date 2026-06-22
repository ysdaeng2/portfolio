document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.getElementById('dynamic-title');
    const imageElement = document.getElementById('dynamic-image');
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-links a, .logo');

    const currentData = {
        title: titleElement.innerHTML,
        image: imageElement.src
    };

    const updateLeftPane = (title, imgSrc) => {
        if (currentData.title !== title) {
            titleElement.classList.add('fade');
            setTimeout(() => {
                titleElement.innerHTML = title;
                titleElement.classList.remove('fade');
                currentData.title = title;
            }, 200);
        }

        if (imgSrc && currentData.image !== imgSrc) {
            imageElement.classList.add('fade');
            setTimeout(() => {
                imageElement.src = imgSrc;
                imageElement.style.display = 'block';
                imageElement.classList.remove('fade');
                currentData.image = imgSrc;
            }, 200);
        } else if (!imgSrc) {
            imageElement.classList.add('fade');
            setTimeout(() => {
                imageElement.style.display = 'none';
                currentData.image = '';
            }, 200);
        }
    };

    // Handle Nav Click to switch tabs
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection && !targetSection.classList.contains('active')) {
                // Hide all sections
                sections.forEach(sec => sec.classList.remove('active'));
                
                // Show target section
                targetSection.classList.add('active');
                
                // Update Left Pane
                const title = targetSection.getAttribute('data-title');
                const image = targetSection.getAttribute('data-image');
                updateLeftPane(title, image);

                // Scroll to top of the page smoothly so they start at the top of the new tab
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });
    // Audio Player Logic
    const audio = document.getElementById('bg-music');
    const soundToggle = document.getElementById('sound-toggle');
    let isPlaying = false;
    const targetVolume = 0.3;

    if (soundToggle && audio) {
        audio.volume = 0; // Start muted for fade-in

        const fadeIn = () => {
            let vol = 0;
            const step = 0.02;
            const interval = 100; // Total 1.5 seconds to reach 0.3
            const fadeId = setInterval(() => {
                if (!isPlaying) {
                    clearInterval(fadeId);
                    return;
                }
                if (vol < targetVolume) {
                    vol += step;
                    try {
                        audio.volume = Math.min(vol, targetVolume);
                    } catch(e) {}
                } else {
                    clearInterval(fadeId);
                }
            }, interval);
        };

        const introScreen = document.getElementById('intro-screen');
        
        introScreen.addEventListener('click', () => {
            introScreen.classList.add('hidden');
            document.body.classList.remove('locked');
            
            audio.volume = 0;
            audio.play().then(() => {
                isPlaying = true;
                soundToggle.innerText = 'SOUND: ON';
                fadeIn();
            }).catch(e => console.log('Intro sound play failed', e));
        });

        soundToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isPlaying) {
                audio.pause();
                isPlaying = false;
                soundToggle.innerText = 'SOUND: OFF';
            } else {
                audio.volume = 0;
                audio.play().then(() => {
                    isPlaying = true;
                    soundToggle.innerText = 'SOUND: ON';
                    fadeIn();
                    const toast = document.getElementById('sound-toast');
                    if (toast) {
                        toast.classList.remove('show');
                        setTimeout(() => toast.style.display = 'none', 500);
                    }
                }).catch(err => console.log('Manual toggle failed', err));
            }
        });
    }

    // Small visible music player hookup
    const musicPlayer = document.getElementById('music-player');
    if (musicPlayer && audio) {
        const playBtn = musicPlayer.querySelector('.play-btn');
        const trackLabel = musicPlayer.querySelector('.track-label');

        const updateLabel = () => {
            const src = audio.currentSrc || (audio.querySelector('source') && audio.querySelector('source').getAttribute('src')) || 'Unknown';
            const name = src.split('/').pop();
            trackLabel.innerText = name;
        };

        updateLabel();

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (audio.paused) {
                audio.play().then(() => {
                    playBtn.innerText = '❚❚';
                    isPlaying = true;
                    if (soundToggle) soundToggle.innerText = 'SOUND: ON';
                }).catch(err => console.log('Play failed', err));
            } else {
                audio.pause();
                playBtn.innerText = '►';
                isPlaying = false;
                if (soundToggle) soundToggle.innerText = 'SOUND: OFF';
            }
        });

        audio.addEventListener('play', () => playBtn.innerText = '❚❚');
        audio.addEventListener('pause', () => playBtn.innerText = '►');
    }

    // Lightbox Logic for Recipe Cards (Project-scoped Navigation)
    const lightbox = document.getElementById('recipe-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    const allMediaItems = Array.from(document.querySelectorAll('.portfolio-media-item'));
    let currentProjectItems = [];
    let currentIndex = 0;

    const showImage = (index) => {
        if (currentProjectItems.length === 0) return;
        
        if (index < 0) {
            index = currentProjectItems.length - 1;
        } else if (index >= currentProjectItems.length) {
            index = 0;
        }
        currentIndex = index;
        const item = currentProjectItems[currentIndex];
        const src = item.getAttribute('data-src');
        const caption = item.getAttribute('data-caption');
        
        lightboxImg.src = src;
        lightboxCaption.innerText = caption;
    };

    allMediaItems.forEach((item) => {
        item.addEventListener('click', () => {
            const projectContainer = item.closest('.portfolio-project');
            if (projectContainer) {
                currentProjectItems = Array.from(projectContainer.querySelectorAll('.portfolio-media-item'));
                const index = currentProjectItems.indexOf(item);
                showImage(index);
                lightbox.classList.add('show');
                document.body.style.overflow = 'hidden'; // Lock scrolling
            }
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('show');
        if (!document.body.classList.contains('locked')) {
            document.body.style.overflow = ''; // Unlock scrolling
        }
    };

    closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-container')) {
            closeLightbox();
        }
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(currentIndex - 1);
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(currentIndex + 1);
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showImage(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
            showImage(currentIndex + 1);
        }
    });
});

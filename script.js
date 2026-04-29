document.addEventListener("DOMContentLoaded", () => {
  const animateNum = (el, start, end, dur) => {
    if (typeof animateNumber === 'function') animateNumber(el, start, end, dur);
  };

  fetch('https://discord.com/api/guilds/1275718191821094934/widget.json')
    .then(r => r.ok ? r.json() : Promise.reject(new Error('Widget disabled')))
    .then(data => {
      const count = data.presence_count ?? (data.members ? data.members.length : 0);
      const el = document.getElementById('discord-members');
      if (!el) return;
      el.setAttribute('data-target', count);
      animateNum(el, parseInt(el.textContent) || 0, count, 800);
    })
    .catch(() => {
      fetch('https://discord.com/api/v10/invites/shootcl?with_counts=true')
        .then(r => {
          if (!r.ok) throw new Error("Discord API Fehler");
          return r.json();
        })
        .then(data => {
          const count = data.approximate_member_count;
          const el = document.getElementById('discord-members');
          if (!el) return;
          el.setAttribute('data-target', count);
          animateNum(el, parseInt(el.textContent) || 0, count, 800);
        })
        .catch(e => console.error("Discord-Daten:", e));
    });

  const fiveMUrl = 'https://servers-frontend.fivem.net/api/servers/single/zrm99p';
  const fetchFiveM = (url) => fetch(url).then(r => {
    if (!r.ok) throw new Error("FiveM API Fehler");
    return r.json();
  });

  const updateFiveMPlayers = () => {
    fetchFiveM(fiveMUrl)
      .catch(() => fetchFiveM('https://api.allorigins.win/raw?url=' + encodeURIComponent(fiveMUrl)))
      .then(data => {
        const players = data?.Data?.clients ?? data?.Data?.selfReportedClients ?? (data?.Data?.players?.length ?? 0);
        const el = document.getElementById('fivem-players');
        if (el) {
          el.setAttribute('data-target', players);
          animateNum(el, parseInt(el.textContent) || 0, players, 350);
        }
      })
      .catch(() => {
        const el = document.getElementById('fivem-players');
        if (el) el.textContent = '–';
      });
  };

  updateFiveMPlayers();
  setInterval(updateFiveMPlayers, 10 * 60 * 1000);

  const setupFeaturesAnimations = () => {
    const featuresSection = document.getElementById("features");
    const featureBoxes = document.querySelectorAll(".feature-box");
    const featuresHeader = document.querySelector(".section-header");

    featureBoxes.forEach((box, i) => {
      box.style.transition = "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)";
      box.style.transitionDelay = i * 0.15 + "s";
    });

    const featuresObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          featureBoxes.forEach(box => box.classList.add("visible"));
          featuresObserver.unobserve(entry.target);
        }
      });
    }, { 'threshold': 0.2 });

    if (featuresSection) {
      featuresObserver.observe(featuresSection);
    }
  };

  setupFeaturesAnimations();

  const allSections = document.querySelectorAll(".section");
  const updateGradientOpacity = () => {
    allSections.forEach(section => {
      const boundingRect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const opacityValue = Math.max(0, Math.min(1, (windowHeight - boundingRect.top) / windowHeight - Math.max(0, (windowHeight + boundingRect.height - boundingRect.bottom) / windowHeight)));

      if (section.querySelector("::before")) {
        section.style.setProperty('--gradient-opacity', opacityValue);
      }
      section.querySelector('::before')?.["style"]['setProperty']("opacity", opacityValue);
    });
  };

  updateGradientOpacity();
  window.addEventListener("scroll", updateGradientOpacity);

  const animateNumber = (element, startValue, endValue, duration) => {
    const diff = endValue - startValue;
    const absDiff = Math.abs(diff);
    if (absDiff > 500) {
      const startTime = performance.now();
      const easeOut = t => 1 - Math.pow(1 - t, 2);
      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOut(progress);
        const current = Math.round(startValue + diff * eased);
        element.textContent = current.toLocaleString('de-DE');
        if (progress < 1) requestAnimationFrame(tick);
        else element.textContent = endValue.toLocaleString('de-DE');
      };
      requestAnimationFrame(tick);
    } else {
      const direction = diff > 0 ? 1 : -1;
      const intervalTime = Math.max(16, Math.floor(duration / (absDiff || 1)));
      let current = startValue;
      const iv = setInterval(() => {
        current += direction;
        element.textContent = current;
        if (current === endValue) clearInterval(iv);
      }, intervalTime);
    }
  };

  const observerOptions = { 'threshold': 0.1 };
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          const statNumbers = entry.target.querySelectorAll('.stat-number:not(#discord-members):not(#fivem-players):not(#registered-players)');
          statNumbers.forEach((statNumber, index) => {
            const targetValue = parseInt(statNumber.getAttribute("data-target"));
            if (isNaN(targetValue)) return;
            setTimeout(() => {
              animateNumber(statNumber, 0, targetValue, 900);
            }, index * 80);
          });
        }, 150);
        statsObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const statsContainer = document.querySelector(".stats-container");
  if (statsContainer) {
    statsObserver.observe(statsContainer);
  }

  const fadeElements = document.querySelectorAll(".fade-in");
  fadeElements.forEach(element => {
    element.style.opacity = '0';
    element.style.animation = "fadeIn 1s ease-in forwards";
  });

  const typingTextElements = document.querySelectorAll(".typing-text:not(.highlight)");

  const typeText = async (element) => {
    const textContent = element.textContent.trim();
    element.textContent = '';
    element.style.opacity = '1';

    const container = document.createElement("div");
    container.className = "typing-container";
    element.appendChild(container);

    const cursor = document.createElement("span");
    cursor.className = 'cursor';
    container.appendChild(cursor);

    for (let i = 0; i < textContent.length; i++) {
      const charSpan = document.createElement("span");
      charSpan.textContent = textContent[i];
      if (textContent[i] === " ") {
        charSpan.style.marginRight = "0.3em";
      }
      container.insertBefore(charSpan, cursor);

      await new Promise(resolve => {
        setTimeout(() => {
          charSpan.style.animation = "typeChar 0.1s ease-out forwards";
          resolve();
        }, 50);
      });
    }

    if (element !== typingTextElements[typingTextElements.length - 1]) {
      cursor.remove();
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  };

  const startTypingAnimation = async () => {
    const highlightElement = document.querySelector(".typing-text.highlight");
    if (highlightElement) {
      highlightElement.style.opacity = '1';
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    for (let i = 0; i < typingTextElements.length; i++) {
      await typeText(typingTextElements[i]);
    }
  };

  setTimeout(startTypingAnimation, 500);

  const ctaButtons = document.querySelectorAll(".cta-button");
  setTimeout(() => {
    ctaButtons.forEach(button => {
      button.classList.add('hover-enabled');
      button.addEventListener("mouseenter", () => {
        ctaButtons.forEach(otherButton => {
          if (otherButton !== button && otherButton.classList.contains("hover-enabled")) {
            otherButton.style.transform = "scale(0.95)";
            otherButton.style.opacity = "0.7";
          }
        });
      });

      button.addEventListener('mouseleave', () => {
        ctaButtons.forEach(otherButton => {
          if (otherButton !== button && otherButton.classList.contains("hover-enabled")) {
            otherButton.style.transform = '';
            otherButton.style.opacity = '';
          }
        });
      });
    });
  }, 3700);

  const setupVideoPlayers = () => {
    const videoPlayers = document.querySelectorAll(".custom-video-player");
    videoPlayers.forEach(player => {
      const video = player.querySelector(".showcase-video");
      video.controls = true;
      if (video.poster) {
        console.log("Video Thumbnail: " + video.poster);
      }
      video.muted = false;
      video.playsInline = true;

      video.addEventListener("play", () => {
        console.log("Video started playing");
      });

      video.addEventListener('pause', () => {
        console.log("Video paused");
      });

      video.addEventListener("volumechange", () => {
        console.log("Volume changed to: " + video.volume);
      });
    });
  };

  if (document.querySelector(".custom-video-player")) {
    setupVideoPlayers();
  }

  if (window.location.hash === '') {
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      document.body.style.overflow = '';
    }, 4000);
  }

  const featuresSection = document.getElementById("features");
  const scrollButton = document.querySelector(".scroll-indicator");
  let isHidden = false;
  let isScrolling = false;

  if (scrollButton && featuresSection) {
    const hideButton = () => {
      scrollButton.classList.add("hidden");
      isHidden = true;
    };

    const showButton = () => {
      if (window.pageYOffset === 0 && !isScrolling) {
        scrollButton.classList.remove("hidden");
        isHidden = false;
      }
    };

    window.addEventListener("scroll", () => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollPosition > 0) {
        hideButton();
      } else if (scrollPosition === 0 && !isScrolling) {
        showButton();
      }
    }, { 'passive': true });

    scrollButton.addEventListener('click', () => {
      isScrolling = true;
      hideButton();

      const targetPosition = featuresSection.offsetTop;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let startTime = null;

      function smoothScroll(currentTime) {
        if (startTime === null) {
          startTime = currentTime;
        }
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / 1000, 1);

        const easeOutCubic = progress < 0.5
          ? 4 * progress * progress * progress
          : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;

        window.scrollTo(0, startPosition + distance * easeOutCubic);

        if (timeElapsed < 1000) {
          requestAnimationFrame(smoothScroll);
        }
      }

      requestAnimationFrame(smoothScroll);
    });

    if (window.pageYOffset > 0 || isScrolling) {
      hideButton();
    }
  }

  const setupSections = () => {
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          if (entry.target.classList.contains("bestseller-section")) {
            const productCards = entry.target.querySelectorAll(".product-card");
            productCards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add("visible");
              }, index * 200);
            });
          }

          if (entry.target.classList.contains("team-section")) {
            const teamMembers = entry.target.querySelectorAll(".team-member");
            teamMembers.forEach((member, index) => {
              setTimeout(() => member.classList.add("visible"), index * 100);
            });
          }

          if (entry.target.classList.contains("features-section")) {
            const featureBoxes = entry.target.querySelectorAll(".feature-box");
            featureBoxes.forEach((box, index) => {
              setTimeout(() => box.classList.add("visible"), index * 150);
            });
          }

          if (entry.target.classList.contains("reviews-section")) {
            const reviewCards = entry.target.querySelectorAll(".review-card");
            reviewCards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add("visible");
              }, index * 100);
            });
          }

          sectionObserver.unobserve(entry.target);
        }
      });
    }, { 'threshold': 0.2 });

    sections.forEach(section => sectionObserver.observe(section));
  };

  const setupReviewsCarousel = () => {
    console.log("Initializing reviews carousel");

    const createReviewCard = review => `
      <div class="review-card">
        <div class="review-header">
          <img src="${review.avatar}" alt="${review.name}" class="reviewer-avatar">
          <div class="reviewer-info">
            <h4>${review.name}</h4>
            <p>${review.date}</p>
          </div>
        </div>
        <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
        <p class="review-text">${review.text}</p>
      </div>
    `;

    const reviewsData = [
      {
        name: "Max G.",
        date: "Vor 2 Tagen",
        rating: 5,
        text: "Server Performance 10/10! Läuft absolut stabil und ohne Lags, selbst bei vielen Spielern.",
        avatar: 'assets/img/pfp.png'
      },
      {
        name: "Lena K.",
        date: "Vor 1 Woche",
        rating: 5,
        text: "Die besten Selfmade Scripts, die ich je gesehen habe! Richtig kreativ und innovativ umgesetzt.",
        avatar: "assets/img/pfp.png"
      },
      {
        name: "Kevin H.",
        date: "Vor 3 Tagen",
        rating: 5,
        text: "Man sieht die harte Arbeit mit Liebe zum Detail. Das Roleplay hier ist auf einem anderen Level!",
        avatar: "assets/img/pfp.png"
      },
      {
        name: "Sophie W.",
        date: "Vor 5 Tagen",
        rating: 5,
        text: "Beste Community ever! Alle sind hilfsbereit und das Admin-Team ist jederzeit erreichbar.",
        avatar: "assets/img/pfp.png"
      },
      {
        name: "Timo R.",
        date: "Vor 1 Tag",
        rating: 5,
        text: "Die Fahrzeug-Mods sind einfach genial! Das Tuning-System ist das beste, was ich bisher erlebt habe.",
        avatar: "assets/img/pfp.png"
      },
      {
        name: "Jana M.",
        date: "Vor 4 Tagen",
        rating: 5,
        text: "Bodyshot Crimelife ist der einzige Server, auf dem ich wirklich in meine Rolle eintauchen kann. Unbedingte Empfehlung!",
        avatar: "assets/img/pfp.png"
      }
    ];

    const topTrack = document.querySelector(".reviews-track-top");
    const bottomTrack = document.querySelector(".reviews-track-bottom");

    if (topTrack && bottomTrack) {
      console.log("Found review tracks, populating with cards");
      const reviewCards = reviewsData.map(createReviewCard).join('');
      topTrack.innerHTML = reviewCards + reviewCards;
      bottomTrack.innerHTML = reviewCards + reviewCards;

      topTrack.style.animation = "none";
      bottomTrack.style.animation = "none";

      topTrack.offsetWidth;
      bottomTrack.offsetWidth;

      topTrack.style.animation = "scrollReviews 35s linear infinite";
      bottomTrack.style.animation = "scrollReviews 35s linear infinite reverse";
      console.log("Review animations set up");
    } else {
      console.log("Review tracks not found");
    }
  };

  const setupShowcaseAnimations = () => {
  };

  const setupScrollIndicator = () => {
    const scrollIndicator = document.querySelector(".scroll-indicator");
    const featuresSection = document.getElementById("features");
    let hasScrolled = false;

    if (scrollIndicator && featuresSection) {
      scrollIndicator.addEventListener('click', () => {
        featuresSection.scrollIntoView({ 'behavior': "smooth" });
      });

      window.addEventListener("scroll", function () {
        if (!hasScrolled && window.scrollY > 10) {
          scrollIndicator.style.opacity = '0';
          setTimeout(() => {
            scrollIndicator.style.display = "none";
          }, 500);
          hasScrolled = true;
        }
      });

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            scrollIndicator.style.opacity = '0';
            setTimeout(() => {
              scrollIndicator.style.display = 'none';
            }, 500);
            hasScrolled = true;
          }
        });
      }, { 'threshold': 0.1 });

      observer.observe(featuresSection);
    }
  };

  const setupCustomVideoPlayer = () => {
    const videoPlayers = document.querySelectorAll(".custom-video-player");

    videoPlayers.forEach(player => {
      const video = player.querySelector(".showcase-video");
      const thumbnailContainer = player.querySelector(".video-thumbnail-container");
      const playButton = player.querySelector('.video-play-button');
      const customControls = player.querySelector(".custom-video-controls");
      const keyboardShortcut = player.querySelector('.keyboard-shortcut');
      const playPauseButton = player.querySelector(".video-play-pause");
      const muteButton = player.querySelector(".video-mute");
      const fullscreenButton = player.querySelector(".video-fullscreen");
      const progressFill = player.querySelector(".video-progress-bar");
      const progressContainer = player.querySelector(".video-progress-container");
      const progressIndicator = player.querySelector(".video-progress-indicator");
      const volumeSlider = player.querySelector(".video-volume-slider");
      const volumeLevel = player.querySelector('.video-volume-level');
      const currentTimeElement = player.querySelector(".video-current-time");
      const durationElement = player.querySelector('.video-duration');

      let volumeIndicator = player.querySelector('.video-volume-indicator');
      if (!volumeIndicator && volumeSlider) {
        volumeIndicator = document.createElement("div");
        volumeIndicator.className = "video-volume-indicator";
        volumeSlider.appendChild(volumeIndicator);
      }

      if (customControls) {
        customControls.style.display = "none";
      }

      function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
      }

      function updateProgress() {
        if (!video || !currentTimeElement || !durationElement || !progressFill) {
          return;
        }
        currentTimeElement.textContent = formatTime(video.currentTime);
        durationElement.textContent = formatTime(video.duration || 0);

        const progressPercent = video.currentTime / video.duration * 100;
        progressFill.style.width = progressPercent + '%';
        if (progressIndicator) {
          progressIndicator.style.left = progressPercent + '%';
        }
      }

      function updateKeyboardShortcutIcon(action) {
        if (!keyboardShortcut) {
          return;
        }
        const icon = keyboardShortcut.querySelector('i');
        if (!icon) {
          return;
        }
        if (action === 'play') {
          icon.className = "fas fa-play";
        } else if (action === 'pause') {
          icon.className = "fas fa-pause";
        }
      }

      if (video) {
        video.addEventListener("loadedmetadata", () => {
          if (durationElement) {
            durationElement.textContent = formatTime(video.duration || 0);
          }
          if (volumeLevel) {
            volumeLevel.style.width = video.volume * 100 + '%';
          }
          updateVolumeIndicator();
        });

        video.addEventListener("timeupdate", updateProgress);

        video.addEventListener('play', () => {
          updateKeyboardShortcutIcon("pause");
        });

        video.addEventListener("pause", () => {
          updateKeyboardShortcutIcon("play");
        });
      }

      function togglePlayPause() {
        if (!video) {
          return;
        }
        if (video.paused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              if (playPauseButton) {
                playPauseButton.innerHTML = "<i class=\"fas fa-pause\"></i>";
              }
              updateKeyboardShortcutIcon('pause');
            }).catch(error => {
              console.error("Fehler beim Abspielen:", error);
            });
          }
        } else {
          video.pause();
          if (playPauseButton) {
            playPauseButton.innerHTML = "<i class=\"fas fa-play\"></i>";
          }
          updateKeyboardShortcutIcon("play");
        }
      }

      function startVideo() {
        if (!video || !thumbnailContainer) {
          return;
        }
        thumbnailContainer.style.opacity = '0';
        thumbnailContainer.style.transform = "scale(1.05)";
        setTimeout(() => {
          thumbnailContainer.style.display = 'none';
          video.style.display = "block";
          if (customControls) {
            customControls.style.display = 'flex';
          }

          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              if (playPauseButton) {
                playPauseButton.innerHTML = "<i class=\"fas fa-pause\"></i>";
              }
            }).catch(error => {
              if (playPauseButton) {
                playPauseButton.innerHTML = "<i class=\"fas fa-play\"></i>";
              }

              const playOverlay = document.createElement('div');
              playOverlay.className = "play-overlay";
              playOverlay.innerHTML = "<div class=\"play-message\"><i class=\"fas fa-play\"></i> Zum Abspielen klicken</div>";
              player.appendChild(playOverlay);

              playOverlay.addEventListener("click", () => {
                video.play();
                if (playPauseButton) {
                  playPauseButton.innerHTML = "<i class=\"fas fa-pause\"></i>";
                }
                playOverlay.style.opacity = '0';
                setTimeout(() => playOverlay.remove(), 300);
              });
            });
          }
        }, 400);
      }

      function toggleMute() {
        if (!video || !muteButton || !volumeLevel) {
          return;
        }
        video.muted = !video.muted;
        if (video.muted) {
          muteButton.innerHTML = "<i class=\"fas fa-volume-mute\"></i>";
          volumeLevel.style.width = '0%';
        } else {
          if (video.volume > 0.5) {
            muteButton.innerHTML = "<i class=\"fas fa-volume-up\"></i>";
          } else if (video.volume > 0) {
            muteButton.innerHTML = "<i class=\"fas fa-volume-down\"></i>";
          } else {
            muteButton.innerHTML = "<i class=\"fas fa-volume-off\"></i>";
          }
          volumeLevel.style.width = video.volume * 100 + '%';
        }
        updateVolumeIndicator();
      }

      function updateVolumeIndicator() {
        if (!volumeIndicator || !volumeLevel) {
          return;
        }
        const width = parseFloat(volumeLevel.style.width) || 0;
        volumeIndicator.style.left = width + '%';
      }

      function toggleFullscreen() {
        if (!player || !fullscreenButton) {
          return;
        }
        if (!document.fullscreenElement) {
          if (player.requestFullscreen) {
            player.requestFullscreen();
          } else if (player.webkitRequestFullscreen) {
            player.webkitRequestFullscreen();
          } else if (player.msRequestFullscreen) {
            player.msRequestFullscreen();
          }
          fullscreenButton.innerHTML = "<i class=\"fas fa-compress\"></i>";
          player.classList.add("fullscreen");
          startFullscreenTimer();
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
          fullscreenButton.innerHTML = "<i class=\"fas fa-expand\"></i>";
          player.classList.remove("fullscreen");
          player.classList.remove("active");
          stopFullscreenTimer();
        }
      }

      let fullscreenTimer;

      function startFullscreenTimer() {
        stopFullscreenTimer();
        player.classList.add("active");
        fullscreenTimer = setTimeout(() => {
          player.classList.remove("active");
        }, 3000);
      }

      function stopFullscreenTimer() {
        if (fullscreenTimer) {
          clearTimeout(fullscreenTimer);
          fullscreenTimer = null;
        }
      }

      player.addEventListener('mousemove', () => {
        if (player.classList.contains("fullscreen")) {
          startFullscreenTimer();
        }
      });

      function seekVideo(event) {
        if (!video || !progressContainer) {
          return;
        }
        const boundingRect = progressContainer.getBoundingClientRect();
        const clickPosition = (event.clientX - boundingRect.left) / boundingRect.width;
        video.currentTime = clickPosition * video.duration;
        updateProgress();
      }

      function setVolume(event) {
        if (!video || !volumeSlider || !volumeLevel || !muteButton) {
          return;
        }
        const boundingRect = volumeSlider.getBoundingClientRect();
        const volumeLevelValue = Math.max(0, Math.min(1, (event.clientX - boundingRect.left) / boundingRect.width));

        video.volume = volumeLevelValue;
        volumeLevel.style.width = volumeLevelValue * 100 + '%';
        video.muted = volumeLevelValue === 0;

        if (volumeLevelValue === 0) {
          muteButton.innerHTML = "<i class=\"fas fa-volume-mute\"></i>";
        } else if (volumeLevelValue < 0.5) {
          muteButton.innerHTML = "<i class=\"fas fa-volume-down\"></i>";
        } else {
          muteButton.innerHTML = "<i class=\"fas fa-volume-up\"></i>";
        }
        updateVolumeIndicator();
      }

      if (playButton) {
        playButton.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          startVideo();
        });
      }

      if (playPauseButton) {
        playPauseButton.addEventListener("click", togglePlayPause);
      }

      if (muteButton) {
        muteButton.addEventListener("click", toggleMute);
      }

      if (fullscreenButton) {
        fullscreenButton.addEventListener("click", toggleFullscreen);
      }

      if (progressContainer) {
        let isSeeking = false;

        progressContainer.addEventListener("mousedown", e => {
          isSeeking = true;
          seekVideo(e);
        });

        document.addEventListener("mousemove", e => {
          if (isSeeking) {
            seekVideo(e);
          }
        });

        document.addEventListener("mouseup", () => {
          isSeeking = false;
        });

        progressContainer.addEventListener("mousemove", e => {
          if (!progressIndicator) {
            return;
          }
          const boundingRect = progressContainer.getBoundingClientRect();
          const hoverPosition = (e.clientX - boundingRect.left) / boundingRect.width;
          progressIndicator.style.left = hoverPosition * 100 + '%';
          progressIndicator.style.display = "block";
        });

        progressContainer.addEventListener('mouseleave', () => {
          if (progressIndicator) {
            progressIndicator.style.display = "none";
          }
        });
      }

      if (volumeSlider) {
        let isAdjustingVolume = false;

        volumeSlider.addEventListener("mousedown", e => {
          isAdjustingVolume = true;
          setVolume(e);
        });

        document.addEventListener('mousemove', e => {
          if (isAdjustingVolume) {
            setVolume(e);
          }
        });

        document.addEventListener('mouseup', () => {
          isAdjustingVolume = false;
        });

        volumeSlider.addEventListener("mousemove", () => {
          if (!volumeIndicator) {
            return;
          }
          volumeIndicator.style.display = "block";
        });

        volumeSlider.addEventListener('mouseleave', () => {
          if (volumeIndicator) {
            volumeIndicator.style.display = "none";
          }
        });
      }

      if (video) {
        video.addEventListener("click", e => {
          if (customControls && !customControls.contains(e.target)) {
            togglePlayPause();
          }
        });

        video.addEventListener("contextmenu", e => {
          e.preventDefault();
          toggleMute();
        });

        video.addEventListener("ended", () => {
          if (playPauseButton) {
            playPauseButton.innerHTML = "<i class=\"fas fa-play\"></i>";
          }
          updateKeyboardShortcutIcon("play");
          video.currentTime = 0;
        });

        document.addEventListener('keydown', e => {
          if (video.style.display !== "block") {
            return;
          }
          if (e.code === 'Space') {
            e.preventDefault();
            togglePlayPause();
          } else if (e.key === 'm' || e.key === 'M') {
            toggleMute();
          } else if (e.key === 'f' || e.key === 'F') {
            toggleFullscreen();
          }
        });

        document.addEventListener("fullscreenchange", () => {
          if (!document.fullscreenElement) {
            player.classList.remove("fullscreen");
            player.classList.remove("active");
            if (fullscreenButton) {
              fullscreenButton.innerHTML = "<i class=\"fas fa-expand\"></i>";
            }
            stopFullscreenTimer();
          }
        });
      }
    });
  };

  const setupSmoothScroll = () => {
    const aktuellerStandBtn = document.getElementById("aktuellerStandBtn");
    const aktuellerStandSection = document.getElementById("aktueller-stand");

    if (aktuellerStandBtn && aktuellerStandSection) {
      aktuellerStandBtn.addEventListener("click", function (e) {
        e.preventDefault();
        aktuellerStandSection.scrollIntoView({ 'behavior': "smooth", 'block': "start" });
      });
    }

    const otherHashLinks = document.querySelectorAll("a[href^=\"#\"]:not(#aktuellerStandBtn)");
    otherHashLinks.forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ 'behavior': "smooth", 'block': "start" });
          }
        }
      });
    });
  };

  const setupTeamAnimations = () => {
    const teamSection = document.querySelector(".team-section");
    const teamMembers = document.querySelectorAll('.team-member');

    if (teamSection && teamMembers.length > 0) {
      teamMembers.forEach(member => {
        member.style.opacity = '0';
        member.style.transform = "translateY(30px)";
        member.style.transition = "all 0.8s ease";
      });

      const teamObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          teamMembers.forEach((member, index) => {
            setTimeout(() => {
              member.style.opacity = '1';
              member.style.transform = "translateY(0)";
            }, 300 + index * 300);
          });
          teamObserver.unobserve(teamSection);
        }
      }, { 'threshold': 0.2 });

      teamObserver.observe(teamSection);
    }
  };

  const setupAntiDebugging = () => {
    const detectDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth > 160;
      const heightDiff = window.outerHeight - window.innerHeight > 160;
      const firebugDetected = window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized;
      const consoleDetected = window.console && (window.console.firebug || window.console.profiles);

      if (widthDiff || heightDiff || firebugDetected || consoleDetected) {
        document.body.innerHTML = `
          <div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;background:#0f0f15;color:white;font-family:sans-serif;">
            <h1 style="color:#f5f5f5;font-size:2rem;">Zugriff verweigert</h1>
            <p style="color:#aaa;font-size:1.2rem;">Die Nutzung von Developer Tools ist auf dieser Seite nicht gestattet.</p>
          </div>
        `;
        return true;
      }
      return false;
    };

    function preventDebugging() {
      (function () {
        const scripts = document.querySelectorAll("script");
        scripts.forEach(script => {
          if (script.src) {
            const randomParam = "?v=" + Math.random().toString(36).substring(2, 15);
            script.src = script.src.includes('?')
              ? script.src + '&_=' + randomParam
              : '' + script.src + randomParam;
          }
        });

        let debuggerCounter = 0;
        const debuggerInterval = setInterval(() => {
          if (debuggerCounter < 3) {
            debugger;
            debuggerCounter++;
          } else {
            clearInterval(debuggerInterval);
          }
        }, 3000);

        const removeSourceMaps = () => {
          const sourceMapComments = [];
          const commentWalker = document.createNodeIterator(
            document.documentElement,
            NodeFilter.SHOW_COMMENT,
            null,
            false
          );

          let commentNode;
          while (commentNode = commentWalker.nextNode()) {
            if (commentNode.nodeValue.includes("sourceMappingURL")) {
              sourceMapComments.push(commentNode);
            }
          }

          sourceMapComments.forEach(comment => {
            if (comment.parentNode) {
              comment.parentNode.removeChild(comment);
            }
          });
        };

        removeSourceMaps();
      })();

      document.addEventListener("contextmenu", e => e.preventDefault());

      document.addEventListener("keydown", e => {
        if (e.keyCode === 123 ||
          (e.keyCode === 73 && e.ctrlKey && e.shiftKey) ||
          (e.keyCode === 74 && e.ctrlKey && e.shiftKey) ||
          (e.keyCode === 67 && e.ctrlKey && e.shiftKey) ||
          (e.keyCode === 83 && e.ctrlKey) ||
          (e.keyCode === 85 && e.ctrlKey)) {
          e.preventDefault();
          return false;
        }
      });
    }

    function addNoiseElements() {
      setInterval(() => {
        const comments = Array.from({ length: 5 }, () =>
          document.createComment("Protected - " + Math.random().toString(36).substring(2))
        );

        comments.forEach(comment => {
          document.body.appendChild(comment);
          setTimeout(() => {
            if (comment.parentNode) {
              comment.parentNode.removeChild(comment);
            }
          }, 100);
        });
      }, 5000);

      const dummyScript = document.createElement("script");
      dummyScript.textContent = "console.log(\"Loading...\");";
      document.head.appendChild(dummyScript);
    }

    let checkCount = 0;
    const checkInterval = setInterval(() => {
      if (checkCount < 10) {
        checkCount++;
        detectDevTools();
      } else {
        clearInterval(checkInterval);
      }
    }, 3000);

    preventDebugging();
    addNoiseElements();
  };

  setupCustomVideoPlayer();

  const initializeAll = () => {
    setupVideoPlayers();
    setupShowcaseAnimations();
    setupReviewsCarousel();
    setupSections();

    window.addEventListener("load", () => {
      console.log("Window loaded, setting up leak animations");
      setupFeaturesAnimations();
    });

    setupScrollIndicator();
    setupCustomVideoPlayer();
    setupSmoothScroll();
    setupTeamAnimations();
    setupAntiDebugging();

    window.addEventListener('scroll', updateGradientOpacity);

    const preloader = document.getElementById("preloader");
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add("fade-out");
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }, 500);
    }
  };

  initializeAll();                                                                                                                                                                                  
});
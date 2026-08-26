const introOverlay = document.getElementById('intro-overlay');
const packageElem = document.getElementById('package');
const skipIntroBtn = document.getElementById('skip-intro');

function triggerConfetti(centerX, centerY) {
  const colors = ['#004d9d', '#ffffff', '#c1443c', '#b98a2e', '#f6ecd9'];
  const particleCount = 50;
  if (!introOverlay) return;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';

    const width = Math.random() * 8 + 6;
    const height = Math.random() * 10 + 6;
    particle.style.width = width + 'px';
    particle.style.height = height + 'px';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 240 + 70;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - Math.random() * 70;
    const tr = (Math.random() - 0.5) * 800;

    particle.style.setProperty('--tx', tx.toFixed(0) + 'px');
    particle.style.setProperty('--ty', ty.toFixed(0) + 'px');
    particle.style.setProperty('--tr', tr.toFixed(0) + 'deg');

    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';

    introOverlay.appendChild(particle);
  }
}

function finishIntro(instant) {
  sessionStorage.setItem('giftOpened', 'true');
  document.body.classList.remove('intro-active');

  const video = document.querySelector('.hintergrund-video');
  if (video && video.paused) {
    video.play().catch(function () {});
  }

  if (!introOverlay) return;

  if (instant) {
    introOverlay.classList.add('hidden');
  } else {
    introOverlay.classList.add('fade-out');
    setTimeout(function () {
      introOverlay.classList.add('hidden');
    }, 750);
  }
}

const scratchCanvas = document.getElementById('scratch-canvas');
const scratchHint = document.getElementById('scratch-hint');
const hintText = document.getElementById('hint-text');

if (sessionStorage.getItem('giftOpened') === 'true') {
  finishIntro(true);
} else if (scratchCanvas) {
  const ctx = scratchCanvas.getContext('2d');
  let isScratching = false;
  let isRevealed = false;
  let lastX = 0;
  let lastY = 0;
  let moveCount = 0;

  function initCanvas() {
    const rect = scratchCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width || 320;
    const h = rect.height || 320;

    scratchCanvas.width = w * dpr;
    scratchCanvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // 1. Kraft paper background
    ctx.fillStyle = '#d9bd94';
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle Kraft Paper Texture Dots
    ctx.fillStyle = 'rgba(185, 138, 46, 0.15)';
    for (let x = 12; x < w; x += 24) {
      for (let y = 12; y < h; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Airmail Stripes Border
    const stripeWidth = 14;
    const stripeGap = 14;
    ctx.save();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#c1443c';
    ctx.strokeRect(4, 4, w - 8, h - 8);

    ctx.strokeStyle = '#004d9d';
    ctx.setLineDash([stripeWidth, stripeGap]);
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.restore();

    // 4. Center Gold Scratch Coin / Stamp
    const cx = w / 2;
    const cy = h / 2;

    // Stamp Outer Circle
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf6';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c1443c';
    ctx.stroke();

    // Stamp Inner Dashed Circle
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#b98a2e';
    ctx.stroke();
    ctx.setLineDash([]);

    // Stamp Text
    ctx.fillStyle = '#26314b';
    ctx.font = 'bold 11.5px "Special Elite", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FREIRUBBELN', cx, cy - 8);

    ctx.font = '20px sans-serif';
    ctx.fillText('🪙', cx, cy + 15);
  }

  // Draw once on load, when fonts are ready, and on resize
  setTimeout(initCanvas, 50);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (!isRevealed) initCanvas();
    });
  }
  window.addEventListener('resize', function () {
    if (!isRevealed) initCanvas();
  });

  function getPointerPos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function scratch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    if (lastX && lastY) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.lineWidth = 56;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    lastX = x;
    lastY = y;
  }

  function checkProgress() {
    const dpr = window.devicePixelRatio || 1;
    const sampleStep = 12;
    const w = scratchCanvas.width;
    const h = scratchCanvas.height;

    let transparentCount = 0;
    let totalSamples = 0;

    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      for (let y = 0; y < h; y += sampleStep) {
        for (let x = 0; x < w; x += sampleStep) {
          const alphaIndex = (y * w + x) * 4 + 3;
          if (data[alphaIndex] < 128) {
            transparentCount++;
          }
          totalSamples++;
        }
      }

      const percent = Math.min(100, Math.round((transparentCount / totalSamples) * 100));

      if (hintText && !isRevealed) {
        hintText.textContent = `Freigerubbelt: ${percent}% 🪙`;
      }

      if (percent >= 60 && !isRevealed) {
        revealGift();
      }
    } catch (err) {
      // Fallback
    }
  }

  function revealGift() {
    if (isRevealed) return;
    isRevealed = true;

    scratchCanvas.style.opacity = '0';
    scratchCanvas.style.pointerEvents = 'none';

    if (hintText) {
      hintText.textContent = '🎉 Geschenk freigerubbelt!';
    }

    const rect = scratchCanvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    triggerConfetti(centerX, centerY);

    const video = document.querySelector('.hintergrund-video');
    if (video && video.paused) {
      video.play().catch(function () {});
    }

    setTimeout(function () {
      finishIntro(false);
    }, 1200);
  }

  // Pointer Events (supports Mouse, Touch, Stylus seamlessly)
  scratchCanvas.addEventListener('pointerdown', function (e) {
    if (isRevealed) return;
    isScratching = true;
    const pos = getPointerPos(e);
    lastX = pos.x;
    lastY = pos.y;
    scratch(pos.x, pos.y);
  });

  scratchCanvas.addEventListener('pointermove', function (e) {
    if (!isScratching || isRevealed) return;
    const pos = getPointerPos(e);
    scratch(pos.x, pos.y);

    moveCount++;
    if (moveCount % 4 === 0) {
      checkProgress();
    }
  });

  window.addEventListener('pointerup', function () {
    if (isScratching) {
      isScratching = false;
      lastX = 0;
      lastY = 0;
      checkProgress();
    }
  });

  // Fallback click on card once partly scratched or directly
  const scratchCard = document.getElementById('scratch-card');
  if (scratchCard) {
    scratchCard.addEventListener('dblclick', revealGift);
  }

  if (skipIntroBtn) {
    skipIntroBtn.addEventListener('click', function () {
      finishIntro(false);
    });
  }
}

const stapel = document.getElementById('stapel');
const leseansicht = document.getElementById('leseansicht');
const leseDatum = document.getElementById('lese-datum');
const leseTitel = document.getElementById('lese-titel');
const leseBild = document.getElementById('lese-bild');
const leseInhalt = document.getElementById('lese-inhalt');
const zurueckBtn = document.getElementById('zurueck-btn');
const beitragKachel = document.querySelector('.kachel-beitrag');

fetch('posts.json')
  .then(function (response) {
    return response.json();
  })
  .then(function (posts) {
    posts.forEach(function (post, index) {
      const winkel = (index % 2 === 0 ? -1 : 1) * (1 + Math.random() * 2);

      const brief = document.createElement('div');
      brief.className = 'letter';
      brief.style.setProperty('--rot', winkel.toFixed(1) + 'deg');
      brief.style.animationDelay = (index * 0.08) + 's';

        const bildHtml = post.bilder.length > 0
           ? `<img src="${post.bilder[0]}" class="brief-bild" alt="">`
          : '';

    brief.innerHTML = `
        <span class="datum">${post.datum}</span>
         <h2 class="titel">${post.titel}</h2>
        ${bildHtml}
        <p class="inhalt">${post.inhalt}</p>
        `;

    brief.addEventListener('click', function () {
  brief.classList.add('oeffnend');

  setTimeout(function () {
    leseDatum.textContent = post.datum;
    leseTitel.textContent = post.titel;
    const absaetze = post.inhalt.split('\n\n');
    leseInhalt.innerHTML = absaetze.map(function (absatz) {
    return `<p>${absatz}</p>`;
    }).join('');

    if (post.bilder.length > 0) {
  leseBild.src = post.bilder[0];
  leseBild.style.display = 'block';
} else {
  leseBild.style.display = 'none';
}

    stapel.classList.add('versteckt');
    history.pushState({ ansicht: 'brief' }, '');
    leseansicht.classList.add('aktiv');
    brief.classList.remove('oeffnend');
  }, 600);
});

      stapel.appendChild(brief);
    });
    const letzterPost = posts[posts.length - 1];

    beitragKachel.innerHTML = `
      <span class="kachel-icon">✉️</span>
      <h2 class="kachel-titel">Neuster Beitrag</h2>
      <p class="kachel-vorschau-titel">${letzterPost.titel}</p>
    `;


    beitragKachel.addEventListener('click', function () {
      leseDatum.textContent = letzterPost.datum;
      leseTitel.textContent = letzterPost.titel;
      const absaetze = letzterPost.inhalt.split('\n\n');
      leseInhalt.innerHTML = absaetze.map(function (absatz) {
        return `<p>${absatz}</p>`;
      }).join('');

      if (letzterPost.bilder.length > 0) {
        leseBild.src = letzterPost.bilder[0];
        leseBild.style.display = 'block';
      } else {
        leseBild.style.display = 'none';
      }

      stapel.classList.add('versteckt');
      history.pushState({ ansicht: 'brief' }, '');
      leseansicht.classList.add('aktiv');
    });
  });

zurueckBtn.addEventListener('click', function () {
  history.back();
});

const tageZahlElement = document.getElementById('tage-zahl');
const abflugDatum = new Date('2026-06-24');
const heute = new Date();
const millisekundenProTag = 1000 * 60 * 60 * 24;
const vergangeneTage = Math.floor((heute - abflugDatum) / millisekundenProTag);

tageZahlElement.textContent = vergangeneTage;

window.addEventListener('popstate', function () {
  stapel.classList.remove('versteckt');
  leseansicht.classList.remove('aktiv');
});

document.body.addEventListener('touchstart', function () {
  const video = document.querySelector('.hintergrund-video');
  if (video && video.paused) {
    video.play();
  }
}, { once: true });
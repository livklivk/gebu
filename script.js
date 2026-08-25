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

if (sessionStorage.getItem('giftOpened') === 'true') {
  finishIntro(true);
} else if (packageElem) {
  function openGift() {
    if (packageElem.classList.contains('opened')) return;
    packageElem.classList.add('opened');

    const rect = packageElem.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    triggerConfetti(centerX, centerY);

    const video = document.querySelector('.hintergrund-video');
    if (video && video.paused) {
      video.play().catch(function () {});
    }

    setTimeout(function () {
      finishIntro(false);
    }, 900);
  }

  packageElem.addEventListener('click', openGift);
  packageElem.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openGift();
    }
  });

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
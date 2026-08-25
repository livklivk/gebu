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
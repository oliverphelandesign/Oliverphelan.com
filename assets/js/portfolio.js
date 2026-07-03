(function(){
  const rail = document.getElementById('rail');
  const countEl = document.getElementById('count');
  const progressEl = document.getElementById('progress');

  if (window['pdfjsLib']) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  function slideEl(inner, tagText, index){
    const s = document.createElement('div');
    s.className = 'slide';
    s.appendChild(inner);
    if (tagText){
      const tag = document.createElement('p');
      tag.className = 'tag';
      tag.innerHTML = `<span class="idx">${String(index).padStart(2,'0')}</span>${tagText}`;
      s.appendChild(tag);
    }
    return s;
  }

  async function renderPdf(item, startIndex, captionBase){
    const slides = [];
    try {
      const loadingTask = pdfjsLib.getDocument(item.src);
      const pdf = await loadingTask.promise;
      for (let p = 1; p <= pdf.numPages; p++){
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const label = `${captionBase || 'Slides'} — page ${p}/${pdf.numPages}`;
        slides.push(slideEl(canvas, label, startIndex + slides.length));
      }
    } catch (err){
      console.error('Could not render PDF', item.src, err);
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = `Couldn't load ${item.src}`;
      slides.push(slideEl(p, 'Error', startIndex));
    }
    return slides;
  }

  function renderImage(item, index){
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.caption || '';
    img.loading = 'lazy';
    return slideEl(img, item.caption, index);
  }

  function renderVideo(item, index){
    const vid = document.createElement('video');
    vid.src = item.src;
    vid.autoplay = true;
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.controls = false;
    return slideEl(vid, item.caption, index);
  }

  function emptyState(){
    const p = document.createElement('p');
    p.className = 'empty';
    p.innerHTML = 'No work loaded yet.<br><br>Add images, gifs, videos or PDFs to<br><code>assets/portfolio/</code> and list them in<br><code>assets/portfolio/manifest.json</code>.';
    return slideEl(p, null, 1);
  }

  async function build(){
    rail.innerHTML = '';
    let manifest = [];
    try {
      const res = await fetch('assets/portfolio/manifest.json', { cache: 'no-store' });
      if (res.ok) manifest = await res.json();
    } catch (err){
      console.warn('No manifest found yet', err);
    }

    if (!manifest.length){
      rail.appendChild(emptyState());
      updateCount();
      return;
    }

    let i = 1;
    for (const item of manifest){
      if (item.type === 'pdf'){
        const pages = await renderPdf(item, i, item.caption);
        pages.forEach(s => rail.appendChild(s));
        i += pages.length;
      } else if (item.type === 'video'){
        rail.appendChild(renderVideo(item, i)); i++;
      } else {
        // image and gif both render as <img>
        rail.appendChild(renderImage(item, i)); i++;
      }
    }
    updateCount();
  }

  function updateCount(){
    const total = rail.children.length;
    const width = rail.scrollWidth - rail.clientWidth;
    const current = width > 0 ? Math.round((rail.scrollLeft / width) * (total - 1)) + 1 : 1;
    countEl.textContent = `${String(current).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    progressEl.style.width = width > 0 ? `${(rail.scrollLeft / width) * 100}%` : '0%';
  }

  // ---- force every scroll gesture to move the rail horizontally ----
  rail.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    rail.scrollLeft += delta;
  }, { passive: false });

  // touch: vertical swipes pan horizontally too
  let touchStartX = 0, touchStartY = 0, touchScrollStart = 0;
  rail.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchScrollStart = rail.scrollLeft;
  }, { passive: true });

  rail.addEventListener('touchmove', (e) => {
    const dx = touchStartX - e.touches[0].clientX;
    const dy = touchStartY - e.touches[0].clientY;
    // combine both axes so a vertical swipe still drives the rail
    rail.scrollLeft = touchScrollStart + dx + dy;
    e.preventDefault();
  }, { passive: false });

  // keyboard: left/right and up/down all move the rail
  window.addEventListener('keydown', (e) => {
    const step = window.innerWidth * 0.9;
    if (['ArrowRight','ArrowDown'].includes(e.key)) rail.scrollLeft += step;
    if (['ArrowLeft','ArrowUp'].includes(e.key)) rail.scrollLeft -= step;
  });

  rail.addEventListener('scroll', updateCount);
  window.addEventListener('resize', updateCount);

  build();
})();

(() => {
  const total = 35;
  const sections = [
    { selector: ".hero", offset: 0 },
    { selector: ".spotlight-body", offset: 12 },
    { selector: ".vault", offset: 24 }
  ];

  let frame = 0;

  function rotateImages() {
    sections.forEach(section => {
      const element = document.querySelector(section.selector);
      if (!element) return;

      const number = ((frame + section.offset) % total) + 1;
      const filename = `bg-${String(number).padStart(2, "0")}.png`;
      const url = `/assets/${filename}`;

      const image = new Image();
      image.onload = () => {
        element.style.backgroundImage =
          `linear-gradient(90deg, rgba(3,10,25,.35), rgba(5,15,35,.15)), url("${url}")`;
        element.style.backgroundSize = "cover";
        element.style.backgroundPosition = "center";
      };
      image.src = url;
    });

    frame++;
  }

  rotateImages();
  setInterval(rotateImages, 12000);
})();

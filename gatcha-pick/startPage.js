const imageRoot = "1st_img/";
const startFrameImage = `${imageRoot}메인_시작.png?v=start-button-removed-20261127`;
const canvas = document.querySelector("#design-canvas");
const frame = document.querySelector("#screen-frame");
const artLayer = document.querySelector("#sequence-art");
const loadingLabel = document.querySelector("#loading-label");
const status = document.querySelector("#sequence-status");
const startButton = document.querySelector("#start-button");
const startButtonImage = startButton.querySelector("img");
const frameDurationMs = 600;

const frames = [
  { name: "메인_1.png", label: "loading.", art: ["초록공선.png"] },
  { name: "메인_2.png", label: "loading..", art: ["초록공 깐.png", "다접은 종이.png"] },
  { name: "메인_3.png", label: "loading...", art: ["초록공 깐.png", "편 종이 짜잔.png"] },
  { name: "메인_1.png", label: "loading.", art: ["초록공선.png"] },
  { name: "메인_2.png", label: "loading..", art: ["초록공 깐.png", "다접은 종이.png"] },
  { name: "메인_3.png", label: "loading...", art: ["초록공 깐.png", "편 종이 짜잔.png"] }
];

const buttonImages = {
  idle: `${imageRoot}시작버튼.svg`,
  hover: `${imageRoot}시작호버.svg`,
  pressed: `${imageRoot}시작클릭.svg`
};

function preloadImage(path) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = path;
  });
}

function showArt(files) {
  artLayer.replaceChildren();
  for (const file of files) {
    const image = document.createElement("img");
    image.src = `${imageRoot}${file}`;
    image.alt = "";
    image.draggable = false;
    if (file === "초록공선.png") image.className = "closed-ball";
    if (file === "초록공 깐.png") image.className = "open-ball";
    if (file === "다접은 종이.png") image.className = "folded-paper";
    if (file === "편 종이 짜잔.png") image.className = "open-paper";
    artLayer.append(image);
  }
}

function showSequenceFrame(frameState) {
  frame.src = `${imageRoot}${frameState.name}`;
  loadingLabel.textContent = frameState.label;
  showArt(frameState.art);
}

async function startIntro() {
  const allAssets = [
    ...new Set([
      ...frames.map(item => `${imageRoot}${item.name}`),
      ...frames.flatMap(item => item.art.map(file => `${imageRoot}${file}`)),
      startFrameImage,
      `${imageRoot}헤더 분홍 공.svg`,
      ...Object.values(buttonImages),
      `${imageRoot}커서.svg`
    ])
  ];

  showSequenceFrame(frames[0]);
  startButtonImage.src = buttonImages.idle;
  await Promise.all([
    ...allAssets.map(preloadImage),
    document.fonts.load('16px "GalmuriMono11Local"').catch(() => [])
  ]);

  let index = 0;
  const advance = () => {
    index += 1;
    if (index < frames.length) {
      showSequenceFrame(frames[index]);
      status.textContent = `가챠픽을 준비하고 있어요. ${index + 1} / 6`;
      window.setTimeout(advance, frameDurationMs);
      return;
    }

    frame.src = startFrameImage;
    showArt([]);
    canvas.classList.add("is-start");
    loadingLabel.hidden = true;
    startButton.hidden = false;
    status.textContent = "준비됐어요. 시작 버튼을 눌러주세요.";
  };

  window.setTimeout(advance, frameDurationMs);
}

let isNavigating = false;
startButton.addEventListener("pointerenter", () => {
  if (!isNavigating) startButtonImage.src = buttonImages.hover;
});
startButton.addEventListener("pointerleave", () => {
  if (!isNavigating) startButtonImage.src = buttonImages.idle;
});
startButton.addEventListener("click", () => {
  if (isNavigating) return;
  isNavigating = true;
  startButtonImage.src = buttonImages.pressed;
  window.setTimeout(() => {
    window.location.href = "mainPage.html";
  }, 180);
});

startIntro();

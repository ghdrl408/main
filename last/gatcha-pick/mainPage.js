const machineTrack = document.querySelector("#machine-track");
const ballAssets = [
  "공 블루.svg",
  "공 보라.svg",
  "공 민트.svg",
  "공 빨강.svg",
  "공 노랑.svg",
  "공 주황.svg"
];

function makeMachine() {
  const machine = document.createElement("div");
  machine.className = "machine";

  const machineArt = document.createElement("img");
  machineArt.className = "machine-art";
  machineArt.src = "2st_img/머신.svg";
  machineArt.alt = "";
  machineArt.draggable = false;

  const windowArea = document.createElement("div");
  windowArea.className = "ball-window";
  for (const [index, asset] of ballAssets.entries()) {
    const ball = document.createElement("img");
    ball.className = "machine-ball";
    ball.src = `2st_img/공/${asset}`;
    ball.style.animationDelay = `${-0.12 - index * 0.31}s`;
    ball.alt = "";
    ball.draggable = false;
    windowArea.append(ball);
  }

  machine.append(machineArt, windowArea);
  return machine;
}

function makeMachineGroup() {
  const group = document.createElement("div");
  group.className = "machine-group";
  for (let index = 0; index < 5; index += 1) group.append(makeMachine());
  return group;
}

machineTrack.append(makeMachineGroup(), makeMachineGroup(), makeMachineGroup());

const machineViewport = document.querySelector(".machine-track-viewport");
const firstMachine = machineTrack.querySelector(".machine");
const machineGroup = machineTrack.firstElementChild;
const machineSpeed = (1380 / 18) * 0.95 * 0.7; // prototype px/s, 30% slower than current
let machineCycleDistance = 0;
let machineOffset = 0;
let lastMachineFrame = null;

function measureMachineLoop() {
  if (!machineGroup || !firstMachine) return;
  const previousCycle = machineCycleDistance;
  const margin = Number.parseFloat(getComputedStyle(machineGroup).marginRight) || 0;
  machineCycleDistance = machineGroup.getBoundingClientRect().width + margin;
  if (previousCycle > 0 && machineCycleDistance > 0) {
    machineOffset = (machineOffset / previousCycle) * machineCycleDistance;
  }
  machineTrack.style.top = `${Math.max(0, (machineViewport.clientHeight - firstMachine.getBoundingClientRect().height) / 2)}px`;
  machineTrack.style.transform = `translate3d(${-machineOffset}px, 0, 0)`;
}

function animateMachines(time) {
  if (lastMachineFrame !== null && machineCycleDistance > 0) {
    const elapsed = Math.min(time - lastMachineFrame, 50);
    machineOffset = (machineOffset + machineSpeed * elapsed / 1000) % machineCycleDistance;
    machineTrack.style.transform = `translate3d(${-machineOffset}px, 0, 0)`;
  }
  lastMachineFrame = time;
  window.requestAnimationFrame(animateMachines);
}

measureMachineLoop();
new ResizeObserver(measureMachineLoop).observe(document.querySelector("#design-canvas"));
window.requestAnimationFrame(animateMachines);

const buttonAssets = {
  place: {
    idle: "2st_img/어디갈까 버튼.svg",
    hover: "2st_img/어디갈까 버튼 호버.svg",
    pressed: "2st_img/어디갈까 버튼 클릭.svg"
  },
  food: {
    idle: "2st_img/뭐먹을까 버튼.svg",
    hover: "2st_img/뭐먹을까 버튼 호버.svg",
    pressed: "2st_img/뭐먹을까 버튼 클릭.svg"
  },
  friend: {
    idle: "2st_img/친구랑.svg",
    hover: "2st_img/친구랑 호버.svg",
    pressed: "2st_img/친구랑 클릭.svg"
  },
  lover: {
    idle: "2st_img/연인이랑.svg",
    hover: "2st_img/연인이랑 호버.svg",
    pressed: "2st_img/연인이랑 클릭.svg"
  }
};

const choiceButtons = [...document.querySelectorAll(".reference-button")];
const canvas = document.querySelector("#design-canvas");
const drawStage = document.querySelector("#draw-stage");
const drawMachineSlot = document.querySelector("#draw-machine-slot");
const leverControl = document.querySelector(".lever-control");
const leverArt = document.querySelector(".lever-art");
const choiceLabels = {
  place: "어디갈까?",
  food: "뭐먹을까?",
  friend: "친구랑",
  lover: "연인이랑"
};
let choiceStage = "category";
let leverRotation = 0;
let leverDragStart = null;

function expandScrollingMachine() {
  if (!drawStage || !drawMachineSlot) return;

  const stageBounds = drawStage.getBoundingClientRect();
  const viewportBounds = machineViewport.getBoundingClientRect();
  const visibleMachines = [...machineTrack.querySelectorAll(".machine")]
    .map(machine => ({ machine, bounds: machine.getBoundingClientRect() }))
    .filter(({ bounds }) => bounds.right > viewportBounds.left && bounds.left < viewportBounds.right);
  const targetX = stageBounds.left + stageBounds.width * 0.35;
  const source = visibleMachines.reduce((best, item) => {
    if (!best) return item;
    const distance = Math.abs((item.bounds.left + item.bounds.width / 2) - targetX);
    const bestDistance = Math.abs((best.bounds.left + best.bounds.width / 2) - targetX);
    return distance < bestDistance ? item : best;
  }, null);

  if (!source) return;

  const clone = source.machine.cloneNode(true);
  const shell = clone.querySelector(".machine-art");
  if (shell) shell.src = "2st_img/프로필/3st_img/머신 (레버X).svg";
  clone.classList.add("draw-machine-clone");

  const border = Number.parseFloat(getComputedStyle(drawStage).borderLeftWidth) || 0;
  clone.style.left = `${source.bounds.left - stageBounds.left - border}px`;
  clone.style.top = `${source.bounds.top - stageBounds.top - border}px`;
  clone.style.width = `${source.bounds.width}px`;
  clone.style.height = `${source.bounds.height}px`;
  drawMachineSlot.replaceChildren(clone);
  void clone.offsetWidth;

  requestAnimationFrame(() => {
    clone.classList.add("is-zooming");
    const targetWidth = drawStage.clientWidth * 0.62;
    const targetHeight = targetWidth * (1010 / 658);
    clone.style.left = `${(drawStage.clientWidth - targetWidth) / 2}px`;
    clone.style.top = `${(drawStage.clientHeight - targetHeight) / 2}px`;
    clone.style.width = `${targetWidth}px`;
    clone.style.height = `${targetHeight}px`;
  });

  const startLeverGuide = () => {
    if (!drawStage.isConnected || !drawStage.classList.contains("is-active")) return;
    drawStage.classList.add("is-guide-active");
  };
  clone.addEventListener("transitionend", event => {
    if (event.propertyName === "height") startLeverGuide();
  }, { once: true });
  window.setTimeout(startLeverGuide, 950);
}

drawStage?.querySelector(".gesture-orbit")?.addEventListener("animationend", event => {
  if (event.animationName !== "gesture-orbit-spin") return;
  drawStage.classList.remove("is-guide-active");
  drawStage.classList.add("is-lever-ready");
  if (leverControl) leverControl.disabled = false;
});

function getPointerAngle(event, element) {
  const bounds = element.getBoundingClientRect();
  return Math.atan2(event.clientY - (bounds.top + bounds.height / 2), event.clientX - (bounds.left + bounds.width / 2)) * 180 / Math.PI;
}

leverControl?.addEventListener("pointerdown", event => {
  if (!drawStage?.classList.contains("is-lever-ready")) return;
  if (event.button !== 0 && event.pointerType === "mouse") return;
  event.preventDefault();
  leverDragStart = { pointerAngle: getPointerAngle(event, leverControl), leverRotation };
  leverControl.setPointerCapture(event.pointerId);
});

leverControl?.addEventListener("pointermove", event => {
  if (!drawStage?.classList.contains("is-lever-ready") || !leverDragStart) return;
  const pointerAngle = getPointerAngle(event, leverControl);
  let delta = pointerAngle - leverDragStart.pointerAngle;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  leverRotation = leverDragStart.leverRotation + delta;
  leverArt.style.transform = `rotate(${leverRotation}deg)`;
});

function endLeverDrag() {
  leverDragStart = null;
}

leverControl?.addEventListener("pointerup", endLeverDrag);
leverControl?.addEventListener("pointercancel", endLeverDrag);

const headerBallToggle = document.querySelector(".header-ball-toggle");
const headerBallIcon = headerBallToggle?.querySelector(".header-ball-icon");
const headerBallAssets = {
  pink: "1st_img/헤더 분홍 공.svg",
  purple: "1st_img/헤더 클릭 보라공.svg"
};

if (headerBallToggle && headerBallIcon) {
  const profilePanel = document.querySelector("#profile-panel");
  let profileIsOpen = false;
  let headerBallIsHovered = false;
  let headerBallShowSelectionUntilLeave = false;

  function renderHeaderBall() {
    const showHoverPreview = headerBallIsHovered && !headerBallShowSelectionUntilLeave;
    const showPurple = showHoverPreview ? !profileIsOpen : profileIsOpen;
    headerBallIcon.src = showPurple ? headerBallAssets.purple : headerBallAssets.pink;
  }

  function setProfileOpen(isOpen) {
    profileIsOpen = isOpen;
    profilePanel?.classList.toggle("is-open", profileIsOpen);
    profilePanel?.setAttribute("aria-hidden", String(!profileIsOpen));
    if (profilePanel) profilePanel.inert = !profileIsOpen;
    headerBallToggle.setAttribute("aria-pressed", String(profileIsOpen));
    headerBallToggle.setAttribute("aria-expanded", String(profileIsOpen));
    headerBallToggle.setAttribute("aria-label", profileIsOpen ? "프로필 닫기" : "프로필 열기");
    renderHeaderBall();
  }

  headerBallToggle.addEventListener("pointerenter", () => {
    headerBallIsHovered = true;
    headerBallShowSelectionUntilLeave = false;
    renderHeaderBall();
  });

  headerBallToggle.addEventListener("pointerleave", () => {
    headerBallIsHovered = false;
    headerBallShowSelectionUntilLeave = false;
    renderHeaderBall();
  });

  headerBallToggle.addEventListener("click", () => {
    setProfileOpen(!profileIsOpen);
    headerBallShowSelectionUntilLeave = true;
    renderHeaderBall();
    headerBallToggle.classList.remove("is-shaking");
    void headerBallToggle.offsetWidth;
    headerBallToggle.classList.add("is-shaking");
  });

  headerBallIcon.addEventListener("animationend", () => {
    headerBallToggle.classList.remove("is-shaking");
  });

  window.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !profileIsOpen) return;
    setProfileOpen(false);
    headerBallToggle.focus();
  });
}

function setButtonImage(button, state) {
  button.querySelector("img").src = buttonAssets[button.dataset.choice][state];
}

for (const button of choiceButtons) {
  button.addEventListener("pointerenter", () => {
    if (button.getAttribute("aria-pressed") !== "true") setButtonImage(button, "hover");
  });

  button.addEventListener("pointerleave", () => {
    if (button.getAttribute("aria-pressed") !== "true") setButtonImage(button, "idle");
  });

  button.addEventListener("pointerdown", () => setButtonImage(button, "pressed"));
  button.addEventListener("pointerup", () => {
    if (button.getAttribute("aria-pressed") !== "true") setButtonImage(button, "hover");
  });

  button.addEventListener("click", () => {
    if (choiceStage === "category") {
      choiceStage = "companion";
      ["friend", "lover"].forEach((choice, index) => {
        const nextButton = choiceButtons[index];
        nextButton.dataset.choice = choice;
        nextButton.setAttribute("aria-label", choiceLabels[choice]);
        nextButton.setAttribute("aria-pressed", "false");
        setButtonImage(nextButton, nextButton.matches(":hover") ? "hover" : "idle");
      });
      return;
    }

    for (const other of choiceButtons) {
      const selected = other === button;
      other.setAttribute("aria-pressed", String(selected));
      setButtonImage(other, selected ? "pressed" : "idle");
    }

    choiceStage = "draw";
    expandScrollingMachine();
    canvas.classList.add("is-draw-ready");
    if (leverControl) leverControl.disabled = true;
    drawStage?.classList.add("is-active");
    drawStage?.setAttribute("aria-hidden", "false");
    if (drawStage) drawStage.inert = false;
  });
}

for (const choice of Object.values(buttonAssets)) {
  for (const path of Object.values(choice)) {
    const image = new Image();
    image.src = path;
  }
}

const purpleHeaderBall = new Image();
purpleHeaderBall.src = headerBallAssets.purple;

for (const src of [
  "2st_img/프로필/3st_img/머신 (레버X).svg",
  "2st_img/프로필/3st_img/레버.svg",
  "2st_img/프로필/3st_img/회전커서.svg",
  "2st_img/프로필/3st_img/회전화살표.svg"
]) {
  const image = new Image();
  image.src = src;
}

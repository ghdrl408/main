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
    const targetHeight = targetWidth * (1010 / 659);
    clone.style.left = `${(drawStage.clientWidth - targetWidth) / 2}px`;
    clone.style.top = `${drawStage.clientHeight * 0.98 - targetHeight}px`;
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
  const shell = drawMachineSlot?.querySelector(".machine-art");
  if (shell) shell.src = "3st_img/머신 (레버X).svg";
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

const profilePanelElement = document.querySelector("#profile-panel");
const profileOverview = document.querySelector("#profile-view");
const profileEditView = document.querySelector("#profile-edit-view");
const profileEditButton = document.querySelector(".profile-edit");
const profileBackButton = document.querySelector("#profile-back");

function setProfileEditing(isEditing) {
  profilePanelElement?.classList.toggle("is-editing", isEditing);
  profileOverview?.setAttribute("aria-hidden", String(isEditing));
  profileEditView?.setAttribute("aria-hidden", String(!isEditing));
  if (profileOverview) profileOverview.inert = isEditing;
  if (profileEditView) profileEditView.inert = !isEditing;
}

profileEditButton?.addEventListener("click", () => setProfileEditing(true));
profileBackButton?.addEventListener("click", () => {
  setProfileEditing(false);
  profileEditButton?.focus();
});

const profileStorageKey = "gacha-pick-profile-settings";
let profileSettings = {};
try {
  profileSettings = JSON.parse(localStorage.getItem(profileStorageKey) || "{}") || {};
} catch {
  profileSettings = {};
}

function saveProfileSettings(changes) {
  profileSettings = { ...profileSettings, ...changes };
  try {
    localStorage.setItem(profileStorageKey, JSON.stringify(profileSettings));
  } catch {
    // The current page still reflects edits when local storage is unavailable.
  }
}

const nicknameInput = document.querySelector("#profile-nickname");
const nicknameClearButton = document.querySelector("#profile-nickname-clear");
const profileNameDisplay = document.querySelector(".profile-info .name-part");
const editAvatar = document.querySelector("#profile-edit-avatar");
const profileAvatar = document.querySelector(".profile-avatar");
const photoPicker = document.querySelector("#profile-photo-input");
const photoPickerButton = document.querySelector("#profile-photo-button");
const provinceSelect = document.querySelector("#profile-province");
const citySelect = document.querySelector("#profile-city");

if (nicknameInput) {
  nicknameInput.value = profileSettings.nickname ?? "김김";
  if (profileNameDisplay) profileNameDisplay.textContent = nicknameInput.value || "김김";
  nicknameInput.addEventListener("input", () => {
    if (profileNameDisplay) profileNameDisplay.textContent = nicknameInput.value || "김김";
    saveProfileSettings({ nickname: nicknameInput.value });
  });
}

nicknameClearButton?.addEventListener("click", () => {
  if (!nicknameInput) return;
  nicknameInput.value = "";
  nicknameInput.focus();
  nicknameInput.dispatchEvent(new Event("input", { bubbles: true }));
});

const regionChoices = {
  "서울특별시": "종로구 중구 용산구 성동구 광진구 동대문구 중랑구 성북구 강북구 도봉구 노원구 은평구 서대문구 마포구 양천구 강서구 구로구 금천구 영등포구 동작구 관악구 서초구 강남구 송파구 강동구",
  "부산광역시": "중구 서구 동구 영도구 부산진구 동래구 남구 북구 해운대구 사하구 금정구 강서구 연제구 수영구 사상구 기장군",
  "대구광역시": "중구 동구 서구 남구 북구 수성구 달서구 달성군 군위군",
  "인천광역시": "제물포구 영종구 미추홀구 연수구 남동구 부평구 계양구 서해구 검단구 강화군 옹진군",
  "광주광역시": "동구 서구 남구 북구 광산구",
  "대전광역시": "동구 중구 서구 유성구 대덕구",
  "울산광역시": "중구 남구 동구 북구 울주군",
  "세종특별자치시": "세종시",
  "경기도": "수원시 용인시 고양시 화성시 성남시 부천시 남양주시 안산시 평택시 안양시 시흥시 파주시 김포시 의정부시 광주시 하남시 광명시 군포시 양주시 오산시 이천시 안성시 구리시 의왕시 포천시 여주시 동두천시 과천시 양평군 가평군 연천군",
  "강원특별자치도": "춘천시 원주시 강릉시 동해시 태백시 속초시 삼척시 홍천군 횡성군 영월군 평창군 정선군 철원군 화천군 양구군 인제군 고성군 양양군",
  "충청북도": "청주시 충주시 제천시 보은군 옥천군 영동군 증평군 진천군 괴산군 음성군 단양군",
  "충청남도": "천안시 공주시 보령시 아산시 서산시 논산시 계룡시 당진시 금산군 부여군 서천군 청양군 홍성군 예산군 태안군",
  "전북특별자치도": "전주시 군산시 익산시 정읍시 남원시 김제시 완주군 진안군 무주군 장수군 임실군 순창군 고창군 부안군",
  "전라남도": "목포시 여수시 순천시 나주시 광양시 담양군 곡성군 구례군 고흥군 보성군 화순군 장흥군 강진군 해남군 영암군 무안군 함평군 영광군 장성군 완도군 진도군 신안군",
  "경상북도": "포항시 경주시 김천시 안동시 구미시 영주시 영천시 상주시 문경시 경산시 의성군 청송군 영양군 영덕군 청도군 고령군 성주군 칠곡군 예천군 봉화군 울진군 울릉군",
  "경상남도": "창원시 김해시 진주시 양산시 거제시 통영시 사천시 밀양시 고성군 남해군 하동군 산청군 함양군 거창군 합천군 의령군 창녕군 함안군",
  "제주특별자치도": "제주시 서귀포시"
};

function addSelectOption(select, label, value = label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.append(option);
}

function populateCityOptions(province, selectedCity = "전체") {
  if (!citySelect) return;
  citySelect.replaceChildren();
  addSelectOption(citySelect, "전체", "전체");
  const cities = regionChoices[province]?.split(" ") || [];
  for (const city of cities) addSelectOption(citySelect, city);
  citySelect.disabled = !province;
  citySelect.value = province && cities.includes(selectedCity) ? selectedCity : "전체";
}

if (provinceSelect && citySelect) {
  for (const province of Object.keys(regionChoices)) addSelectOption(provinceSelect, province);
  provinceSelect.value = regionChoices[profileSettings.province] ? profileSettings.province : "부산광역시";
  populateCityOptions(provinceSelect.value, profileSettings.city || "전체");
  provinceSelect.addEventListener("change", () => {
    populateCityOptions(provinceSelect.value, "전체");
    saveProfileSettings({ province: provinceSelect.value, city: citySelect.value });
  });
  citySelect.addEventListener("change", () => {
    saveProfileSettings({ province: provinceSelect.value, city: citySelect.value });
  });
  saveProfileSettings({ province: provinceSelect.value, city: citySelect.value });
}

for (const radio of document.querySelectorAll('input[name="profile-age"]')) {
  radio.checked = radio.value === (profileSettings.age || "20대");
  radio.addEventListener("change", () => {
    if (radio.checked) saveProfileSettings({ age: radio.value });
  });
}

for (const radio of document.querySelectorAll('input[name="profile-car"]')) {
  radio.checked = radio.value === (profileSettings.car || "없음");
  radio.addEventListener("change", () => {
    if (radio.checked) saveProfileSettings({ car: radio.value });
  });
}

if (profileSettings.photo && editAvatar && profileAvatar) {
  editAvatar.src = profileSettings.photo;
  profileAvatar.src = profileSettings.photo;
}

photoPickerButton?.addEventListener("click", () => photoPicker?.click());
photoPicker?.addEventListener("change", () => {
  const file = photoPicker.files?.[0];
  if (!file || !file.type.startsWith("image/") || !editAvatar || !profileAvatar) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const source = new Image();
    source.addEventListener("load", () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 512 / Math.max(source.naturalWidth, source.naturalHeight));
      canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
      canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL("image/jpeg", 0.88);
      editAvatar.src = photo;
      profileAvatar.src = photo;
      saveProfileSettings({ photo });
    }, { once: true });
    source.src = String(reader.result);
  }, { once: true });
  reader.readAsDataURL(file);
});

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
  "3st_img/머신 (레버X).svg",
  "3st_img/레버.svg",
  "3st_img/회전커서.svg",
  "3st_img/회전화살표.svg"
]) {
  const image = new Image();
  image.src = src;
}

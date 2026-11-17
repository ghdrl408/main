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
const machineCanvas = document.querySelector("#design-canvas");
const firstMachine = machineTrack.querySelector(".machine");
const machineGroup = machineTrack.firstElementChild;
const machineSpeedAtReferenceWidth = (1380 / 18) * 0.95 * 0.7;
const machineReferenceWidth = 1380;
const machineCycleRatio = (5 * 11.88 + 5 * 2.55) / 100;
const machineLoopsPerSecond = machineSpeedAtReferenceWidth / (machineReferenceWidth * machineCycleRatio);
let machineCycleDistance = 0;
let machineOffset = 0;
let machineProgress = 0;
let lastMachineFrame = null;

function measureMachineLoop() {
  if (!machineGroup || !firstMachine) return;
  const previousCycle = machineCycleDistance;
  const margin = Number.parseFloat(getComputedStyle(machineGroup).marginRight) || 0;
  machineCycleDistance = machineGroup.getBoundingClientRect().width + margin;
  if (previousCycle > 0 && machineCycleDistance > 0) {
    machineProgress = (machineOffset / previousCycle) % 1;
  }
  machineOffset = machineProgress * machineCycleDistance;
  machineTrack.style.top = `${Math.max(0, (machineViewport.clientHeight - firstMachine.getBoundingClientRect().height) / 2)}px`;
  machineTrack.style.transform = `translate3d(${-machineOffset}px, 0, 0)`;
}

function animateMachines(time) {
  if (lastMachineFrame !== null && machineCycleDistance > 0) {
    const elapsed = Math.min(time - lastMachineFrame, 50);
    machineProgress = (machineProgress + machineLoopsPerSecond * elapsed / 1000) % 1;
    machineOffset = machineProgress * machineCycleDistance;
    machineTrack.style.transform = `translate3d(${-machineOffset}px, 0, 0)`;
  }
  lastMachineFrame = time;
  window.requestAnimationFrame(animateMachines);
}

measureMachineLoop();
new ResizeObserver(measureMachineLoop).observe(machineCanvas);
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
const leverGesture = drawStage?.querySelector(".lever-gesture");
const leverArt = document.querySelector(".lever-art");
const gachaResult = document.querySelector("#gacha-result");
const gachaResultPackage = document.querySelector("#gacha-result-package");
const gachaResultLabel = document.querySelector("#gacha-result-label");
const choiceLabels = {
  place: "어디갈까?",
  food: "뭐먹을까?",
  friend: "친구랑",
  lover: "연인이랑"
};
let choiceStage = "category";
let selectedActivityChoice = "place";
let leverRotation = 0;
let leverDragStart = null;
let activeDrawMachine = null;

const foodResultOptions = [
  { label: "봉골레 파스타", keywords: ["이국적인", "담백한"] },
  { label: "순두부찌개", keywords: ["얼큰한", "부드러운"] },
  { label: "연어초밥", keywords: ["담백한", "진한"] },
  { label: "물냉면과 갈비만두", keywords: ["새콤한", "든든한"] },
  { label: "김치찌개", keywords: ["매운", "얼큰한", "진한"] },
  { label: "간장게장", keywords: ["짭짤한", "진한"] },
  { label: "크림 리소토", keywords: ["부드러운", "고소한"] },
  { label: "해물파전", keywords: ["바삭한", "고소한"] },
  { label: "마라샹궈", keywords: ["매운", "얼큰한", "이국적인"] },
  { label: "냉모밀", keywords: ["가벼운", "담백한"] },
  { label: "돈코츠라멘", keywords: ["진한", "든든한", "이국적인"] },
  { label: "베트남 쌀국수", keywords: ["이국적인", "담백한"] },
  { label: "뼈해장국", keywords: ["얼큰한", "든든한", "진한"] },
  { label: "소금빵", keywords: ["짭짤한", "고소한"] },
  { label: "꿀호떡", keywords: ["달콤한", "촉촉한"] },
  { label: "탕수육", keywords: ["바삭한", "달콤한"] },
  { label: "양념치킨", keywords: ["달콤한", "바삭한"] },
  { label: "후라이드치킨", keywords: ["바삭한", "든든한"] },
  { label: "제육볶음", keywords: ["매운", "든든한"] },
  { label: "오징어볶음", keywords: ["매운", "쫄깃한"] },
  { label: "갈비찜", keywords: ["달콤한", "든든한"] },
  { label: "비빔밥", keywords: ["가벼운", "든든한"] },
  { label: "들기름 막국수", keywords: ["고소한", "쫄깃한"] },
  { label: "잔치국수", keywords: ["담백한", "가벼운"] },
  { label: "칼국수", keywords: ["든든한", "쫄깃한"] },
  { label: "마늘보쌈", keywords: ["고소한", "든든한"] },
  { label: "샤브샤브", keywords: ["가벼운", "담백한"] },
  { label: "곱창전골", keywords: ["얼큰한", "진한"] },
  { label: "부대찌개", keywords: ["얼큰한", "매운", "든든한"] },
  { label: "감자탕", keywords: ["얼큰한", "든든한"] },
  { label: "춘천 닭갈비", keywords: ["매운", "든든한"], province: "강원특별자치도", cities: ["춘천시"] },
  { label: "찜닭", keywords: ["달콤한", "든든한"] },
  { label: "닭한마리 칼국수", keywords: ["담백한", "든든한"] },
  { label: "고등어구이 정식", keywords: ["짭짤한", "담백한"] },
  { label: "연어덮밥", keywords: ["담백한", "가벼운"] },
  { label: "장어덮밥", keywords: ["진한", "든든한"] },
  { label: "새우튀김 우동", keywords: ["바삭한", "쫄깃한"] },
  { label: "냉우동", keywords: ["쫄깃한", "가벼운"] },
  { label: "돈카츠 카레", keywords: ["바삭한", "든든한"] },
  { label: "토마토 파스타", keywords: ["새콤한", "이국적인"] },
  { label: "로제 파스타", keywords: ["부드러운", "진한"] },
  { label: "새우크림 파스타", keywords: ["고소한", "부드러운"] },
  { label: "고르곤졸라 피자", keywords: ["짭짤한", "고소한"] },
  { label: "페퍼로니 피자", keywords: ["짭짤한", "진한"] },
  { label: "수제버거와 감자튀김", keywords: ["든든한", "바삭한"] },
  { label: "타코와 나초", keywords: ["이국적인", "바삭한"] },
  { label: "팟타이", keywords: ["새콤한", "이국적인"] },
  { label: "마라탕", keywords: ["매운", "얼큰한", "이국적인"] },
  { label: "순대국밥", keywords: ["든든한", "진한"] },
  { label: "설렁탕", keywords: ["부드러운", "담백한"] },
  { label: "부산 돼지국밥", keywords: ["든든한", "진한"], province: "부산광역시" },
  { label: "부산 밀면", keywords: ["새콤한", "쫄깃한", "가벼운"], province: "부산광역시" },
  { label: "강릉 초당순두부", keywords: ["부드러운", "담백한"], province: "강원특별자치도", cities: ["강릉시"] },
  { label: "제주 흑돼지구이", keywords: ["고소한", "든든한"], province: "제주특별자치도" },
  { label: "전주 비빔밥", keywords: ["가벼운", "든든한"], province: "전북특별자치도", cities: ["전주시"] },
  { label: "대구 막창구이", keywords: ["고소한", "진한"], province: "대구광역시" },
  { label: "대전 두부두루치기", keywords: ["매운", "든든한"], province: "대전광역시" },
  { label: "여수 갓김치 삼합", keywords: ["매운", "진한"], province: "전라남도", cities: ["여수시"] },
  { label: "속초 오징어순대", keywords: ["쫄깃한", "든든한"], province: "강원특별자치도", cities: ["속초시"] },
  { label: "인천 차이나타운 짜장면", keywords: ["달콤한", "든든한"], province: "인천광역시" }
];

const placeResultOptions = [
  { label: "방탈출 카페", keywords: ["이색적인", "활기찬"] },
  { label: "강아지 카페", keywords: ["귀여운", "아늑한", "아기자기한", "데이트"] },
  { label: "불꽃축제", keywords: ["북적이는", "활기찬", "낭만적인"] },
  { label: "인생네컷 사진관", keywords: ["귀여운", "활기찬", "아기자기한", "데이트"] },
  { label: "보드게임 카페", keywords: ["아늑한", "활기찬"] },
  { label: "만화 카페", keywords: ["아늑한", "조용한"] },
  { label: "실내 클라이밍장", keywords: ["활기찬", "이색적인"] },
  { label: "볼링장", keywords: ["활기찬", "북적이는"] },
  { label: "코인 노래방", keywords: ["활기찬", "북적이는"] },
  { label: "아쿠아리움", keywords: ["몽환적인", "이색적인"] },
  { label: "미술관 전시", keywords: ["조용한", "감성적인"] },
  { label: "독립 서점", keywords: ["조용한", "감성적인"] },
  { label: "빈티지 소품샵", keywords: ["빈티지한", "빈티지", "레트로", "이색적인"] },
  { label: "플라워 카페", keywords: ["감성적인", "아늑한", "분위기있는", "아기자기한", "데이트"] },
  { label: "루프탑 야경 명소", keywords: ["낭만적인", "분위기 있는", "분위기있는", "데이트"] },
  { label: "식물원 산책", keywords: ["자연의", "여유로운"] },
  { label: "야시장 구경", keywords: ["활기찬", "북적이는"] },
  { label: "전통시장 먹거리 골목", keywords: ["북적이는", "이색적인"] },
  { label: "유람선 야경 투어", keywords: ["낭만적인", "탁 트인"] },
  { label: "근교 드라이브 코스", keywords: ["여유로운", "자연의"] },
  { label: "야외 영화제", keywords: ["낭만적인", "분위기 있는", "분위기있는", "데이트"] },
  { label: "야구 경기장", keywords: ["활기찬", "북적이는"] },
  { label: "캠핑장", keywords: ["자연의", "여유로운"] },
  { label: "글램핑장", keywords: ["아늑한", "자연의"] },
  { label: "재즈 라이브 공연", keywords: ["감성적인", "분위기 있는", "분위기있는", "데이트"] },
  { label: "서울숲 산책", keywords: ["자연의", "여유로운"], province: "서울특별시", cities: ["성동구"] },
  { label: "북촌 한옥마을", keywords: ["감성적인", "조용한"], province: "서울특별시", cities: ["종로구"] },
  { label: "여의도 한강공원 피크닉", keywords: ["탁 트인", "여유로운"], province: "서울특별시", cities: ["영등포구"] },
  { label: "남산 둘레길", keywords: ["자연의", "낭만적인"], province: "서울특별시", cities: ["중구", "용산구"] },
  { label: "수원 화성 산책", keywords: ["감성적인", "여유로운"], province: "경기도", cities: ["수원시"] },
  { label: "파주 출판도시 구경", keywords: ["조용한", "감성적인"], province: "경기도", cities: ["파주시"] },
  { label: "해운대 해수욕장", keywords: ["탁 트인", "자연의", "북적이는"], province: "부산광역시", cities: ["해운대구"] },
  { label: "광안리 해수욕장", keywords: ["낭만적인", "탁 트인", "북적이는"], province: "부산광역시", cities: ["수영구"] },
  { label: "다대포 해수욕장 노을 산책", keywords: ["낭만적인", "탁 트인", "여유로운"], province: "부산광역시", cities: ["사하구"] },
  { label: "태종대 해안 산책", keywords: ["자연의", "탁 트인", "여유로운"], province: "부산광역시", cities: ["영도구"] },
  { label: "앞산 전망대 야경", keywords: ["낭만적인", "탁 트인"], province: "대구광역시", cities: ["남구"] },
  { label: "수성못 산책", keywords: ["여유로운", "낭만적인"], province: "대구광역시", cities: ["수성구"] },
  { label: "월미도 바닷길", keywords: ["활기찬", "탁 트인"], province: "인천광역시", cities: ["제물포구"] },
  { label: "을왕리 해수욕장", keywords: ["탁 트인", "자연의", "여유로운"], province: "인천광역시", cities: ["영종구"] },
  { label: "송도 센트럴파크", keywords: ["세련된", "여유로운"], province: "인천광역시", cities: ["연수구"] },
  { label: "무등산 숲길", keywords: ["자연의", "조용한"], province: "광주광역시", cities: ["동구"] },
  { label: "한밭수목원 산책", keywords: ["자연의", "여유로운"], province: "대전광역시", cities: ["서구"] },
  { label: "대왕암공원 바다 산책", keywords: ["탁 트인", "자연의"], province: "울산광역시", cities: ["동구"] },
  { label: "세종호수공원 피크닉", keywords: ["여유로운", "탁 트인"], province: "세종특별자치시" },
  { label: "경포해변 산책", keywords: ["탁 트인", "자연의", "여유로운"], province: "강원특별자치도", cities: ["강릉시"] },
  { label: "강릉 안목해변 커피거리", keywords: ["감성적인", "탁 트인"], province: "강원특별자치도", cities: ["강릉시"] },
  { label: "속초해변 산책", keywords: ["탁 트인", "자연의"], province: "강원특별자치도", cities: ["속초시"] },
  { label: "낙산해변 일출 산책", keywords: ["낭만적인", "탁 트인"], province: "강원특별자치도", cities: ["양양군"] },
  { label: "대천해수욕장", keywords: ["활기찬", "탁 트인"], province: "충청남도", cities: ["보령시"] },
  { label: "단양 도담삼봉", keywords: ["자연의", "몽환적인"], province: "충청북도", cities: ["단양군"] },
  { label: "전주 한옥마을", keywords: ["감성적인", "북적이는"], province: "전북특별자치도", cities: ["전주시"] },
  { label: "여수 오동도 산책", keywords: ["자연의", "여유로운"], province: "전라남도", cities: ["여수시"] },
  { label: "포항 영일대해수욕장", keywords: ["탁 트인", "활기찬"], province: "경상북도", cities: ["포항시"] },
  { label: "경주 동궁과 월지 야경", keywords: ["낭만적인", "몽환적인"], province: "경상북도", cities: ["경주시"] },
  { label: "거제 바람의 언덕", keywords: ["탁 트인", "자연의"], province: "경상남도", cities: ["거제시"] },
  { label: "협재해수욕장", keywords: ["탁 트인", "자연의", "여유로운"], province: "제주특별자치도", cities: ["제주시"] },
  { label: "함덕해수욕장", keywords: ["탁 트인", "자연의", "낭만적인"], province: "제주특별자치도", cities: ["제주시"] },
  { label: "월정리 해변 산책", keywords: ["감성적인", "탁 트인"], province: "제주특별자치도", cities: ["제주시"] },
  { label: "성산일출봉 일출 보기", keywords: ["자연의", "탁 트인", "낭만적인"], province: "제주특별자치도", cities: ["서귀포시"] },
  { label: "통영 케이블카", keywords: ["탁 트인", "이색적인"], province: "경상남도", cities: ["통영시"] },
  { label: "순천만국가정원 산책", keywords: ["자연의", "여유로운"], province: "전라남도", cities: ["순천시"] },
  { label: "양평 두물머리 산책", keywords: ["자연의", "여유로운", "낭만적인"], province: "경기도", cities: ["양평군"] }
];

const nearbyProvincesByProvince = {
  "서울특별시": ["경기도", "인천광역시", "강원특별자치도"],
  "부산광역시": ["울산광역시", "경상남도", "경상북도"],
  "대구광역시": ["경상북도", "경상남도", "울산광역시"],
  "인천광역시": ["서울특별시", "경기도", "충청남도"],
  "광주광역시": ["전라남도", "전북특별자치도"],
  "대전광역시": ["세종특별자치시", "충청남도", "충청북도"],
  "울산광역시": ["부산광역시", "경상남도", "경상북도"],
  "세종특별자치시": ["대전광역시", "충청남도", "충청북도"],
  "경기도": ["서울특별시", "인천광역시", "강원특별자치도", "충청북도", "충청남도"],
  "강원특별자치도": ["서울특별시", "경기도", "충청북도", "경상북도"],
  "충청북도": ["경기도", "강원특별자치도", "충청남도", "대전광역시", "세종특별자치시", "경상북도", "전북특별자치도"],
  "충청남도": ["경기도", "인천광역시", "대전광역시", "세종특별자치시", "충청북도", "전북특별자치도"],
  "전북특별자치도": ["충청남도", "충청북도", "전라남도", "경상남도"],
  "전라남도": ["광주광역시", "전북특별자치도", "경상남도"],
  "경상북도": ["강원특별자치도", "충청북도", "대구광역시", "울산광역시", "경상남도"],
  "경상남도": ["부산광역시", "울산광역시", "경상북도", "전북특별자치도", "전라남도"],
  "제주특별자치도": []
};

function makeGachaResultLabel() {
  const resultOptions = selectedActivityChoice === "food" ? foodResultOptions : placeResultOptions;
  const selectedKeywords = Array.isArray(profileSettings.keywords) ? profileSettings.keywords : [];
  const province = profileSettings.province;
  const city = profileSettings.city || "전체";
  const carCanExpandPlaces = selectedActivityChoice === "place" && profileSettings.car === "있음";
  const nearbyProvinces = new Set(carCanExpandPlaces ? nearbyProvincesByProvince[province] || [] : []);
  const optionPoolByRegion = resultOptions.filter(option => {
    if (!option.province) return true;
    if (option.province === province) {
      return carCanExpandPlaces || city === "전체" || !option.cities || option.cities.includes(city);
    }
    return nearbyProvinces.has(option.province);
  });
  const eligibleOptions = optionPoolByRegion.length
    ? optionPoolByRegion
    : resultOptions.filter(option => !option.province);
  const scoredOptions = eligibleOptions.map(option => ({
    option,
    score: option.keywords.reduce((score, keyword) => score + Number(selectedKeywords.includes(keyword)), 0)
  }));
  const bestScore = Math.max(0, ...scoredOptions.map(item => item.score));
  const minimumKeywordScore = Math.max(1, bestScore - 1);
  const optionPool = bestScore > 0
    ? scoredOptions.filter(item => item.score >= minimumKeywordScore).map(item => item.option)
    : eligibleOptions;
  const selectedResult = optionPool[Math.floor(Math.random() * optionPool.length)];
  return selectedResult.label;
}

function showGachaResult() {
  if (!activeDrawMachine || !gachaResult || !gachaResultPackage) return;

  const stageBounds = drawStage.getBoundingClientRect();
  const zoomedMachineBounds = activeDrawMachine.getBoundingClientRect();
  const zoomedMachineLeft = zoomedMachineBounds.left - stageBounds.left;
  const zoomedMachineTop = zoomedMachineBounds.top - stageBounds.top;
  const fullMachineHeight = stageBounds.height * 0.92;
  const fullMachineWidth = fullMachineHeight * (658 / 1010);
  const fullMachineLeft = stageBounds.width * 0.13;
  const fullMachineTop = stageBounds.height * 0.03;
  const outletX = zoomedMachineLeft + zoomedMachineBounds.width * 0.75;
  const outletY = zoomedMachineTop + zoomedMachineBounds.height * 0.78;
  const setPosition = (name, value) => gachaResultPackage.style.setProperty(name, `${value}px`);
  setPosition("--ball-start-x", outletX);
  setPosition("--ball-start-y", outletY);
  setPosition("--ball-mid-x", stageBounds.width * 0.49);
  setPosition("--ball-mid-y", stageBounds.height * 0.59);
  setPosition("--ball-center-x", stageBounds.width * 0.52);
  setPosition("--ball-center-y", stageBounds.height * 0.49);
  setPosition("--result-ball-size", fullMachineWidth * 0.55);
  setPosition("--split-distance", fullMachineWidth * 0.2);
  setPosition("--left-land-x", stageBounds.width * 0.26);
  setPosition("--right-land-x", stageBounds.width * 0.74);
  setPosition("--floor-y", stageBounds.height * 0.84);
  setPosition("--paper-x", stageBounds.width * 0.52);
  setPosition("--paper-y", stageBounds.height * 0.47);
  setPosition("--paper-size", fullMachineWidth * 0.88);
  gachaResultLabel.textContent = makeGachaResultLabel();
  gachaResult.className = "draw-result is-active";
  gachaResult.setAttribute("aria-hidden", "false");
  drawStage.classList.remove("is-lever-ready");
  drawStage.classList.add("is-result-active");
  leverControl.disabled = true;

  activeDrawMachine.classList.remove("is-zooming");
  void activeDrawMachine.offsetWidth;
  activeDrawMachine.classList.add("is-result-reframing");
  activeDrawMachine.style.left = `${fullMachineLeft}px`;
  activeDrawMachine.style.top = `${fullMachineTop}px`;
  activeDrawMachine.style.width = `${fullMachineWidth}px`;
  activeDrawMachine.style.height = `${fullMachineHeight}px`;

  gachaResult.classList.add("is-popping");
  window.setTimeout(() => gachaResult.classList.add("is-splitting"), 1150);
  window.setTimeout(() => gachaResult.classList.add("is-falling"), 1400);
  window.setTimeout(() => gachaResult.classList.add("is-landed"), 2300);
  window.setTimeout(() => gachaResult.classList.add("is-half"), 2500);
  window.setTimeout(() => gachaResult.classList.add("is-open"), 3100);
}

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
  const cloneArt = clone.querySelector(".machine-art");
  if (cloneArt) cloneArt.src = "3st_img/머신 (레버X).svg";
  clone.append(leverControl, leverGesture);

  const border = Number.parseFloat(getComputedStyle(drawStage).borderLeftWidth) || 0;
  clone.style.left = `${source.bounds.left - stageBounds.left - border}px`;
  clone.style.top = `${source.bounds.top - stageBounds.top - border}px`;
  clone.style.width = `${source.bounds.width}px`;
  clone.style.height = `${source.bounds.height}px`;
  activeDrawMachine = clone;
  drawMachineSlot.replaceChildren(clone);
  void clone.offsetWidth;

  requestAnimationFrame(() => {
    clone.classList.add("is-zooming");
    const targetWidth = drawStage.clientWidth * 0.62;
    const targetHeight = targetWidth * (1010 / 658);
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
  if (event.animationName !== "gesture-orbit-travel") return;
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
  leverDragStart = {
    lastPointerAngle: getPointerAngle(event, leverControl),
    leverRotation,
    travel: 0
  };
  leverControl.setPointerCapture(event.pointerId);
});

leverControl?.addEventListener("pointermove", event => {
  if (!drawStage?.classList.contains("is-lever-ready") || !leverDragStart) return;
  const pointerAngle = getPointerAngle(event, leverControl);
  let delta = pointerAngle - leverDragStart.lastPointerAngle;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  leverDragStart.lastPointerAngle = pointerAngle;
  leverDragStart.travel += delta;
  leverRotation = leverDragStart.leverRotation + leverDragStart.travel;
  leverArt.style.transform = `rotate(${leverRotation}deg)`;
});

function endLeverDrag(event) {
  const completedDraw = event.type === "pointerup" && Math.abs(leverDragStart?.travel || 0) >= 330;
  leverDragStart = null;
  if (completedDraw) {
    incrementDrawCount();
    showGachaResult();
  }
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
    if (isOpen) {
      setProfileEditing(false);
      setKeywordEditing(false);
    }
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
const designCanvasElement = document.querySelector("#design-canvas");
const profileOverview = document.querySelector("#profile-view");
const profileEditView = document.querySelector("#profile-edit-view");
const profileEditButton = document.querySelector(".profile-edit");
const profileBackButton = document.querySelector("#profile-back");
const keywordEditView = document.querySelector("#keyword-edit-view");
const keywordEditButton = document.querySelector(".keyword-edit");
const keywordBackButton = document.querySelector("#keyword-back");

function updateEditorVisibility() {
  const editorVisible = profilePanelElement?.classList.contains("is-editing")
    || profilePanelElement?.classList.contains("is-keyword-editing");
  designCanvasElement?.classList.toggle("is-editor-visible", Boolean(editorVisible));
}

function setProfileEditing(isEditing) {
  profilePanelElement?.classList.toggle("is-editing", isEditing);
  if (isEditing) profilePanelElement?.classList.remove("is-keyword-editing");
  updateEditorVisibility();
  profileOverview?.setAttribute("aria-hidden", String(isEditing));
  profileEditView?.setAttribute("aria-hidden", String(!isEditing));
  keywordEditView?.setAttribute("aria-hidden", "true");
  if (profileOverview) profileOverview.inert = isEditing;
  if (profileEditView) profileEditView.inert = !isEditing;
  if (keywordEditView) keywordEditView.inert = true;
}

function setKeywordEditing(isEditing) {
  profilePanelElement?.classList.toggle("is-keyword-editing", isEditing);
  if (isEditing) profilePanelElement?.classList.remove("is-editing");
  updateEditorVisibility();
  profileOverview?.setAttribute("aria-hidden", String(isEditing));
  profileEditView?.setAttribute("aria-hidden", "true");
  keywordEditView?.setAttribute("aria-hidden", String(!isEditing));
  if (profileOverview) profileOverview.inert = isEditing;
  if (profileEditView) profileEditView.inert = true;
  if (keywordEditView) keywordEditView.inert = !isEditing;
}

profileEditButton?.addEventListener("click", () => setProfileEditing(true));
profileBackButton?.addEventListener("click", () => {
  setProfileEditing(false);
  profileEditButton?.focus();
});
keywordEditButton?.addEventListener("click", () => setKeywordEditing(true));
keywordBackButton?.addEventListener("click", () => {
  setKeywordEditing(false);
  keywordEditButton?.focus();
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

const drawCountDisplay = document.querySelector(".draw-count");
let drawCount = Number.isSafeInteger(profileSettings.drawCount) && profileSettings.drawCount >= 0
  ? profileSettings.drawCount
  : 0;

function renderDrawCount() {
  if (drawCountDisplay) drawCountDisplay.textContent = String(drawCount);
}

function incrementDrawCount() {
  drawCount += 1;
  saveProfileSettings({ drawCount });
  renderDrawCount();
}

renderDrawCount();

const keywordGroups = [
  ["매운", "달콤한", "짭짤한", "고소한", "새콤한", "얼큰한", "담백한", "바삭한", "촉촉한", "쫄깃한", "부드러운", "진한", "든든한", "가벼운", "이국적인"],
  ["귀여운", "분위기 있는", "조용한", "활기찬", "감성적인", "자연의", "탁 트인", "아늑한", "낭만적인", "빈티지한", "세련된", "이색적인", "여유로운", "북적이는", "몽환적인", "빈티지", "레트로", "분위기있는", "아기자기한", "데이트"]
];
const availableKeywords = new Set(keywordGroups.flat());
const savedKeywords = Array.isArray(profileSettings.keywords)
  ? [...new Set(profileSettings.keywords.filter(keyword => availableKeywords.has(keyword)))].slice(0, availableKeywords.size)
  : [];
if (JSON.stringify(savedKeywords) !== JSON.stringify(profileSettings.keywords)) {
  saveProfileSettings({ keywords: savedKeywords });
}
const keywordEditGrid = document.querySelector("#keyword-edit-grid");
const keywordSelectionCount = document.querySelector("#keyword-selection-count");
const profileKeywordCloudTrack = document.querySelector("#profile-keyword-cloud-track");
const profileKeywordCloudImages = [
  "2st_img/프로필수정/구름.png"
];

function renderProfileKeywordClouds() {
  if (!profileKeywordCloudTrack) return;
  const cloudSets = [...profileKeywordCloudTrack.querySelectorAll(".keyword-cloud-set")];
  const selectedKeywords = Array.isArray(profileSettings.keywords) ? profileSettings.keywords : [];
  const card = profileKeywordCloudTrack.closest(".keyword-card");
  const panel = profileKeywordCloudTrack.closest(".profile-panel");
  const cardRect = card?.getBoundingClientRect();
  const panelRect = panel?.getBoundingClientRect();
  const cardWidth = cardRect?.width || (panelRect?.width || 0) * 0.89;
  const cardHeight = cardRect?.height || (panelRect?.height || 0) * 0.592;
  const cloudHeight = cardWidth * 0.86 * 0.4 * (100 / 151);
  const gap = Math.max(8, cardWidth * 0.025);
  const setHeight = selectedKeywords.length
    ? Math.max(cardHeight, selectedKeywords.length * (cloudHeight + gap) + gap)
    : 0;

  profileKeywordCloudTrack.style.height = `${setHeight * 2}px`;
  if (selectedKeywords.length) {
    profileKeywordCloudTrack.style.setProperty("--keyword-rise-duration", `${28 * setHeight / Math.max(cardHeight, 1)}s`);
  } else {
    profileKeywordCloudTrack.style.removeProperty("--keyword-rise-duration");
  }
  profileKeywordCloudTrack.setAttribute(
    "aria-label",
    selectedKeywords.length ? `선호 키워드: ${selectedKeywords.join(", ")}` : "선호 키워드 없음"
  );

  cloudSets.forEach((set, setIndex) => {
    set.replaceChildren();
    set.style.height = `${setHeight}px`;
    set.style.flexBasis = `${setHeight}px`;
    set.style.setProperty("--keyword-cloud-gap", `${gap}px`);
    selectedKeywords.forEach((keyword, index) => {
      const cloud = document.createElement("div");
      cloud.className = "keyword-cloud-item";
      cloud.style.alignSelf = index % 2 === 0 ? "flex-start" : "flex-end";
      cloud.style.setProperty("--cloud-index", String(index));
      cloud.style.setProperty("--cloud-image", `url("${profileKeywordCloudImages[index % profileKeywordCloudImages.length]}")`);
      const label = document.createElement("span");
      label.className = "keyword-cloud-label";
      label.textContent = keyword;
      cloud.append(label);
      set.append(cloud);
    });
    if (setIndex === 1) set.setAttribute("aria-hidden", "true");
  });
}

function updateKeywordSelection() {
  const selectedKeywords = Array.isArray(profileSettings.keywords) ? profileSettings.keywords : [];
  const buttons = [...(keywordEditGrid?.querySelectorAll(".keyword-cloud-option") || [])];
  const focusedButton = buttons.includes(document.activeElement) ? document.activeElement : null;
  const keywordScroll = keywordEditGrid?.closest(".keyword-edit-scroll");
  const scrollTop = keywordScroll?.scrollTop;
  const selectedOrder = new Map(selectedKeywords.map((keyword, index) => [keyword, index]));
  for (const button of buttons) {
    button.setAttribute("aria-pressed", String(selectedKeywords.includes(button.dataset.keyword)));
  }
  const compareWithinGroup = (first, second) => {
    const firstOrder = selectedOrder.get(first.dataset.keyword);
    const secondOrder = selectedOrder.get(second.dataset.keyword);
    if (firstOrder !== undefined && secondOrder !== undefined) return secondOrder - firstOrder;
    if (firstOrder !== undefined) return -1;
    if (secondOrder !== undefined) return 1;
    return Number(first.dataset.keywordIndex) - Number(second.dataset.keywordIndex);
  };
  const foodButtons = buttons.filter(button => button.dataset.keywordGroup === "food").sort(compareWithinGroup);
  const moodButtons = buttons.filter(button => button.dataset.keywordGroup === "mood").sort(compareWithinGroup);
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 15; index += 1) {
    if (foodButtons[index]) fragment.append(foodButtons[index]);
    if (moodButtons[index]) fragment.append(moodButtons[index]);
  }
  keywordEditGrid.replaceChildren(fragment);
  if (keywordScroll && scrollTop !== undefined) keywordScroll.scrollTop = scrollTop;
  focusedButton?.focus({ preventScroll: true });
  if (keywordScroll && scrollTop !== undefined) keywordScroll.scrollTop = scrollTop;
  if (keywordSelectionCount) keywordSelectionCount.textContent = `선택 키워드 ${selectedKeywords.length}/${availableKeywords.size}`;
  renderProfileKeywordClouds();
}

if (keywordEditGrid) {
  for (let row = 0; row < 15; row += 1) {
    for (let column = 0; column < 2; column += 1) {
      const keyword = keywordGroups[column][row];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "keyword-cloud-option";
      button.dataset.keyword = keyword;
      button.dataset.keywordGroup = column === 0 ? "food" : "mood";
      button.dataset.keywordIndex = String(row);
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", `${column === 0 ? "음식" : "장소·분위기"} 키워드 ${keyword}`);
      const cloudImage = document.createElement("img");
      cloudImage.src = "2st_img/프로필/구름3.png";
      cloudImage.alt = "";
      cloudImage.draggable = false;
      button.append(cloudImage);
      const label = document.createElement("span");
      label.textContent = keyword;
      button.append(label);
      button.addEventListener("click", () => {
        const selectedKeywords = Array.isArray(profileSettings.keywords) ? [...profileSettings.keywords] : [];
        const index = selectedKeywords.indexOf(keyword);
        if (index >= 0) {
          selectedKeywords.splice(index, 1);
        } else {
          selectedKeywords.push(keyword);
        }
        saveProfileSettings({ keywords: selectedKeywords });
        updateKeywordSelection();
      });
      keywordEditGrid.append(button);
    }
  }
  updateKeywordSelection();
}

window.addEventListener("resize", renderProfileKeywordClouds);

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
  nicknameInput.value = String(profileSettings.nickname ?? "김김").slice(0, 7);
  if (nicknameInput.value !== profileSettings.nickname) saveProfileSettings({ nickname: nicknameInput.value });
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
      selectedActivityChoice = button.dataset.choice === "food" ? "food" : "place";
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
  "3st_img/커서화살표.svg"
]) {
  const image = new Image();
  image.src = src;
}

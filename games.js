const BENCH_LIMIT = 9;

const champions = [
    { name: "Ace", cost: 5, traits: ["Lover"]},
    { name: "Martee", cost: 3, traits: ["Charismatic", "Sporty", "Weeb"]},
    { name: "Kristjan", cost: 1, traits: ["Charismatic", "Freaky"]},
    { name: "Boots", cost: 2, traits: ["Glasses", "Loud", "Sporty"]},
    { name: "Shan", cost: 2, traits: ["Freaky", "Gamer"]},
    { name: "Axel", cost: 1, traits: ["Chinese", "Tall"]},
    { name: "Charles", cost: 2, traits: ["Gay", "Gamer"]},
    { name: "Marco", cost: 3, traits: ["Charismatic", "Gay", "Tall"]},
    { name: "Ashley", cost: 3, traits: ["Chinese", "Patient", "Smart"]},
    { name: "Rhionna", cost: 2, traits: ["Short", "Feisty", "Loud"]},
    { name: "Stella", cost: 1, traits: ["Patient", "Glasses"]},
    { name: "Eliza", cost: 2, traits: ["Glasses", "Smart"]},
    { name: "Destine", cost: 1, traits: ["Short", "Feisty"]},
    { name: "Andrea", cost: 1, traits: ["Freaky", "Creative"]},
    { name: "Mikka", cost: 2, traits: ["Freaky", "Sporty", "Gay"]},
    { name: "Michelle", cost: 3, traits: ["Short", "Smart", "Weeb"]},
    { name: "Gab", cost: 1, traits: ["Short, Creative"]},

];

let championPool = champions.map(c => ({ ...c }));

const traitTiers = {
    Lover: [1],
    Charismatic: [2, 4],
    Creative: [2, 4],
    Chinese: [2],
    Feisty: [2],
    Freaky: [2, 4],
    Gamer: [2, 4],
    Gay: [2],
    Glasses: [2, 4],
    Loud: [2, 4],
    Patient: [2],
    Short: [3, 6],
    Smart: [2, 4],
    Sporty: [2, 4],
    Tall: [2, 4],
    Weeb: [2, 4],
};

const augments = [
  {
    id: 1,
    name: "Happy..?",
    desc: "All your champions become depressed. <br>Lose all succeeding rounds.",
    type: "autoLose"
  },
  {
    id: 2,
    name: "Birthday XIX",
    desc: "It's the summoner's birthday! But...there's no cake? <br> Lose all succeeding rounds. ",
    type: "autoLose"
  },
  {
    id: 3,
    name: "D.W.Y.A.N.E",
    desc: "Upon reaching 6 traits that make up Dwyane, win!.",
    type: "traitWin",
    traitPool: [
        "Short",
        "Charismatic",
        "Freaky",
        "Gamer",
        "Glasses",
        "Loud",
        "Patient",
        "Smart",
        "Sporty",
        "Weeb",
        "Lover"
    ],
    needed: 6
  }
];

let chosenAugment = null;

let gold = 242006;
let shop = [];
let bench = [];
let board = [];
const BOARD_CAP = 10;

function renderAugments() {
  const container = document.getElementById("augmentOptions");
  container.innerHTML = augments.map(a => `
    <div class="augment" onclick="selectAugment(${a.id})">
      <h3>${a.name}</h3>
      <small>${a.desc}</small>
    </div>
  `).join("");
}

function selectAugment(id) {
  chosenAugment = augments.find(a => a.id === id);
  document.getElementById("augmentScreen").style.display = "none";
}

function randomChampion() {
    if (championPool.length === 0) return null;

    const index = Math.floor(Math.random() * championPool.length);
    return championPool[index];
}

function calculateTraits(units) {
    const counts = {};
    units.forEach(u =>
        u.traits.forEach(t => counts[t] = (counts[t] || 0) + 1)
    );
    return counts;
}

function rollShop() {
  shop = [];

  const tempPool = [...championPool]; 

  for (let i = 0; i < 5; i++) {
    if (tempPool.length === 0) {
      shop.push(null);
      continue;
    }

    const index = Math.floor(Math.random() * tempPool.length);
    const champ = tempPool.splice(index, 1)[0]; 
    shop.push(champ);
  }
}

function reroll() {
    if (gold < 2) return alert("Not enough gold!");
    gold -= 2;
    rollShop();
    render();
}

function buy(i) {
    const unit = shop[i];
    if (!unit) return;
    if (gold < unit.cost) return;
    if (bench.length >= BENCH_LIMIT) {
        alert("Bench is full!");
        return;
    }

    gold -= unit.cost;
    bench.push(unit);

    const poolIndex = championPool.indexOf(unit);
    if (poolIndex !== -1) {
        championPool.splice(poolIndex, 1);
    }

    shop[i] = null;
    render();
}

function moveToBoard(i) {
    if (board.length >= BOARD_CAP) return alert("Board full!");
    board.push(bench.splice(i, 1)[0]);
    render();
}


function showWin() {
  const winScreen = document.getElementById("winScreen");
  const winVideo = document.getElementById("winVideo");

  bgMusic.pause();

  winScreen.style.display = "flex";
  winVideo.currentTime = 0;
  winVideo.volume = 0.9;
  winVideo.play();
}

function closeWin() {
  const winScreen = document.getElementById("winScreen");
  const winVideo = document.getElementById("winVideo");

  winVideo.pause();
  winScreen.style.display = "none";

  bgMusic.play().catch(() => {});
}

function fight() {
    if (!chosenAugment) {
        alert("Pick an augment first!");
        return;
    }

    if (chosenAugment.type === "autoLose") {
        loseGame();
        return;
    }

    if (chosenAugment.type === "traitWin") {
        const traits = calculateTraits(board);

        const activeTraits = Object.keys(traits).filter(trait => {
            const tiers = traitTiers[trait];
            return tiers && traits[trait] >= tiers[0];
        });

        const activeFromPool = chosenAugment.traitPool.filter(t =>
        activeTraits.includes(t)
        );

        if (activeFromPool.length < chosenAugment.needed) {
        loseGame();
        return;
        }
        showWin();
        return;
    }
}

function loseGame() {
  alert("You LOSE! \n\n TARUNGA HAMPANG");
  location.reload();
}

function render() {
    document.getElementById("gold").innerText = `Gold: ${gold}`;
    document.getElementById("unitCap").innerText =
        `Units: ${board.length}/${BOARD_CAP}`;

    document.getElementById("shop").innerHTML = shop.map((c, i) => {
        if (!c) {
        return `<div class="card empty">Empty</div>`;
        }
        return `
        <div class="card">
            <b>${c.name}</b><br>
            <small>${c.traits.join(", ")}</small><br>
            ${c.cost}g<br>
            <button onclick="buy(${i})">Buy</button>
        </div>
        `;
    }).join("");

    document.getElementById("bench").innerHTML = bench.map((c, i) => `
        <div class="card">
            <b>${c.name}</b><br>
            <small>${c.traits.join(", ")}</small><br>
            <button onclick="moveToBoard(${i})">Place</button>
            <button onclick="sellFromBench(${i})">Sell (${c.cost}g)</button>
        </div>
        `).join("");

    document.getElementById("board").innerHTML = board.map((c, i) => `
    <div class="card">
        <b>${c.name}</b><br>
        <small>${c.traits.join(", ")}</small><br>
        <button onclick="retractFromBoard(${i})">Retract</button>
    </div>
    `).join("");

    const traits = calculateTraits(board);

    document.getElementById("traits").innerHTML =
    Object.entries(traits).map(([trait, count]) => {
        const tiers = traitTiers[trait];
        if (!tiers) return "";

        let nextThreshold = tiers[0];

        for (let i = 0; i < tiers.length; i++) {
        if (count >= tiers[i]) {
            nextThreshold = tiers[i + 1] || tiers[i];
        }
        }

        const active = count >= tiers[0];

        return `
        <div class="trait ${active ? "active" : ""}">
            ${trait}: ${count}/${nextThreshold}
        </div>
        `;
    }).join("") || "No traits";


}

function retractFromBoard(i) {
    if (bench.length >= BENCH_LIMIT) {
        alert("Bench is full!");
        return;
    }

    bench.push(board.splice(i, 1)[0]);
    render();
}

function sellFromBench(i) {
  const unit = bench[i];
  gold += unit.cost;

  championPool.push(unit);

  bench.splice(i, 1);
  render();
}

const bgMusic = document.getElementById("bgMusic");

function startMusicOnce() {
  bgMusic.volume = 0.9;
  bgMusic.play().catch(() => {});
  document.removeEventListener("click", startMusicOnce);
}

document.addEventListener("click", startMusicOnce);

window.onload = () => {
  renderAugments();
  rollShop();
  render();
};

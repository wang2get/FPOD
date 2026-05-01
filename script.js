window.onload = function () {

  // 原本按鈕事件
  document.getElementById("analyzeBtn")
    .addEventListener("click", analyze);

  // 滑鼠橫向滑動）
  document.querySelectorAll('.swiper').forEach(el => {
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    });
  });

};

const jieqiTable = {
  1: 6,   // 小寒
  2: 4,   // 立春（關鍵🔥）
  3: 6,
  4: 5,
  5: 6,
  6: 6,
  7: 7,
  8: 8,
  9: 8,
  10: 8,
  11: 7,
  12: 7
};

const hiddenStems = {
  "子": { water: 20 },
  "丑": { earth: 21, water: 6, metal: 3 },
  "寅": { wood: 21, fire: 6, earth: 3 },
  "卯": { wood: 20 },
  "辰": { earth: 15, wood: 10, water: 5 },
  "巳": { fire: 21, earth: 6, metal: 3 },
  "午": { fire: 20, earth: 10 },
  "未": { earth: 15, fire: 10, wood: 5 },
  "申": { metal: 21, water: 6, earth: 3 },
  "酉": { metal: 20 },
  "戌": { earth: 15, metal: 10, fire: 5 },
  "亥": { water: 15, wood: 10 }
};

const nameMap = { 
  wood: "木", 
  fire: "火", 
  earth: "土", 
  metal: "金", 
  water: "水" 
};

const avoidTips = {
  "木": "避免過度消耗體力、情緒內耗",
  "火": "少熬夜、避免急躁、壓力爆發",
  "土": "避免過度保守、停滯",
  "金": "避免過度批判、壓抑",
  "水": "避免拖延、想太多"
};

const stemColor = {
  甲:"#28a745",乙:"#28a745",
  丙:"#dc3545",丁:"#dc3545",
  戊:"#fd7e14",己:"#fd7e14",
  庚:"#ffc107",辛:"#ffc107",
  壬:"#007bff",癸:"#007bff"
};

const style = document.createElement("style");
style.innerHTML = `
@keyframes flow {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}`;
document.head.appendChild(style);

//八字干支循環
function getYearStem(year) {
  const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  return stems[(year - 4) % 10];
}

function getBar(label, percent, color, dayElement, tag=""){
  return `
    <div style="margin:12px 0;">
      <div style="display:flex; justify-content:space-between;">
        <small>
          ${label} ${tag} ${label === nameMap[dayElement] ? "⭐日主" : ""}
        </small>
        <small>${percent}%</small>
      </div>

      <div style="
        position:relative;
        background:rgba(255,255,255,0.1);
        height:12px;
        border-radius:10px;
        overflow:hidden;
      ">

        <div style="
          position:absolute;
          left:0;
          top:0;
          width:${percent}%;
          height:100%;
          background: linear-gradient(90deg, #ffffff55, ${color});
          background-size:200% 100%;
          border-radius:10px;
          animation: flow 3.5s linear infinite reverse;
		  
        "></div>

      </div>
    </div>
  `;
}


//五行開運字典
const luckTips = {
  "木": "🌿 多接觸綠色、植物，適合往東發展",
  "火": "🔥 多運動、多曬太陽，提升能量",
  "土": "🏔️ 接觸大自然、穩定環境最有利",
  "金": "⚙️ 強化決策力，適合金融與管理",
  "水": "🌊 多學習、多思考，適合流動環境"
};

// 👉 點整個框打開日曆
function openDate() {
  document.getElementById("birthdate").focus();
  document.getElementById("shichen").focus();
  document.getElementById("noTime").focus();
// document.getElementById("birthdate").showPicker();
}


// ---------分析----------
function analyze() {

  // ==============================
  // 1️⃣ 基本輸入檢查
  // ==============================
  let date = document.getElementById("birthdate").value;
  if (!date) return alert("請填日期");

  let shichen = document.getElementById("shichen").value;
  let noTime = document.getElementById("noTime").checked;

  if (!shichen && !noTime) return alert("請選時辰");
  if (noTime) shichen = "未知時辰";


  // ==============================
  // 2️⃣ 節氣修正（🔥核心）
  // ==============================
  // 修正：立春才換年 + 節氣換月
  let { baziYear, baziMonth } = getBaziDate(date);


  // ==============================
  // 3️⃣ 四柱計算
  // ==============================

  // 年柱
  let yearStem = getYearStem(baziYear);
  let yearB = getYearBranch(baziYear);

  // 月柱
  let month = baziMonth;
  let monthB = getMonthBranch(month);
  let monthStem = getMonthStem(yearStem, month);

  // 日柱（含子時跨日🔥）
  let dayGZ = getDayGanZhi(date, shichen);
  let dayStem = dayGZ.stem;
  let dayElement = stemToElement(dayStem);

  // 時柱
  let hourB = getHourBranch(shichen);
  let hourStem = hourB ? getHourStem(dayStem, hourB) : "";


  // ==============================
  // 4️⃣ 十神（全盤）
  // ==============================
  let yearTenGod = getTenGod(dayStem, yearStem);
  let monthTenGod = getTenGod(dayStem, monthStem);
  let hourTenGod = hourStem ? getTenGod(dayStem, hourStem) : "-";


  // ==============================
  // 5️⃣ 干支集合（🔥合化用）
  // ==============================
  const stems = [yearStem, monthStem, dayStem, hourStem].filter(Boolean);
  const branches = [yearB, monthB, dayGZ.branch, hourB].filter(Boolean);


  // ==============================
  // 6️⃣ 五行初始化
  // ==============================
  let score = getElementScore(date, shichen, month);

  // 日主加權（核心）
  score[dayElement] += 25;


  // ==============================
  // 7️⃣ 藏干
  // ==============================
  score = applyAllHiddenStems(score, date, shichen);


  // ==============================
  // 8️⃣ 🔥 合化 / 沖
  // ==============================
  score = applyFullRelations(score, stems, branches);


  // ==============================
  // 9️⃣ 五行流動
  // ==============================
  score = applyGeneration(score);

  // 克制（含反克）
  score = applyControl(score);


  // ==============================
  // 🔟 平滑（最後）
  // ==============================
  score = smoothScore(score);


  // ==============================
  // 11️⃣ 旺衰（含得令）
  // ==============================
  let strength = analyzeStrength(score, dayElement, monthB);


  // ==============================
  // 12️⃣ 用神
  // ==============================
  let gods = analyzeGodsWithDM(score, dayElement, strength);

  // 調候用神（優先級最高）
  let seasonGod = adjustSeasonGod(month, dayElement);
  if (seasonGod) {
    gods.yongGod = nameMap[seasonGod];
  }




  // ==============================
  // 13️⃣ 格局
  // ==============================
  let pattern = getPattern(score, dayStem);


  // ==============================
  // 14️⃣ UI：五行流動
  // ==============================
  let flowHtml = `
<div class="card" style="text-align:center;font-size:20px;letter-spacing:5px;background:rgba(255,255,255,0.05);">
水 → 木 → 火 → 土 → 金 → 水
</div>
`;


  // ==============================
  // 15️⃣ UI：總結
  // ==============================
let summary = `
<br>
<div class="card" style="margin-top:15px;">
🔮 ${pattern}｜${strength.type}｜用神：${gods.yongGod}
</div>
`;


  // ==============================
  // 16️⃣ 八字表（🔥含十神）
  // ==============================
  let baziHtml = `
<div class="card">
<table style="width:100%;text-align:center;">

<tr>
<td></td><td>年柱</td><td>月柱</td><td>日柱</td><td>時柱</td>
</tr>

<tr>
<td>十神</td>
<td>${yearTenGod}</td>
<td>${monthTenGod}</td>
<td>日主</td>
<td>${hourTenGod}</td>
</tr>


<tr>
<td>天干</td>
<td>${yearStem}</td>
<td>${monthStem}</td>
<td style="color:${stemColor[dayStem]};font-weight:bold;">${dayStem}</td>
<td>${hourStem || "-"}</td>
</tr>


<tr>
<td>地支</td>
<td>${yearB}</td>
<td>${monthB}</td>
<td>${dayGZ.branch}</td>
<td>${hourB || "未知"}</td>
</tr>

</table>
</div>
`;


  // ==============================
  // 17️⃣ 五行條
  // ==============================
  let bars = `
${getBar("木", gods.percent.wood, "#28a745", dayElement)}
${getBar("火", gods.percent.fire, "#dc3545", dayElement)}
${getBar("土", gods.percent.earth, "#fd7e14", dayElement)}
${getBar("金", gods.percent.metal, "#ffc107", dayElement)}
${getBar("水", gods.percent.water, "#007bff", dayElement)}
`;


  // ==============================
  // 18️⃣ 結果輸出
  // ==============================
  document.getElementById("result").innerHTML = `
${summary}
${baziHtml}

<div class="card">📅 ${date}</div>
<div class="card">⏰ ${shichen}</div>

${flowHtml}

<div class="card">${bars}</div>

<div class="card">✨ 用神：${gods.yongGod}</div>
<div class="card">⚠️ 忌神：${gods.jiGod}</div>

<div class="card">💡 開運建議：<br>${luckTips[gods.yongGod]}</div>
<div class="card">⚠️ 避忌建議：${getAvoidDetail(gods.jiGod)}</div>

${generateResult(getType(date), shichen)}

<div class="card">⚖️ 旺衰：${strength.level}</div>
<div class="card">🔮 格局：${pattern}</div>
`;

}


// 分類（超簡單版本）
function getType(date) {
  let sum = date.replace(/-/g, '').split('')
    .reduce((a,b)=>a+Number(b),0);

  return sum % 3;
}



// 生成內容（重點🔥）
function generateResult(type, shichen) {

  const data = [
    {
      title:"穩定型",
      personality:"做事踏實，但容易想太多",
      career:"適合長期累積型工作",
      money:"財運穩定",
      love:"慢熱但專一"
    },
    {
      title:"行動型",
      personality:"行動力強，喜歡變化",
      career:"適合創業",
      money:"波動大但爆發強",
      love:"來得快去得快"
    },
    {
      title:"思考型",
      personality:"觀察力強",
      career:"適合策略分析",
      money:"重規劃",
      love:"重安全感"
    }
  ];

  let r = data[type];

  return `
<div class="swiper">

  <div class="swiper-track">

    <div class="slide">
      <h3>🧠 性格</h3>
      <p>${r.personality}</p>
    </div>

    <div class="slide">
      <h3>💼 事業</h3>
      <p>${r.career}</p>
    </div>

    <div class="slide">
      <h3>💰 財運</h3>
      <p>${r.money}</p>
    </div>

    <div class="slide">
      <h3>❤️ 感情</h3>
      <p>${r.love}</p>
    </div>

  </div>

</div>
`;
}


//--- 用年份＋月份推五行----
function getElementScore(date, shichen, fixedMonth) {
	let [year] = date.split("-").map(Number);
	let month = fixedMonth; // ⭐用節氣月

  let score = {
    wood: 10,
    fire: 10,
    earth: 10,
    metal: 10,
    water: 10
  };

  // 👉 ① 年份（弱權重）
  let y = year % 10;
  if ([4,5].includes(y)) score.wood += 20;
  if ([6,7].includes(y)) score.fire += 20;
  if ([8,9].includes(y)) score.earth += 20;
  if ([0,1].includes(y)) score.metal += 20;
  if ([2,3].includes(y)) score.water += 20;

  // 👉 ② 月令（主導🔥）
  if (month >= 2 && month <= 4) {
    score.wood += 120;
    score.water += 40;
  }

  if (month >= 5 && month <= 7) {
    score.fire += 50;
    score.wood += 20;
  }

  if (month >= 8 && month <= 10) {
    score.metal += 50;
    score.earth += 20;
  }

  if (month === 1 || month === 12) {
    score.water += 50;
    score.metal += 20;
  }


	score.earth += 10; // 平時存在
  // 👉 ③ 季節交界（土自然出現🔥）
  if ([3,6,9,12].includes(month)) {
    score.earth += 20;
  }

  // 👉 ④ 時辰（偏向調整）
  const shichenMap = {
    "子時": { water: 25 },
    "丑時": { earth: 25 },
    "寅時": { wood: 25 },
    "卯時": { wood: 30 },
    "辰時": { earth: 30 },
    "巳時": { fire: 30 },
    "午時": { fire: 35 },
    "未時": { earth: 30 },
    "申時": { metal: 30 },
    "酉時": { metal: 35 },
    "戌時": { earth: 30 },
    "亥時": { water: 30 }
  };

  if (shichen && shichenMap[shichen]) {
    let effect = shichenMap[shichen];
    for (let key in effect) {
      score[key] += effect[key];
    }
  }

  return score;
}

//節氣切換
function fixMonthByJieqi(date) {
  let d = new Date(date);
  let day = d.getDate();
  let month = d.getMonth() + 1;

  // ⭐ 粗略節氣切換（夠用了）
  if (day < 5) month -= 1;

  if (month === 0) month = 12;
  return month;
}



//--- 算五行比例----
function normalize(score) {
  let total = Object.values(score).reduce((a,b)=>a+b,0);

  let result = {};
  for (let key in score) {
    result[key] = Math.round((score[key] / total) * 100);
  }
  return result;
}





//--用神 / 忌神----
function analyzeGods(data) {
  let entries = Object.entries(data);

  entries.sort((a,b)=>a[1]-b[1]);

  return {
    yongGod: entries[0][0],
    jiGod: entries[entries.length -1][0]
  };
}



//--- 「日主」判斷喜忌----
function analyzeGodsWithDM(score, dayElement, strength) {
  const support = { wood: "water", fire: "wood", earth: "fire", metal: "earth", water: "metal" };
  const release = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
  const control = { wood: "metal", fire: "water", earth: "wood", metal: "fire", water: "earth" };

  let percent = normalize(score);
  
  // 1. 找出全盤最強的元素（忌神）
  let sortedElements = Object.entries(percent).sort((a, b) => b[1] - a[1]);
  let jiGod = sortedElements[0][0];

  let yongGod, xiGod;

  // 2. 判斷邏輯：身弱補源頭，身強找出口
  if (strength.type === "身強") {
    // 身強：不需要補，最少那個如果是「生我」的，絕對不能當用神
    let option1 = release[dayElement]; // 洩 (我生)
    let option2 = control[dayElement]; // 剋 (剋我)
    
    // 挑選這兩個裡面比例較低的一個
    yongGod = percent[option1] <= percent[option2] ? option1 : option2;
    xiGod = (yongGod === option1) ? option2 : option1;
  } else {
    // 【身弱】你的案例就在這裡！
    // 雖然「木」最少，但木是「我生」，會把日主抽乾，所以絕對不選木。
    let option1 = support[dayElement]; // 生我 (印) -> 你的例子是：金
    let option2 = dayElement;         // 幫我 (比) -> 你的例子是：水

    // 挑選這兩個裡面比例較低的一個
    yongGod = percent[option1] <= percent[option2] ? option1 : option2;
    xiGod = (yongGod === option1) ? option2 : option1;
  }

  // 3. 🚨 終極防呆：確保用神絕對不是忌神
  if (yongGod === jiGod) {
        yongGod = sortedElements[sortedElements.length - 1][0];
		xiGod = sortedElements[sortedElements.length - 2][0];
	  // 如果算出來的用神剛好是盤面上最強的（發生在特殊格局），則取剩餘項中最弱的
  }

  // 4. 中文化與對應
  const nameMap = { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" };

  return { 
    yongGod: nameMap[yongGod], 
    xiGod: nameMap[xiGod], 
    jiGod: nameMap[jiGod], 
    percent
  };
}


// -----日主-----以 1900-01-01 為基準（庚子日，索引=36）
function getDayStem(dateStr) {
  const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];

  let base = new Date("1900/01/01"); // ✔️ 改這裡
  let target = new Date(dateStr.replace(/-/g, "/")); // ✔️ 改這裡

  let diff = Math.floor((target - base) / (1000*60*60*24));

  let index60 = (36 + diff) % 60;
  if (index60 < 0) index60 += 60;

  return stems[index60 % 10];
}


//-----日主 → 五行------------
function stemToElement(stem) {
  const map = {
    甲:"wood", 乙:"wood",
    丙:"fire", 丁:"fire",
    戊:"earth", 己:"earth",
    庚:"metal", 辛:"metal",
    壬:"water", 癸:"water"
  };
  return map[stem];
}


//-----------低補高抑（動態平滑）-----
function smoothScore(score) {
  let values = Object.values(score);
  let avg = values.reduce((a,b)=>a+b,0) / values.length;

  let result = {};

  for (let key in score) {
    let val = score[key];

    // 👉 太低 → 補一點
    if (val < avg * 0.7) {
      val += avg * 0.2;
    }

    // 👉 太高 → 壓一點
    if (val > avg * 1.5) {
      val -= avg * 0.2;
    }

    result[key] = Math.round(val);
  }

  return result;
}


//-------強元素-----如火很強 → 土被帶動、水很強 → 木被帶動---
function applyGeneration(score) {
  const generate = {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood"
  };

  let result = { ...score };

  for (let key in score) {
    let val = score[key];

    // 氣流調整>強的流快/弱的流慢
    let flow = Math.round(val * (val > 80 ? 0.08 : 0.04));

    let next = generate[key];

    result[key] -= flow;
    result[next] += flow;
  }

  return result;
}



//------四柱藏干整合------
function applyAllHiddenStems(score, date, shichen) {
  let [year, month, day] = date.split("-").map(Number);

  let yearB = getYearBranch(year);
  let monthB = getMonthBranch(month);
  let dayGZ = getDayGanZhi(date);
  let dayB = dayGZ.branch;
  let hourB = getHourBranch(shichen);

  let branches = [yearB, monthB, dayB, hourB];

  branches.forEach(b => {
    if (b && hiddenStems[b]) {
      let effect = hiddenStems[b];

      for (let key in effect) {
        score[key] += effect[key];
      }
    }
  });

  return score;
}

//------年支------
function getYearBranch(year) {
  const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  return branches[(year - 4) % 12];
}

//------月支------
function getMonthBranch(month) {
  const branches = ["丑","寅","卯","辰","巳","午","未","申","酉","戌","亥","子"];
  return branches[month - 1];
}

//------日支------
function getDayGanZhi(dateStr, shichen) {

  let target = new Date(dateStr.replace(/-/g, "/"));

  if (shichen === "子時") {
    target.setDate(target.getDate() + 1);
  }

  let base = new Date("1900/01/01");
  let diff = Math.floor((target - base) / (1000*60*60*24));

  const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

  let index60 = (36 + diff) % 60;
  if (index60 < 0) index60 += 60;

  return {
    stem: stems[index60 % 10],
    branch: branches[index60 % 12]
  };
}

//------時支------
function getHourBranch(shichen) {
  if (!shichen || shichen === "未知時辰") return null;
  const match = shichen.match(/[子丑寅卯辰巳午未申酉戌亥]/);
  return match ? match[0] : null;
}

//--------身強/身弱(旺衰進階)----------
function analyzeStrength(score, dayElement, monthB) {

  const support = {
    wood: ["wood", "water"],
    fire: ["fire", "wood"],
    earth: ["earth", "fire"],
    metal: ["metal", "earth"],
    water: ["water", "metal"]
  };

  const drain = {
    wood: ["fire", "metal"],
    fire: ["earth", "water"],
    earth: ["metal", "wood"],
    metal: ["water", "fire"],
    water: ["wood", "earth"]
  };

  let supportScore = 0;
  let drainScore = 0;

  support[dayElement].forEach(el => supportScore += score[el] || 0);
  drain[dayElement].forEach(el => drainScore += score[el] || 0);

  // ⭐ 得令加權（關鍵）
  let monthElement = getBranchMainElement(monthB);
  if (dayElement === monthElement) {
    supportScore *= 1.5;
  }

  let ratio = supportScore / (supportScore + drainScore);

  // ⭐ 等級一起算
  let level;
  if (ratio > 0.7) level = "極強";
  else if (ratio > 0.55) level = "偏強";
  else if (ratio > 0.45) level = "平衡";
  else if (ratio > 0.3) level = "偏弱";
  else level = "極弱";

  return {
    supportScore,
    drainScore,
    ratio,
    type: ratio >= 0.5 ? "身強" : "身弱",
    level
  };
}


//----十神------
function getTenGod(dayStem, otherStem) {

  const elements = {
    甲:"wood",乙:"wood",
    丙:"fire",丁:"fire",
    戊:"earth",己:"earth",
    庚:"metal",辛:"metal",
    壬:"water",癸:"water"
  };

  const yinYang = {
    甲:"yang",乙:"yin",
    丙:"yang",丁:"yin",
    戊:"yang",己:"yin",
    庚:"yang",辛:"yin",
    壬:"yang",癸:"yin"
  };

  const generate = {
    wood:"fire",
    fire:"earth",
    earth:"metal",
    metal:"water",
    water:"wood"
  };

  const control = {
    wood:"earth",
    earth:"water",
    water:"fire",
    fire:"metal",
    metal:"wood"
  };

  let dm = elements[dayStem];
  let other = elements[otherStem];

  if (dm === other) {
    return yinYang[dayStem] === yinYang[otherStem] ? "比肩" : "劫財";
  }

  if (generate[other] === dm) {
    return yinYang[dayStem] === yinYang[otherStem] ? "正印" : "偏印";
  }

  if (generate[dm] === other) {
    return yinYang[dayStem] === yinYang[otherStem] ? "食神" : "傷官";
  }

  if (control[other] === dm) {
    return yinYang[dayStem] === yinYang[otherStem] ? "正官" : "七殺";
  }

  if (control[dm] === other) {
    return yinYang[dayStem] === yinYang[otherStem] ? "正財" : "偏財";
  }

  return "";
}



//------格局--------
function getPattern(score, dayStem) {
  let sorted = Object.entries(score).sort((a,b)=>b[1]-a[1]);
  let main = sorted[0][0];
  let day = stemToElement(dayStem);

  const support = { wood:"water", fire:"wood", earth:"fire", metal:"earth", water:"metal" };
  const release = { wood:"fire", fire:"earth", earth:"metal", metal:"water", water:"wood" };
  const control = { wood:"metal", fire:"water", earth:"wood", metal:"fire", water:"earth" };

  if (main === day) return "建祿格（自我強）";
  if (main === support[day]) return "印綬格（學習型）";
  if (main === release[day]) return "食傷格（輸出型）";
  if (main === control[day]) return "官殺格（壓力型）";

  return "混合格局";
}

//------月干-------
function getMonthStem(yearStem, month) {
  const startMap = {
    甲:"丙", 己:"丙",
    乙:"戊", 庚:"戊",
    丙:"庚", 辛:"庚",
    丁:"壬", 壬:"壬",
    戊:"甲", 癸:"甲"
  };

  const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  let start = startMap[yearStem];
  let startIndex = stems.indexOf(start);

  return stems[(startIndex + month - 1) % 10];
}



//-----時干-------
function getHourStem(dayStem, hourBranch) {
  const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
  const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

  let dayIdx = stems.indexOf(dayStem) % 5; // ⭐核心
  let branchIdx = branches.indexOf(hourBranch);

  if (branchIdx === -1) return "";

  return stems[(dayIdx * 2 + branchIdx) % 10];
}


//-----克制系統(反克)------
function applyControl(score) {
  const control = {
    wood:"earth", fire:"metal", earth:"water",
    metal:"wood", water:"fire"
  };

  let result = {...score};

  for (let key in score) {
    let target = control[key];
    let power = score[key] * 0.08;

    // 正常克
    result[target] -= power;

    // 🔥 反克（侮）
    if (score[target] > score[key] * 2) {
      result[key] -= power * 0.5;
    }

    result[target] = Math.max(0, result[target]);
    result[key] = Math.max(0, result[key]);
  }

  return result;
}




function adjustSeasonGod(month, dayElement) {
  // 冬天（水旺）
  if ([11,12,1].includes(month)) {
    return "fire"; // 🔥必補火
  }

  // 夏天（火旺）
  if ([5,6,7].includes(month)) {
    return "water"; // 💧降溫
  }

  return null;
}


//三合 / 六合 / 六沖
function applyBranchRelations(score, branches) {
  const sanhe = [
    ["申","子","辰","water"],
    ["寅","午","戌","fire"],
    ["亥","卯","未","wood"],
    ["巳","酉","丑","metal"]
  ];

  const liuhe = {
    "子丑":"earth","寅亥":"wood","卯戌":"fire",
    "辰酉":"metal","巳申":"water","午未":"earth"
  };

  const liuchong = [
    ["子","午"],["丑","未"],["寅","申"],
    ["卯","酉"],["辰","戌"],["巳","亥"]
  ];

  // 🔥 三合局（直接強化）
  sanhe.forEach(([a,b,c,el])=>{
  if (branches.includes(a) && branches.includes(b) && branches.includes(c)) {

    score[el] += 80;

    [a,b,c].forEach(x=>{
      let origin = getBranchMainElement(x);
      if(origin !== el){
        score[origin] -= 20;
      }
    });

  }
});

  // 🔥 六合（中度強化）
  Object.keys(liuhe).forEach(pair=>{
    let [a,b] = pair.split("");
    if (branches.includes(a) && branches.includes(b)) {
      score[liuhe[pair]] += 30;
    }
  });

  // 🔥 六沖（互相削弱）
  liuchong.forEach(([a,b])=>{
    if (branches.includes(a) && branches.includes(b)) {
      score = reducePair(score, a, b);
    }
  });

  return score;
}

function reducePair(score, a, b){
  const mainA = getBranchMainElement(a);
  const mainB = getBranchMainElement(b);

  score[mainA] = Math.max(0, score[mainA] - 20);
  score[mainB] = Math.max(0, score[mainB] - 20);

  return score;
}

//得令加權
function getBranchMainElement(branch){
  const map = {
    寅:"wood",卯:"wood",
    巳:"fire",午:"fire",
    申:"metal",酉:"metal",
    亥:"water",子:"water",
    辰:"earth",未:"earth",戌:"earth",丑:"earth"
  };
  return map[branch];
}



//節氣月份 + 年份（一起修）
function getBaziDate(dateStr) {

  let d = new Date(dateStr);
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let day = d.getDate();

  let jieqiDay = jieqiTable[month];

  let baziMonth = month;
  let baziYear = year;

  // ⭐ 月份切換
  if (day < jieqiDay) {
    baziMonth = month - 1;
    if (baziMonth === 0) baziMonth = 12;
  }

  // ⭐ 年份（立春才換年🔥）
  if (month < 2 || (month === 2 && day < jieqiTable[2])) {
    baziYear = year - 1;
  }

  return { baziYear, baziMonth };
}


//天干五合、地支三合、六合、六沖
function applyFullRelations(score, stems, branches) {

  // --- 天干五合 ---
  const stemHe = {
    "甲己":"earth","乙庚":"metal","丙辛":"water","丁壬":"wood","戊癸":"fire"
  };

  const stemStr = stems.join("");
  Object.keys(stemHe).forEach(pair=>{
    let [a,b] = pair.split("");
    if (stemStr.includes(a) && stemStr.includes(b)) {
      let el = stemHe[pair];
      score[el] += 40;

      score[stemToElement(a)] -= 15;
      score[stemToElement(b)] -= 15;
    }
  });

  // --- 地支三合 ---
  const sanhe = [
    ["申","子","辰","water"],
    ["寅","午","戌","fire"],
    ["亥","卯","未","wood"],
    ["巳","酉","丑","metal"]
  ];

  sanhe.forEach(([a,b,c,el])=>{
    if (branches.includes(a) && branches.includes(b) && branches.includes(c)) {
      score[el] += 100;

      [a,b,c].forEach(x=>{
        let origin = getBranchMainElement(x);
        if(origin !== el) score[origin] -= 25;
      });
    }
  });

  // --- 六合 ---
  const liuhe = {
    "子丑":"earth","寅亥":"wood","卯戌":"fire",
    "辰酉":"metal","巳申":"water","午未":"earth"
  };

  Object.keys(liuhe).forEach(pair=>{
    let [a,b] = pair.split("");
    if (branches.includes(a) && branches.includes(b)) {
      score[liuhe[pair]] += 40;
    }
  });

  // --- 六沖 ---
  const liuchong = ["子午","丑未","寅申","卯酉","辰戌","巳亥"];

  liuchong.forEach(pair=>{
    let [a,b] = pair.split("");
    if (branches.includes(a) && branches.includes(b)) {
      score = reducePair(score, a, b);
    }
  });

  return score;
}

//避忌建議
function getAvoidDetail(element){

  const map = {
    "木": {
      core:"避免過度消耗",
      detail:[
        "不要長時間熬夜",
        "避免情緒內耗",
        "少做無效社交"
      ]
    },
    "火": {
      core:"避免情緒爆發",
      detail:[
        "控制脾氣",
        "避免壓力累積",
        "少熬夜"
      ]
    },
    "土": {
      core:"避免停滯",
      detail:[
        "不要拖延",
        "避免過度保守",
        "多嘗試新事物"
      ]
    },
    "金": {
      core:"避免過度壓抑",
      detail:[
        "不要過度批判",
        "避免情緒壓住不說",
        "適當表達"
      ]
    },
    "水": {
      core:"避免想太多",
      detail:[
        "不要過度焦慮",
        "避免拖延",
        "提升行動力"
      ]
    }
  };

  let d = map[element];

  if(!d) return "暫無資料";

  return `
  <b>${d.core}</b><br>
  ${d.detail.map(x=>"・"+x).join("<br>")}
  `;
}
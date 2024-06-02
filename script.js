// 데이터 준비
import { fetchData, keyData } from "./data.js";
// ! TOP-5
const colorList = [
  "#1f77b4", // 진한 청색
  "#ff7f0e", // 밝은 주황색
  "#2ca02c", // 진한 녹색
  "#d62728", // 진한 붉은색
  "#9467bd", // 진한 보라색
  "#8c564b", // 갈색
  "#e377c2", // 밝은 분홍색
  "#7f7f7f", // 중간 회색
  "#bcbd22", // 녹색이 섞인 황금색
  "#17becf"  // 청록색
];


// Function to convert keys to lowercase
const convertKeysToLowercase = (array) => {
  return array.map(item => {
      const newItem = {};
      Object.keys(item).forEach(key => {
          newItem[key.toLowerCase()] = item[key];
      });
      return newItem;
  });
};


function drawChart(currentCategory) {
  curData = data[currentCategory];
  console.log("curData", curData);

  curData = convertKeysToLowercase(curData);
  console.log("curData", curData);

  let curKey = keys[currentCategory].filter((x)=>{
    return x !== "year"
  }).map(v => v.toLowerCase());
  
  console.log(keys[currentCategory]);
  displayCandidates(curKey);


  let selectedColumns = [];
  for (let i = 0; i < document.getElementById('keywords').children.length; i++) {
    if(document.getElementById('keywords').children[i].style.display !== 'none') {
      selectedColumns.push(document.getElementById('keywords').children[i].innerText.slice(0, -1));
    }
  }

  console.log("selectedColumns ", selectedColumns);

  let minVal = 5;
  let maxVal = 0;

  for (let item of curData) {
    for (let key of selectedColumns) {
      minVal = minVal < item[key] ? minVal : item[key]
      maxVal = maxVal > item[key] ? maxVal : item[key]
    }
  }

  minVal = minVal-0.2;
  maxVal = maxVal+0.2;


  // 차트 크기 및 마진 설정
  const margin = { top: 40, right: 40, bottom: 40, left: 70 },
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  d3.select("#timechart").selectAll("*").remove();  // 기존 SVG 내용 삭제
  // const svgContainer = d3.select("#timechart").append("svg")
  //     .attr("width", 800)
  //     .attr("height", 600);

  // 스케일 설정
  const xScale = d3.scaleLinear()
  .domain([2000, 2003]) // 연도 범위 설정
  .range([50, width - 50]);  // x축의 시작과 끝에 여백 추가

  const yScale = d3.scaleLinear()
  .domain([minVal, maxVal]) // 평점 범위 설정 (1부터 5까지)
  .range([height, 0]);

  // 축 설정
  const xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.format("d"))  // 정수 형식으로 포맷 변경
  .tickPadding(20) // y축 눈금과 축 라벨 사이의 패딩을 증가시킴
  .tickValues([2000, 2001, 2002, 2003]); // X축에 표시할 특정 값 설정

  const yAxis = d3.axisLeft(yScale)
  .ticks(5) // y축 눈금 간격 설정
  .tickSize(-width) // 그리드 라인을 확장하여 x축과 그래프 사이의 공간을 가시화
  .tickPadding(20); // y축 눈금과 축 라벨 사이의 패딩을 증가시킴

  // 라인 생성기
  const line = d3.line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.value));

  // SVG 요소 추가
  const svg = d3.select("#timechart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

  // 제목 추가 (좌측 상단)
  svg.append('text')
  .attr('x', 0)
  .attr('y', -20)
  .attr('text-anchor', 'start')
  .style('font-size', '20px')
  .style('font-weight', 'bold')
  .style('fill', '#444') // 폰트 색상 변경
  .text(`1) Trends in Movie ${currentCategory} Popularity`);

  // X축 및 Y축 추가
  svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(xAxis);

  const yAxisG = svg.append("g")
  .call(yAxis);

  yAxisG.selectAll(".tick line") // y축 그리드 라인 스타일링
  .attr("opacity", "0.2"); // 그리드 라인의 투명도 설정

  // 데이터 변환 및 라인 추가
  // const genres = Object.keys(curData[0])[1: ];
  // curSubCategory = Object.keys(curData[0]).filter((x)=>{
  //   return x !== "year"
  // });

  // curSubCategory = selectedColumns
  // const genres = ["SF", "Thriller", "Horror", "Drama"];
  let temp = [];
  for (let item of curSubCategory){
    temp.push(item.toLowerCase())
  }
  console.log("temp ", temp, selectedColumns)
  selectedColumns.forEach(genre => {
  const genreData = curData.map(d => ({ year: d.year, value: d[genre] }));
  const path = svg.append("path")
    .datum(genreData)
    .attr("class", "line")
    .attr("d", line)
    .style("stroke", color(temp.indexOf(genre)))
    .style("stroke-width", 2)
    .style("fill", "none");

  // 마우스 호버 이벤트
  path.on("mouseover", function(event) {
    d3.select(this)
      .style("stroke-width", 6);
    const [x, y] = d3.pointer(event);  // 마우스 위치에 따라 동적으로 위치 결정
    svg.append("text")
      .attr("id", "genreLabel")
      .attr("x", x + 10)  // 마우스 위치에서 조금 옆으로
      .attr("y", y + 10)  // 마우스 위치에서 조금 아래로
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(genre);
  })
  .on("mouseout", function() {
    d3.select(this)
      .style("stroke-width", 2);
    svg.select("#genreLabel").remove();
  });

  svg.selectAll(`.dot-${genre}`)
  .data(genreData)
  .enter().append("circle")
  .attr("class", `dot-${genre}`)
  .attr("cx", d => xScale(d.year))
  .attr("cy", d => yScale(d.value))
  .attr("r", 5) // 원의 크기
  .style("fill", color(temp.indexOf(genre)));
  });
}


// 색상 함수
function color(genre) {
  if(genre <= 9) {
    return colorList[genre];
  }
  else{
    genre = genre % 10;
    return colorList[genre];
  }
}

// 버튼 클릭 이벤트
document.getElementById("btnGenre").addEventListener("click", () => {
    data = fetchData();
    currentCategory = "Genre"
    curSubCategory = Object.keys(data[currentCategory][0]).filter((x)=>{
      return x !== "year"
    });
    curData = data[currentCategory]
    console.log(curData)
    curKey = keys[currentCategory].map(v => v.toLowerCase())

    console.log(document.querySelectorAll("#keywords > button"));
    for(let element of document.querySelectorAll("#keywords > button")){
      console.log(element);
      element.remove();
    }
    submitInitalKeywords(curKey[0]);
    submitInitalKeywords(curKey[1]);
    submitInitalKeywords(curKey[2]);

    
    drawChart(currentCategory);
});

document.getElementById("btnDirector").addEventListener("click", () => {
    data = fetchData();
    currentCategory = "Director"
    curSubCategory = Object.keys(data[currentCategory][0]).filter((x)=>{
      return x !== "year"
    });
    curData = data[currentCategory];
    curKey = keys[currentCategory].map(v => v.toLowerCase())
    for(let element of document.querySelectorAll("#keywords > button")){
      console.log(element);
      element.remove();
    }

    submitInitalKeywords(curKey[0]);
    submitInitalKeywords(curKey[1]);
    submitInitalKeywords(curKey[2]);


    drawChart(currentCategory);
});

document.getElementById("btnActor").addEventListener("click", () => {
  data = fetchData();

  currentCategory = "Actor";
  curSubCategory = Object.keys(data[currentCategory][0]).filter((x)=>{
    return x !== "year"
  });
    curData = data[currentCategory];
    curKey = keys[currentCategory].map(v => v.toLowerCase())
    for(let element of document.querySelectorAll("#keywords > button")){
      console.log(element);
      element.remove();
    }
    submitInitalKeywords(curKey[0]);
    submitInitalKeywords(curKey[1]);
    submitInitalKeywords(curKey[2]);
    drawChart(currentCategory);
});


function keypressHandler() {
  let searchKeyword = document.getElementById("FOI").value.toLowerCase();
  if(curKey.indexOf(searchKeyword) === -1) {
    alert(`no keyword ${searchKeyword}`);
    document.getElementById("FOI").value = "";
    return;
  }
  let divElement = document.createElement("button");
  divElement.className = "btn btn-primary button-with-close";
  divElement.type = "button"
  divElement.innerText = searchKeyword
  divElement.id = `year-${currentCategory}-${searchKeyword}`;
  divElement.style.display ="block"
  divElement.style.margin="4px";

  let temp = [];
  for (let item of curSubCategory){
    temp.push(item.toLowerCase())
  }
  console.log("temp", temp);
  divElement.style.backgroundColor=color(temp.indexOf(searchKeyword));
  divElement.style.borderColor=color(temp.indexOf(searchKeyword));


  let spanElement = document.createElement("span");
  spanElement.class = "close-mark";
  spanElement.onclick = () => {
    var button = document.getElementById(divElement.id );
    button.style.display = 'none'; // Hides the button
    drawChart(currentCategory);
  }
  spanElement.innerHTML="&times;"

  divElement.appendChild(spanElement);
  

  let testElement = document.getElementById(`year-${currentCategory}-${searchKeyword}`);

  if(testElement){
    if(testElement.style.display !== 'none') { 
      alert(`already exists ${searchKeyword}`);
      document.getElementById("FOI").value = "";
      return;
    }
  }

  let sample_count = 0;
  for (let i = 0; i < document.getElementById('keywords').children.length; i++) {
    if(document.getElementById('keywords').children[i].style.display !== 'none') {
      sample_count+=1;
    }
  }

  if(sample_count >= 5){
    alert(`maximum 5 keywords allowed`);
    document.getElementById("FOI").value = "";
    return;
  }

  console.log(curKey.indexOf(searchKeyword));
  document.getElementById("FOI").value = "";


  document.getElementById("keywords").appendChild(divElement);

  drawChart(currentCategory);
}

function submitInitalKeywords(searchKeyword) {
  let divElement = document.createElement("button");
  divElement.className = "btn btn-primary button-with-close";
  divElement.type = "button"
  divElement.innerText = searchKeyword
  divElement.id = `year-${currentCategory}-${searchKeyword}`;
  divElement.style.display ="block"
  divElement.style.margin="4px";
  let temp = [];
  for (let item of curSubCategory){
    temp.push(item.toLowerCase())
  }
  console.log("temp", temp);
  divElement.style.backgroundColor=color(temp.indexOf(searchKeyword));
  divElement.style.borderColor=color(temp.indexOf(searchKeyword));

  let spanElement = document.createElement("span");
  spanElement.class = "close-mark";
  spanElement.onclick = () => {
    var button = document.getElementById(divElement.id );
    button.style.display = 'none'; // Hides the button
    drawChart(currentCategory);
  }
  spanElement.innerHTML="&times;"

  divElement.appendChild(spanElement);
  
  document.getElementById("keywords").appendChild(divElement);
}

function displayCandidates(candidateList) {
  if(document.getElementById("candidateList") ){
    document.getElementById("candidateList").remove();
  }

  let tempElement = document.createElement("div");
  tempElement.id="candidateList";

  tempElement.style.height = `500px`;
  tempElement.style.width = `220px`;
  
  for(let candidate of candidateList) {
    let canElement = document.createElement("div");
    canElement.innerText = candidate;
    canElement.style.width = `200px`;
    tempElement.appendChild(canElement);
  }

  document.getElementById("candidate").appendChild(tempElement);
}


document.getElementById("FOI").addEventListener("keydown", (e) => {
  console.log(e);
  let searchKeyword = document.getElementById("FOI").value.toLowerCase();
  console.log("searchKeyword ", searchKeyword);
  console.log("keys ", keys[currentCategory]);
  curKey = keys[currentCategory].filter((x)=>{
    return x !== "year"
  }).map(v => v.toLowerCase());

  let tempKey = curKey.filter((x)=>{
    return x.indexOf(searchKeyword) !== -1
  });

  console.log("tempKey ", tempKey);

  for(let prevCandidate of document.querySelectorAll("#candidateList > div")) {
    prevCandidate.remove();
  }


  for(let candidate of tempKey) {
    let canElement = document.createElement("div");
    canElement.innerText = candidate;
    canElement.style.width = `200px`;
    document.getElementById("candidateList").appendChild(canElement);
  }

  if (e.key !== 'Enter') {
    return;
  }


  keypressHandler();

  e.preventDefault();
  
  
});

let keys = keyData();
let data = fetchData();
let currentCategory = "Genre"
let curSubCategory = Object.keys(data[currentCategory][0]).filter((x)=>{
  return x !== "year"
});
let curData = data[currentCategory];
let curKey = keys[currentCategory].filter((x)=>{
  return x !== "year"
}).map(v => v.toLowerCase());
submitInitalKeywords(curKey[0]);
submitInitalKeywords(curKey[1]);
submitInitalKeywords(curKey[2]);

console.log(keys[currentCategory]);
// displayCandidates(curKey);
drawChart(currentCategory);
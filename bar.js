const data_dict = {
    // * Occupation
    "Director": {
        "path": "./data/barchart_director.csv",
        "minVal": 3.8,
        "maxVal": 4.2,
    },
    "Actor": {
        "path": "./data/barchart_actors.csv",
        "minVal": 4.0,
        "maxVal": 4.6,
    },
    "Genre": {
        "path": "./data/barchart_genres.csv",
        "minVal": 3.5,
        "maxVal": 4.5,
    }
}

function drawBarChart() {
    // set the dimensions and margins of the graph
    let minXval = data_dict[curTarget].minVal;
    let maxXval = data_dict[curTarget].maxVal;
    var margin = {top: 40, right: 30, bottom: 40, left: 90},
    width = screen.availWidth - 30 - margin.left - margin.right,
    // height =screen.availHeight - 780  - margin.top - margin.bottom;
    height = 180;

    // append the svg object to the body of the page

    d3.select("#barchart").selectAll("*").remove();  // 기존 SVG 내용 삭제


    var svg = d3.select("#barchart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


    svg.append('text')
    .attr('x', -50)
    .attr('y', -20)
    .attr('text-anchor', 'start')
    .style('font-size', '20px')
    .style('font-weight', 'bold')
    .style('fill', '#444') // 폰트 색상 변경
    .text(`3) Leading Movie ${curTarget} of the Year`);

    // Parse the Data
    // d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv", function(data) {

    d3.csv(data_dict[curTarget].path, function(data) {

    // Add X axis
    var x = d3.scaleLinear()
    .domain([minXval, maxXval])
    .range([ 0, width]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    // Y axis
    var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(data.map(function(d) { return d.Country; }))
    .padding(.1);
    
    svg.append("g")
    .call(d3.axisLeft(y))

    //Bars
    svg.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(minXval) )
    .attr("y", function(d) { return y(d.Country); })
    .attr("width", function(d) { return x(d.Value); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#17becf")
    })
}


document.getElementById("barChartBtnDirector").addEventListener("click", () => {
    curTarget = "Director"
    drawBarChart(curTarget)
});
document.getElementById("barChartBtnGenre").addEventListener("click", () => {
    curTarget = "Genre"
    drawBarChart(curTarget)
});
document.getElementById("barChartBtnActor").addEventListener("click", () => {
    curTarget = "Actor"
    drawBarChart(curTarget)
});

let curTarget = "Genre";

drawBarChart(curTarget)
const data_dict = {
    // * Occupation
    "Director-Occupation": {
        "myVars": ['other', 'academic/educator', 'artist', 'clerical/admin',
        'college/grad student', 'customer service', 'doctor/health care',
        'executive/managerial', 'farmer', 'homemaker', 'K-12 student',
        'lawyer', 'programmer', 'retired', 'sales/marketing', 'scientist',
        'self-employed', 'technician/engineer', 'tradesman/craftsman',
        'unemployed', 'writer'],
        "myGroups" :['Akira Kurosawa', 'Frank Darabont', 'M. Night Shyamalan',
        'Clyde Bruckman', 'Satyajit Ray'],
        "path": "./data/occup_director.csv"
    },
    "Actor-Occupation": {
        "myVars": ['other', 'academic/educator', 'artist', 'clerical/admin',
        'college/grad student', 'customer service', 'doctor/health care',
        'executive/managerial', 'farmer', 'homemaker', 'K-12 student',
        'lawyer', 'programmer', 'retired', 'sales/marketing', 'scientist',
        'self-employed', 'technician/engineer', 'tradesman/craftsman',
        'unemployed', 'writer'],
        "myGroups" :['Keiju Kobayashi', 'Yukiko Shimazaki', 'Keiko Tsushima',
        'Richard S. Castellano', 'Anne Reid'],
        "path": "./data/occup_actor.csv"
    },
    "Genre-Occupation": {
        "myVars": ['other', 'academic/educator', 'artist', 'clerical/admin',
        'college/grad student', 'customer service', 'doctor/health care',
        'executive/managerial', 'farmer', 'homemaker', 'K-12 student',
        'lawyer', 'programmer', 'retired', 'sales/marketing', 'scientist',
        'self-employed', 'technician/engineer', 'tradesman/craftsman',
        'unemployed', 'writer'],
        "myGroups" : ['Short', 'Film-Noir', 'Documentary', 'History', 'War'],
        "path": "./data/occup_genre.csv"
    },
    // * Gender
    "Director-Gender": {
        "myVars": ['Female', 'Male'],
        "myGroups" :['Akira Kurosawa', 'Frank Darabont', 'M. Night Shyamalan',
        'Clyde Bruckman', 'Satyajit Ray'],
        "path": "./data/gender_director.csv"
    },
    "Actor-Gender": {
        "myVars": ['Female', 'Male'],
        "myGroups" :['Keiju Kobayashi', 'Yukiko Shimazaki', 'Keiko Tsushima',
        'Richard S. Castellano', 'Anne Reid'],
        "path": "./data/gender_actors.csv"
    },
    "Genre-Gender": {
        "myVars": ['Female', 'Male'],
        "myGroups" : ['Short', 'Film-Noir', 'Documentary', 'History', 'War'],
        "path": "./data/gender_genre.csv"
    },
    // * Age
    "Director-Age": {
        "myVars":['Under 18', '18-24', '25-34', '35-44', '45-49', '50-55', '56+'],
        "myGroups" : ['Akira Kurosawa', 'Frank Darabont', 'M. Night Shyamalan', 'Clyde Bruckman', 'Satyajit Ray'],
        "path": "./data/age_director.csv"
    },
    "Actor-Age": {
        "myVars": ['Under 18', '18-24', '25-34', '35-44', '45-49', '50-55', '56+'],
        "myGroups" :['Keiju Kobayashi', 'Yukiko Shimazaki', 'Keiko Tsushima', 'Richard S. Castellano', 'Anne Reid'],
        "path": "./data/age_actors.csv"
    },
    "Genre-Age": {
        "myVars": ['Under 18', '18-24', '25-34', '35-44', '45-49', '50-55', '56+'],
        "myGroups" :['Short', 'Film-Noir', 'Documentary', 'History', 'War'],
        "path": "./data/age_genre.csv"
    },
}


function drawHeatMap(curItem, curUser) {
    // set the dimensions and margins of the graph
var margin = {top: 40, right: 30, bottom: 30, left: 140},
width = 700 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

d3.select("#my_dataviz").selectAll("*").remove();


// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");


let cur = data_dict[`${curItem}-${curUser}`]

var myVars = cur["myVars"]
var myGroups = cur["myGroups"]
var myFile = cur["path"]
// Build X scales and axis:
var x = d3.scaleBand()
.range([ 0, width ])
.domain(myGroups)
.padding(0.01);
svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x))

// Build X scales and axis:
var y = d3.scaleBand()
.range([ height, 0 ])
.domain(myVars)
.padding(0.01);
svg.append("g")
.call(d3.axisLeft(y));

// Build color scale
var myColor = d3.scaleLinear()
.range(["white", "#ff7f0e"])
// .range(["white", "black"])
.domain([3.5, 5])

//Read the data
// d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv", function(data) {
  d3.csv(myFile, function(data) {
  

svg.selectAll()
    .data(data, function(d) {return d.group+':'+d.variable;})
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.group) })
    .attr("y", function(d) { return y(d.variable) })
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .style("fill", function(d) { console.log(parseFloat(d.value)); return myColor((parseFloat(d.value)))} )

})

svg.append('text')
.attr('x', -130)
.attr('y', -20)
.attr('text-anchor', 'start')
.style('font-size', '20px')
.style('font-weight', 'bold')
.style('fill', '#444') // 폰트 색상 변경
.text(`2) Exploring Movie ${curItem} Preferences by ${curUser}`);
}

document.getElementById("heatmapBtnGenre").addEventListener("click", () => {
    curItem = "Genre"
    drawHeatMap(curItem, curUser);
});
document.getElementById("heatmapBtnDirector").addEventListener("click", () => {
    curItem = "Director"
    drawHeatMap(curItem, curUser);
});
document.getElementById("heatmapBtnActor").addEventListener("click", () => {
    curItem = "Actor"
    drawHeatMap(curItem, curUser);
});

document.getElementById("heatmapBtnOccupation").addEventListener("click", () => {
    curUser = "Occupation"
    drawHeatMap(curItem, curUser);
});
document.getElementById("heatmapBtnAge").addEventListener("click", () => {
    curUser = "Age"
    drawHeatMap(curItem, curUser);
});
document.getElementById("heatmapBtnGender").addEventListener("click", () => {
    curUser = "Gender"
    drawHeatMap(curItem, curUser);
});

let curItem = "Genre"
let curUser = "Occupation"
drawHeatMap(curItem, curUser);
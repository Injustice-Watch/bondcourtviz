var margin = {top: 50, right: 20, bottom: 100, left: 100},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */


// to-do: stop double-counting charges for same person

//supplemental functions

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// setup x 
var xpos_j = {
    "Adam Donald BourgeoisBATTERY" : 1,
    "Adam Donald BourgeoisDRUG DELIVERY" : 2,
    "Adam Donald BourgeoisDRUG POSSESSION" : 3,
    "Adam Donald BourgeoisTHEFT" : 4,
    "Adam Donald BourgeoisTRAFFIC MAJOR" : 5,
    "Adam Donald BourgeoisWEAPON RELATED" : 6,
    "Laura SullivanBATTERY" : 7,
    "Laura SullivanDRUG DELIVERY" : 8,
    "Laura SullivanDRUG POSSESSION" : 9,
    "Laura SullivanTHEFT" : 10,
    "Laura SullivanTRAFFIC MAJOR" : 11,
    "Laura SullivanWEAPON RELATED" : 12,
    "Peggy ChiampasBATTERY" : 13,
    "Peggy ChiampasDRUG DELIVERY" : 14,
    "Peggy ChiampasDRUG POSSESSION" : 15,
    "Peggy ChiampasTHEFT" : 16,
    "Peggy ChiampasTRAFFIC MAJOR" : 17,
    "Peggy ChiampasWEAPON RELATED" : 18
}

var xpos_c = {
    "Adam Donald BourgeoisBATTERY" : 1,
    "Laura SullivanBATTERY" : 2,
    "Peggy ChiampasBATTERY" : 3,
    "Adam Donald BourgeoisDRUG DELIVERY" : 4,
    "Laura SullivanDRUG DELIVERY" : 5,
    "Peggy ChiampasDRUG DELIVERY" : 6,
    "Adam Donald BourgeoisDRUG POSSESSION" : 7,
    "Laura SullivanDRUG POSSESSION" : 8,
    "Peggy ChiampasDRUG POSSESSION" : 9,
    "Adam Donald BourgeoisTHEFT" : 10,
    "Laura SullivanTHEFT" : 11,
    "Peggy ChiampasTHEFT" : 12,
    "Adam Donald BourgeoisTRAFFIC MAJOR" : 13,
    "Laura SullivanTRAFFIC MAJOR" : 14,
    "Peggy ChiampasTRAFFIC MAJOR" : 15,
    "Adam Donald BourgeoisWEAPON RELATED" : 16,
    "Laura SullivanWEAPON RELATED" : 17,
    "Peggy ChiampasWEAPON RELATED" : 18
}

var judges = ["", "Adam Donald Bourgeois", "Laura Sullivan", "Peggy Chiampas", ""]

var charges = ["Battery", "Drug Delivery", "Drug Possession", "Theft", "Major Traffic Offense", "Weapons Offense", ""]

var xValue = function(d) { return d.JudgeCharge;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display,
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    x = d3.scale.ordinal() //number might be meaningless
    .domain(charges)
    .rangePoints([0, width]);
    xAxis = d3.svg.axis().scale(x).orient("bottom");

// setup y
var yValue = function(d) { return d.Bond;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color
var cValue = function(d) { return d.Judge;},
    color = d3.scale.ordinal()
      .range(["#369682", "#E1B65B", "#DB842E", "#9E3E17"]);

//Calculate width of radius for point
var radius_scale = function(data, d) {
    var rad_scal = 1
    var hIDs =[d.hID]
    for (var i = data.length - 1; i >= 0; i--) {
        if (data[i].Bond == d.Bond && data[i].Judge == d.Judge && data[i].Charge == d.Charge && !hIDs.includes(data[i].hID)){
                    rad_scal = rad_scal + 1
                    hIDs.push(data[i].hID)
                };
    };
    return rad_scal
};

// add the graph canvas to the body of the webpage
var svg = d3.select("#judges").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("shape-rendering", "geometricPrecision")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// for hover on legend fade

function cellover(d) {
      var judge_last = d.split(" ").slice(-1)[0]
      //Dim all blobs
      d3.selectAll("circle")
        .transition().duration(400)
        .style("stroke-width", 1)
        .style("stroke-opacity", 0); 
      //Bring back the hovered over blob

      d3.selectAll("circle." + judge_last)
        .transition().duration(400)
        .style("stroke-width", 1)
        .style("stroke-opacity", 1);

  }

  // on mouseout for the legend symbol
function cellout() {
    //Bring back all blobs
    d3.selectAll("circle")
      .transition().duration(200)
      .style("stroke-width", 1)
      .style("stroke-opacity", 1);

  }

// load data
d3.csv("judges_scatter_d_names_no_outliers.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.JudgeCharge = xpos_c[d.Judge + d.Charge];
    d.Bond = +d.Bond;
//    console.log(d);
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
        .attr("y", 20)
        .attr("x", width/12) // 12 is number of ticks * 2
        .attr("dy", ".35em") //add rotate here .attr("transform", "rotate(20)")
        .style("text-anchor", "middle")
        .style("font-size", "1em");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Bond");

  // draw dots
  svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("class", function(d) {
        return d.Judge.split(" ").slice(-1)[0];
      })
      .attr("r", function(d) {return Math.sqrt(radius_scale(data, d)/Math.PI)*6;}) //Use scaling factor to determine circle area. Calculate radius from area, multiply by factor of 4 for aesthetics
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", "white")
      .style("fill-opacity", 0) //so hover works on whole circle
      .style("stroke-width", "1")
      .style("stroke", function(d) { return color(cValue(d));}) 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html("Type of Charge: " + toTitleCase(d.Charge) 
            + "<br/>" +  "Bond Amount: " + "$" + yValue(d) + "<br/>" + "Count: " + radius_scale(data, d))
               .style("left", (d3.event.pageX + 15) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
          cellover(d.Judge);
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
          cellout()
      });

  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 30 + ")"; })
      .on("mouseover", function(d){ cellover(d); })
      .on("mouseout", function(d) { cellout(); });

  // draw legend colored rectangles
  legend.append("rect")
        .attr("x", width - 18)
        .attr("y", 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 29)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("font-size", "1em")
      .text(function(d) { return d;})

});


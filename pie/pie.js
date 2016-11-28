// Define the margin, radius, and color scale. Colors are assigned lazily, so
// if you want deterministic behavior, define a domain for the color scale.
var m = 10,
    r = 100,
    font_fam = "'Playfair Display', serif"
    colors = ["#369682", "#E1B65B", "#DB842E", "#9E3E17"],
    z = d3.scale.ordinal()
      .range(colors)

// Define a pie layout: the pie angle encodes the count of flights. Since our
// data is stored in CSV, the counts are strings which we coerce to numbers.
var pie = d3.layout.pie()
    .value(function(d) { return +d["Hearing ID"]; })
    .sort(function(a, b) { return b["Hearing ID"] - a["Hearing ID"]; });

// Define an arc generator. Note the radius is specified here, not the layout.
var arc = d3.svg.arc()
    .innerRadius(r / 2)
    .outerRadius(r);

function percent(hearings, judge, datum) {
  total = 0
  for (var i = hearings.length - 1; i >= 0; i--) {
    if (hearings[i]["Judge"] == judge) {
      total = total + parseInt(hearings[i]["Hearing ID"])
    }
  };
  return Math.round((datum["Hearing ID"] / total) * 100)
}

var btype = {
  "I" : "Released on Own Recognizance",
  "I-EM" : "Released on Electronic Monitoring",
  "D" : "Given Cash Bail"
}

function cellover(d) {
      var type = d
      //Dim all blobs
      d3.selectAll("path")
        .transition().duration(400)
        .style("opacity", .3); 
      //Bring back the hovered over blob

      d3.selectAll("path." + type)
        .transition().duration(400)
        .style("opacity", 1);
}

function cellout() {
    //Bring back all blobs
    d3.selectAll("path")
      .transition().duration(200)
      .style("opacity", 1);
}
/*
d3.csv("nonviolent_only.csv", function(error, hearings) {
  if (error) throw error;

  // Nest the flight data by originating airport. Our data has the counts per
  // airport and carrier, but we want to group counts by aiport.

  var bondtypes = d3.nest()
      .key(function(d) { return d["Bond Type"]; })
      .entries(hearings);

  console.log(bondtypes)

  var legend = d3.select("#legend").selectAll("div")
    .data(bondtypes)
    .enter().append("div")
    .attr("class", "legend_line")
    .append("svg")
});

*/

// Load the flight data.
d3.csv("nonviolent_only.csv", function(error, hearings) {
  if (error) throw error;

  // Nest the flight data by originating airport. Our data has the counts per
  // airport and carrier, but we want to group counts by aiport.
  var judges = d3.nest()
      .key(function(d) { return d["Judge"]; })
      .entries(hearings);

  var bondtypes = d3.nest()
      .key(function(d) { return d["Bond Type"]; })
      .entries(hearings);

  //legend

  var legend = d3.select("#legend_box").selectAll("div")
    .data(bondtypes)
    .enter().append("div")
    .attr("class", "legend")
    .style("height", "33%")
    .style("text-align", "right")
    .append("svg")
    .attr("overflow", "visible")
    .attr("width", "100%")
    .attr("height", "20")
    .attr("text-align", "right")
    .append("g");

  legend.append('text')
    .style("font-family", font_fam)
    .style("font-size", "12px")
    .style("text-anchor", "end")
    .attr("x", "90%")
    .attr("y", "14")
    .text(function(d){
      return btype[d.key]
    });

  legend.append('circle')
    .attr("cx", "95%")
    .attr("cy", "10")
    .attr("r", "7")
    .style("fill", function(d) {return z(d.key);});

  // Insert an svg element (with margin) for each airport in our dataset. A
  // child g element translates the origin to the pie center.

  var svg = d3.select("#pie").selectAll("div")
      .data(judges)
    .enter().append("div") // http://code.google.com/p/chromium/issues/detail?id=98951
      .style("display", "inline-block")
      .style("width", (r + m) * 2 + "px")
      .style("height", (r + m) * 2 + "px")
    .append("svg")
      .attr("class", "chart")
      .attr("width", (r + m) * 2)
      .attr("height", (r + m) * 2)
    .append("g")
      .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")");

  // Add a label for the airport. The `key` comes from the nest operator.
  svg.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-family", font_fam)
      .text(function(d) { return d.key; });

  // Pass the nested per-airport values to the pie layout. The layout computes
  // the angles for each arc. Another g element will hold the arc and its label.
  var g = svg.selectAll("g")
      .data(function(d) { return pie(d.values); })
    .enter().append("g");

  // Add a colored arc path, with a mouseover title showing the count.
  g.append("path")
      .attr("d", arc)
      .attr("class", function(d) {
        return d.data["Bond Type"].split(" ").slice(-1)[0];
      })
      .style("fill", function(d) { return z(d.data["Bond Type"]); })
      .on("mouseover", function(d) {cellover(d.data["Bond Type"]);})
      .on("mouseout", function(d) {cellout();})
    .append("title")
      .text(function(d) { return d.data["Hearing ID"] + " " + btype[d.data["Bond Type"]]; });

  // Add a label to the larger arcs, translated to the arc centroid and rotated.
  g.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-family", font_fam)
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .text(function(d){return d.data["Bond Type"] + ": " + percent(hearings, d.data["Judge"], d.data) +"%";});

  // Computes the label angle of an arc, converting from radians to degrees.
  function angle(d) {
    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
  }

});


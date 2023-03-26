function plotGraph(fileName) {
	d3.json(`static/data/${fileName}`, function(error, data) {		
				
		// set the dimensions and margins of the graph
		var margin = {top: 10, right: 30, bottom: 20, left: 50},
			width = 1200 - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom;
		
		// append the svg object to the body of the page
		var svg = d3.select("#my_statistic")
					.append("svg")
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom);

		var g = svg.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");
			
		// List of subgroups = header of the csv files = soil condition here
					
		var subgroups = []
		data.forEach(arr => {
			Object.keys(arr).forEach(d => {
				if (d != "group_value" && d != "status" && !subgroups.includes(d)) {
					subgroups.push(d);
				}
			})
		})
			
		// Y Scale
		yMax = 0
		data.forEach(el => {
			Object.values(el).forEach(d => {
				if (d > yMax) {
					yMax = d;
				}
			})
		})

		yMin = 0
		data.forEach(el => {
			Object.values(el).forEach(d => {
				if (d < yMin) {
					yMin = d;
				}
			})
		})


		// Add Y axis
		var y = d3.scaleLinear()
			.domain([yMin-10, yMax+10])
			.range([ height, 0 ]);
			
		// List of groups = species here = value of the first column called group -> I show them on the X axis
		var groups = d3.map(data, function(d){return(d.group_value)}).keys()			

		const yAxis = d3.axisLeft(y).ticks(7);
		
		// Add X axis
		var x = d3.scaleBand()
			.domain(groups)
			.range([0, width])
			.padding([0.2])
		

		
		// Another scale for subgroup position?
		var xSubgroup = d3.scaleBand()
							.domain(subgroups)
							.range([0, x.bandwidth()])
							.padding([0.05])
		

		// COLORS
		f = d3.interpolateHsl("blue", "green")
		var colors_array=[];
		var nColors=subgroups.length;
		for (var i=0; i<nColors; i++) colors_array.push(f(i/(nColors-1)));
		
		// color palette = one color per subgroup
		var color = d3.scaleOrdinal()
						.domain(subgroups)
						.range(colors_array)

		f_error = d3.interpolateHsl("red", "purple")
		var colors_array_error=[];

		for (var i=0; i<nColors; i++) colors_array_error.push(f_error(i/(nColors-1)));
		// color palette = one color per subgroup
		var color_error = d3.scaleOrdinal()
			.domain(subgroups)
			.range(colors_array_error)


		// What happens when user hover a bar
		var mouseover = function(d) {  
			showTooltip(d.key) 
			// var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
			subgroupName = d.key.replace(" ", "")
			// console.log(subgroupName)
			var subgroupValue = d.value
			// console.log(subgroupValue)

			// Reduce opacity of all rect to 0.2
			d3.selectAll(".myRect").style("opacity", 0.2)
			// Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
			d3.selectAll("."+subgroupName)
			.style("opacity", 1)
		}
		
		function showTooltip(text) {        
			let tooltip = document.getElementById("visible_val");
			tooltip.innerHTML = text;
			tooltip.style.visibility = "block";
			
		}

		function hideTooltip() {
			var tooltip = document.getElementById("visible_val");
			tooltip.text = "";
		}

		// When user do not hover anymore
		var mouseleave = function(d) {
			hideTooltip();
			// Back to normal opacity: 0.8
			d3.selectAll(".myRect")
			.style("opacity",0.8)
			}
		


		var selection = g.selectAll("g")
				// Enter in data = loop group per group
				.data(data)
				.enter()
				.append("g")
				.attr("transform", function(d) { return "translate(" + x(d.group_value) + ",0)"; })
				.attr("class", "users_info")
				.selectAll("rect")
				.data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
				.enter().append("rect")
				.attr("class", function(d){ return "myRect " + d.key.replace(" ", "") }) // Add a class to each subgroup: their name
				.attr("x", function(d) { return xSubgroup(d.key); })
				.attr("y", d => (d.value<0 ? y(0) : y(d.value)))
				// .attr("y", function(d) { return y(d.perf);})
				.attr("width", xSubgroup.bandwidth())
				.attr("height", d => Math.abs(y(d.value) - y(0)))
				.attr("fill", function(d) { return d.value>0 ? color(d.key): color_error(d.key); })
				.on("mouseover", mouseover)
				.on("mouseleave", mouseleave)

		//add the x-axis
		g.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (height-5) + ")")
			.call(d3.axisBottom(x))
			.selectAll(".tick text")

		// d3.selectAll(".domain").remove() 
		d3.select(".axis").selectAll("line").remove()
		d3.select(".axis").style("font-size", 18).style("font-weight", "bold")
			
			//add the y-axis - notice it does not have css class 'axis'
		g.append('g')
			.call(yAxis)
			.attr("id", "y_line_status")

		//idenitfy zero line on the y axis.
		g.append("line")
			.attr("y1", y(0))
			.attr("y2", y(0))
			.attr("x1", 0)
			.attr("x2", width)
			.attr("stroke", "black");

		svg.append("text")
			.attr("id", "visible_val")
			.attr("x", width-250)
			.attr("y", 20)
			.text("")
			.style("font-size", "15px")
			.attr("alignment-baseline","middle")

		var yGrid = d3.axisLeft()
			.scale(y)
			.tickFormat('')
			.ticks(5)
			.tickSizeInner(-width)

		g.append('g')
			.attr('class', 'y-grid')
			.attr('transform', 'translate(' + 0 + ', 0)')
			.call(yGrid)
			.attr("stroke", "#b5adad")

		d3.select(".y-grid").selectAll("line").style("stroke", "#d2cfcf")

		d3.select("#y_line_status")
			.append('text')
			.attr('x', -20)
			.attr('dy', "-1.7em")
			.attr('transform', 'rotate(-90)')
			.attr('fill', '#000')
			.style("font-weight", "bold")
			.style("font-family", "sans-serif")
			.style("font-size", "18px")
			.text(`Failed < 0 || Success > 0`)
				
		});
};			
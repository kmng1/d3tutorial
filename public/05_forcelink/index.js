(function(){

    var data = {
        'nodes':[
            {'id': 'shoulder',	    'x': 50,	'y': 50,    'r':5,  'fx': 50, 'fy':50},
            {'id': 'elbow',			'x': 100,	'y': 50,    'r':5},
            {'id': 'wrist',			'x': 150,	'y': 50,    'r':5},
            {'id': 'handTip',		'x': 200,	'y': 50,    'r':5}
        ],
        'links': [
            {'source': 'shoulder', 	'target': 'elbow', 	'distance': 100},
            {'source': 'elbow', 		'target': 'wrist', 	'distance': 100},
            {'source': 'wrist', 		'target': 'handTip', 'distance': 30}
        ]
    };


    var width 	= 400,
        height 	= 400;
    var svg			= d3.select('div#container').append('svg')
        .attr('width', width)
        .attr('height', height);

    var chart		= svg.append('g')
        .classed('chart', true)
        .attr('width', width)
        .attr('height', height);




    var linkForce = d3.forceLink(data.links)
        .id(function(d){ return d.id })
        .distance(function (d) { return d.distance; })
        .strength(1);

    var simulation = d3.forceSimulation(data.nodes)
        .force('linkForce', linkForce)
        .velocityDecay(0.1)
        .on('tick', tick)
     ;

    var node = chart
        .selectAll("circle")
        .data(simulation.nodes())
        .enter().append("circle")
        .attr("r", function(d){ console.log(d);  return d.r });

    var link = chart
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "black");

    var a = simulation.nodes()[0];
    var b = simulation.nodes()[1];
    var c = simulation.nodes()[2];

    function tick() {
        //console.log('tick');



        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }

    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
    }

    function dragged(d) {
        if(d.id != 'handTip') return;
        //console.log(d);

        var a = simulation.nodes()[0];
        var b = {};
        b.x = d3.event.x;
        b.y = d3.event.y;
        var r = 230;
        var c = {};
        c.x = a.x + r * ( (b.x- a.x) / Math.sqrt( Math.pow( (b.x- a.x),2 ) + Math.pow( (b.y- a.y),2 ) ) );
        c.y = a.x + r * ( (b.y- a.y) / Math.sqrt( Math.pow( (b.x- a.x),2 ) + Math.pow( (b.y- a.y),2 ) ) );

        var di = Math.sqrt( Math.pow(a.x- b.x,2) + Math.pow(a.y-b.y,2));
        console.log(di);
        if(di >= r){
            d3.event.subject.fx = c.x;
            d3.event.subject.fy = c.y;
        } else {
            d3.event.subject.fx = d3.event.x;
            d3.event.subject.fy = d3.event.y;
        }

    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
    }

})();
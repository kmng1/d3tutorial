(function(){
    const API_URL = '/api/get/humantraffic';

    var WIDTH           = 1000,
        HEIGHT          = 400,

        MARGIN_LEFT     = 100,
        MARGIN_RIGHT    = 100,
        MARGIN_TOP      = 25,

        X_RANGE_MIN     = 0,
        X_RANGE_MAX     = WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

    d3.json(API_URL, function(err, res){
        if(err) return;
        var response = res.result;
        console.log(response);
        draw(response);
    });

    var container, simulation, circleG;
    function draw(_data){

    container = d3.select('div#graph-01')
        .append('svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT);

       // CREATE: Y AXIS---------------------
    var labelValues = ['living room', 'dining room', 'bed room', 'kitchen', 'toilet', 'freezer'];
    var tickCount = labelValues.length;

    var axisScale = d3.scaleLinear()
        .domain( [0, tickCount-1])
        .range( [X_RANGE_MIN, X_RANGE_MAX] );

    var axis = d3.axisBottom(axisScale)
        .ticks(tickCount-1)
        .tickFormat(function(d,i){ return (i<=_data.length)? labelValues[i] : undefined; });

    container.append('g')
        .call(axis)
        .attr( 'transform', 'translate(' + MARGIN_LEFT +','+MARGIN_TOP+')' );


    simulation = d3.forceSimulation(_data)
        .velocityDecay(0.1)
        .force("x", d3.forceX(function(d) { return x(d.roomid) }).strength(0.05))
        .force("y", d3.forceY(HEIGHT / 2).strength(0.05))
        .force("collide", d3.forceCollide().radius(10).iterations(4))
        .on('tick', tick);

    circleG = container.append('svg:g')
        .attr('class', 'circles');


    circleG.selectAll('circle')
        .data(simulation.nodes(), function(d){console.log(d)})
        .enter().append('circle')
        .attr('r', 10)
        .attr('fill', '#000');

    circleG.selectAll('circle').call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    circleG.selectAll('circle')
        .on('mouseover', mouseover)
        .on('mouseleave', mouseleave);

    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
    }

    function dragged(d) {
        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
    }

    function x(n){
        return MARGIN_LEFT + (X_RANGE_MAX/5*n);
    }

    function tick(e){
        console.log('.');
        circleG.selectAll('circle').attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')'; });
    }

    function mouseover(d){
        d3.select(this).raise()
            .transition()
            .attr('fill', 'red');

        var g = container.append('g')
            .attr('class', 'label');

        g.append('rect')
            .attr('x', d.x)
            .attr('y', HEIGHT-30)
            .attr('width', 150)
            .attr('height', 30)
            .attr('fill', 'black');

        g.append('text')
            .attr('x', d.x + 20)
            .attr('y', HEIGHT-10)
            .html(d.name)
            .attr('fill', 'white');
    }

    function mouseleave(d){
        d3.select(this)
            .transition()
            .attr('fill', '#000');
        container.selectAll('.label').remove();
    }


})();

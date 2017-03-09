(function(){
    const API_URL = '/api/get/humantraffic';

    var WIDTH           = 1200,
        HEIGHT          = 400,

        MARGIN_LEFT     = 100,
        MARGIN_RIGHT    = 25,
        MARGIN_BOTTOM   = 25,
        MARGIN_TOP      = 25,

        X_DOMAIN_MIN    = -10,
        X_DOMAIN_MAX    = 50,
        X_RANGE_MIN     = 0,
        X_RANGE_MAX     = WIDTH - MARGIN_LEFT - MARGIN_RIGHT,

        Y_DOMAIN_MIN    = 0,
        Y_RANGE_MIN     = 0,
        Y_RANGE_MAX     = HEIGHT - MARGIN_BOTTOM - MARGIN_TOP,

        BAR_HEIGHT      = 30,

        DURATION        = 1000;

    d3.json(API_URL, function(err, res){
        if(err) return;
        var response = res.result;
        console.log(response);
        draw(response);
    });

    var circles, container, simulation;
    function draw(_data){

    container = d3.select('div#graph-01')
        .append('svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT);


    // CREATE: Y AXIS---------------------
    var yValues = ['living room', 'dining room', 'bed room', 'kitchen', 'toilet', 'freezer'];
    var tickCount = yValues.length;

    var yAxisScale = d3.scaleLinear()
        .domain( [0, tickCount]).nice()
        .range( [X_RANGE_MIN, X_RANGE_MAX] );

    var yAxis = d3.axisBottom(yAxisScale)
        .ticks(tickCount)
        .tickFormat(function(d,i){ return yValues[i] });

    container.append('g')
        .call(yAxis)
        .attr( 'transform', 'translate(' + MARGIN_LEFT +','+MARGIN_TOP+')' );


    simulation = d3.forceSimulation(_data)
        .velocityDecay(0.1)
        .force("x", d3.forceX(function(d) { return x(d.roomid) }).strength(0.01))
        .force("y", d3.forceY(HEIGHT / 2).strength(0.003))
        .force("collide", d3.forceCollide().radius(10).iterations(2))
        .on('tick', tick);

    circles = container.append('svg:g')
        .attr('class', 'circles')
        .selectAll('circle')
        .data(simulation.nodes())
        .enter().append('circle')
        .attr('r', 10)
        .attr('fill', '#000');

    circles.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    circles
        .on('mouseover', mouseover)
        .on('mouseleave', mouseleave);

    }

    function dragstarted(d) {

    }

    function dragged(d) {
        d3.select(this)
            .attr('transform', function(d) {
                return 'translate(' + (d.x = d3.event.x) + ',' + (d.y = d3.event.y) + ')' });
    }

    function dragended(d) {

    }

    function x(n){
        return 100 + (X_RANGE_MAX/6*n);
    }

    function tick(e){
        circles.attr('transform', function(d) {
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

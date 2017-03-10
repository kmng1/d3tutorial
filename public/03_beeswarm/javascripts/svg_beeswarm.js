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

    //var svgobj = {
    //    svg:{
    //        width: 960,
    //        height: 960
    //    },
    //    paths: [
    //        {
    //            name: 'living',
    //            d: 'M429.9,219h509.1v509.1H429.9V219z'
    //        },
    //        {
    //            name: 'dining',
    //            d: 'M429.8,728.1H25V421.4h404.8V728.1z'
    //        },
    //        {
    //            name: 'bed',
    //            d: 'M25,16.6h404.8v404.8H25V16.6z'
    //        },
    //        {
    //            name: 'kitchen',
    //            d: 'M939.1,728.1v189.2H429.8V728.1H939.1z'
    //        },
    //        {
    //            name: 'toilet',
    //            d: 'M733.2,117.8c0-55.7-44.7-100.9-100.7-101.2v-0.1h-203v203h203V219 C688.5,218.8,733.2,173.6,733.2,117.8z'
    //        },
    //        {
    //            name: 'freezer',
    //            d: 'M236.2,728.1h193.6v189.2C236.2,917.3,236.2,728.1,236.2,728.1z'
    //        }
    //    ],
    //    texts: [
    //        {
    //            name: 'living',
    //            transform: 'matrix(1 0 0 1 618.1054 242.7861)',
    //            text: 'LIVING ROOM'
    //        },
    //        {
    //            name: 'dining',
    //            transform: 'matrix(1 0 0 1 180.7328 446.1767)',
    //            text: 'DINING ROOM'
    //        },
    //        {
    //            name: 'bed',
    //            transform: 'matrix(1 0 0 1 191.5927 38.1074)',
    //            text: 'BED ROOM'
    //        },
    //        {
    //            name: 'kitchen',
    //            transform: 'matrix(1 0 0 1 634.2011 752.5498)',
    //            text: 'KITCHEN'
    //        },
    //        {
    //            name: 'toilet',
    //            transform: 'matrix(1 0 0 1 501.1533 38.1074))',
    //            text: 'TOILET'
    //        },
    //        {
    //            name: 'freezer',
    //            transform: 'matrix(1 0 0 1 305.2499 747.4003)',
    //            text: 'FREEZER'
    //        }
    //    ]
    //};

    //container.append('g').attr('class','bg')
    //    .selectAll('path')
    //    .data(svgobj.paths, function(d){ return d.name })
    //    .enter().append('path')
    //    .attr('d', function(d){ return d.d })
    //    .style('fill', '#fff')
    //    .style('stroke', '#000');

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

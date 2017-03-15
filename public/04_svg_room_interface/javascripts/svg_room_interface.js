(function(){
    // constants
    const TEMPERATURE_API_URL = '/api/get/mocktemperature';
    const TRAFFIC_API_URL = '/api/get/humantraffic';
    const SVG_URL = 'data/room_svg.json';

    var WIDTH           = 960,
        HEIGHT          = 960,

        DURATION        = 1000;

    var container, roomPaths, roomLabels, roomCenters = [], roomData;
    var simulation;

    // "MAIN" ==============================================================
    document.addEventListener("DOMContentLoaded", function() {

        // Initialise the svg
        container =   d3.select('div#graph-01')
                        .append('svg')
                        .attr('width', WIDTH)
                        .attr('height', HEIGHT);

        // Initialise the room svg
       call(SVG_URL, initRoom);

        // Initialise the swarm
        call(TRAFFIC_API_URL, initSwarm);

        // update on poll
        d3.interval(function(){ call(TEMPERATURE_API_URL, updateRoom) },DURATION );

    });
    // =====================================================================


    // EVENT TRIGGERED FUNCTIONS-----------------------------------------
    function call(url, fn){
        d3.json(url, function(err, res){
            if(err) return;
            var response = res.result;
            fn(response);
        });
    }

    function initRoom(_data){

        roomData = _data;
        for(var i in roomData.paths)
            roomData.paths[i].fill = '#fff';

        // draw the paths
        roomPaths = container.append('g').attr('class','room-path')
            .selectAll('path')
            .data(roomData.paths, function(d){ return d.name });

        roomPaths.enter().append('path')
            .attr('d', function(d){ return d.d })
            .style('fill', function(d){ return d.fill })
            .style('stroke', '#fff');

        // draw the texts
        roomLabels = container.append('g').attr('class', 'room-label')
            .selectAll('text')
            .data(roomData.texts, function(d){ return d.name })
            .enter().append('text')
            .attr('transform', function(d){ return d.transform })
            .html( function (d){ return d.text } );

        // get the centroid of each room for swarm to gather
        container.select('.room-path').selectAll('path')
            .each( function(d,i){
                roomCenters[i] = getBoundingBoxCenter(this);
            });
    }

    function updateRoom(_data){
        for(var i in roomData.paths)
            roomData.paths[i].fill = d3.hsv(celsiusToHue(_data[i].temperature, 45), 1, 1);

        var rooms = container.select('g.room-path').selectAll('path')
            .data(roomData.paths, function(d){ return d.name })
            .transition()
            .style('fill', function (d) { return d.fill });
    }

    function initSwarm(_data){

        simulation = d3.forceSimulation(_data)
            .velocityDecay(0.5)
            .force("x", d3.forceX(function(d) { return roomCenters[d.roomid].x }).strength(0.3))
            .force("y", d3.forceY(function(d) { return roomCenters[d.roomid].y }).strength(0.3))
            .force("collide", d3.forceCollide().radius(10).iterations(2))
            .on('tick', tick)
        ;

        circleG = container.append('svg:g')
            .attr('class', 'circles');


        circleG.selectAll('circle')
            .data(simulation.nodes(), function(d){console.log(d)})
            .enter().append('circle')
            .attr('r', 10)
            .attr('fill', '#000');

        circles
            .on('mouseover', mouseover)
            .on('mouseleave', mouseleave);

    }

    function tick(e){
        circleG.selectAll('circle')
            .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')'; });
    }

    function mouseover(d){
        d3.select(this).raise()
            .transition()
            .attr('fill', 'red');

        var g = container.append('g')
            .attr('class', 'label');

        g.append('rect')
            .attr('x', d.x + 20)
            .attr('y', d.y)
            .attr('width', 150)
            .attr('height', 30)
            .attr('fill', 'black');

        g.append('text')
            .attr('x', d.x + 40)
            .attr('y', d.y + 20)
            .html(d.name)
            .attr('fill', 'white');
    }

    function mouseleave(d){
        d3.select(this)
            .transition()
            .attr('fill', '#000');
        container.selectAll('.label').remove();
    }

    function celsiusToHue(c, max){
        var h = 180;
        if(c > 0)  h += c/max * 180;
        if(h > 360) h = 360;
        return h;
    }

    function getBoundingBoxCenter (selection) {
        var bbox = selection.getBoundingClientRect();
        return {
            x : bbox.left + bbox.width/2,
            y : bbox.top + bbox.height/2
        };
    }

})();

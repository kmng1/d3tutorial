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

    var svg, simulation, circleG;
    function draw(_data){

        svg = d3.select('div#graph-01')
            .append('svg')
            .attr('width', WIDTH)
            .attr('height', HEIGHT);

        simulation = d3.forceSimulation(_data)
            .velocityDecay(0.1)
            .force('x', d3.forceX( function(d){ return x(d.roomid) }).strength(0.05))
                        // calculate xforce based on a x coordinate // then, multiply by factor strength
            .force('y', d3.forceY( HEIGHT / 2).strength(0.8 ))
            .force( 'collide', d3.forceCollide().radius(10).iterations(2) )
            .on('tick', tick);

        circleG = svg.append('g')
            .attr('class', 'circles');

        circleG.selectAll('circle')
            .data(simulation.nodes(), function(d){ console.log(d) })
            .enter().append('circle')
            .attr('r', 10)
            .attr('fill', '#000');

        function tick(e){
            //handle what happens at every frame of the simulation
            console.log('ticks');

            circleG.selectAll('circle')
                .attr('transform', function(d){
                    return 'translate(' + d.x + ',' + d.y + ')';
                });

        }

        circleG.selectAll('circle').call(
            d3.drag()
                .on('start', dragstart)
                .on('drag', drag)
                .on('end', dragend)
        );


        function dragstart(d){

            // if simulation has stopped restart it
            if(!d3.event.active)
                simulation.alphaTarget(0.7).restart();

            // set the starting non physics position
            // to its current physics position
            d3.event.subject.fx = d3.event.subject.x;
            d3.event.subject.fy = d3.event.subject.y;
        }

        function drag(d){
            // ignore physics and follow the mouse
            d3.event.subject.fx = d3.event.x;
            d3.event.subject.fy = d3.event.y;
        }
        function dragend(d){
            if(!d3.event.active)
                simulation.alphaTarget(0);

            // stop following the mouse
            // and go back to physics world
            d3.event.subject.fx = null;
            d3.event.subject.fy = null;
        }

        function x(n){
            //calculate the 6 distributed x positions for the swarms to gather
            return MARGIN_LEFT + (X_RANGE_MAX/5*n);
        }




    }



})();
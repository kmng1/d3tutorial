(function(){

    // constants
    const API_URL = '/api/get/mocktemperature'; // route to make api call

    var WIDTH           = 600,  // of svg
        HEIGHT          = 400,  // of svg

        MARGIN_LEFT     = 100,  // space before y axis
        MARGIN_RIGHT    = 25,   // space after graph
        MARGIN_BOTTOM   = 25,   // space after x axis
        MARGIN_TOP      = 25,   // space before graph

        X_DOMAIN_MIN    = -10,  // minimum temperature display
        X_DOMAIN_MAX    = 50,   // maximum temperature display
        X_RANGE_MIN     = 0,    // starting x position of graph after margin
        X_RANGE_MAX     = WIDTH - MARGIN_LEFT - MARGIN_RIGHT,   // ending x relational position of graph

        Y_DOMAIN_MIN    = 0,    // max domain will be calculated from array size
        Y_RANGE_MIN     = 0,    // starting y position of graph after margin
        Y_RANGE_MAX     = HEIGHT - MARGIN_BOTTOM - MARGIN_TOP,  // ending y relational position of graph

        BAR_HEIGHT      = 30,   // thickness of bar

        DURATION        = 1000; // time between each poll in milliseconds

    // variables
    var container;  // svg element

    // MAIN ===================================================
    document.addEventListener("DOMContentLoaded", function() {

        // initialise
        call(init);

        // update on poll
        d3.interval(function(){ call(update) },DURATION );

    });
    // ==========================================================

    // MAIN FUNCTION DEFINITIONS ================================
    function call(fn){
        d3.json(API_URL, function(err, res){
            if(err) return;
            response = res.result;
            fn(response);
        });
    }

    // Run once at the start
    function init(_data){

        // CREATE: svg element
        container = d3.select('div#graph-01')
            .append('svg')
            .attr('width', WIDTH)
            .attr('height', HEIGHT);

        // CREATE: X AXIS---------------------
            // a. create scale object: Math operation to map array distribution & values
        var xAxisScale = d3.scaleLinear()
            .domain( [X_DOMAIN_MIN, X_DOMAIN_MAX] )     // range of tick values
            .range( [X_RANGE_MIN, X_RANGE_MAX] );       // range of graph width

            // b. create the axis object
        var xAxis = d3.axisBottom(xAxisScale);
            // is it bottom, left, top or right axis?

            // c. add the axis to the svg
        container.append("g")                           // create a group
              .call(xAxis)                              // add the axis into the group
              .attr( 'transform',                       // move the axis into position
                  'translate(' + MARGIN_LEFT +',' + (HEIGHT-MARGIN_BOTTOM) + ')' );

        // optionally: Add mouse events to ticks
        // any standard DOM event works (not same as pseudo class)
        container.selectAll('.tick')                    // .tick is added automatically by axis method above
            .on('mouseover', function(){                // mouseover is like hovering in
                d3.select(this).select('text')          // this = <g class="tick"> that is mouseovered
                    .attr('fill', 'red');               // make the text red
                d3.select(this).select('line')          // line of the tick
                    .transition()                       // no params = default linear easing config
                    .attr('y1', -Y_RANGE_MAX);          // line y1 is the starting y position (in relation to parent)

            })
            .on('mouseout', function(){                 // mouseout is like exiting a hovered item
                d3.select(this).select('text')          // select the text
                    .attr('fill', '#000');              // make it black
                d3.select(this).select('line')          // next, select the line
                    .transition()
                    .attr('y1', 0);                     // set the starting y position back to 0 (in relation to parent)
            });

        // CREATE: Y AXIS---------------------
        // since the y axis is used for labels, we will manually feed in the [values,..]

        var yAxisScale = d3.scaleLinear()
            .domain( [Y_DOMAIN_MIN, _data.length] )     // [0, 6]   // 6 items worth
            .range( [Y_RANGE_MIN, Y_RANGE_MAX] );       // [0, 350] // over the distance of 350px

        var yAxis = d3.axisLeft(yAxisScale)
            .ticks(_data.length)                                    // manually set number of ticks = 6
            .tickFormat(function(d,i){
                return (i<_data.length)? _data[i].name : undefined; // manually set text to room names
            });

        container.append('g')                           // create a group
            .call(yAxis)                                // add the axis into the group
            .attr( 'transform',                         // move the axis into position
                'translate(' + MARGIN_LEFT +','+MARGIN_TOP+')' );

        // CREATE: BARS (enter state of update cycle)---------------------

        container.selectAll('rect')        // declare the abstract selection of PRESENT & FUTURE rects for data binding
            .data(_data, function(d){ return d.name})   // bind the data to the abstract selection with an identifier
            .enter().append('rect')     // enter() is the state of handling NEW rects that don't match existing ones
            .attr('x', MARGIN_LEFT)     // starting x position
            .attr('y', function(d,i){ return Y_RANGE_MAX / _data.length * i + MARGIN_TOP } )    //starting y position
            .attr('height', BAR_HEIGHT);    // height. (width will be handled on update as it changes)

        update(_data); // run the update for the first time at TIME=0
    }

    // Run at every interval
    function update(_data){

        // Transition config for .transition() function used next
        var t = d3.transition()
            .duration(DURATION)     // how much time
            .ease(d3.easeExpIn);    // tweening type

        container.selectAll('rect')
            .data(_data, function(d){ return d.name })  // bind the NEW data into the same OLD rects
            .transition(t)
            .attr('width', function(d){ return celsiusToWidth(+d.temperature) })
            .attr('fill', function(d){ return d3.hsv( celsiusToHue(+d.temperature, X_DOMAIN_MAX), 0.5,1) });

    }

    // HELPER FUNCTIONS-------------------------

    function celsiusToWidth(celsius){
        var width = (celsius - X_DOMAIN_MIN) / (X_DOMAIN_MAX - X_DOMAIN_MIN) * (X_RANGE_MAX-X_RANGE_MIN) + X_RANGE_MIN;
        if(width < 1) width = 1;
        if(width > X_RANGE_MAX) width = X_RANGE_MAX;
        return width;
    }

    function celsiusToHue(c, max){
        var h = 180;
        if(c > 0)  h += c/max * 180;
        if(h > 360) h = 360;
        return h;
    }

})();
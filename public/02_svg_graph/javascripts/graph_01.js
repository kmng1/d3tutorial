(function(){

    // constants
    const API_URL = '/api/get/mocktemperature';

    var WIDTH           = 600,
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

    // variables
    var container;


    document.addEventListener("DOMContentLoaded", function() {

        // initialise
        call(init);

        // update on poll
        d3.interval(function(){ call(update) },DURATION );

    });

    // EVENT TRIGGERED FUNCTIONS-----------------------------------------
    function call(fn){
        d3.json(API_URL, function(err, res){
            if(err) return;
            response = res.result;
            response = formatData(response);
            fn(response);
        });
    }

    function update(_data){
        // transition config
        var t = d3.transition()
            .duration(DURATION)
            .ease(d3.easeExpIn);


        var bars = container.selectAll('rect')
            .data(_data, function(d){ return d.name});

        bars.transition(t)
            .attr('width', function(d){ return celsiusToWidth(d.temperature) })
            .attr('fill', function(d){ return d3.hsv( celsiusToHue(d.temperature, X_DOMAIN_MAX), 0.5,1) });

    }

    function init(_data){

        container = d3.select('div#graph-01')
            .append('svg')
            .attr('width', WIDTH)
            .attr('height', HEIGHT);

        // CREATE: X AXIS---------------------
        var xAxisScale = d3.scaleLinear()
            .domain( [X_DOMAIN_MIN, X_DOMAIN_MAX] )
            .range( [X_RANGE_MIN, X_RANGE_MAX] );

        var xAxis = d3.axisBottom(xAxisScale);

        container.append("g")
              .call(xAxis)
              .attr( 'transform', 'translate(' + MARGIN_LEFT +',' + (HEIGHT-MARGIN_BOTTOM) + ')' );


        container.selectAll('.tick')
            .on('mouseover', function(){
                d3.select(this).select('text').attr('fill', 'red');
                d3.select(this).select('line').transition().attr('y1', -Y_RANGE_MAX);

            })
            .on('mouseout', function(){
                d3.select(this).select('text').attr('fill', '#000');
                d3.select(this).select('line').transition().attr('y1', 0);
            });

        // CREATE: Y AXIS---------------------
        var yValues = [];
        for (var i in _data)
            yValues[i] = _data[i].name;
        var tickCount = yValues.length;

        var yAxisScale = d3.scaleLinear()
            .domain( [Y_DOMAIN_MIN, tickCount] )
            .range( [Y_RANGE_MIN, Y_RANGE_MAX] );

        var yAxis = d3.axisLeft(yAxisScale)
            .ticks(tickCount)
            .tickFormat(function(d,i){ return yValues[i] });

        container.append('g')
            .call(yAxis)
            .attr( 'transform', 'translate(' + MARGIN_LEFT +','+MARGIN_TOP+')' );

        // CREATE: BARS---------------------

        var bars = container.selectAll('rect')
            .data(_data, function(d){ return d.name});

        bars.enter().append('rect')
            .attr('x', MARGIN_LEFT)
            .attr('y', function(d,i){ return Y_RANGE_MAX / tickCount * i + MARGIN_TOP } )
            .attr('height', BAR_HEIGHT);

        update(_data);
    }

    // HELPER FUNCTIONS-------------------------
    function formatData(data){
        data.forEach(function(d){
            d.temperature = +d.temperature;
        });
        return data;
    }

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
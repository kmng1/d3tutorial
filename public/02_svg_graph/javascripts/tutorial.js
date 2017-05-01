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
    var svg;  // svg element
    document.addEventListener('DOMContentLoaded', function(){

        // init
        call(init);

        // setup a update polling
        d3.interval(function(elapsed){
            call(update);
        }, DURATION);

    });

    function call(fn){
        d3.json(API_URL, function(err, res){
           if(err) return;
            fn(res.result);
        });
    }

    function init(_data){
        //create svg
        svg = d3.select('div#graph-01')
            .append('svg')
            .attr('width', WIDTH)
            .attr('height', HEIGHT);

        var xAxisScale = d3.scaleLinear()
            .domain( [X_DOMAIN_MIN, X_DOMAIN_MAX] )
            .range( [X_RANGE_MIN, X_RANGE_MAX]);

        var xAxis = d3.axisBottom(xAxisScale);

        svg.append('g')
            .call(xAxis)
            .attr('transform',
            'translate('+ MARGIN_LEFT + ','
            + (HEIGHT-MARGIN_BOTTOM) + ')' );

        // make mouse hover events

        svg.selectAll('.tick')
            .on('mouseover', function(){
                console.log(this);
                // make the text red
                d3.select(this).select('text')
                    .attr('fill', 'red');

                // make the line stretch
                d3.select(this).select('line')
                    .transition()
                    .attr('y1', -Y_RANGE_MAX);

            })
            .on('mouseout', function(){

                d3.select(this).select('text')
                    .attr('fill', '#000');

                // make the line stretch
                d3.select(this).select('line')
                    .transition()
                    .attr('y1', 0);

            });



        // Y AXIS ---

        var yAxisScale = d3.scaleLinear()
            .domain( [Y_DOMAIN_MIN, _data.length] )
            .range( [Y_RANGE_MIN, Y_RANGE_MAX]);

        var yAxis = d3.axisLeft(yAxisScale)
            .ticks(_data.length)
            .tickFormat( function(d,i){
                if(i<_data.length){
                    return _data[i].name;
                }
                else {
                    return undefined;
                }
            } );

        svg.append('g')
            .call(yAxis)
            .attr('transform',
            'translate(' + MARGIN_LEFT +','+
            MARGIN_TOP + ')');

        // BARS -----
        svg.selectAll('rect')
            .data(_data, function(d){ return d.name })
            .enter().append('rect')
            .attr('x', MARGIN_LEFT)
            .attr('y', function(d,i){
                return Y_RANGE_MAX / _data.length * i + MARGIN_TOP;
            })
            .attr('height', BAR_HEIGHT)
            .attr('width', X_RANGE_MAX);

        //initial update at time=0
        update(_data);
    }

    function update(_data){

        svg.selectAll('rect')
            .data(_data, function(d){
                return d.name;
            })
            .transition()
            .attr('width', function(d){
                //get the temperature and map it to a width
                return celsiusToWidth(+d.temperature);
            })
            .attr('fill', function(d){
                return d3.hsv(
                    celsiusToHue(+d.temperature, 50), 1,1);
            })

    }

    // SAME HELPERS AS BEFORE-----------------------
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
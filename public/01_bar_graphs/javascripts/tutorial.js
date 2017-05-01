(function(){

    const API_URL = '/api/get/mocktemperature';
    const DURATION = 1000;

    // make sure you only run stuff when DOM is ready
    document.addEventListener('DOMContentLoaded', function(){
        // initialise
        call(init);

        // updates by polling in intervals
        d3.interval(function(elapsed){
            //call the updates
            call(update);
        }, DURATION);
    });

    function call(fn){
        // make the call
        d3.json(API_URL, function(err, res){
            if(err) return;

            var response = res.result;
            fn(response);
        });
    }

    function init(_data){

        // setup the group divs
        var groups = d3.select('div#graph-01').selectAll('div.bar-group')
            .data(_data, function(d){ return d.name })  // bind to the name
            .enter().append('div')  // add the div
            .attr('class', 'bar-group');    // give a class

        // setup the text labels
        groups.selectAll('label.bar-label')
            .data( function(d){ console.log([d]); return [d] } )
            .enter().append('label')
            .attr('class', 'bar-label')
            .html( function(d){ return d.name } );
            // <p> innerHTML </p>

        // setup the divs as bars
        groups.selectAll('div.bar')
            .data( function(d){ console.log('>>divs setup');
                console.log([d]);
                return [d]} )
            .enter().append('div')
            .attr('class', 'bar');

        update(_data);  // make the first update at TIME=0
    }

    function update(_data){

        // attach the new updated data into the groups
        var groups = d3.select('div#graph-01').selectAll('div.bar-group')
            .data(_data, function(d){ return d.name });

        //update the style of the bars based on the new data
        groups.selectAll('div.bar')
            .data( function(d){ return [d] })
            .html( function(d){ return d.temperature} )
            .style('background-color', function(d){
                return d3.hsv(celsiusToHue(d.temperature, 50), 1, 1);
            })
            .style('width', function(d){
                return celsiusToWidth(d.temperature, 50, 10, 400) + 'px';
            });

        // sort the order of the groups based on the temperature

    }

    // HELPER FUNCTIONS DEFINITIONS-------------------------

    // Set Hue (colour code) based on temperature
    function celsiusToHue(c, max) {
        var h = 180;    // minimum is 180
        if (c > 0) h += c / max * 180;  // map the scale of 0-50 :: 180-360
        if (h > 360) h = 360;   // max hue is 360
        return h;
    }

    // Set the width of the bar based on temperature
    function celsiusToWidth(temp, maxTemp, minW, maxW) {
        var result = minW;
        if (temp > 0) result += (maxW - minW) / maxTemp * temp;
        if (result > maxW) result = maxW;
        return result;
    }

})();
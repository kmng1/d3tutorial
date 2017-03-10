(function(){

    const LOCAL_URL = 'data/data.json';
    const API_URL = '/api/get/mocktemperature';
    const DURATION = 1000;
    var response, groups, bars;

    call(init);
    d3.interval(function(elapsed){
            call(update);
        },DURATION
    );

    // EVENT TRIGGERED FUNCTIONS-------------------------
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

        groups.data(_data);

        bars.data(function(d){return [d]})
            .enter().select('div')
            .html(function(d){ return d.temperature })
            .transition(t)
            .style('background-color', function (d) { return d3.hsv(celsiusToHue(d.temperature,45),1,1); } )
            .style('width', function(d){ return celsiusToWidth(d.temperature,45,10,400) + "px" });

        groups.sort(function(a,b){ return b.temperature - a.temperature});
    }

    function init(_data){
        // setup group divs
        groups = d3.select('div#graph-01').selectAll('div.bar-group')
                .data(_data)
                .enter().append('div')
                .attr('class', 'bar-group');

        groups.selectAll('label.bar-label')
            .data(function(d){return [d]})
            .enter().append('label')
            .attr('class', 'bar-label')
            .html(function(d){ return d.name });

        // only bind the dataset to bars
        bars = groups.selectAll('div.bar')
            .data(function(d){return [d]});

        // handle the event separately as we will be editing the bars
        bars.enter().append('div')
            .attr('class', 'bar');

        update(_data);
    }

    // HELPER FUNCTIONS-------------------------
    function formatData(data){
        data.forEach(function(d){
            d.temperature = +d.temperature;
        });
        return data;
    }

    function celsiusToHue(c, max){
        var h = 180;
        if(c > 0)  h += c/max * 180;
        if(h > 360) h = 360;
        return h;
    }

    function celsiusToWidth(temp, maxTemp, minW, maxW){
        var result = minW;
        if(temp > 0) result += (maxW-minW)/maxTemp*temp;
        if(result > maxW) result = maxW;
        return result;
    }


})();
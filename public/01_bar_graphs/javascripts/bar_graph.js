(function () {

    // Declare constants and variables 
    const   LOCAL_URL = 'data/data.json',   // local json demo file
            API_URL = '/api/get/mocktemperature',   // api url for dynamic data
            DURATION = 1000;    // time between each poll in milliseconds

    // MAIN ===================================================
    document.addEventListener("DOMContentLoaded", function () {
        // Make the first call to server using call function
        // and initialise the app using init function
        call(init);

        // Set the interval for the app to call the server for data updates
        d3.interval(function (elapsed) {
            // Make the call to server using call function
            // and update the graph using update function plus data from server
            call(update);
            // Set the interval to 1000 milliseconds
        }, DURATION);
    });
    // ==========================================================

    // MAIN FUNCTION DEFINITIONS -------------------------
    function call(fn) {
        // Make a GET request to the server to retrieve JSON file
        d3.json(API_URL, function (err, res) {
            // Error handler: exit function if error encountered
            if (err) return;

            // Assign result from server to variable response
            var response = res.result;

            // Call a separate function and pass in response as a parameter
            // In our case, either init or update function
            fn(response);
        });
    }

    function update(_data) {

        // attach updated data to the groups
        var groups = container.selectAll('div.bar-group')
            .data(_data, function(d){ return d.name });

        // Transition config for .transition() function used next
        var t = d3.transition()
            .duration(DURATION)     // how much time
            .ease(d3.easeExpIn);    // tweening type

        // Update the style of the bars based on new data attached above
        groups.selectAll('div.bar')
            .data(function (d) { return [d] })
            .html(function (d) { return d.temperature })
            .transition(t)
            .style('background-color', function (d) {
                return d3.hsv(celsiusToHue(d.temperature, 45), 1, 1);
            })
            .style('width', function (d) {
                return celsiusToWidth(d.temperature, 45, 10, 400) + "px"
            });

        // Sort the array in descending order of temperature
        // This is a standard array.sort method in most programming
        groups.sort(function (a, b) {
            return b.temperature - a.temperature
        });
    }

    function init(_data) {

        // Setup group divs
        var groups = d3.select('div#graph-01').selectAll('div.bar-group')
            .data(_data, function(d){ return d.name })
            .enter().append('div')
            .attr('class', 'bar-group');

        // Setup labels for the bars
        groups.selectAll('label.bar-label')
            .data(function (d) { return [d] })
            .enter().append('label')
            .attr('class', 'bar-label')
            .html(function (d) {
                return d.name
            });

        // Setup empty divs as bars
       groups.selectAll('div.bar')
            .data(function (d) { return [d] })
            .enter().append('div')
            .attr('class', 'bar');
        // Handle the styling of the bar in the update() as it will change

        update(_data);
    }

    // HELPER FUNCTIONS DEFINITIONS-------------------------

    // Set Hue (colour code) based on temperature
    function celsiusToHue(c, max) {
        var h = 180;
        if (c > 0) h += c / max * 180;
        if (h > 360) h = 360;
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
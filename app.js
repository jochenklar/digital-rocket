_width = 940;
_height = 500;
_stars = "data/hipparcos.json";
_planets = "data/planets.json";
_start = 0;
_f = 100;
_t = 10000;
var _earth;
var _markers = new Array();
var _old_f;
var _scaleText;

function x(glon, dist, earth, f) {
    return Math.cos(glon) * dist * f - Math.cos(earth.glon) * earth.dist * f;
};

function y(glon, dist, earth, f) {
    return Math.sin(glon) * dist * f - Math.sin(earth.glon) * earth.dist * f;
};

function rad(id, rad, f) {
    if(id == "Earth") {
        if(0.0000425875046 * f > 5) {
            return 0.0000425875046 * f;
        } else {
            return 5;
        }
    } else {
        if(isNaN(rad)) {
            return 5;
        } else {
            return 0.5*Math.abs(rad);
        }
    }
}

function planetColors(id) {
    var v;
    if (id == 'Sun') {
        v =  'yellow';
    } else if (id == 'Earth') {
        v = 'blue';
    } else if (id % 1 === 0){
        v = 'orange';
    } else {
        v = 'silver'
    }
    return v;
}

function init() {
    d3.json(_planets, function(planets) {
        d3.json(_stars, function(stars) {
            data = stars.concat(planets);

            _earth = $.grep(planets, function(e){ return e.id === "Earth"; })[0];

            var svg = d3.select('#canvas').append('svg')
                .attr('width', _width)
                .attr('height', _height);

            var g = svg.append('g').attr('transform','translate(' + _width/2 + ',' + _height/2 +')');

            d3.select("svg > g").selectAll('circle').data(data).enter().append("circle")
                .on("click", function(d,i) { 
                    $('#info').children().remove();
                    $('#info').append('<p>' + d.id + '</p>');
                })
                .attr('cx', function (d) {return x(d.glon, d.dist, _earth, _f);})
                .attr('cy', function (d) {return y(d.glon, d.dist, _earth, _f);})
                .attr("r", function (d) {return rad(d.id, d.vmag, _f);})
                .style('stroke', 'white')
                .style('fill', function (d) {return planetColors(d.id);})
                .style('stroke-width', '0.2');

            d3.select("svg > g").append("line")
                .attr('x1', 0.0-_f*0.5)
                .attr('y1', 1*_height/2)
                .attr('x2', 0.0+_f*0.5)
                .attr('y2', 1*_height/2)
                .style('stroke', 'white')
                .style('stroke-width', '2');

            _old_f = _f;
            _markers[0] = new  marker(_start);
            _markers[1] = new marker(_start+1);

            _scaleText = d3.select("svg > g").append("text")
                .text(function (d) { return Math.pow(10, Math.floor(_start)) + " AU"; })
                .attr('x', function (d) {return 0.0 - (this.getComputedTextLength() / 2.0);})
                .attr('y', 1*_height/2-0.05*_f)
                .attr("fill", "white");

            d3.select("input[type=range]").on("change", function() {
                f = _f * Math.pow(10,-this.value);
                scale = Math.pow(10, this.value);
                g.selectAll("circle").transition()
                    .attr('cx', function (d) {return x(d.glon, d.dist, _earth, f);})
                    .attr('cy', function (d) {return y(d.glon, d.dist, _earth, f);})
                    .attr("r", function (d) {return rad(d.id, d.vmag, f);});
                g.selectAll("line").transition()
                    .attr('x1', 0.0-_f*0.5)
                    .attr('y1', 1*_height/2)
                    .attr('x2', 0.0+_f*0.5)
                    .attr('y2', 1*_height/2)
                    .style('stroke', 'white')
                    .style('stroke-width', '2');
                _scaleText.transition()
                    .text(function (d) { return scale + " AU"; })
                    .attr('y', 1*_height/2-0.05*_f)
                    .attr("fill", "white")
                    .attr('x', function (d) {return 0.0 - (this.getComputedTextLength() / 2.0);});


                //update the square markers and add new if needed
                if((Math.pow(10, Math.floor(parseFloat(this.value)+1)) * f <= _width ||
                    Math.pow(10, Math.floor(parseFloat(this.value)+1)) * f <= _height ||
                    parseFloat(this.value)+1 == _markers[1].logScale+1) &&
                    _markers[1].logScale < Math.floor(parseFloat(this.value)+1)) {

                    _markers[0].remove();
                    _markers[0] = _markers[1];
                    _markers[1] = new marker(Math.floor(parseFloat(this.value)+1.0));
                }


                _markers[0].update(f);
                _markers[1].update(f);

                _old_f = f;
            });

        });
    });
};

function marker (scale) {
    this.logScale = scale;
    this.scale = Math.pow(10, Math.floor(scale));
    this.square = d3.select("svg > g").append("rect")
                    .attr('x', 0.0-this.scale*_f*0.5)
                    .attr('y', 0.0-this.scale*_f*0.5)
                    .attr('width', this.scale*_f)
                    .attr('height', this.scale*_f)
                    .style('stroke', 'white')
                    .style('stroke-width', '2')
                    .style('fill', 'transparent');

    this.text = d3.select("svg > g").append("text")
                    .text(this.scale + " AU")
                    .attr('x', function (d) {return 0.0 - this.scale*_f*0.5 - (this.getComputedTextLength() / 2.0);})
                    .attr('y', 0.0-this.scale*_f*0.5 - 0.05*_f)
                    .attr("fill", "white");

    this.update = function(f) {
        this.square.transition()
                .attr('x', 0.0-this.scale*f*0.5)
                .attr('y', 0.0-this.scale*f*0.5)
                .attr('width', this.scale*f)
                .attr('height', this.scale*f);
        this.text.transition()
                .text(this.scale + " AU")
                .attr('x', function (d) {return 0.0 - this.scale*f*0.5 - (this.getComputedTextLength() / 2.0);})
                .attr('y', 0.0-this.scale*f*0.5 - 0.05*f);
    };

    this.remove = function() {
        this.square.remove();
        this.text.remove();
    }
};

$(document).ready(function () {
    init();
});


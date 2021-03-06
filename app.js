_width = 940;
_height = 500;
_stars = "data/hipparcos.json";
_planets = "data/planets.json";
_start = 1;
_f = 100 * Math.pow(10, -1.0 * _start);
_t = 10000;
_au = 149597870700;
var _earth;
var _markers = new Array();
var _old_f;

var _img1;
var _img2;
var _img3;

var _m,_g;

function x(glon, dist, earth, f) {
    return Math.cos(glon) * dist * _au * f - Math.cos(earth.glon) * earth.dist * _au * f;
};

function y(glon, dist, earth, f) {
    return Math.sin(glon) * dist * _au * f - Math.sin(earth.glon) * earth.dist * _au * f;
};

function rad(id, radius, f) {
    if(id == "Earth") {
        if(0.0000425875046 * _au * f > 5) {
            return 0.0000425875046 * _au * f;
        } else {
            return 5;
        }
    }

    var g = Math.log(1e-9/f)/2.30258509299;
    return radius * Math.pow(0.5,g);
}

function init() {
    d3.json(_planets, function(planets) {
        d3.json(_stars, function(stars) {
            data = stars.concat(planets);
            //data = planets;
            _earth = $.grep(planets, function(e){ return e.id === "Earth"; })[0];

            var svg = d3.select('#canvas').append('svg')
                .attr('width', _width)
                .attr('height', _height);

            _g = svg.append('g').attr('transform','translate(' + _width/2 + ',' + _height/2 +')');
            _m = svg.append('g').attr('transform','translate(' + _width/2 + ',' + _height/2 +')');

            _g.selectAll('circle').data(data).enter().append("circle")
                .on("click", function(d,i) {
                    console.log(d.id);
                    $('#info').children().remove();
                    $('#info').append('<p>' + d.id + '</p>');
                })
                .attr('cx', function (d) {return x(d.glon, d.dist, _earth, _f);})
                .attr('cy', function (d) {return y(d.glon, d.dist, _earth, _f);})
                .attr("r", function (d) {return rad(d.id, d.radius, _f);})
                .style('stroke', 'silver')
                .style('fill', function (d) {return d.color;})
                .style('stroke-width', '1');

            //images
            _img3 = _g.append("svg:image")
                        .attr("xlink:href", "data/1000000m.jpg")
                        .attr("x", 0.0 - 1000000.0 * _f / 2)
                        .attr("y", 0.0 - 1000000.0 * _f / 2)
                        .attr("width", 1000000.0 * _f)
                        .attr("height", 1000000.0 * _f);

            _img2 = _g.append("svg:image")
                        .attr("xlink:href", "data/10000m.jpg")
                        .attr("x", 0.0 - 10000.0 * _f / 2)
                        .attr("y", 0.0 - 10000.0 * _f / 2)
                        .attr("width", 10000.0 * _f)
                        .attr("height", 10000.0 * _f);

            _img1 = _g.append("svg:image")
                        .attr("xlink:href", "data/100m.jpg")
                        .attr("x", 0.0 - 100.0 * _f / 2)
                        .attr("y", 0.0 - 100.0 * _f / 2)
                        .attr("width", 100.0 * _f)
                        .attr("height", 100.0 * _f);

            _old_f = _f;
            _markers[0] = new marker(_start);
            _markers[1] = new marker(_start+1);

            d3.select("input[type=range]").on("change", function() {
                f = 100 * Math.pow(10,-this.value);
                scale = Math.pow(10, this.value);
                _g.selectAll("circle").transition()
                    .attr('cx', function (d) {return x(d.glon, d.dist, _earth, f);})
                    .attr('cy', function (d) {return y(d.glon, d.dist, _earth, f);})
                    .attr("r", function (d) {return rad(d.id, d.radius, f);});
                _m.selectAll("line").transition()
                    .attr('x1', 0.0-_f*0.5)
                    .attr('y1', 1*_height/2)
                    .attr('x2', 0.0+_f*0.5)
                    .attr('y2', 1*_height/2)
                    .style('stroke', 'white')
                    .style('stroke-width', '2');

                _img1.transition()
                    .attr("x", 0.0 - 100.0 * f / 2)
                    .attr("y", 0.0 - 100.0 * f / 2)
                    .attr("width", 100.0 * f)
                    .attr("height", 100.0 * f);

                _img2.transition()
                    .attr("x", 0.0 - 10000.0 * f / 2)
                    .attr("y", 0.0 - 10000.0 * f / 2)
                    .attr("width", 10000.0 * f)
                    .attr("height", 10000.0 * f);

                _img3.transition()
                    .attr("x", 0.0 - 1000000.0 * f / 2)
                    .attr("y", 0.0 - 1000000.0 * f / 2)
                    .attr("width", 1000000.0 * f)
                    .attr("height", 1000000.0 * f);


                //update the square markers and add new if needed
                if(_old_f >= f) {
                    //zooming out
                    if((Math.pow(10, Math.floor(parseFloat(this.value)+1)) * f <= _width ||
                        Math.pow(10, Math.floor(parseFloat(this.value)+1)) * f <= _height ||
                        parseFloat(this.value)+1 == _markers[1].logScale+1) &&
                        _markers[1].logScale < Math.floor(parseFloat(this.value)+1)) {

                        _markers[0].remove();
                        _markers[0] = _markers[1];
                        _markers[1] = new marker(Math.floor(parseFloat(this.value)+1.0));
                    }
                } else {
                    //zooming in
                    if((Math.pow(10, Math.floor(parseFloat(this.value))) * f > 1 ||
                        Math.pow(10, Math.floor(parseFloat(this.value))) * f > 1 ||
                        parseFloat(this.value) == _markers[0].logScale-1) &&
                        _markers[0].logScale > Math.floor(parseFloat(this.value))) {

                        _markers[1].remove();
                        _markers[1] = _markers[0];
                        _markers[0] = new marker(Math.floor(parseFloat(this.value)));
                    }
                }

                _markers[0].update(f);
                _markers[1].update(f);

                _old_f = f;
            });

        });
    });
};

function marker(scale) {
    this.logScale = scale;
    this.scale = Math.pow(10, Math.floor(scale));

    this.line1 = _m.append("line")
                    .attr('x1', 0.0-this.scale*_f*0.5)
                    .attr('y1', 0.0-this.scale*_f*0.5)
                    .attr('x2', 0.0-this.scale*_f*0.5 + this.scale*_f)
                    .attr('y2', 0.0-this.scale*_f*0.5)
                    .style('stroke', 'white')
                    .style('stroke-width', '2');

    this.line2 = _m.append("line")
                    .attr('x1', 0.0-this.scale*_f*0.5 + this.scale*_f)
                    .attr('y1', 0.0-this.scale*_f*0.5)
                    .attr('x2', 0.0-this.scale*_f*0.5 + this.scale*_f)
                    .attr('y2', 0.0-this.scale*_f*0.5 + this.scale*_f)
                    .style('stroke', 'white')
                    .style('stroke-width', '2');

    this.line3 = _m.append("line")
                    .attr('x1', 0.0-this.scale*_f*0.5 + this.scale*_f)
                    .attr('y1', 0.0-this.scale*_f*0.5 + this.scale*_f)
                    .attr('x2', 0.0-this.scale*_f*0.5)
                    .attr('y2', 0.0-this.scale*_f*0.5 + this.scale*_f)
                    .style('stroke', 'white')
                    .style('stroke-width', '2');

    this.line4 = _m.append("line")
                    .attr('x1', 0.0-this.scale*_f*0.5)
                    .attr('y1', 0.0-this.scale*_f*0.5 + this.scale*_f)
                    .attr('x2', 0.0-this.scale*_f*0.5)
                    .attr('y2', 0.0-this.scale*_f*0.5)
                    .style('stroke', 'white')
                    .style('stroke-width', '2');

    this.text = _m.append("text")
                    .text(this.scale.toExponential() + " m")
                    .attr('x', function (d) {return 0.0 - this.scale*_f*0.5 - (this.getComputedTextLength() / 2.0);})
                    .attr('y', 0.0-this.scale*_f*0.5 - 10.0)
                    .attr("fill", "white");

    this.update = function(f) {
        this.line1.transition()
            .attr('x1', 0.0-this.scale*f*0.5)
            .attr('y1', 0.0-this.scale*f*0.5)
            .attr('x2', 0.0-this.scale*f*0.5 + this.scale*f)
            .attr('y2', 0.0-this.scale*f*0.5);

        this.line2.transition()
            .attr('x1', 0.0-this.scale*f*0.5 + this.scale*f)
            .attr('y1', 0.0-this.scale*f*0.5)
            .attr('x2', 0.0-this.scale*f*0.5 + this.scale*f)
            .attr('y2', 0.0-this.scale*f*0.5 + this.scale*f);

        this.line3.transition()
            .attr('x1', 0.0-this.scale*f*0.5 + this.scale*f)
            .attr('y1', 0.0-this.scale*f*0.5 + this.scale*f)
            .attr('x2', 0.0-this.scale*f*0.5)
            .attr('y2', 0.0-this.scale*f*0.5 + this.scale*f);

        this.line4.transition()
            .attr('x1', 0.0-this.scale*f*0.5)
            .attr('y1', 0.0-this.scale*f*0.5 + this.scale*f)
            .attr('x2', 0.0-this.scale*f*0.5)
            .attr('y2', 0.0-this.scale*f*0.5);

        this.text.transition()
                .text(this.scale.toExponential() + " m")
                .attr('x', function (d) {return 0.0 - this.scale*f*0.5 - (this.getComputedTextLength() / 2.0);})
                .attr('y', 0.0-this.scale*f*0.5 - 10.0);
    };

    this.remove = function() {
        this.line1.remove();
        this.line2.remove();
        this.line3.remove();
        this.line4.remove();
        this.text.remove();
    }
};

$(document).ready(function () {
    init();

    // $('#launch').on('click', function () {
    //     var i = $('#slider').val();
    //     console.log(i);
    //     $('#slider').val(i+1);
    // });
});


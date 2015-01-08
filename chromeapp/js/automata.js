var M0conf = ["M0D-100", "M0D100", "M0D0", "M0D-100", "M0D100", "M0D0", "M0D-100", "M0D100"];
var M1conf = ["M1D0", "M1D0", "M1D-100", "M1D-100", "M1D-100", "M1D100", "M1D100", "M1D100"];

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

var Automata = function(elt) {
    this.elt = $(elt);
    this.drawing = [];
    this.total_duration = 0;
    this.running = false;
    this.bag_num = this.elt.attr("bag");
};

Automata.prototype.initSeq = function(nbseq) {
    for (var n = 0; n < nbseq; n++) {
        var p = n % 8;
        var duration = 3 + Math.floor(Math.random() * 3);
        this.total_duration += duration;
        this.drawing[n] = {
            cmd: ["B" + this.bag_num + M0conf[p] + "E", "B" + this.bag_num + M1conf[p] + "E"],
            duration: duration
        };
    }
    shuffle(this.drawing);
};

Automata.prototype.initSparse = function(nbseq) {
    for (var n = 0; n < nbseq; n++) {
        var bag = Math.floor(Math.random() * 10);
        var motor = Math.floor(Math.random() * 2);
        var pow = 100; // Math.random() < .5 ? -100: 100);
        var dur = 3 + Math.floor(Math.random() * 3);
        var wait = 30 + Math.floor(Math.random() * 30);
        this.drawing.push({
            bag: bag,
            cmd: ["B" + bag + "M" + motor + "D" + pow + "E"],
            duration: dur,
            monitor: $("#sparse" + bag)
        });
        this.drawing.push({
            cmd: ["B" + bag + "M" + motor + "D0E"],
            duration: wait,
            monitor: $("#sparse" + bag)
        });
        this.total_duration += (dur + wait);
        this.bag_num = bag;
    }
};

var runningList = [];

Automata.prototype.initIntensity = function(percent) {
    var bag = Math.floor(Math.random() * 10);
    while (-1 < runningList.indexOf(bag))
        bag = Math.floor(Math.random() * 10);
    var motor = Math.floor(Math.random() * 2);
    var pow = (Math.random() < .5 ? -100 : 100);
    var dur = 1 + Math.floor((Math.random() * 10 * percent) / 100);
    var wait = 1 + Math.floor((Math.random() * 10 * (100 - percent)) / 100);
    this.drawing.push({
        bag: bag,
        cmd: ["B" + bag + "M" + motor + "D" + pow + "E"],
        duration: dur,
        monitor: $("#sparse" + bag)
    });
    this.drawing.push({
        bag: bag,
        cmd: ["B" + bag + "M" + motor + "D0E"],
        duration: wait,
        monitor: $("#sparse" + bag)
    });
    this.total_duration += (dur + wait);
    this.bag_num = bag;
};

Automata.prototype.sendCurrent = function(done) {
    if (this.drawing[this.currentpos].monitor) {
        this.drawing[this.currentpos].monitor.toggleClass("btn-default btn-success");
        if (this.drawing[this.currentpos].bag)
            this.bag_num = this.drawing[this.currentpos].bag;
    }
    sendCombineCommand(this.drawing[this.currentpos].cmd, done);
};

Automata.prototype.start = function(done) {
    this.currentpos = 0;
    this.remaining = this.total_duration;
    this.running = true;
    this.sendCurrent(done);
    this.elt.find('.badge').text(this.remaining);
    runningList.push(this.bag_num);
};

Automata.prototype.step = function(done) {
    if (this.running) {
        this.drawing[this.currentpos].duration -= 1;
        this.remaining -= 1;
        this.elt.find('.badge').text(this.remaining);
        if (this.drawing[this.currentpos].duration <= 0) {
            this.currentpos += 1;
            if (this.drawing.length <= this.currentpos) {
                this.stop(done);
            } else {
                this.sendCurrent(done);
            }
        } else {
            done();
        }
    } else {
        done();
    }
};

Automata.prototype.stop = function(done) {
    this.running = false;
    this.remaining = 0;
    this.elt.find('.badge').text(this.remaining);
    this.currentpos = this.drawing.length;
    this.elt.removeClass("btn-success disabled");
    this.elt.addClass("btn-primary");
    sendCombineCommand(["B" + this.bag_num + "M0D0E", "B" + this.bag_num + "M1D0E"], done);
};

var activeBags = [];
var nextMeta = function() {};

$(".seqstart").click(function() {
    nextMeta = function() {};
    $(this).removeClass("btn-primary");
    $(this).addClass("btn-success disabled");
    var myAuto = new Automata(this);
    myAuto.initSeq(16);
    myAuto.start(function() {
        activeBags.push(myAuto);
    });
});

$("#seqstop").click(function() {
    stopBags(activeBags.slice(0), function() {});
});

$("#sparsestart").click(function() {
    nextMeta = function() {};
    $(this).addClass("disabled");
    var myAuto = new Automata(this);
    myAuto.initSparse(16);
    myAuto.start(function() {
        activeBags.push(myAuto);
    });
});

$("#sparsestop").click(function() {
    stopBags(activeBags.slice(0), function() {
        $(".sparses").removeClass("btn-success");
        $(".sparses").addClass("btn-primary");
    });
});

$("#intensitystart").click(function() {
    $(this).addClass("disabled");
    var intensity = $("#actintensity").data("slider").getValue();
    for (var i = 0; i < (intensity / 10); i++) {
        var myAuto = new Automata(this);
        myAuto.initIntensity(intensity);
        activeBags.push(myAuto);
        myAuto.start(function() {});
    }
    nextMeta = function() {
        var intensity = $("#actintensity").data("slider").getValue();
        while (runningList.length < (intensity / 10)) {
            var myAuto = new Automata(this);
            myAuto.initIntensity(intensity);
            activeBags.push(myAuto);
            myAuto.start(function() {});
        }
    }
});

$("#intensitystop").click(function() {
    nextMeta = function() {};
    stopBags(activeBags.slice(0), function() {
        $(".sparses").removeClass("btn-success");
        $(".sparses").addClass("btn-primary");
    });
});

var iterateBags = function(aBags) {
    if (0 < aBags.length) {
        aBags.shift().step(function() {
            iterateBags(aBags);
        });
    } else {}
};

var lastTime = window.performance.now();

var runAutomata = function() {
    if (1000 < (window.performance.now() - lastTime)) {
        lastTime = window.performance.now();
        iterateBags(activeBags.slice(0));
        for (var i = activeBags.length - 1; i >= 0; i--) {
            if (!activeBags[i].running) {
                runningList.splice(runningList.indexOf(activeBags[i].bag_num), 1);
                nextMeta();
                activeBags.splice(i, 1);
            }
        }
    }
    window.requestAnimationFrame(runAutomata);
};

window.requestAnimationFrame(runAutomata);

var stopBags = function(aBags, done) {
    if (0 < aBags.length) {
        aBags.shift().stop(function() {
            stopBags(aBags, done);
        });
    } else {
        done();
    }
};

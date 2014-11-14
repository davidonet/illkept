var initUI = function() {
    $header = $("#header");
    $header.append("<th># bag</th>");
    for (var i = 0; i < 10; i++) {
        $header.append("<th>" + i + "</th>")
    }
    $header.append("<th>all</th>")

    var $tr1 = $("<tr><td>tension</td></tr>").appendTo($("#tbody"));
    for (var i = 0; i < 10; i++) {
        $tr1.append("<td id=m_v" + i + ">00</td>")
    }
    var $tr2 = $("<tr><td>motor 0</td></tr>").appendTo($("#tbody"));
    for (var i = 0; i < 10; i++) {
        $tr2.append("<td id=m_m0" + i + ">00</td>")
    }
    var $tr3 = $("<tr><td>motor 1</td></tr>").appendTo($("#tbody"));
    for (var i = 0; i < 10; i++) {
        $tr3.append("<td id=m_m1" + i + ">00</td>")
    }
    var $tr4 = $("<tr><td><select class='form-control' id='pulseduration'><option value='50'>50 ms</option><option value='100'>100 ms</option><option value='200'>200 ms</option><option value='400'>400 ms</option><option value='800'>800 ms</option></select></td></tr>").appendTo($("#tbody"));
    for (var i = 0; i < 10; i++) {
        var $td = $("<td/>").appendTo($tr4);
        $("<button class='btn btn-warning btn-xs' id=B" + i + "M0>0</button>").appendTo($td).click(buttonUpdate);
        $td.append("<br/>");
        $("<button class='btn btn-warning  btn-xs' id=B" + i + "M1>1</button>").appendTo($td).click(buttonUpdate);
    }
    var $td = $("<td/>").appendTo($tr4);
    $("<button class='btn btn-warning' id=BAMA>all</button>").appendTo($td).click(buttonUpdate);
    var $tr5 = $("<tr><td>motor 0</td></tr>").appendTo($("#tbody"));
    for (var i = 0; i < 10; i++) {

        $("<input type='text' data-slider-min='-100' data-slider-max='100' data-slider-step='10' data-slider-value='0' data-slider-orientation='vertical' id=B" + i + "M0 />").appendTo($("<td/>").appendTo($tr5))
            .slider({
                reversed: true
            }).on('slideStop', slideUpdate);
    }
    var $tr6 = $("<tr><td>motor 1</td></tr>").appendTo($("#tbody"));
    for (var i = 0; i < 10; i++) {

        $("<input type='text' data-slider-min='-100' data-slider-max='100' data-slider-step='10' data-slider-value='0' data-slider-orientation='vertical' id=B" + i + "M1 />").appendTo($("<td/>").appendTo($tr6))
            .slider({
                reversed: true,
            }).on('slideStop', slideUpdate);
    }
    $foot = $("#foot");
    $foot.append("<th># bag</th>");
    for (var i = 0; i < 10; i++) {
        $foot.append("<th>" + i + "</th>")
    }
    $foot.append("<th>all</th>")

    $("#connectbox").modal('show');

};

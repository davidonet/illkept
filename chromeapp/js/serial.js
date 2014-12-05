var statusArduino;
var buf = new ArrayBuffer(4);
var bufView = new Uint8Array(buf);
bufView[0] = 0;
bufView[1] = 0;
bufView[2] = 0;
bufView[3] = 0;

// bufView
// 0 : action code : 
//  'S' Start
//      1 2 3 : 0    
//  'M' Motor Power
//      1 : Bag Number
//      2 : Motor 0 Power : b7 direction, b6-b0 power
//      3 : Motor 0 Power : b7 direction, b6-b0 power
//  'P' Pulse
//      1 : Bag Number
//      2 : Motor 0 Power : b7 direction, b6-b0 duration in 10 ms
//      3 : Motor 0 Power : b7 direction, b6-b0 duration in 10 ms
//  'R' Reset
//      1 2 3 : 0

/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
var ab2str = function(buf) {
    var bufView = new Uint8Array(buf);
    var encodedString = String.fromCharCode.apply(null, bufView);
    return decodeURIComponent(escape(encodedString));
};

/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
var str2ab = function(str) {
    var encodedString = unescape(encodeURIComponent(str));
    var bytes = new Uint8Array(encodedString.length);
    for (var i = 0; i < encodedString.length; ++i) {
        bytes[i] = encodedString.charCodeAt(i);
    }
    return bytes.buffer;
};

var aConnectionId;


var onGetDevices = function(ports) {
    console.log('onGetDevices');
    for (var i = 0; i < ports.length; i++) {
        $('#connect').prepend('<option>' + ports[i].path + '</option>');
    }
    $('#connect').prepend("<option/>");


};

var onConnect = function(connectionInfo) {
    console.log('onConnect');
    if (connectionInfo != undefined) {
        aConnectionId = connectionInfo.connectionId;
    }
    $("#connectbox").modal('hide');
    chrome.serial.onReceive.addListener(onReceiveCallback);
    chrome.serial.setControlSignals(aConnectionId, {
        "dtr": true
    }, function() {
        console.log("reset sent");
    })
};

$('#start').click(function() {
    chrome.serial.connect($('#connect').val(), {
        bitrate: 57600,
        name: 'arduino'
    }, onConnect);
});

var connectedTimer;


var onReadLine = function(line) {
    statusArduino = JSON.parse(line);
    if (connectedTimer)
        clearTimeout(connectedTimer);
    if (statusArduino.connected) {
        $("#status").text("Connected");
        $("#status").removeClass("label-danger");
        $("#status").addClass("label-success");
    }
    if (statusArduino.bag) {
        for (var i = statusArduino.bag.length - 1; i >= 0; i--) {
            $("#m_v" + i).removeClass("alert alert-danger alert-warning text-success");
            var b = statusArduino.bag[i];
            if (64 == b.v) {
                $("#m_v" + i).text("###");
                $("#m_v" + i).addClass("alert alert-warning");
                $("#m_m0" + i).text("##");
                $("#m_m1" + i).text("##");
            } else {
                var v = 0;
                if (64 < b.v) {
                    v = b.v;
                    if (b.v < 200)
                        $("#m_v" + i).addClass("alert alert-danger");
                } else {
                    v = "max";
                    $("#m_v" + i).addClass("text-success");
                }

                $("#m_v" + i).text(v);
                $("#m_m0" + i).text(b.m0);
                $("#m_m1" + i).text(b.m1);
            }
        };
    }
    if (statusArduino.lastcmd) {
        $("#lastcmd").text(statusArduino.lastcmd);
        if (statusArduino.lastcmd == "reset")
            resetMotors(0);
    }
    connectedTimer = setTimeout(function() {
        $("#status").text("Not connected");
        $("#status").addClass("label-danger");
        $("#status").removeClass("label-success");
    }, 3000);
}

lineBuffer = "";
var onReceiveCallback = function(receiveInfo) {
    if (receiveInfo.connectionId !== aConnectionId) {
        return;
    }

    lineBuffer += ab2str(receiveInfo.data);

    var index;
    while ((index = lineBuffer.indexOf('\n')) >= 0) {
        var line = lineBuffer.substr(0, index + 1);
        onReadLine(line);
        lineBuffer = lineBuffer.substr(index + 1);
    }
};

var sendCommand = function(cmd, done) {
    chrome.serial.send(aConnectionId, str2ab(cmd), function() {
        $("#status").text("Command sent");
        // console.log("sent", cmd);
        done();
    });
};

var sendCombineCommand = function(cmds, done) {
    if (0 < cmds.length) {
        // console.log("sendCombineCommand", cmds);
        sendCommand(cmds.shift(), function() {
            setTimeout(function() {
                sendCombineCommand(cmds, done);
            }, 50);
        });
    } else {
        done();
    }
};

var slideUpdate = function() {
    var cmd = $(this).attr("motor") + "D" + $(this).data("slider").getValue() + "E";
    sendCommand(cmd);
};

var buttonUpdate = function() {
    var cmd = $(this).attr("motor") + "P" + $("#pulseduration").val() + "E";
    sendCommand(cmd);
};

var resetMotors = function(i) {
    $.each($('.motorpwm'), function() {
        $(this).data("slider").setValue(0);
    });
};

$(function() {
    initUI();
    chrome.serial.getDevices(onGetDevices);
});

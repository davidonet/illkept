var slideUpdate = function() {
    var cmd = $(this).attr("id") + "D" + $(this).data("slider").getValue()+"E";
    console.log(cmd);
    sendCommand(cmd);
};

var buttonUpdate = function() {
    var cmd = $(this).attr("id") + "P" + $("#pulseduration").val()+"E";
    console.log(cmd);
    sendCommand(cmd);
};


$(function() {
    initUI();
    chrome.serial.getDevices(onGetDevices);
});

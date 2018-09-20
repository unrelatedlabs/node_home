var Wemo = require('wemo-client');
var wemo = new Wemo();

function discover(){
wemo.discover(function (err, deviceInfo) {
    var name = deviceInfo.friendlyName

    console.log('Wemo Device Found: %s', name);
//    console.log('Wemo Device Found: %j', deviceInfo);

    // Get the client for the found device
    var client = wemo.client(deviceInfo);

    // You definitely want to listen to error events (e.g. device went offline),
    // Node will throw them as an exception if they are left unhandled  
    client.on('error', function (err) {
        console.log('Error: %s %s', err.code, name);
    });

    // Handle BinaryState events
    client.on('binaryState', function (value) {
        console.log('Binary State changed to: %s %s', value, name);
    });

    // Turn the switch on
//    client.setBinaryState(1);
});
}

setInterval(discover,5000)



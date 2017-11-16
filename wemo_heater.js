var Wemo = require('wemo-client');
var wemo = new Wemo();

var clients = {}

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
    //client.setBinaryState(1);
    clients[""+name] = client
});


exports.init = function(name){
    console.log("Wemo heater", name)
    return {
        switch: function (onOff, success, error) {
            console.log("Wemo Switch '" + name + "' " + onOff);
            if( clients[name] ){
                client = clients[name];
                client.setBinaryState( onOff ? 1:0 )
            }else{
                console.log("Wemo " + name + " not found '"+ name +"'", Object.keys(clients), clients[name] )
            }
        }
    }
}
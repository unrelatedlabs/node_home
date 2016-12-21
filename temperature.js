var noble = require('noble');

var callbacks = []

noble.on('stateChange', function(state){
	console.log("State")
	console.log(state);

	noble.startScanning([], true); 

});

noble.on('discover', function(peripheral){
	var temperatureUUID = '1809' 
	peripheral.advertisement.serviceData.forEach(function(service){
		if( service.uuid  == temperatureUUID ){
			var temp = (service.data[0] + service.data[1] * 256)/100
			var status = {
				'device':peripheral.advertisement.localName,
				temperature:temp,
				'timestamp':new Date().getTime()
			}
			console.log(status)
			callbacks.forEach( (callback) => callback(status) )
		}
	})
});


exports.update = (callback) => callbacks.push(callback)



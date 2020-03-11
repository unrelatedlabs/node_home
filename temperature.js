var noble = require('noble');

var callbacks = []

noble.on('stateChange', function(state){
	console.log("noble state")
	console.log(state);

//	noble.startScanning([], false); 
	noble.startScanning([], true); 

});

var temperature_last = {}

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
			console.log("discover status",status);
			if( temperature_last[peripheral.advertisement.localName] != temp ){
				console.log(status)
				temperature_last[peripheral.advertisement.localName] = temp
				callbacks.forEach( (callback) => callback(status) )
			}else{
				console.log("No change, not updating", status)
			}
		}
	})
});


exports.update = (callback) => callbacks.push(callback)



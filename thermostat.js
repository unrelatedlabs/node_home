

exports.init = function(name,heater){
	var thermostat = {}
	thermostat.name = name
	thermostat.heater = heater;

	function process(){
		if(!thermostat.enabled || !thermostat.status || !thermostat.settings){
			return
		}

		try{
			if( thermostat.status.temperature < thermostat.settings.temperature - thermostat.settings.hysteresis ){
				thermostat.heater.switch(true)
			}else if(thermostat.status.temperature > thermostat.settings.temperature + thermostat.settings.hysteresis){
				thermostat.heater.switch(false)
			}else{
				console.log("Update inside hysteresis",thermostat.status.temperature,thermostat.settings.temperature, thermostat.settings.hysteresis)
			}
		}catch(e){
			console.error("Error processing thermostat", e);
		}
	}

	thermostat.updateSettings = function(settings){
		thermostat.settings = settings
		console.log("updateSettings",name,settings)
		process()
	}

	thermostat.updateStatus = function(status){
		thermostat.status = status
		console.log("updateTemperature",name,status)
		process()
	}


	thermostat.switch = function(onOff){
		if( thermostat.switchState != onOff ){
			//Let it be: thermostat.switchState = onOff
			thermostat.heater.switch(onOff)
		}
	}

	thermostat.enable = function(){
		thermostat.enabled = true
		process()
	}

	return thermostat;
}
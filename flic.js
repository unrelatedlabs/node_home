var noble = require('noble');

var request = require('request');

var LifxClient = require('node-lifx').Client;
var client = new LifxClient();
 
var lightToControl;
var mood_light_id = "d073d52352a1";

client.on('light-new', function(light) {
  // Change light state here 
  console.log("Found",light)
  if(light.id == mood_light_id){
      lightToControl = light;
  }
});
 
client.init();


noble.on('stateChange', function(state){
        console.log("State")
        console.log(state);

//      noble.startScanning([], false);
        noble.startScanning(['f02adfc026e711e49edc0002a5d5c51b'], true);

});

//noble.startScanning(['f02adfc026e711e49edc0002a5d5c51b'], true,function(error){
//
//   console.log("startScanning callback",error)
//});

var lastClick = Date.now();
var minClickPause = 2*1000;

function toggleLight(){
    lightToControl.getState((error,state)=>{
        console.log("getState",state);
        if( !state || state.power == undefined ){
            return;
        }
        if( state.power ){
            lightToControl.off();
        }else{
            lightToControl.on();
        }
    })
}

function clickHandler(peripheral){
    console.log("Click",peripheral)
    sendEvent("flic_click")
    toggleLight();
}


function sendEvent(eventName,data){
    request.post(
        'https://maker.ifttt.com/trigger/'+eventName+'/with/key/csHz5pSPxFxgv5IoaPU0Kx',
        data || {},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }else{
                console.log("Error")
            }
        }
    );

}


noble.on('discover', function(peripheral) {
    console.log("discover",peripheral.advertisement)
    if( Date.now()-lastClick > minClickPause){
        clickHandler(peripheral.id);
    }
    lastClick = Date.now();

    if( peripheral.state == "disconnected" ){
        peripheral.connect(function(error){
            console.log("connect",error);

            peripheral.disconnect(function(){
                console.log("disconnect");
                setTimeout(function(){
                    noble.startScanning(['f02adfc026e711e49edc0002a5d5c51b'],false);
                },1)

            })
        });
    }
})


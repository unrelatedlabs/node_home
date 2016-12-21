// lazybone.js
// http://www.tinyosshop.com/index.php?route=product/product&product_id=657
// (c) 2016 Peter Kuhar

var net = require('net');


exports.init = function(address){

	return {
		switch:function(onOff,success,error){
			console.log("Lazybone",address, onOff)
			setTimeout(function(){//this seems to be required
				var client = new net.Socket();

				client.on('data', function(data) {
					console.log('Received: ' + data);
					try{
						client.write( onOff ? 'e':'o' )
						client.destroy(); // kill client after server's response
					}catch(e){
						console.log("Error switching",e)
					}

				});

				client.on('close', function() {
					console.log('Connection closed');
				});

				client.connect(2000, address, function() {
					console.log('Connected');
					// client.write('Hello, server! Love, Client.');
				});
				client.on('error',function(error){
					console.error("Connection error",error)
				})
			},1)

		}
	}
}

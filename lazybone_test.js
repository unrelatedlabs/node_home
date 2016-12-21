var lazybone = require("./lazybone.js").init('10.0.0.19')
console.log(process.argv)
if( process.argv.length != 3 ){
	console.error(process.argv[0] + " on|off")
	throw 'Invalid params'
}

lazybone.switch( process.argv[2] == 'on' )

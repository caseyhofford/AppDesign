var http = require('http');
var fs   = require('fs');
if( process.argv.length < 3 )
{
    console.log( "Error: A file listing desired URLs is required" );
    process.exit( 1 );
}
var fn = process.argv[ 2 ];

try
{
    var urls = fs.readFileSync( fn ).toString().split( "\n" );
}
catch( e )
{
    console.log(
        "Make sure each URL is seperated by a return in "+
            fn);
    process.exit( 1 );
}

var download = function( url, cb ) {
    console.log( url );
    var dest = url.split("/").pop();
    var file = fs.createWriteStream( dest );
    file.on('error', function(error){console.log("caught:", error)});
    var request = http.get( url, function( response ) {
        console.log( "get callback!" );
        response.pipe( file );
        file.on( 'finish', function() {
            console.log( "finish callback!" );
            // close() is async, call cb after close completes.
            file.close( cb );
        });
    });
    console.log( "called http.get" );
    request.on( 'error', function( err ) { // Handle errors
        console.log( "error callback!" );
        // Delete the file async. (But we don't check the result)
        fs.unlink(dest);
        if( cb )
            cb( err.message );
    });
    console.log( "called request.on" );
};

for(var i=0; i<urls.length; i++)
{
  download(urls[i], function() {console.log("Main CB")});
}

console.log("done?")

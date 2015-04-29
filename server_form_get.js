var http = require( "http" );
var fs = require("fs");

function serverFn( req, res )
{
    for( field in req )
    {
        console.log( "R."+field+" = ..."/*+req[ field ]*/ );
    }
    for( field in req.headers )
    {
        console.log( "R.header."+field+" = ..."/*+req[ field ]*/ );
    }
    console.log( "url: "+req.url.toString() );

    if( req.url.substring( 0, 16 ) == "/submit_the_form" )
    {
      var log = fs.createWriteStream("./input.log",{flags:'a'});
      var length = req.url.length;
      var input = req.url.substring(17,length);
      var editted = input.replace('&',"\n").replace('+',' ') + "\n\n";
      fs.appendFile("./input.log",editted,function (err){ if(err) throw err;
      log.end();
      console.log("log updated")})
    }

    res.writeHead( 200 );
    var h = "<!DOCTYPE html>"+
        "<html>"+
        "<body>"+
        "<form action='submit_the_form' method='get'>"+
        "<input name='textbox' type='text' placeholder='write something'>"+
        "<input name='color' type='color' value='What is your favorite color?'>"+
        "<input type='submit'>"+
        "</form>"+
        "</body>"+
        "</html>";
    res.end( h );
}

var server = http.createServer( serverFn );

server.listen( 8080 );

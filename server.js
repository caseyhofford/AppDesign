var http = require("http");
var x = 0;

function serverFn( req, res)
{
  for (field in req)
  {
    console.log(field +" = "+ req[field]);
  }
  console.log("url"+ req.url)
  res.writeHead(200);
  x++
  res.end("Hello web" + x);
}

var server = http.createServer( serverFn );

server.listen(8080);

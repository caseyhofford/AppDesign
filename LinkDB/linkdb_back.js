var fs   = require( "fs" );
var http = require( "http" );
var sqlite = require("sqlite3");

function giveBackFile( name, res )
{
    var contents = "";
    try {
    	contents = fs.readFileSync( name ).toString();
      console.log(contents);
    }
    catch( e ) {
    	console.log(
    	    "Error: Something bad happened trying to open "+name );
        res.writeHead( 404 );
        res.end( "" );
        return;
    }

    res.writeHead( 200 );
    res.end( contents );
}

function addLink(req,res)
{
  var requests = req.url.substring(10).split("&");
  var address = requests[0].substring(8);
  var title = requests[1].substring(5);
  var db = new sqlite.Database("linkdb.sqlite");
  var sql_add = "INSERT INTO Links ('name','address') VALUES ('"+title+"','"+address+"')";
  db.run(sql_add);
  db.close;
  res.writeHead(200);
  res.end("");
}

function deleteLink(req,res)
{
  var id = req.url.substring(13);
  //var id = Math.floor(request);
  var db = new sqlite.Database("linkdb.sqlite");
  var sql_remove = "DELETE FROM Links WHERE id = '"+id+"'";
  db.run(sql_remove);
  db.close;
  res.writeHead(200);
  res.end("");
}

function getDB(res)
{
  var db = new sqlite.Database("linkdb.sqlite");
  var db_out = [];
  db.each("SELECT name,address,id FROM Links", function(err,row){
    db_out.push(row);
  })
  db.close(function()
    {
    array_string = JSON.stringify(db_out);
    res.writeHead(200);
    res.end(array_string);})
}

function serverFn(req, res)
{
  if (req.url.substring(1,9) == "add_link")
  {
    addLink(req,res);
  }
  else if (req.url.substring(1,12) == "delete_link")
  {
    deleteLink(req,res);
  }
  else if (req.url.substring(1,7) == "get_db")
  {
    getDB(res);
  }
  else if (req.url == "/linkdb_front.js")
  {
    giveBackFile("linkdb_front.js", res);
  }
  else
  {
    giveBackFile("index.html", res);
  }
}

var server = http.createServer( serverFn );
server.listen( 8080 );

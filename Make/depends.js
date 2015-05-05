/* Run jshint clean!!! */

var fs = require( "fs" );

/* What if the user doesn't type the right number of arguments? */

var args = process.argv;
if(args.length !== 4 && args.length !== 3)
{
  console.log("please provide 1 file");
  return;
}

/* What if the file doesn't exist? */
try
{
var lines = fs.readFileSync( args[2] ).toString().split( "\n" );
}
catch(err){
  console.log("You want me to open WUUUT?! Try Again");
  return;
}

var targets = {}

for( var i = 0; i < lines.length; i++ )
{
    if (lines[i]=="")
    {
      lines.splice(i,i);
      continue;
    }
    var target = {};
    var line = lines[ i ];
    /* What about format errors in the input file? */
    /* Consider using regexes instead of split */
    /* line.match( ??? ) */
    var colon = line.split( ":" );
    if( colon.length !== 2 )
    {
        console.log("input file formatted incorrectly");
        return;
    }
    target.name = colon[ 0 ];
    target.depend_names = colon[ 1 ].split( " " );
    /* What if there's no target for a dependency? */
    target.visited = false;
    targets[ target.name ] = target;
}


function trace_dependencies( prev, target )
{
    if( target.visited )
    {
        // console.log( "Already visited "+target.name );
        return;
    }
    else

    target.visited = true;
    console.log( "> " + prev + " depends on " + target.name );
    for( var i = 0; i < target.depend_names.length; i++ )
    {
        var dep_name = target.depend_names[ i ];
        if( !( dep_name in targets ) )
            continue;
        var dep = targets[ dep_name ];
        // if( date( dep ) older than date( target ) )
        //    continue;
        trace_dependencies( target.name, dep );
        // trace_dependencies( {l:12, m:34}, "hello" );
    }
}

/* What if the target given at the command line doesn't exist? */
if(targets[args[3]])
{
  if(args.length=4)
  {
    trace_dependencies( "[ Start ]", targets[ args[3] ] );
  }
  else
  {
    trace_dependencies( "[ Start ]", targets[ "a" ] );
  }
}
else
{
  console.log("target not in provided file, please try again");
}

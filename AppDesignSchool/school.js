var fs = require("fs");
var http = require("http");
var sqlite = require( "sqlite3" );

var server = http.createServer( serverFn );
server.listen( 8080 );

function serverFn( req, res )
{
    var filename = req.url.substring( 1, req.url.length );
    if( filename == "" )
    {
        filename = "./index.html";
    }
    if( filename.substring( 0, 13 ) == "list_students" )
    {
        listStudents( req, res );
    }
    else if( filename.substring( 0, 13 ) == "list_teachers" )
    {
        listTeachers( req, res );
    }
    else if( filename.substring( 0, 12 ) == "list_classes" )
    {
        listClasses( req, res );
    }
    else if( filename.substring( 0, 16 ) == "list_enrollments" )
    {
        listEnrollments( req, res );
    }
    else if( filename.substring( 0, 16 ) == "list_assignments" )
    {
        listAssignments( req, res );
    }
    else if( filename.substring( 0, 14 ) == "add_enrollment" )
    {
      addEnrollment(req, res);
    }
    else if( filename.substring( 0, 11 ) == "add_student" )
    {
      addStudent(req, res);
    }
    else
    {
      serveFile(filename,req,res);
    }
}

function listStudents( req, res )
{
  var db = new sqlite.Database( "school.sqlite")
  var resp_text = "<!DOCTYPE html>"+
  "<html>"+
  "<body>";
  db.each( "SELECT Name FROM Students", function(err,row)
  {
    console.log("Student: "+row.Name);
    resp_text += row.Name + "\n\n";
  });
  db.close(
    function() {
      resp_text +="</body>" + "</html>";
      res.writeHead (200);
      res.end(resp_text);
    });
}

function listTeachers( req, res )
{
  var db = new sqlite.Database( "school.sqlite")
  var resp_text = "<!DOCTYPE html>"+
  "<html>"+
  "<body>";
  db.each( "SELECT Name FROM Teachers", function(err,row)
  {
    resp_text += row.Name;
  });
  db.close(
    function(){
      resp_text += "</body>"+"</html>";
      res.writeHead(200);
      res.end(resp_text);
    });
}

function listClasses(req,res)
{
  var db = new sqlite.Database( "school.sqlite")
  var resp_text = "<!DOCTYPE html>"+
  "<html>"+
  "<body>";
  db.each( "SELECT Name FROM Classes", function(err,row)
  {
    resp_text += row.Name;
  });
  db.close(
    function(){
      resp_text += "</body>"+"</html>";
      res.writeHead(200);
      res.end( resp_text );
    });
}

function listEnrollments(req,res)
{
  var db = new sqlite.Database( "school.sqlite")
  var resp_text = "<!DOCTYPE html>"+
  "<html>"+
  "<body>"+
  "<table>"+
  "<tbody>";
  var ClassIdArray = [];
  var StudentIdArray = [];
  var StudentArray = [];
  var ClassesArray = [];
  //why won't the same syntax as used in telluride.js work here? How do I check syntax in the terminal with sqlite3?
  db.each(
    "SELECT Enrollments.ClassId, Enrollments.StudentId, Students.Name FROM Enrollments JOIN Students ON Enrollments.StudentId = Students.Id",
  function( err, row ) {
    console.log(row);
    ClassIdArray.push(row.ClassId);
    StudentIdArray.push(row.StudentId);
    StudentArray.push(row.Name);
  });
  db.each(
    "SELECT Enrollments.ClassId, Enrollments.StudentId, Classes.Name FROM Enrollments JOIN Classes ON Enrollments.StudentId = Classes.Id",
    function(err,row)
    {
      console.log(row);
      ClassesArray.push(row.Name);
    }
  );
  db.close(
    function()
      {
        for (i = 0; i < ClassIdArray.length; i++)
        {
          //placed this in a for loop because the results were always coming up in the body outside the table but this still occurs, assume it is an issue with asynchronus processes but this should fix that, right?
          resp_text += "<tr>"+StudentIdArray[i]+": </tr>"+" <tr>"+ StudentArray[i]+"</tr>"+" <tr>"+ClassIdArray[i]+": </tr>"+" <tr>"+ClassesArray[i]+"</tr>";
        }
        resp_text += "</tbody>"+"</table>"+"</body>" +"</html>";
        res.writeHead(200);
        res.end(resp_text);
      }
      );
}

function listAssignments(req,res)
{
  var db = new sqlite.Database( "school.sqlite")
  var resp_text = "<!DOCTYPE html>"+
  "<html>"+
  "<body>"+
  "<table>"+
  "<tbody>";
  var ClassIdArray = [];
  var TeacherIdArray = [];
  var TeacherArray = [];
  var ClassesArray = [];
  db.each(
    "SELECT TeachingAssignments.ClassId, TeachingAssignments.TeacherId, Teachers.Name FROM TeachingAssignments JOIN Teachers ON TeachingAssignments.TeacherId = Teachers.Id",
  function( err, row ) {
    console.log(row);
    ClassIdArray.push(row.ClassId);
    TeacherIdArray.push(row.TeacherId);
    TeacherArray.push(row.Name);
  });
  db.each(
    "SELECT TeachingAssignments.ClassId, TeachingAssignments.TeacherId, Classes.Name FROM TeachingAssignments JOIN Classes ON TeachingAssignments.ClassId = Classes.Id",
  function( err, row ) {
    console.log(row);
    ClassesArray.push(row.Name);
  });
  db.close(
    function()
    {
      for (i = 0; i < ClassIdArray.length; i++)
      {
        resp_text += "<tr>"+TeacherIdArray[i]+": </tr>"+" <tr>"+ TeacherArray[i]+"</tr>"+" <tr>"+ClassIdArray[i]+": </tr>"+" <tr>"+ClassesArray[i]+"</tr>";
      }
      resp_text += "</tbody>"+"</table>"+"</body>" +"</html>";
      res.writeHead(200);
      res.end(resp_text);
    });
}

function addEnrollment(req,res)
{
  var db = new sqlite.Database("school.sqlite");
  var form_text = req.url.split( "?" )[1];
  var form_inputs = form_text.split( "&" );
  var student = null, add_class = null;
  for(var i = 0; i< form_inputs.length; i++)
  {
    var inp = form_inputs[i].split( "=" );
    if( inp[0] == 'student' ) {
        student = inp[1];
    }
    else if( inp[0] == 'addclass' ) {
        add_class = inp[1];
    }
  }
  if (student = null || add_class == null)
  {
    res.writeHead(200);
    res.end("error, no input.");
    return;
  }
  else
  {
    var sql_add = "INSERT INTO Enrollments ('ClassId','StudentId') VALUES('"+ /*use join to make ID variables from cleartext inputs*/"')";
    console.log(req.url);
    res.writeHead(200);
    res.end();
  }
}

function addStudent(req,res)
{
  var db = new sqlite.Database("school.sqlite");
  console.log(req.url);
  res.writeHead(200);
  var raw_input = req.url.split("?")[1];
  var value = raw_input.split("=")[1];
  var student = value.replace(/\+/, ' ');
  var sql_add = "INSERT INTO Students ('Name') VALUES('"+ student +"')";
  res.end("<html><body>Student"+ student +"added!</body></html>");
}

function serveFile(filename,req,res)
{
  try
  {
    var contents = fs.readFileSync( filename ).toString();
  }
  catch( e )
  {
    console.log(
        "Error: Something bad happened trying to open "+filename );
      res.writeHead( 404 );
      res.end( "" );
      return;
  }
  res.writeHead( 200 );
  res.end( contents );
}

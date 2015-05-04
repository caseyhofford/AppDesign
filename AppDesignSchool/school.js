var fs = require("fs");
var http = require("http");
var sqlite = require( "sqlite3" );

var server = http.createServer( serverFn );
server.listen( 8080 );

function serverFn( req, res )
{
    var filename = req.url.substring( 1, req.url.length );
    if( filename === "" )
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
  var db = new sqlite.Database( "school.sqlite");
  var resp_text = "<!DOCTYPE html>"+
  "<html>"+
  "<body>"+
  "<table>"+
  "<tbody>";
  db.each( "SELECT Name FROM Students", function(err,row)
  {
    console.log("Student: "+row.Name);
    resp_text += "<tr>"+"<td>"+row.Name +"</tr>"+"</td>";
  });
  db.close(
    function() {
      resp_text +="</tbody>"+"</table>"+"</body>" + "</html>";
      res.writeHead (200);
      res.end(resp_text);
    });
}

function listTeachers( req, res )
{
  var db = new sqlite.Database( "school.sqlite");
  var resp_text = "<!DOCTYPE html>"+
  "<html>"+
  "<body>"+
  "<table>"+
  "<tbody>";
  db.each( "SELECT Name FROM Teachers", function(err,row)
  {
    resp_text += "<tr>"+"<td>"+row.Name+"</tr>"+"</td>";
  });
  db.close(
    function(){
      resp_text += "</tbody>"+"</table>"+"</body>"+"</html>";
      res.writeHead(200);
      res.end(resp_text);
    });
}

function listClasses(req,res)
{
  var db = new sqlite.Database( "school.sqlite");
  var resp_text = "<!DOCTYPE html>"+
  "<html>"+
  "<body>"+
  "<table>"+
  "<tbody>";
  db.each( "SELECT Name FROM Classes", function(err,row)
  {
    resp_text += "<tr>"+"<td>"+row.Name+"</tr>"+"</td>";
  });
  db.close(
    function(){
      resp_text += "</tbody>"+"</table>"+"</body>"+"</html>";
      res.writeHead(200);
      res.end( resp_text );
    });
}

function listEnrollments(req,res)
{
  var db = new sqlite.Database( "school.sqlite");
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
          resp_text += "<tr><td>"+StudentIdArray[i]+": </td>"+" <td>"+ StudentArray[i]+"</td>"+"\n"+" <td>"+ClassIdArray[i]+": </td>"+" <td>"+ClassesArray[i]+"</td></tr>"+"\n";
        }
        resp_text += "</tbody>"+"</table>"+"</body>" +"</html>";
        res.writeHead(200);
        res.end(resp_text);
      }
      );
}

function listAssignments(req,res)
{
  var db = new sqlite.Database( "school.sqlite");
  var resp_text = "<!DOCTYPE html>"+
  "<html>"+
  "<body>"+
  "<table>"+
  "<tbody>";
  var ClassIdArray = [];
  var TeacherIdArray = [];
  var TeacherArray = [];
  var ClassesArray = [];
  console.log("sane");
  db.each(
    "SELECT TeachingAssignments.ClassId, TeachingAssignments.TeacherId, Teachers.Name FROM TeachingAssignments JOIN Teachers ON TeachingAssignments.TeacherId = Teachers.Id",
  function( err, row ) {
    console.log("alsosane");
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
        resp_text += "<tr><td>"+TeacherIdArray[i]+": </td>"+" <td>"+ TeacherArray[i]+"</td>"+" <td>"+ClassIdArray[i]+": </td>"+" <td>"+ClassesArray[i]+"</td></tr>";
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
  if (student === null || add_class === null)
  {
    res.writeHead(200);
    res.end("error, no input.");
    return;
  }
  else
  {
    var sql_add = "INSERT INTO Enrollments ('ClassId','StudentId') VALUES('"+ add_class+"','"+student+"')";
    db.run( sql_add );
    db.close();
    console.log(req.url);
    res.writeHead(200);
    res.end("<html><body>Student "+student+" added to class "+add_class+"</body></html>");
  }
}

function addStudent(req,res)
{
  var db = new sqlite.Database("school.sqlite");
  console.log(req.url);
  res.writeHead(200);
  var raw_input = req.url.split("?")[1];
  var fields = raw_input.split("&");
  var student = null, year = null;
  for(var i = 0; i< fields.length; i++)
  {
    var inp = fields[i].split( "=" );
    if( inp[0] == 'student' ) {
        student = inp[1].split("+").join(" ");
    }
    else if( inp[0] == 'year' ) {
        if(typeof inp[1] !== 'number'){
          year = inp[1];
      }
        else{
          year = 1;
        }
    }
  }
  if(student === "" || student === null)
  {
    db.close();
    res.writeHead(200);
    res.end("<html><body>No student added</body></html>");
  }
  if(year>4){
    db.close();
    res.writeHead(200);
    res.end("<html><body>No student added, year out of range</body></html>");
  }
  var sql_add = "INSERT INTO Students ('Name','Year') VALUES('"+ student +"','"+year+"')";
  db.run( sql_add );
  db.close();
  res.writeHead(200);
  res.end("<html><body>Student "+ student +" added!</body></html>");
}

function serveFile(filename,req,res)
{
  var contents = "";
  try
  {
    contents = fs.readFileSync( filename ).toString();
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

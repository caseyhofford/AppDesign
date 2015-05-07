function startUp()
{
  pollDB();
  //window.setInterval(pollDB,1000);
}

function printTable()
{
  console.log("printTable()");
  db_table = JSON.parse(this.responseText);
  var table = document.getElementById("table");
  table.innerHTML = "";
  for(var i=0; i < db_table.length; i++)
  {
    tr = document.createElement("tr");
    tr.id = db_table[i].id;
    tr.innerHTML = "<td>"+db_table[i].name+"</td><td><a href='"+db_table[i].address+"'>"+db_table[i].address+"</a></td><td><input type='button' onclick='deleteLink("+db_table[i].id+")' value='Delete'></input></td>";
    table.appendChild(tr);
  }
}

function pollDB()
{
  console.log("polldb()");
  var db_req = new XMLHttpRequest();
  db_req.onload = printTable;
  db_req.open("get", "get_db");
  db_req.send();
}

function add()
{
  var new_url = document.getElementById("add_link").value;
  var new_name = document.getElementById("add_name").value;
  var add_send = new XMLHttpRequest();
  add_send.open("get","add_link?address="+new_url+"&name="+new_name);
  add_send.send();
  pollDB();
}

function deleteLink(id)
{
  var delete_send = new XMLHttpRequest();
  delete_send.open("get","delete_link?"+id);
  delete_send.send();
  pollDB();
}

/** References: https://mottie.github.io/tablesorter/docs/
**/

$(document).ready(function () {
  $("#reset").click(function () {
    reset();
  });
  createTable();
  $("#delete").click(delete_by_id);
  $("#add").click(postQuery);
  $("#get").click(get_by_id);
  $("#update").click(update);
  $("#table1").tablesorter();
  $("#table2").tablesorter();

});

//task 2 reset the data in the database
function reset() {
  $.ajax({
    url: "http://localhost:3000/reset",
    method: "DELETE",
    dataType: "json"
  }).done(function (data) {
    console.log("reset the database");
    createTable();
  });
}

/**helper function for task 3
 * update the table
 **/
function updateTable(arr) {
  $tbody = $("tbody:first");
  // adding content per row
  for (let product of arr) {
    $tbody.prepend("<tr></tr>");
    delete product['id'];
    for (let key in product) {
      if (key == "image") {
        str = `<td><img class="pic" src=${product[key]}></td>`;
        $node = $(str);

      }
      else {
        str = `<td>${product[key]}</td>`;
        $node = $(str);
      }

      $("tr:eq(1)").append($node);

    }
  }
  // update new content to tablesorter
  $("#table1").trigger("update");
}

// clear the table
function clear() {
  $tbody = $("tbody:first");
  $tbody.empty();
}

//task 3 dynamic table content
/** get data from the website and update
 * the table by using the data
 **/
function createTable() {
  clear();
  $.ajax({
    url: "http://localhost:3000/products",
    method: "GET",
    dataType: "json"
  }).done(function (result) {
    updateTable(result);
  });
}

//task 4 add new item to the table on the top
function postQuery() {
  let l = {};
  l["brand"] = $("#brand").val();
  l["model"] = $("#model").val();
  l["os"] = $("#os").val();
  l["image"] = $("#image").val();
  l["screensize"] = $("#screensize").val();

  $.ajax({
    url: "http://localhost:3000/create",
    data: l,
    method: "POST",
    dataType: "json"
  }).done(function (result) {
    createTable();
  });
}

// function for updating the table by id
function update() {
  let l ={};
  l["id"] = $("#id").val();
  l["brand"] = $("#brand").val();
  l["model"] = $("#model").val();
  l["os"] = $("#os").val();
  l["image"] = $("#image").val();
  l["screensize"] = $("#screensize").val();

  $.ajax({
    url: "http://localhost:3000/update",
    data: l,
    method: "PUT",
    dataType: "json"
  }).done(function (result) {
    createTable();
  });
  
}


//Get a specific item by id
function get_by_id() {
  id = $("#id").val();
  $.ajax({
    url: `http://localhost:3000/${id}`,
    method: "GET",
    dataType: "json"
  }).done(function (result) {
    clear()
    updateTable(result);
  });
}

//Delete a specific item by id
function delete_by_id() {
  id = $("#id").val();
  $.ajax({
    url: `http://localhost:3000/delete/${id}`,
    method: "DELETE",
    dataType: "json"
  }).done(function (result) {
    createTable();
  });

}
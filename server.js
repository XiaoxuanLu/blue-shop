// ###############################################################################
// Author: Xiaoxuan Lu


// ###############################################################################

const sqlite = require('sqlite3').verbose();
let db = my_database('./phones.db');


var express = require("express");
var app = express();

var cors = require("cors");


// We need some middleware to parse JSON data in the body of our HTTP requests:
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("public"));
app.use(cors());


// ###############################################################################
// Routes
// ###############################################################################


// get a list of all items
app.get("/products", function(req, res) {;
	db.all("SELECT id, brand, model, os, image, screensize FROM phones", function(err, result) {
		if(err) {
			res.status(500).send(err);
		}
		else if (result.length === 0) {
			res.send("This is an empty table");

		}
		else{
			res.status(200).json(result);
		}

	});
});



// This route responds to http://localhost:3000/id by selecting specific item with id from the
// database and return it as JSON object.
// Please test if this works on your own device before you make any changes.
app.get('/:id', function(req, res) {
    // Example SQL statement to select the name of all products from a specific brand
    db.all("SELECT * FROM phones WHERE id=" + req.params.id, function(err, result) {
	
    	// # Return db response as JSON
		if (err) {
			res.status(500).send(err);
		}
		else if (result.length>0) {
			res.status(200).json(result);
		
		}

		//when the id does not exist in the database
		else{
			res.status(404).json("Cannot find the id");
		}
    	
    });
});

// function used to check if some part of JSON query is empty or undefined
function checkEmpty(req) {
	return req.body.image == "" || req.body.brand == "" || req.body.model == "" || req.body.screensize == "" || req.body.os == "" || req.body.image == undefined || req.body.brand == undefined || req.body.model == undefined || req.body.screensize == undefined || req.body.os == undefined;
  }

// Create new item by sending POST request for JSON-encoded product
// We check input first rather than the server
app.post('/create', function(req, res) {
	if (checkEmpty(req)){
		res.status(400).json("Double check your JSON query if anything is empty or undefined");
	}
	else {
		db.run(`INSERT INTO phones (brand, model, os, image, screensize)
		VALUES (?, ?, ?, ?, ?)`,
		[req.body.brand, req.body.model, req.body.os, req.body.image,  req.body.screensize], function(err) {
			if (err) {
			//no db
				res.status(500).send(err);
			}
			else {
				res.status(201).json("Created successfully");
			}

		});
	}


});

// update an item with a specific id
app.put('/update', function(req, res) {
	if (req.body.id == "" || req.body.id == undefined || checkEmpty(req)){
		res.status(400).json("Double check your JSON query if anything is empty or undefined");
	}
	else {
		db.run(`UPDATE phones
		SET brand=?, model=?, os=?, image=?,
		screensize=? WHERE id=?`,
		[req.body.brand, req.body.model, req.body.os, req.body.image,  req.body.screensize, req.body.id], function(err, result) {
			if (err) {
				res.status(500).send(err);
			}
			db.all("select count(*) as count from phones WHERE id=" + req.body.id, function(err, result) {
				if (result[0].count == 0) {
					res.status(404).json("Cannot find the id");
				}


				else {
					res.sendStatus(204);
				}
			});

		});
	}


});


// Deleting an item with a given id
app.delete('/delete/:id', function(req, res) {
	db.all("select count(*) as count from phones WHERE id=" + req.params.id, function(err, result) {
		if (result[0].count == 0) {
			res.status(404).json("Cannot find the id");
		}
		else {
			db.run("DELETE FROM phones WHERE id=" + req.params.id, function (err, result) {		
				if(err) {
					res.status(500).send(err);
				}
		
				else {
					res.sendStatus(204);
				}
			});
		}
	});
});

// reset the database
app.delete('/reset', function(req, res) {
	db.run("DELETE FROM phones", function(err,result){
		if(err){
			res.status(500).json({ error: err.message });

		}
		else {
			res.sendStatus(204);
		}
	});
});



// ###############################################################################
// This should start the server, after the routes have been defined, at port 3000:

app.listen(3000);
console.log("Your Web server should be up and running, waiting for requests to come in. Try http://localhost:3000/products to see all items");

// ###############################################################################
// Some helper functions called above
function my_database(filename) {
	// Conncect to db by opening filename, create filename if it does not exist:
	var db = new sqlite.Database(filename, (err) => {
  		if (err) {
			console.error(err.message);
  		}
  		console.log('Connected to the phones database.');
	});
	// Create our phones table if it does not exist already:
	db.serialize(() => {
		db.run(`
        	CREATE TABLE IF NOT EXISTS phones
        	(id 	INTEGER PRIMARY KEY,
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	image 	CHAR(254) NOT NULL,
        	screensize INTEGER NOT NULL
        	)`);});
		db.all(`select count(*) as count from phones`, function(err, result) {
			if (result[0].count == 0) {
				db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
				["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);
				console.log('Inserted dummy phone entry into empty database');
			} else {
				console.log("Database already contains", result[0].count, " item(s) at startup.");
			}
		});
	return db;
}

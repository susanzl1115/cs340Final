'use strict';
var express = require('express'),
    app = express(),
    handlebars = require('express-handlebars'),
    bodyParser = require('body-parser'),
    mysql = require('mysql'),
    morgan = require('morgan');

// Creating connection pool for querying our MySQL database
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_zhangl8',
  password        : '23530265Zl',
  database        : 'cs340_zhangl8'
});

// Making sure that the database exists when we are connecting
pool.on('connection', function(connection){
  connection.query('CREATE DATABASE IF NOT EXISTS final;', function(err){
    if(err) {console.log(this.sql);next(err);}
  });
  connection.query('USE final', function(err){
    if(err) {console.log(this.sql);next(err);}
  });
});

// Setting our template engine to use Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main',
                              extname:'.handlebars',
                              helpers: {dateFormat: require('handlebars-dateformat')},
                              partialsDir:'views/partials'}
));
app.set('view engine', 'handlebars');

// Establishing port to use when running on the server
app.set('port', process.env.PORT || 7535);

// Initializing our tables if they do not already exist

var createTables = function(){
  pool.query('CREATE TABLE IF NOT EXISTS location(' +
             'location_id INT NOT NULL AUTO_INCREMENT,'+
             'location_name VARCHAR(255) NOT NULL UNIQUE,' +
           	 'location_zipcode INT,' +
             'PRIMARY KEY(location_id)'+
             ')ENGINE=INNODB;', function(err){
               if(err) {console.log(this.sql);throw err;}
  else {
    pool.query('CREATE TABLE IF NOT EXISTS pokemon_type(' +
               'pokemon_name VARCHAR(255) NOT NULL UNIQUE,' +
             	 'type_name VARCHAR(255) NOT NULL,' +
             	 ')ENGINE=INNODB;', function(err){
                 if(err) {console.log(this.sql);throw err;}
    else {
      pool.query('CREATE TABLE IF NOT EXISTS player(' +
                'player_id INT NOT NULL AUTO_INCREMENT,'+
                'first_name VARCHAR(255) NOT NULL,'+
                'last_name VARCHAR(255) NOT NULL,' +
                'PRIMARY KEY(player_id),'+
                'UNIQUE KEY(first_name, last_name),'+
                ')ENGINE=INNODB;', function(err){
                  if(err) {console.log(this.sql);throw err;}

      else {
        pool.query('CREATE TABLE IF NOT EXISTS pokemon(' +
                   'pokemon_id INT NOT NULL AUTO_INCREMENT, '+
                   'pokemon_name VARCHAR(255) NOT NULL, '+
                   'PRIMARY KEY(pokemon_id), '+
                   ')ENGINE=INNODB;', function(err){
                     if(err) {console.log(this.sql); throw err;}
        else{
          pool.query('CREATE TABLE IF NOT EXISTS catch(' +
                    'catch_time DATE,'+
                    'catch_player_id INT,'+
                    'catch_location_id INT'+
                    'catch_pokemon_id INT'+
                    'FOREIGN KEY (catch_player_id) REFERENCES player(player_id),'+
                    'FOREIGN KEY (catch_location_id) REFERENCES location(location_id)'+
                    'FOREIGN KEY (catch_pokemon_id) REFERENCES pokemon(pokemon_id)'+
                    ')ENGINE=INNODB;', function(err){
                      if(err) {console.log(this.sql); throw err;}
                    });
        }
        });
      }
      });
    }
    });
  }
  });
};

createTables();

var populateTables = function(){
  var popType = "INSERT IGNORE INTO pokemon_type (pokemon_name, type_name) VALUES " +
                 " ('Bulbasaur','grass')," +
                 " ('Squirtle','water')," +
                 " ('Charmander','fire')," +
                 " ('Rattata','normal')," +
                 " ('Pidgey','flying')," +
                 " ('Weedle','poison')," +
                 " ('Caterpie','bug')," +
                 " ('Metapod','bug')," +
                 " ('Kakuna','bug')," +
                 " ('Spearow', 'flying');";

  var popLocation = "INSERT IGNORE INTO location (location_id, location_name, location_zipcode) VALUES" +
                 " (1,'Pallet Town', 98125)," +
                 " (2,'Route 1', 98004)," +
                 " (3,'Viridian City', 98133)," +
                 " (4,'Route 2', 98101)," +
                 " (5,'Viridian Forest', 98006)," +
                 " (6,'Route 3', 98167);";

  var popPlayer = "INSERT IGNORE INTO player (player_id, first_name, last_name) VALUES " +
                  "	(1, 'Susan', 'Miller')," +
                  "	(2, 'Will', 'Peng')," +
                  "	(3, 'Samamtha', 'Klapp')," +
                  "	(4, 'Chris', 'Creme')," +
                  "	(5, 'Kris', 'Hight')," +
                  "	(6, 'Eric', 'Mcgree');";
  var popPokemon = "INSERT IGNORE INTO pokemon (pokemon_id, pokemon_name) VALUES " +
                 " (1, 'Bulbasaur')," +
                 " (2, 'Charmander')," +
                 " (3, 'Squirtle')," +
                 " (4, 'Caterpie')," +
                 " (5, 'Metapod')," +
                 " (6, 'Weedle')," +
                 " (7, 'Kakuna')," +
                 " (8, 'Pidgey')," +
                 " (9, 'Rattata')," +
                 " (10, 'Spearow')," +
                 " (11, 'Bulbasaur')," +
                 " (12, 'Charmander')," +
                 " (13, 'Squirtle')," +
                 " (14, 'Caterpie')," +
                 " (15, 'Pidgey');";

  var popPlayers = "INSERT IGNORE INTO `players` (`playerName`,`raceID`,`class`,`level`,`homezoneID`) VALUES " +
                   " ('richard', 3, 'druid', 55, 1),  ('moot', 2, 'rogue', 61, 2), 	   ('test', 1, 'deathknight', 90, 3),"+
                   " ('Lucius',4,'priest',28,4),    	('Lucian',3,'deathknight',33,2), ('Tiger',5,'warrior',16,2),"+
                   " ('Acton',3,'paladin',9,3),     	('Emerson',1,'monk',95,4),       ('Micah',4,'warlock',59,3),"+
                   " ('Harrison',3,'warlock',77,2), 	('Drew',2,'monk',8,1),           ('Francis',3,'mage',38,5),"+
                   " ('Prescott',1,'warrior',20,4), 	('Oliver',3,'warlock',70,5),     ('Edward',6,'warlock',34,4),"+
                   " ('Benedict',1,'paladin',17,4), 	('Baxter',3,'monk',16,4),        ('Laith',6,'monk',28,1),"+
                   " ('Wyatt',6,'warrior',1,3),     	('Arthur',2,'druid',3,2),        ('Nehru',2,'paladin',70,2),"+
                   " ('Wing',4,'paladin',36,1),     	('Xenos',3,'warlock',47,1),      ('Zephania',3,'warrior',24,1),"+
                   " ('Jerry',6,'paladin',51,2),    	('Henry',5,'mage',96,3),         ('Philip',5,'shaman',15,3),"+
                   " ('Dale',3,'rogue',38,4),       	('Denton',5,'monk',67,2),        ('Hunter',3,'warrior',100,2),"+
                   " ('Thomas',2,'warlock',67,2),   	('Caleb',5,'rogue',10,4),        ('Geoffrey',5,'warlock',27,1),"+
                   " ('Owen',4,'rogue',30,4),       	('William',6,'monk',35,4),       ('Blake',2,'shaman',89,5),"+
                   " ('Reuben',2,'shaman',85,5),    	('Nash',5,'warrior',13,5),       ('Neville',4,'rogue',86,3),"+
                   " ('Colby',1,'mage',96,4),       	('Jason',4,'mage',49,3),         ('Brenden',4,'priest',86,4),"+
                   " ('Oren',4,'warlock',52,4),     	('Quamar',5,'rogue',55,2),       ('Uriah',2,'monk',51,5),"+
                   " ('Steel',6,'monk',99,5),       	('Malcolm',2,'druid',79,3),      ('Holmes',6,'monk',77,4),"+
                   " ('Timothy',6,'priest',29,1);";
  var popCatch = "INSERT IGNORE INTO catch (catch_time, catch_player_id, catch_location_id, catch_pokemon_id) VALUES " +
                    "2017-05-30, 2, 1, 4," +
                    "2017-05-27, 1, 1, 8," +
                    "2017-05-29, 1, 1, 3," +
                    "2017-05-31, 6, 2, 6," +
                    "2017-06-01, 6, 2, 7," +
                    "2017-06-02, 5, 5, 5," +
                    "2017-06-03, 5, 5, 9," +
                    "2017-06-04, 2, 5, 13," +
                    "2017-06-05, 4, 4, 1," +
                    "2017-06-06, 4, 4, 2," +
                    "2017-06-07, 3, 3, 10," +
                    "2017-06-08, 3, 6, 11," +
                    "2017-06-09, 3, 6, 12," +
                    "2017-06-10, 1, 3, 15;";

  pool.query(popType, function(err){
    if(err) { console.log(this.sql); throw err;}
    else {
      pool.query(popLocation, function(err){
        if(err) { console.log(this.sql); throw err;}
        else{
          pool.query(popPlayer, function(err){
            if(err) { console.log(this.sql); throw err;}
            else{
              pool.query(popPokemon, function(err){
                if(err) { console.log(this.sql); throw err;}
                else{
                  pool.query(popCatch, function(err){
                    if(err) { console.log(this.sql); throw err;}
                  })
                }
              })
            }
          })
        }
      })
    }
  })
};

// Parsing middleware and setting our directory for public assets
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sever logging to track what is happening at a given time
app.use(morgan('short'));


app.get('/', function(req, res, next) {
  var context = {};

  context.active = {home: true};
  res.render('home', context);
});

app.get('/pokemon', function(req, res, next){
  var context = {};
  context.active = {pokemon: true};

  pool.query("SELECT * FROM pokemon;", function(err, rows){
    if(err) next(err);
    else {
      if(rows[0] !== undefined){
        context.results = rows;
        context.keys = Object.keys(rows[0]);
      }
      else {
        context.error = 'No data found in table';
      }
      res.render('pokemon', context);
    }
  })
});

app.get('/pokemon_type', function(req, res, next) {
  var context = {};
  context.active = {races: true};


  pool.query('SELECT * FROM pokemon_type;', function(err, rows){
    if(err) next(err);
    else {
      if(rows[0] !== undefined){
        context.results = rows;
        context.keys = Object.keys(rows[0]);
      }
      else {
        context.error = 'No data found in table';
      }
      res.render('pokemon_type', context);
    }
  })
});

app.get('/player', function(req, res, next){
  var context = {};
  context.active = {player: true};

  pool.query('SELECT * FROM player;', function(err, rows){
    if(err) next(err);
    else {
      if(rows[0] !== undefined){
        context.results = rows;
        context.keys = Object.keys(rows[0]);
      }
      else {
        context.error = 'No data found in table';
      }
      res.render('player', context);
    }
  })
});

app.get('/location', function(req, res, next) {
  var context = {};
  context.active = {location: true};

  pool.query('SELECT * FROM location;', function(err, rows){
    if(err) next(err);
    else {
      if(rows[0] !== undefined){
        context.results = rows;
        context.keys = Object.keys(rows[0]);
      }
      else {
        context.error = 'No data found in table';
      }

      res.render('location', context);
    }
  })
});

app.get('/catch', function(req, res, next){
  var context = {};
  context.active = {catch: true};
  var query = " SELECT * FROM `catch`;"
              // " INNER JOIN defeated ON defeated.playerID=players.id" +
              // " INNER JOIN bosses ON defeated.bossID=bosses.ID;"
  pool.query(query, function(err, rows){
    if(err) {console.log(this.sql); next(err);}
    else{
      if(rows[0] !== undefined){
        context.results = rows;
        context.keys = Object.keys(rows[0]);
      }
      else {
        context.error = "No table data found";
      }
      res.render('catch', context);
    }
  });

});

app.delete('/delete-row', function(req, res, next){
  if( req.body.id !== undefined){
    var query = "DELETE FROM " + req.body.table + " WHERE id=" + req.body.id;

    pool.query(query, function(err, rows){
      if(err) next(err);
      else{
        res.send(req.body.id);
      }
    })
  }
  else{
    res.send("Error: No ID provided");
  }

});

app.post('/update-row', function(req, res, next){
  var context = {};
  var query = 'UPDATE '+ req.body.table + ' SET ?' + ' WHERE id=' + req.body.id;

  pool.query(query, req.body.columns, function(err, rows){
    if(err){
      next(err);
    }
    else {
      res.send(req.body);
    }
  })
});

app.post('/add-row', function(req, res, next){
  var context = {};

  var query = 'INSERT INTO ' + req.body.table + ' SET ? ;';

  pool.query(query, req.body.columns, function(err, rows){
    if(err) {console.log(this.sql); res.send(err); next(err);}
    else {
      res.send("Success");
    }
  })

});

app.get('/reset-data', function(req ,res, next){
  var context = {};
  context.active = {'reset-data': true};


  pool.query("DROP DATABASE IF EXISTS final;" +
             "CREATE DATABASE IF NOT EXISTS final;" +
             "USE final;"
             , function(err){
    if(err) {console.log(this.sql);next(err);}
    else{
      createTables();
      res.render('reset-data', context);
    }
  });
});

app.get('/pop-data', function(req, res, next){
  var context = {};

  context.active = {'pop-data': true};

  populateTables();

  res.render('pop-data', context);
})

app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function(req, res) {
  console.log('Application started on port ' + app.get('port') + '; Press Ctrl+C to terminate.')
});
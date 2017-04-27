var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/defense-in-derpth';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
    db = databaseConnection;
});

app.post('/submit', function(request, response) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");

    var vehicles = ['RagpIGnC','JANET','ilFrXqLz', 't4wcLoCT', 'WnVPdTjF', '1fH5MXna', '4aTtB30R', '8CXROgIF', 'w8XMS577', 'ZywrOTLJ', 'cQRzspF5', 'GSXHB9L1', 'TztAkR2g', 'aSOqNo4S', 'ImjNJW4n', 'svEQIneI', 'N10SCqi5', 'QQjjwwH2', 'H0pfmYGr', 'FyUHoAvS', 'bgULOMsX', 'OlOBzZF8', 'Ln7b7ODx', 'ZoxN11Sa', 'itShXf78', 'o6kJKzyI', 'pD0kGOax', 'njr1i7xM', 'wtDRzig8', 'l2r8bViT', 'oZn3b2OZ', 'ym2J1vil'];
    //var passengers = ['dwR3TbOH','GfxthVGV', 'ZkLnG6EZ', 'EHT0Rc9k', 'DhBOY0lT', 'LQBzR5Lc', 'kH6tkjjd', 'eOhwZ42u', 'JyggLRkg', 'zVAzdXwT', 'aj5P8OGT', 'ZDp9SUI8', 'n43801bH', '5SZbXihZ', 'upH3QwSx', 'OGyGLT4c', 'QopbHhwB', 'lTAv59dF', 'u48FRAF7', 'hW9U2YVS', 'NedmDRLG', 'QF4y7nso', 'i3oxTCVc', 'GRFQKAVp', 'bECJTExd', 'Km0TjyQB', 's4lIFLCg', '8jBoB4RN', 'FACZaAp2', 'zhlDIUUC', 'bCaq0utn', 'bG3XpClP', 'yzuB0ru8', 'mwFQ4Mfn', 'NJ9WQCEm', '9SO147Xl', 'H2I2KaRj', '3fUAMsR2', 'DifF0fA9', 'QjvG1B5x', 'bHvA7ZI8', 'Pfy0zQBn', 'tNdlJuB4', '7Qro8170', 'STgg85uu', 'QymWuv6O', 'nmwMbHID', '7bBskisO', '85sBoDu6', 'TMMAmR9y', 'GOCK80Ii', 'TRAM96zq', '52iVwuEg', 'o5b341rr', 'Rhefuvfg', 'vuTkCJ0s', 'dJys58Ox', 'vdOttDOL', 'We1HUtFX', '2zBf5CnB', 'ohMT3Ekt', 'Qh1AMT8E', '1ZTX8P2C', 'jelyI6fv', '5xU0fpdZ', 'OlVc4ZBz', 'Xgzbl3n7', 'QnjcxLkp', 'y7p5Fosa', 'toA5vnc1', 'Yy7CwrO4', 'p9DXn1Nr', 'BGTOqZVx', 'vJ8HkH3e', 'G8Gyp9DB', 'e0BdmYPs', 'ZRNOMH3d', 'QxCsBRo4', 'YdpGqvtk', 'OAyVNkd2', 'aqGecNYE', 'eu5V65qb', '6NVPzKEi', 'h6HzyiHK', 'eKAxYriw', 'q37CTsZa', 'zvLmuEPN', 'vXeUlZrk', '6vZ9qT63', 'KFhBSaqv', 'iraQrjcj', 'BXRk3kaR', 'sSPuQLul', 'IR5n7nOy', 'tkaebPFC', '6VCxlrtD'];
    var username = request.body.username;
    var lat = request.body.lat;
    var lng = request.body.lng;
    var results = {};
    // Allow all passengers
    if (username != undefined && lat != undefined && lng != undefined && validator.isFloat(lat) && validator.isFloat(lng)) {
    //if ((passengers.indexOf(username) != -1 || vehicles.indexOf(username) != -1)  && username != undefined && lat != undefined && lng != undefined && validator.isFloat(lat) && validator.isFloat(lng)) {
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        if (lat >= -90.0 && lat <= 90 && lng >= -180 && lng <= 180) {
            var toInsert = {
                "username":username,
                "lat":lat,
                "lng":lng,
                "created_at":new Date()
            };
            var fiveMinutesAgo = new Date(new Date().getTime() - 1000 * 60 * 5);

            if (vehicles.indexOf(username) != -1) {
                db.collection('vehicles', function(errorCollection, collection) {
                    collection.update({"username":username}, toInsert,  { upsert: true }, function (errorUpdate, result) {
                        db.collection('passengers', function(errorCollection, passengersCollection) {
                            passengersCollection.find({"created_at": {$gt: fiveMinutesAgo}}).toArray(function(errorFind, passengers) {
                                results.passengers = passengers;
                                response.send(results);
                            });
                        });
                    });
                });
            }
            else {
                db.collection('passengers', function(errorCollection, collection) {
                    collection.update({"username":username}, toInsert,  { upsert: true }, function (errorUpdate, result) {
                        db.collection('vehicles', function(errorCollection, vehiclesCollection) {
                            vehiclesCollection.find({"created_at": {$gt: fiveMinutesAgo}}).toArray(function(errorFind, vehicles) {
                                results.vehicles = vehicles;
                                response.send(results);
                            });
                        });
                    });
                });
            }
        }
        else {
            response.send('{"error":"Whoops, something is wrong with your data!"}');
        }
    }
    else {
        response.send('{"error":"Whoops, something is wrong with your data!"}');
    }
});

app.get('/vehicle.json', function(request, response) {
    var usernameEntry = request.query.username;
    if (usernameEntry == undefined || usernameEntry == null) {
        response.send("{}");
    }
    else {
        db.collection('vehicles', function(error, collection) {
            collection.findOne({username:usernameEntry}, function(error, result) {
                if (!result) {
                    response.send("{}");
                }
                else {
                    response.send(result);
                }
            });
        });
    }
});

app.get('/', function(request, response) {
    response.set('Content-Type', 'text/html');
    var indexPage = '';
    db.collection('passengers', function(error, collection) {
        collection.find().sort({"_id":-1}).toArray(function(error, results) {
            if (!error) {
                indexPage += "<!DOCTYPE HTML><html><head><title>Not Uber</title></head><body><h1>Not Uber</h1><ul>";
                if (results.length == 0) {
                    indexPage += "<li>No check-ins</li>";
                }
                else {
                    for (var count = 0; count < results.length; count++) {
                        indexPage += "<li>" + results[count].username + " checked in at " + results[count].lat + ", " + results[count].lng + " on " + results[count].created_at + "</li>";
                    }
                }
                indexPage += "</ul></body></html>"
                response.send(indexPage);
            } else {
                response.send('<!DOCTYPE HTML><html><head><title>Not Uber</title></head><body><h1>Not Uber</h1><p>Whoops, something went terribly wrong!</p></body></html>');
            }
        });
    });
});

app.listen(process.env.PORT || 3000);
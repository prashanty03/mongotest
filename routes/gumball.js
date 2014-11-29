var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('ds043200.mongolab.com',43200,{auto_reconnect: true});
db = new Db('prashant', server);


db.open(function(err, db) {
	db.authenticate('admin', 'admin', function(err, success) {
		if(!err) {
	        console.log("Connected to 'gumballdb' database");
	        db.collection('gumballs', {strict:true}, function(err, collection) {
	            if (err) {
	                console.log("The 'gumballs' collection doesn't exist. Creating it with sample data...");
	                populateDB();
	            }
	        });
	    }
    });
    
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving gumball: ' + id);
    db.collection('gumballs', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
        	res.render('details', {result:item, _id: id, state:'No Coin', Msg:'Please Insert Coin'});//res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('gumballs', function(err, collection) {
        collection.find().toArray(function(err, items) {
        	 res.render('list', {result:items});// res.send(items);
        });
    });
};

exports.addgumball = function(req, res) {
    var gumball = req.body;
    console.log('Adding gumball: ' + JSON.stringify(gumball));
    db.collection('gumballs', function(err, collection) {
        collection.insert(gumball, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updategumball = function(req, res) {
	var id = req.params.id;
	var input = JSON.parse(JSON.stringify(req.body));
	var state = input.state;
	var event = input.event;
	
	var data = {
			id : id,
			serialNumber : input.serialNumber,
			modelNumber : input.modelNumber,
			count : input.count
	}
	console.log(data);
	if(event=="Insert Quarter"){
		if(state=="No Coin"){
			//state = "Has Coin";
			res.render('details', {result:data, _id:id, state:'Has Coin', Msg:'Coin Inserted'});
		}
		else
			res.render('details', {result:data, _id:id, state:state, Msg:'Coin already Inserted'});
	}
	else{
		if(state=="No Coin"){
			res.render('details', {result:data, _id:id, state:state, Msg:'Please Insert Coin'})
		}
		else if(state=="Has Coin"){
			if(input.count > 0){
				var dataNew = {
						serialNumber : input.serialNumber,
						modelNumber : input.modelNumber,
						count : input.count-1
				}
				
				db.collection('gumballs', function(err, collection) {
			        collection.update({'_id':new BSON.ObjectID(id)}, dataNew, {safe:true}, function(err, result) {
			            if (err) {
			                console.log('Error updating gumball: ' + err);
			                res.send({'error':'An error has occurred'});
			            } else {
			                console.log('' + result + ' document(s) updated');
			                res.render('details', {result:dataNew, _id:id, state:'No Coin', Msg:'Please Collect gumball'});
			            }
			        });
			    });
			}
			else {
				res.render('details', {result:data, _id : id, state:state, Msg:'Inventory Zero'});
			}
			
		}
	}
	
	
//    var id = req.params.id;
//    var gumball = req.body;
//    console.log('Updating gumball: ' + id);
//    console.log(JSON.stringify(gumball));
//    db.collection('gumballs', function(err, collection) {
//        collection.update({'_id':new BSON.ObjectID(id)}, gumball, {safe:true}, function(err, result) {
//            if (err) {
//                console.log('Error updating gumball: ' + err);
//                res.send({'error':'An error has occurred'});
//            } else {
//                console.log('' + result + ' document(s) updated');
//                res.send(gumball);
//            }
//        });
//    });
}

exports.deletegumball = function(req, res) {
    var id = req.params.id;
    console.log('Deleting gumball: ' + id);
    db.collection('gumballs', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

var populateDB = function() {

    var gumballs = [
    {
        serialNumber : "123456789999",
        modelNumber : "123123123",
        count : 5
    },
    {
        serialNumber : "12345678999999",
        modelNumber : "12312312399",
        count : 10
    }
    ];

    db.collection('gumballs', function(err, collection) {
        collection.insert(gumballs, {safe:true}, function(err, result) {});
    });

};
var mongo = require('mongodb');
var crypto = require('crypto');
var secretkey = 'XLK5NFogsyjXTq9h02qYeh3B93qqJhoX';
var get_hash = function(state, ts){
	var text = state + ts + secretkey;
	hmac = 	crypto.createHmac("sha256", secretkey);
	hmac.setEncoding('base64');
	hmac.write(text);
	hmac.end();
	hash = hmac.read();
	return hash;
	
}
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
        	var state = 'No Coin';
        	var ts = new Date().getTime();
        	var hash = get_hash(state, ts)
        	res.render('details', {result:item, _id: id, state:state, hash : hash, ts : ts, Msg:'Please Insert Coin'});//res.send(item);
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
	var hash1 = input.hash;
	var ts = parseInt(input.ts);
	console.log(hash +" ***" +state +"***"+ts);
	var now = new Date().getTime();
	var diff = ((now-ts)/1000);
	var hash2 = get_hash(state, ts);
	console.log(hash2 +" &&&" +state +"&&&"+ts);
	console.log("Diff" + diff);
	console.log("Hash1" + hash1);
	console.log("Hash2" + hash2);
	var data = {
			id : id,
			serialNumber : input.serialNumber,
			modelNumber : input.modelNumber,
			count : input.count
	}
	
	if(diff > 120){
		res.render('details', {result:data, _id:id, state:state, ts : now, hash : hash, Msg:'******Session Invalid*******'} );
	}
	
	console.log(data);
	if(event=="Insert Quarter"){
		if(state=="No Coin"){
			var nstate = "Has Coin";
			var nhash = get_hash(state, now);
			console.log(nhash +" ###" +nstate +"###"+now);
			res.render('details', {result:data, _id:id, state:nstate, ts : now, hash : nhash, Msg:'Coin Inserted'});
		}
		else{
			res.render('details', {result:data, _id:id, state:state, ts : now, hash : get_hash(state, now), Msg:'Coin already Inserted'});
		}
			
	}
	else{
		if(state=="No Coin"){
			res.render('details', {result:data, _id:id, ts : now, state:state, hash : get_hash(state, now),  Msg:'Please Insert Coin'})
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
			                
			                res.render('details', {result:dataNew, _id:id, ts : now, state:'No Coin', hash : get_hash('No Coin', now), Msg:'Please Collect gumball'});
			            }
			        });
			    });
			}
			else {
				res.render('details', {result:data, _id : id, ts : now, hash : get_hash(state, now), state:state, Msg:'Inventory Zero'});
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
        count : 10
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


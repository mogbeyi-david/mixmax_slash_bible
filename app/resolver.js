var config = require('../config/config');
var request = require('request');
var sync = require('synchronize');
var _ = require('underscore');

module.exports = function(req,res){
	var term = req.query.text.trim();
	return handleSearchQuery(term,req,res);
}

var formatString = function(term){
	var result;
	var data = term.split(":");
	if(data.length == 3){
		result = data[0]+"+"+data[1]+":"+data[2];
	} else if(data.length == 2){
		result = data[0]+"+"+data[1]+":1";
	} else if (data.length == 1){
		result = data+"+1"+":1";
	}
	console.log("formatString");
	console.log(result);
	return result;
}

var handleSearchQuery = function(term, req, res){
	var query = formatString(term);
	var result;
	try {
		result = sync.await(request('https://bibles.org/v2/search.js?query='+query, sync.defer()).auth(config.api_key,'password',true));
	} catch(e){
		console.log(e);
		//return res.status(500).send(e);
	}
	var r_data = result.body;
	var data = JSON.parse(r_data).response.search.result.passages[0].text;
	console.log(data);
	return res.json({'body': data });
}
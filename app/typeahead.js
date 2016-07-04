var config  = require('../config/config');
var request = require('request');
var sync = require('synchronize');
var  _   = require('underscore');

module.exports = function(req,res){

	var chapteres_api = '';
	var verses_api = '';

	var term = req.query.text.trim();
	console.log(term);

	if(!term){
		res.json({
			title: '<i>(enter a bible verse)</i>',
			text: '',
		});
		return;
	}

	return analyseString(res,term);
}

function analyseString(res,input){
	var data = input.split(":");
	if(data.length == 1){
		return getBooks(res,input);
	} else if(data.length == 2){
		return getChapters(res, input);
	} else if(data.length == 3){
		return getVerses(res,input);
	}
}

function getBooks(res,input){
	try {
		response = sync.await(request('https://bibles.org/v2/versions/eng-GNTD/books.js',sync.defer()).auth(config.api_key,'password',true));
	} catch(e){
		res.status(500).send('Error');
		return;
	}

	if(response.statusCode !== 200 || !response.body){
		res.status(500).send('Error');
		return;
	}

	var results = _.chain((JSON.parse(response.body)).response.books)
				.reject(function(item){
					var name = item.name.indexOf(input);

					return name  > -1;
				})
				.map(function(item){
					return {
						title : '<i>'+item.name+'</i>',
						text : '<i>'+item.name+'</i>'
					}

				}).value();

	if(results.length === 0){
		res.json([{
			title: '<i>(no results)</i>',
			text: ''
		}]);
	} else {
		console.log("get Books");
		console.log(results);
		res.json([results]);
	}
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getChapters(res, input){
	var text = input.split(":");
	var chapter = text[1]+"."+capitalizeFirstLetter(text[0].substr(0,3));
	console.log(chapter);

	try {
		response = sync.await(request('https://bibles.org/v2/books/eng-GNTD:'+chapter+'/chapters.js',sync.defer()).auth(config.api_key,'password',true));
	} catch(e){
		console.log("exception");
		console.log(e);
		res.status(500).send('Error');
		return;
	}
	//console.log(response);

	if(response.statusCode !== 200 || !response.body){
		res.status(500).send(response);
		return;
	}

	var results = _.chain((JSON.parse(response.body)).response.chapters)
				.reject(function(item){
					return !item.chapter;
				})
				.map(function(item){
					return {
						title: '<i>'+item.chapter+'</i>',
						text : '<i>'+item.chapter+'</i>'
					}
				}).value();
				
	if(results.length === 0){
		res.json([{
			title: '<i>(no results)</i>',
			text: ''
		}]);
	} else {
		console.log("chapters");
		console.log(results);
		res.json([results]);
	}
}

function getVerses(){

}
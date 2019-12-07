const http = require('http');
const fs = require('fs');
const open = require('opn');


const port = 5000;
const addr = "localhost"; // "127.0.0.1"
const VidIdFile = "VidIdPlaylist.txt";
const openBrowserTab = true;


if(!fs.existsSync(VidIdFile)) {
	return console.error("File not found.");
}
var MainIndexFile = 'yt-fpl.html'
if(!fs.existsSync(MainIndexFile)) {
	return console.error("Main HTML-File not found.");
}

// YouTubeGetID
// https://gist.github.com/takien/4077195
// With modification
function YouTubeGetID(url){
	var ID = '';
	url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
	if(url[2] !== undefined) {
		ID = url[2].split(/[^0-9a-z_\-]/i);
		ID = ID[0];
	}
	else {
		ID = url[0]; // Modificated
	}
	return ID;
}


var RAW_myVideoIds = fs.readFileSync(VidIdFile, 'utf-8').split('\n').filter(Boolean);
console.log(RAW_myVideoIds);

var myVideoIds = []
for(var i=0, j=0, len=RAW_myVideoIds.length; i<len; i++) {
	RAW_myVideoIds[i] = RAW_myVideoIds[i].replace(/\s/g,'');
	if(RAW_myVideoIds[i].charAt(0) !== '#'){
		myVideoIds[j] = YouTubeGetID(RAW_myVideoIds[i]).substring(0, 11);
		++j;
	}
}
console.log(myVideoIds);

var vidIndex = -1;

var server = http.createServer(function (req, res) {
	if (req.url == '/') {
		fs.readFile(MainIndexFile, (err, binaryContent) => {
			if(err){
				return console.error(err);
			}
			res.writeHead(200, {'Content-Type': 'text/html'});   
			res.write(binaryContent, "binary");
			res.end();
		});		
	}
	else if (req.url == "/nextVidId") {
		++vidIndex;
		if(vidIndex >= myVideoIds.length){
			vidIndex = 0;
		}		
		
		console.log(myVideoIds[vidIndex])
		res.writeHead(200, {'Content-Type': 'text/plain'});   
		res.write(myVideoIds[vidIndex]);
		res.end();		
	}
	else if (req.url == "/prevVidId") {
		--vidIndex;
		if(vidIndex < 0){
			vidIndex = myVideoIds.length - 1;
		}		
		
		console.log(myVideoIds[vidIndex])
		res.writeHead(200, {'Content-Type': 'text/plain'});   
		res.write(myVideoIds[vidIndex]);
		res.end();		
	}	
	else if (req.url == "/done") {
		res.writeHead(200, {'Content-Type': 'text/html'});   
		res.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Custom Playlist</title></head><body><p>Done.</p></body></html>');
		res.end();
		server.close();	
	}	
	else {
		res.writeHead(200, {'Content-Type': 'text/html'});   
		res.end('Invalid Request!');
		return server.close();
	}
});

server.on('close', function(){
  console.log('Server closed.');
});


server.listen(port);
if(openBrowserTab){
	open('http://' + addr + ':' + port.toString(), '_blank');
}
console.log('Running Node.js web server at port ' + port.toString());


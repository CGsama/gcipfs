var http = require('http');
var fs = require('fs');
var exec = require('child_process').exec;
var cache = JSON.parse(fs.readFileSync('cache.json', {encoding: "utf8"}));

var gateway_pool = ["gateway.ipfs.io", "cloudflare-ipfs.com"];

setInterval(() => {
	fs.writeFileSync("cache.json", JSON.stringify(cache), {encoding: "utf8"});
}, 60000);

http.createServer(function (req, res) {
	if(cache[req.url]){
		console.log("cache: " + req.url + " --> " + cache[req.url]);
		res.writeHead(302, {'Location': "https://" + gateway_pool[Math.floor(Math.random() * Math.floor(gateway_pool.length))] + "/ipfs/" + cache[req.url]});
		res.end();
		return;
	}
	rand = Math.floor(Math.random() * Math.floor(100000));
	cmd = "wget --no-check-certificate --max-redirect=20 -O " + rand + "tempfile https:\/\/files.misskey.gothloli.club" + req.url + " >\/dev\/null 2>&1; IPFS_PATH=\/ipfsrepo ipfs add -n " + rand + "tempfile 2>\/dev\/null| tr -d \'\\n\'| tr -d \'\\r\' | sed \'s\/.*added\\s*\\(\\w*\\)\\s*" + rand + "tempfile.*\/\\1\/\'; rm " + rand + "tempfile";
	exec(cmd, function(error, stdout, stderr){
		if(error){
			res.status(404);
			return;
		}
		cache[req.url] = stdout;
		exec("wget --no-check-certificate --max-redirect=0 -O \/dev\/null https:\/\/test.gothiclolita.club" + req.url, function(error, stdout, stderr){});
		console.log(req.url + " --> " + stdout);
		res.writeHead(302, {'Location': "https://ipfs.io/ipfs/" + stdout});
		res.end();
	});
}).listen(80);

var http = require('http');

var request = require('request'); // Imports libraries
var fs = require('fs');

// Define URLs here
var allURLS = ["https://johnlaschobersoftwareengineering.azurewebsites.net/myInfo.json", "https://softwareengineeringapp.azurewebsites.net/my-information.json", "https://korszulak-static.azurewebsites.net/myInfo.json", "http://csoftware.azurewebsites.net/groupinfo.json", "https://cpsc440.azurewebsites.net/myInfo.json", "https://alisp18.azurewebsites.net/myinfo.json"];
// Where JSON objects will be stored
var allJSON = [];

var concattedJSON;
var finalJSON = "no";
var done = false;

var indexStack = [];

function concatGroupJson()
{
	console.log("concatted");
	for (i = 0; i < allURLS.length; i++)
	{
		indexStack.push(i);
		request(allURLS[i], function (error, response, body) 
		{
			console.log(response.statusCode);
			if (!error && response.statusCode == 200) 
			{
				var iterator = indexStack[indexStack.length - 1];
				indexStack.pop();
				var importedJSON = JSON.parse(body);
				allJSON.push(importedJSON);
				var outputString = JSON.stringify(importedJSON, null, 4);
				fs.writeFile("member" + iterator + ".json", outputString, 'utf-8', function (err)  // File writer for saving a json file, not done
				{
					if (err) 
					{
						return console.log(err);
					}
					else
					{
						if (indexStack.length == 0)
						{
						    concattedJSON = "";
							concattedJSON = '{"members":[';
							for (j = 0; j < allJSON.length; j++)
							{
								concattedJSON += JSON.stringify(allJSON[j]);
								if (j != allURLS.length - 1) 
								{
									concattedJSON += ',';
								}
							}
							concattedJSON += ']}';
							fs.writeFile("groupJSON.json", concattedJSON, 'utf-8', function (err)  // File writer for saving a json file, not done
							{
								if (err) 
								{
									return console.log("Error writing to groupJSON.json: " + err);
								}
							});
							fs.writeFile("lastUpdated.txt", Date(), 'utf-8', function (err) 
							{ 
								if (err) 
								{ 
									return console.log("Error writing lastUpdated.txt:" + err); 
								} 
							}); 
						}
					}
				});

			}
			else
			{
				console.log("Error accessing a member's JSON file: " + error);
			}
		});
	}
	//setTimeout(concatGroupJson, 1000 * 60 * 30); // 30 minute refresh in milliseconds
}

concatGroupJson();

var server = http.createServer(function (request, response)  // On user connect
{
    //response.writeHead(200, { "Content-Type": "text/plain" });
    try
    {
		response.write(concattedJSON);
        
		
		response.end();
    }
    catch (err)
    {
		try
		{
			var importedJSON = JSON.parse(fs.readFileSync('groupJSON.json', 'utf8'));
			response.write(JSON.stringify(importedJSON, null, 4));
		}
		catch (err) 
		{
			response.writeHead(200, { "Content-Type": "text/plain" });
			response.write("Something went wrong... " + err);
		}
    }
	try
	{
		var lastUpdated = fs.readFileSync('lastUpdated.txt', 'utf8');
		console.log("Last updated: " + lastUpdated);
	}
	catch (err){}
	response.end();
});

var port = process.env.PORT || 80;
server.listen(port);

console.log("Server running at http://localhost:%d", port);

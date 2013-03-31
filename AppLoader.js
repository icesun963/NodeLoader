var http = require("http");
var fs = require("fs");
var config = require("./config.json");
var AdmZip = require("adm-zip");


var size = 0;
var isRun = false;
var AutoRun=function(){
    size = 0;
    var file = fs.createWriteStream("update.zip");

    http.get(config.url).on("response", function (response) {
        console.log("wget:" + config.url);
        var body = 0;
        var i = 0;
        response.on("data", function (chunk) {
            i++;
            body += chunk.length;
            //console.log("chunk:" + i);
        });
        response.on("end", function () {
            console.log("Size:" + size + "->" + body);
            if(size!=body)
            {
                try{
                    var zip = new AdmZip("./update.zip")
                        ,zipEntries = zip.getEntries();
                    zip.extractAllTo("./", true);
                    size = body;
                    console.log("Finished:" + body);

                    if(!isRun)
                    {
                        console.log("Start Run App...");
                        require(config.runApp);
                    }
                    else
                    {
                        console.log("Exit...");
                        process.exit();
                    }

                }
                catch(e)
                {
                    console.log("error:" + e);
                }
            }

        });

        response.pipe(file);

    });

}

AutoRun();

setInterval(function(){
    AutoRun();
},30*1000);









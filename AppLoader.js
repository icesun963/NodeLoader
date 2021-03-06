var http = require("http");
var fs = require("fs");
var config = require("./config.json");
var exec = require('child_process').exec;

var size = 0;
var isRun = false;
var AutoRun=function(){

    var file = fs.createWriteStream("update.zip");

    http.get(config.url).on("response", function (response) {
        console.log("wget:" + config.url);
        var body = 0;
        var i = 0;

        response.on("error", function (){
            console.log("GET request error");
        });

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
                    var AdmZip = require("adm-zip");
                    var zip = new AdmZip("./update.zip")
                        ,zipEntries = zip.getEntries();
                    zip.extractAllTo("./", true);
                    if(size==0 && isRun)
                    {
                        size=body;
                        return;
                    }
                    size = body;
                    console.log("Finished:" + body);

                    if(!isRun)
                    {
                        console.log("Start Run App...");
                        require(config.runApp);
                        isRun = true;
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


exec('npm install adm-zip', function(err, data, stderr){
    console.log(data);

        try{
            console.log("try Start Run App...");
            require(config.runApp);
            isRun = true;
        }
        catch(err)
        {

        }

    setInterval(function(){
            if(!isRun)
            {
                try
                {
                    AutoRun();
                }
                catch(err)
                {

                }
            }
        },5*1000);

    setInterval(function(){
            if(isRun)
            {
                try
                {
                    AutoRun();
                }
                catch(err)
                {

                }
            }
        },60*1000);
});

process.on("uncaughtException", function(err) {
    // handle the error safely
    console.error("App UncaughtException:\r\n"  + err);
});













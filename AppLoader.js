var http = require("http");
var fs = require("fs");
var config = require("./config.json");
var AdmZip = require("adm-zip");
var exec = require('child_process').exec;

var size = 0;
var isRun = false;
var AutoRun=function(){
    size = 0;
    try
    {
        fs.unlinkSync("./update.zip");
    }
    catch(err)
    {

    }
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
    AutoRun();

    setInterval(function(){
        if(!isRun)
            AutoRun();
    },5*1000);

    setInterval(function(){
        if(isRun)
            AutoRun();
    },60*1000);
});












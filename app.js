var loginCode = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        input {
            margin: 20px;
            font-size: 30px;
            width: 100%;
        }

        body {
            height: 100vh;
            align-content: center;
            justify-content: center;
        }

        button {
            margin: 20px;
            font-size: 30px;
            align-self: center;
            cursor: pointer;
        }

        #loginComponents {
            width: 20%;
            height: 20%;
            margin: auto;
            margin-top: 50vh;
        }

    </style>
</head>

<body>

    <div id="loginComponents">


        <form action="/" method="post">
            <input type="text" placeholder="Enter Username" name="username" id="username">
            <br>
            <input type="password" placeholder="Enter Password" name="password" id="password">
            <br>
            <button type="submit">Login</button>
        </form>
    </div>
</body>

</html>
`;
var head = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MyLoggerServer</title>
    <style>
    .btn {
        background-color: beige;
        text-align: center;
        font-size: 32px;
        border: 2px solid black;
        margin: 20px;
    }


    .onLeft {
        display: flex;
        float: right;
    }

    .row {
        display: flex;
        align-items: center;
    }

    .right {
        float: right;
    }

    .hidden {
        display: none;
    }
    .center {
        align-items: center;
        justify-self: center;
        font-size: 20px;
        margin-top: 20px;
    }

    .form {
        border: 2px solid red;
        align-items: center;
        justify-items: center;
    }
</style>
</head>
<body>
    <button id="selectMultipleDevices" class="btn">
    Perform defined actions on Selected Devices
    </button>

    <button id="selectAllDevices" class="btn">Select All Devices</button>

    <button id="deSelectAllDevices" class="btn">DeSelect All Devices</button>

    <button id="toggleDeviceSelectedState" class="btn">
      Toggle Devices Selected State
    </button>

        <form action="/logout" method="get" id="logoutForm">

        <button class="btn">Logout</button>

        </form>


`;
var body = ``;


var validCredentials = [{
    username: "jasshugarg",
    password: "Jasshu@12"
}, {
    username: "jasshu01",
    password: "Jasshu@01"

}]

// REQUIREMENTS 
const express = require('express'),
    http = require('http'),
    app = express(),
    path = require('path'),
    server = http.createServer(app),
    io = require('socket.io')().listen(server);

const { ifError } = require('assert');
var bodyParser = require('body-parser');
const { time } = require('console');
var session = require('express-session')
const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved
var ACCESS_TOKEN = "sl.BYWcg9uQKndcUaUxYy_PdCXag7sMpvzD04MhB6EJB_dNeb5ivZf3SZylGtUKkT_xa4ujiCWYlTrbCIWv9gSJf3mw6uuyctFRMl64tRWnhjMzl6gTYfN0NTN-7hu8erqpZ6hmHCg_";
var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });
const FileSaver = require("file-saver");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jasshugarg0098@gmail.com',
        pass: 'mrdrfxyymbzaqwuy'
    }
});




app.use(bodyParser.json())
app.use(session({
    secret: 'MacChromeBrowser',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))


// ARRAYS/OBJECTS USED
var socketIDofUser = {};
var otherInformationofDevice = {};
var detailedInformation = {};
var usersCapturing = {};
var connectedDevices = [];
var connectedDevicesRebootCount = {};
var lastRebootTime = {};



// EXTRACT INFORMATION RECEIVED FROM DEVICE 
function extractOtherInformation(deviceID, otherInformation) {
    var myinformation = {};

    information = otherInformation.split(",");


    information.forEach(element => {
        mykey = element.split("-")[0];
        myvalue = element.split("-")[1];
        myinformation[mykey] = myvalue;
    });

    detailedInformation[deviceID] = myinformation;

}



// DATABASE CONNECTION
var mongoose = require("mongoose");
const e = require('express');
var DB = `mongodb+srv://jasshugarg:Yashu1801@pizzaclub.4rjeu.mongodb.net/PizzaClub?retryWrites=true&w=majority`;
// mongoose.set('strictQuery', true)
mongoose.connect(DB, {

}).then(() => {
    console.log("connection successful");
}).catch((err) = console.log("no connection"));
const ownerSchema = new mongoose.Schema({
    username: String,
    password: String
})

const Owner = mongoose.model('Owner', ownerSchema);




// GENERATE HOMEPAGE BODY HTML
function generateBody() {

    body = `
    `;


    var noDeviceConnectd = true;

    for (const [key, value] of Object.entries(socketIDofUser)) {
        noDeviceConnectd = false;
        console.log(`${key}: ${value}`);
        var MessageValue = "startLogging";

        var UIValue = "Start Logging";

        if (usersCapturing[key] == true) {
            MessageValue = "stopCapturing";
            UIValue = "Stop Capturing";
        }

        if (connectedDevicesRebootCount[key] == NaN) {
            connectedDevicesRebootCount[key] = parseInt(0);
        }


        body += `

  


        <div class="row">
        <div style="width: 30%;">
        <form action="/deviceinformation" method="POST">
        <input type="submit" style="font-size:30px" name="deviceID" value="${key}"></input>
        </form>


        </div>

        <h4 type="text"> Reboot Count : ${connectedDevicesRebootCount[key]} &nbsp; </h4>
        <h4 type="text"> Last Reboot Time : ${lastRebootTime[key]}</h4>

        <form action="/" method="post">
            <input type="text"   name="userID" id="userID" value="${key}" hidden />

            <input type="text" name="message" id="message" value="${MessageValue}" hidden />

            <div class="row right">
            <h1 class="onRight" style="margin-left:20px">Select</h1>
                <input type="checkbox" name="isSelected" id="isSelected" value="${key}" class="onRight" /> </div>

            <button type="submit" class="btn">${UIValue}</button>
`

        if (usersCapturing[key] == false) {
            body += `
            <div class="row right center" id="${key}_typeOfLog">
                <input type="radio" style="margin:10px" name="Logs"  checked id="${key}_radio" value="radio">Radio Logs</input>
                <input type="radio" style="margin:10px" name="Logs" id="${key}_adb" value="adb">ADB Logs</input>
                <input type="radio" style="margin:10px" name="Logs" id="${key}_kernel" value="kernel">Kernel Logs</input>
            </div>
`;
        } else {
            body += `
            <div class="row right center hidden" id="${key}_typeOfLog">
                <input type="radio" style="margin:10px" name="Logs"   id="${key}_radio">Radio Logs</input>
                <input type="radio" style="margin:10px" name="Logs" id="${key}_adb">ADB Logs</input>
                <input type="radio" style="margin:10px" name="Logs" id="${key}_kernel">Kernel Logs</input>
            </div>
`;
        }

        body += `
        </form>
    </div>

    `;
    }

    if (noDeviceConnectd) {
        body += `<h1>No Device Connected</h1>`
    }


    body += `

    <form action="/" id="sendingToServerForm" method="post" class="hidden">
    <input type="text" name="deviceInformation" id="sendSelectedDevicesInformationToServer">
</form>


<script>





    document
        .getElementById("selectMultipleDevices")
        .addEventListener("click", (e) => {
            console.log("clicked");

            var allDevices = {};

            var markedCheckbox = document.getElementsByName("isSelected");
            for (var checkbox of markedCheckbox) {
                if (checkbox.checked)
                {
                    var typeOfLogs="none";

                    if(document.getElementById(checkbox.value+"_radio").checked)
                    {
                        typeOfLogs="radio";
                    }
                    if(document.getElementById(checkbox.value+"_adb").checked)
                    {
                        typeOfLogs="adb";
                    }
                    if(document.getElementById(checkbox.value+"_kernel").checked)
                    {
                        typeOfLogs="kernel";
                    }

                    allDevices[checkbox.value] = typeOfLogs;
                }
                else{
                    allDevices[checkbox.value] = checkbox.checked;
                }
            }
            console.log("clicked" + allDevices);



            document.getElementById("sendSelectedDevicesInformationToServer").value = JSON.stringify(allDevices);
            document.getElementById("sendingToServerForm").submit();

        });

        document
        .getElementById("selectAllDevices")
        .addEventListener("click", () => {
            var markedCheckbox = document.getElementsByName("isSelected");
            console.log("selecting all");
            for (var checkbox of markedCheckbox) {
                checkbox.checked = true;
            }
        });
    document
        .getElementById("deSelectAllDevices")
        .addEventListener("click", () => {
            var markedCheckbox = document.getElementsByName("isSelected");
            console.log("deselecting all");
            for (var checkbox of markedCheckbox) {
                checkbox.checked = false;
            }
        });

    document
        .getElementById("toggleDeviceSelectedState")
        .addEventListener("click", () => {
            var markedCheckbox = document.getElementsByName("isSelected");
            console.log("toggling all");
            for (var checkbox of markedCheckbox) {
                if (checkbox.checked) checkbox.checked = false;
                else checkbox.checked = true;
            }
        });
</script>

    </body></html>`;
}



// POST REQUESTS

app.post("/downloadFile", async(req, res) => {
    console.log(req.body);
    if (req.body.deviceID != undefined) {

        console.log("about to fetch data");
        var filedata = await downloadFileFromDropBox(req.body.deviceID, req.body.filename);
        await console.log("fetched");
        // await console.log(filedata);
        // var downloadfileResponse = await ;
        res.send(`<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
        </head>
        
        <body>
        <p style="display:none" id="content">${filedata}</p>
        </body>
        <script>
          
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
               
                save(document.getElementById(\"content\").innerHTML,\"${req.body.filename}\");
         
                function save(data, fileName) {
                    (blob = new Blob([data], {
                        type: "octet/stream",
                    })),
                    (url = window.URL.createObjectURL(blob));
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    history.back();
                };
            
            
        </script>
        
        </html>`);
        return;




    } else {
        res.send(loginCode);
        return;
    }
});
app.post("/deviceinformation", async(req, res) => {

    if (req.body.deviceID != undefined) {
        res.send(await generateDeviceDisplayInformation(req.body.deviceID));
        return;
    } else {
        res.send(loginCode);
        return;
    }
});

app.post("/sendMail", async(req, res) => {
    console.log(req.body);
    console.log(req.body.deviceID, req.body.filename);
    if (req.body.deviceID != undefined) {

        var myfileLink = await getSharedLink(req.body.deviceID, req.body.filename);

        var mailOptions = {
            from: 'jasshugarg0098@gmail.com',
            to: `${req.body.recepients}`,
            subject: `Log file access link`,
            text: ` ${req.body.deviceID} \n FileName-${req.body.filename} \n File Access Link-${myfileLink}`
        };

        await transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
                res.send((error))
            } else {
                console.log('Email sent: ' + info.response);
                res.send('Email sent: ' + info.response);
            }
        });



        return;


    } else {
        res.send(loginCode);
        return;
    }
});

app.post("/viewfile", async(req, res) => {

    // if (req.body.deviceID != undefined) {

    console.log(req.body.deviceID, req.body.filename);
    // var filedata = await downloadFileFromDropBox(req.body.deviceID, req.body.filename);
    // console.log(filedata);
    // res.send(filedata);
    // return;
    // } else {
    //     res.send(loginCode);
    //     return;
    // }

    var myans = await getSharedLink(req.body.deviceID, req.body.filename);
    console.log("getting , ", myans);

    res.redirect(myans);
    return;



    await dbx.filesDownload({ path: `/myloggerApp/+${req.body.deviceID}/${req.body.filename}` })
        .then(function(response) {

            var myViewFileHTML = `

            <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
        </head>

        <body>
            <button onclick="downloadFile()">Download Log File</button>
            <p id="filename">${req.body.filename}</p>
            <p id="logfiledata">${response.result.fileBinary.toString("utf8")}</p>
        </body>
        <script>
            function downloadFile() {
                saveData(document.getElementById("logfiledata").innerHTML, document.getElementById("filename").innerHTML);
            }
            var saveData = (function() {
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                return function(data, fileName) {
                    (blob = new Blob([data], {
                        type: "octet/stream",
                    })),
                    (url = window.URL.createObjectURL(blob));
                    a.href = url;
                    a.download = fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                };
            })();

            var data = "my data",
                fileName = "my-download.txt";

            // saveData(data, fileName);
        </>

        </html>
            `
            res.send(myViewFileHTML);
            // res.send(response.result.fileBinary.toString("utf8"));
            return;
            // file = response.result.fileBinary.toString("utf8");
            // console.log(response.result.fileBinary.toString("utf8"));
        })
        .catch(function(error) {
            res.send(error);
            console.error(error);
        });



});

app.post("/", (req, res) => {

    // console.log(req.body.userID);
    console.log("info " + req.body.deviceInformation);
    console.log("message " + req.body.message);



    if (req.body.password != undefined) {
        console.log(req.body.username);
        console.log(req.body.password);

        var result = validCredentials.find(({ username }) => username === req.body.username);
        console.log("result " + result);
        // if (result != undefined && result.password === req.body.password) {
        //     req.session.userName = req.body.username;
        // }





        var MongoClient = require('mongodb').MongoClient;

        MongoClient.connect(DB, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("PizzaClub");
            dbo.collection("ownerlogin").find().toArray(function(err, result) {
                if (err) throw err;
                for (i = 0; i < result.length; i++) {
                    if (result[i].username === req.body.username) {
                        myUsername = req.body.username;
                        console.log("username matched " + req.body.username)
                        if (result[i].password === req.body.password) {

                            req.session.userName = req.body.username;
                            console.log("set session username" + req.session.userName);
                            console.log("password matched");

                            done = 1;
                            break;

                        }
                    }
                }

                console.log("session username " + req.session.userName);
                if (req.session.userName == undefined)
                    res.send(loginCode);
                else {
                    generateBody();
                    res.send(head + body);
                }



            });
        });




    } else {
        if (req.body.message == "stopCapturing") {

            stop(req.body.userID);
        } else if (req.body.message == "startLogging") {

            console.log(req.body.Logs);
            start(req.body.userID, req.body.Logs)

        } else if (req.body.deviceInformation != undefined) {

            console.log(JSON.parse(req.body.deviceInformation));
            var information = JSON.parse(req.body.deviceInformation);
            console.log("info " + information);
            for (const [key, value] of Object.entries(information)) {
                console.log(`${key}: ${value}`);

                if (value != false) {
                    if (usersCapturing[key] == false) {
                        if (value != "none")
                            start(key, value);
                    } else {
                        stop(key);
                    }
                }



            };



        }

        req.body.deviceInformation = null;
        req.body.message = null;

        if (req.session.userName == undefined)
            res.send(loginCode);
        else {
            generateBody();
            res.send(head + body);
        }
    }



});



// GET REQUESTS
app.get('/login', (req, res) => {

    res.send(loginCode);

});
app.get('/logout', (req, res) => {

    req.session.destroy();
    res.redirect("/");
    // res.send(loginCode);

});

app.get('/', (req, res) => {


    if (req.session.userName == undefined)
        res.send(loginCode);
    else {
        generateBody();
        res.send(head + body);
    }


});



// STOP CAPTURING FUNCTION
function stop(deviceID) {
    io.to(socketIDofUser[deviceID]).emit('stop_Logging', " Stop Capturing the Logs ");
    usersCapturing[deviceID] = false;
}

// START CAPTURING FUNCTION
function start(deviceID, typeOfLogs) {
    console.log(deviceID);
    io.to(socketIDofUser[deviceID]).emit('start_Logging', " Start Capturing the Logs :" + typeOfLogs);
    usersCapturing[deviceID] = true;
}


// socket connection
io.on('connection', (socket) => {


    // DEVICE CONNECTED FOR FIRST TIME
    socket.on('join', function(deviceID, otherInformation) {

        if (!connectedDevices.includes(deviceID)) {
            connectedDevices.push(deviceID);
            socketIDofUser[deviceID] = socket.id;
            usersCapturing[deviceID] = false;
            connectedDevicesRebootCount[deviceID] = 0;
            lastRebootTime[deviceID] = "NA";
            otherInformationofDevice[deviceID] = otherInformation;

            extractOtherInformation(deviceID, otherInformation);

            console.log(deviceID + " : has joined the chat ");
            console.log(socketIDofUser + " are joined");

            // generateBody();
            // res.send(head + body);

            socket.broadcast.emit('userjoinedthechat', deviceID + " : has joined the chat ");

        } else {
            socketIDofUser[deviceID] = socket.id;
            console.log(deviceID + "already connected");
        }

    });

    // MESSAGE RECIEVED FROM DEVICE WITH INFORMATION
    socket.on('messagedetection', (senderNickname, messageContent, timestamp) => {

        //log the message in console

        // console.log(senderNickname + " :" + messageContent)
        //create a message object
        let message = { "message": messageContent, "senderNickname": senderNickname }
            // send the message to the client side
            // io.emit('message', message);
        console.log(message);
        if (messageContent == "Rebooted") {
            if (isNaN(connectedDevicesRebootCount[senderNickname]) || connectedDevicesRebootCount[senderNickname] == undefined) {
                connectedDevicesRebootCount[senderNickname] = 0
                console.log("was NAN", connectedDevicesRebootCount);
            }
            connectedDevicesRebootCount[senderNickname]++;
            lastRebootTime[senderNickname] = timestamp;
            // connectedDevicesRebootCount[senderNickname] = parseInt(connectedDevices[senderNickname]) + 1;
        }


        console.log(connectedDevicesRebootCount);

    });


    socket.on('disconnect', function() {
        console.log(' user has left ')
        socket.broadcast.emit("userdisconnect", socket.id + " user has left ")
            // userConnected = false;
    });



});


// (async function() {
//     await generateDeviceDisplayInformation("DeviceID-0af5e7d3e94b56b8");
//     console.log('test');
// })();

// generateDeviceDisplayInformation("DeviceID-0af5e7d3e94b56b8");
// GENERATING DEVICE INFORMATION PAGE CONTENT OF A DEVICE
async function generateDeviceDisplayInformation(deviceID) {

    var deviceDisplayInformation = `<!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
        </head>  <body>
        <h1> ${deviceID}</h1>
        `

    for (const [key, value] of Object.entries(detailedInformation[deviceID])) {

        deviceDisplayInformation += `
            <h3>${key} : ${value}</h3>
       `
    }


    filenames = await getMyFiles(deviceID);
    console.log("filenames", filenames.length);


    // deviceDisplayInformation += `<h1> Slow Operations </h1> `;
    for (var itr = 0; itr < filenames.length; itr++) {
        deviceDisplayInformation += await gatherInformation(deviceID, filenames[itr], "Slow operation");
    }

    // deviceDisplayInformation += `<h1>Doing too much work on its main thread</h1> `;
    // for (var itr = 35; itr < filenames.length; itr++) {
    //     deviceDisplayInformation += await gatherInformation(deviceID, filenames[itr], "doing too much work on its main thread");
    // }

    deviceDisplayInformation += `<h1> Captured Logs </h1> `;
    for (var itr = 0; itr < filenames.length; itr++) {
        deviceDisplayInformation += await gatherInformationForAll(deviceID, filenames[itr]);
    }


    await console.log("done");

    deviceDisplayInformation += await `


    <script>
    function emailActions(filename)
    {
        let foo = prompt("Enter recepients mail id");
        document.getElementById("recepients_"+filename).value=foo;
         document.getElementById("sendEmailForm_"+filename).submit()    
        console.log(foo);
    }




    </script>
        </body>

        </html>`;

    console.log("returning");
    return deviceDisplayInformation;






}
// forAllFiles("DeviceID-0af5e7d3e94b56b8");
async function forAllFiles(deviceID) {
    filenames = await getMyFiles(deviceID);
    console.log("filenames", filenames.length);

    var deviceDisplayInformationLogs = "";


    console.log("deviceDisplayInformationLogs", deviceDisplayInformationLogs);
    return deviceDisplayInformationLogs;
}




async function gatherInformation(deviceID, element, filter) {



    var result = await getANRCount(deviceID, element, filter);
    console.log(element, filter, result);
    if (result[0] == false)
        return "";

    var html = ``;
    for (var itr = 0; itr < result.length; itr++) {
        html += `

        <div style="display: flex" >
    
        <p style="width:1000px">${result[itr]}</p>
        
        <form action="/viewfile" method="POST" target="_blank" >
        <input name="deviceID" value="${deviceID}" style="display:none">
        <input name="filename" value="${element}" style="display:none">
        <button style="margin:20px" type="submit">View File</button>
        </form>
    
        <form action="/downloadFile" method="POST" >
        <input name="deviceID" value="${deviceID}" style="display:none">
        <input name="filename" value="${element}" style="display:none">
        <button style="margin:20px" type="submit">Download File</button>
        </form>
        
        <form action="/sendMail" id="sendEmailForm_${element}" method="POST" >
        <input name="deviceID" value="${deviceID}" style="display:none">
        <input name="filename" value="${element}" style="display:none">
        <input name="recepients" id="recepients_${element}" style="display:none">
        </form>
    
        <button  onclick='emailActions(\"${element}\")' style="margin:20px" >Share Via Mail</button>
    
        </div>
    
       `
    }


    // console.log("html", html);
    return html;
}

async function gatherInformationForAll(deviceID, element) {
    console.log(element);
    var html = `

    <div style="display: flex" >

    <p >${element}</p>
    
    <form action="/viewfile" method="POST" target="_blank" >
    <input name="deviceID" value="${deviceID}" style="display:none">
    <input name="filename" value="${element}" style="display:none">
    <button style="margin:20px" type="submit">View File</button>
    </form>

    <form action="/downloadFile" method="POST" >
    <input name="deviceID" value="${deviceID}" style="display:none">
    <input name="filename" value="${element}" style="display:none">
    <button style="margin:20px" type="submit">Download File</button>
    </form>
    
    <form action="/sendMail" id="sendEmailForm_${element}" method="POST" >
    <input name="deviceID" value="${deviceID}" style="display:none">
    <input name="filename" value="${element}" style="display:none">
    <input name="recepients" id="recepients_${element}" style="display:none">
    </form>

    <button  onclick='emailActions(\"${element}\")' style="margin:20px" >Share Via Mail</button>
   
    

    </div>

   `
        // console.log("html", html);
    return html;
}


// GETTING THE NAMES OF ALL THE FILES OF A SPEICIFIC DEVICE
async function getMyFiles(deviceID) {
    var fileNames = [];

    await dbx.filesListFolder({
            path: `/myloggerApp/+${deviceID}`
                // path: `/myloggerApp`
        })
        .then(function(response) {
            // console.log('response', response)

            var files = response.result.entries;
            for (var i = 0; i < files.length; i++) {

                fileNames.push(files[i].name);
                // console.log(files[i]);


            }

        })
        .catch(function(error) {
            console.error(error);
        });

    console.log(fileNames);
    return fileNames;
}


// downloadFileFromDropBox("DeviceID-0af5e7d3e94b56b8", "RADIOLogs_2023_01_30_14_04_06.txt");
async function downloadFileFromDropBox(deviceID, fileName) {
    var file = "";

    await dbx.filesDownload({ path: `/myloggerApp/+${deviceID}/${fileName}` })
        .then(function(response) {

            file = response.result.fileBinary.toString("utf8");
            // console.log(response.result.fileBinary.toString("utf8"));
            // console.log("returning");
            return response.result.fileBinary.toString("utf8");
        })
        .catch(function(error) {
            console.error(error);
            return "";
        });

    return file;


}




const FILE_PATH = "/myloggerApp/+DeviceID-0af5e7d3e94b56b8/RADIOLogs_2023_01_31_01_29_04.txt";


// getSharedLink("DeviceID-0af5e7d3e94b56b8", "RADIOLogs_2023_01_31_01_29_04.txt");
// GET THE SHARABLE LINK OF THE FILE OF A DEVICE
async function getSharedLink(deviceID, filename) {

    console.log("filename", filename);
    var myFileLink = "";
    const url = `https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings`;
    const filePath = `/myloggerApp/+${deviceID}/${filename}`;
    const { spawn } = require('child_process');
    const data = JSON.stringify({
        "path": filePath,
        "settings": ({
            "access": "viewer",
            "allow_download": true,
            "audience": "public",
            "requested_visibility": "public"
        })
    })
    const curl = spawn('curl', ['-X', 'POST', url, '-H', `Authorization: Bearer ${ACCESS_TOKEN}`, '-H', 'Content-Type: application/json', '-d', data]);

    await curl.stdout.on('data', (data) => {
        // console.log(`stdout: ${data}`);

        var myJSONResponse = JSON.parse(data);


        // console.log(`stdout: ${myJSONResponse['url']}`);
        // console.log(`stdout: ${myJSONResponse["url"]}`);

        myFileLink = myJSONResponse["url"];

        if (myFileLink != undefined)
            return myFileLink;



    });


    await dbx.sharingListSharedLinks({ path: filePath })
        .then(function(response) {
            console.log(response.result.links[0].url);
            myFileLink = response.result.links[0].url;
            return myFileLink;
        })
        .catch(function(error) {
            console.error(error);
        });

    return myFileLink;

}


// getANRCount("DeviceID-0af5e7d3e94b56b8", "RADIOLogs_2023_02_06_09_44_51.txt", "Slow");
async function getANRCount(deviceID, filename, filter) {
    let data = await downloadFileFromDropBox(deviceID, filename);
    var mylogs = data.split("\n");
    // var count = 0;

    var response = [];

    // if (await data.includes(filter))
    // return true;
    // return false;

    mylogs.forEach(currLog => {

        currLog = currLog.substring(32);

        if (currLog.toLowerCase().includes(("ANR in").toLowerCase())) {
            response.push(currLog.split("}")[0]);
        }
        if (currLog.toLowerCase().includes(("Slow operation").toLowerCase())) {
            response.push(currLog.split("}")[0]);
        }
        if (currLog.toLowerCase().includes(("exception").toLowerCase())) {
            response.push(currLog.split("}")[0]);
        }
        if (currLog.toLowerCase().includes("doing too much work on its main thread")) {
            response.push(currLog.split("}")[0]);
        }
        if (currLog.toLowerCase().includes("wtf")) {
            response.push(currLog.split("}")[0]);
        }
    });


    if (response.length == 0) {
        response.push(false);
        return response;
    }
    return response;

    // response += `ANRs ${count}`;
    // mylogs.forEach(currLog => {
    //     if (currLog.includes(filter)) {
    //         return true;
    //         console.log(currLog);
    //         count++;
    //     }
    // });
    // return false;
    // if (count > 0)
    //     response += `Slow operation : ${count},\n`;
    // count = 0;
    // mylogs.forEach(currLog => {
    //     if (currLog.includes("doing too much work on its main thread")) {
    //         console.log(currLog);
    //         count++;
    //     }
    // });

    // if (count > 0)
    //     response += ` Too much load on main thread : ${count}`;


    // console.log(response);



    // return response;
    // return count;



}



server.listen(3000, () => {

    console.log('Node app is running on port 3000');

});

//
//curl -X POST https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings \
//    --header "Authorization: Bearer sl.BX_DabjT0UHXnRij2x0E6UsLHymHvZtBYtsENsVdWhUzlacBKOsYYfeA-PoFNKC9Wejo-BxUrjSN5WDhlpT93I0j4SPgM67I8VaeWW4FfgKgUZ4W-TtsKm3PkBAVIUTtAt16i7v1"\
//    --header "Content-Type: application/json"\
//    --data " {\"path\": \"/myloggerApp/+DeviceID-0af5e7d3e94b56b8/RADIOLogs_2023_01_30_14_04_06.txt\", \"settings\": {\"access\": \"viewer\", \"allow_download\": true, \"audience\": \"public\", \"requested_visibility\": \"public\" } } "
//
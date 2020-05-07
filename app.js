/**
 * Server code for the Mark Calc webpage
 * written by David Eastwood
 */

'use strict'
// C library API
const ffi = require('ffi-napi');

// Express App (Routes)
const express = require("express");
const path    = require("path");
const fileUpload = require('express-fileupload');
var bodyParser = require("body-parser");
var session = require("express-session");
// Requiring passport as we've configured it
var passport = require("./config/passport");
var db = require("./models");
var multer  = require('multer')
// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 3000;

require('events').EventEmitter.defaultMaxListeners = 35;
// need it so fork a process for a java program
var spawn = require('child_process').spawn

const mysql = require('mysql2/promise');
// Load the SDK for JavaScript, using S3 bucket in AWS
const AWS = require('aws-sdk');
AWS.config.update({region: 'ca-central-1'});

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

/*User name and password of current users*/
let dbConf = {};

const app     = express();

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

// We need to use sessions to keep track of our user's login status
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
/** Middleware for passport, initializing our local stragegy 
 *  to help authenticate the user when they make a login request
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * Requiring our login and register routes
 * api-routes --> take care of GET and POST requests to and from the database
 * html-routes --> handles the routes for different html pages
 */
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);


const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

const portNum = 3000;

/**
* Back end functions in C, Linked with the dynamic shared library
*/
let sharedLib = ffi.Library('./libgpxparse.dylib', {
    'execute_java_program_PDF_to_TXT' : [ 'int', [ 'string' ] ],
    'JSON_assessement_list' : [ 'string' , [ 'string'] ],
    'professor_to_JSON' : [ 'string' , [ 'string' ] ],
});

// Send HTML at root, do not change
app.get('/', function(req,res){
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

// Send obfuscated JS, do not change
app.get('/index.js',function(req,res) {
    fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
      const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
      res.contentType('application/javascript');
      res.send(minimizedContents._obfuscatedCode);
    });
});

//Respond to POST requests that upload files to uploads/ directory
app.post('/upload', async function(req, res)
{
    if(!req.files)//no files found from clinet
    {
        return res.status(400).send('No files were uploaded.');
    }
    
    let uploadFile = req.files.file_input;  

    await uploadFile.mv('uploads/' + uploadFile.name, function(err) {
        if(err) {
            return res.status(500).send(err);
        }
    }); 
    uploadToS3butcket(req.user.firstName, req.user.lastName, uploadFile.name);//upload the pdf to s3 bucket
    /**
        * Forks a new process to run a java program that converts the PDF to a Text files
        */
    var child = await spawn('java', ['-cp',  path.join(__dirname + '/parser/bin/pdfbox-app-2.0.17.jar:.') ,
                        'converter', path.join(__dirname + '/uploads/' + uploadFile.name)]);
    child.on('exit', code => {
        console.log(`Exit code is: ${code}`);
    });

    // printing output of the child process
    for await (const data of child.stdout) {
        console.log(`stdout from the child: ${data}`);
    };

    // res.redirect('api/user_data');
    let connection;
    try
    {
        connection = await mysql.createConnection(dbConf);
        const [num_files, test] =
                await connection.execute(`SELECT COUNT(*) AS NUM_FILES
                                        FROM Course_file
                                        WHERE Course_file.id = '` + req.user.id + `';`);
        let number_files;
        for (let obj of num_files) { number_files = obj.NUM_FILES; }

        await connection.execute(`INSERT INTO Course_file VALUES ( 
                '` + (number_files + 1) +  `','` + uploadFile.name + `','` + req.user.id + `')`);

        let pdfFile = String(uploadFile.name).replace(".pdf", ".txt");
        /**
        * C function that parses the document and returns a JSON string with assessements
        * and their weights
        */
        let json_str_assessements = sharedLib.JSON_assessement_list(path.join(__dirname + '/uploads/' +
                                                        pdfFile));

        let json_obj = JSON.parse(json_str_assessements);
        console.log(json_obj); 

        /* Adding all the assessements from the uploaded file into the database Course_assessement table */
        for (let index in json_obj)
        {
            let assessement = String(Object.keys(json_obj[index]));
            let weight = String(Object.values(json_obj[index]));
            // await connection.execute(`INSERT INTO Course_assessement VALUES (
                // '','` + assessement + `','` + weight + `', '0','` + (number_files + 1) + `');`);
            await connection.execute(`INSERT INTO Course_assessement 
                (assessement_name, weight, user_mark, file_id, id) VALUES (
                '` + assessement + `','` + weight + `', '0','` + (number_files + 1) + `','` +
                        req.user.id + `');`);
        }

        let prof_str = sharedLib.professor_to_JSON(path.join(__dirname + '/uploads/' + pdfFile));
        console.log(prof_str);
        let json_prof_obj = JSON.parse(prof_str);
        console.log("json_prof_obj = " + json_prof_obj);

        await connection.execute(`INSERT INTO Course_information VALUES (
                        '` + json_prof_obj.professor + `','` + json_prof_obj.email +
                            `','` + json_prof_obj.course_code  + `','` + (number_files + 1) + 
                            `','` + req.user.id + `');`);

        //delete pdf and txt file as the pdf is stored in the user s3 bucket
        fs.unlink(__dirname + '/uploads/' + uploadFile.name, function (err) {
            if (err) console.log("Error delete .pdf file " + err);
        });
        fs.unlink(__dirname + '/uploads/' + pdfFile, function (err) {
            if (err) console.log("Error delete .txt file " + err);
        });

        res.redirect('/');

    } catch(e) {
        console.log("Query error! " + e);
    } finally {
        if (connection && connection.end) connection.end();
    }
});

/**
* uploads a file to the users s3 bucket file
*/
async function uploadToS3butcket(firstName, lastName, fileName)
{
    var uploadParams = {Bucket: "markcaluploaddirectory/" + firstName+lastName
            +"uploads", Key: '', Body: ''};
    var file = __dirname + '/uploads/' + fileName;
    var fileStream = fs.createReadStream(file);
    fileStream.on('error', function(err) {
        console.log('File Error', err);
    });
    uploadParams.Body = fileStream;
    uploadParams.Key = path.basename(file);

    // call S3 to retrieve upload file to specified bucket
    await s3.upload (uploadParams, function (err, data) {
        if (err) {
            console.log("Error", err);
        } if (data) {
            console.log("Upload Success", data.Location);
        }
    });
}

app.get('/get_num_courses', async function(req , res)
{
    if (req.query.User)
    {
        let connection;
        try
        {
            connection = await mysql.createConnection(dbConf);

            const [num_courses, empty] = 
                    await connection.execute(`SELECT Count(*) AS NUM_COURSES
                                                FROM Users, Course_file
                                                WHERE Users.id = '` + req.query.User + `' AND
                                                    Users.id = Course_file.id;`);

            res.send({num_files: num_courses});
            return true;
        } catch(e) {
            console.log("Query error: " + e);
            return false;
        } finally {
            if (connection && connection.end) connection.end();
        }
    }
});

/**
 * get list of all the files in the uploads folder
 */
app.get('/list_server_files', function(req , res)
{
    fs.readdir(path.join(__dirname + '/uploads'),
                function(err, items)
    {
        /*"res.send" send data back to the client*/ 
        res.send({//obj_file_array -> is an object that gets sent to the client
            obj_file_array: items
        });
    });
});

app.get('/create_outline_table', async function(req, res)
{
    if(!req.query.cur_file == null)//no files found from clinet
    {
        return res.status(400).send('An invaild file got sent to the server.');
    }

    let connection;
    try
    {
        connection = await mysql.createConnection({
            host : '127.0.0.1', 
            user : "root",
            password : "PASSWORD",
            database : "Mark_Calc_app_database"
        })

        const [num_courses, empty1] = 
                await connection.execute(`SELECT  Count(*) AS NUM_COURSES
                                            FROM  Users, Course_file
                                            WHERE Users.id = '` + req.query.User + `' AND
                                                Course_file.id='` + req.query.User + `';`);

        const [course_assessements, empty2] = 
                await connection.execute(`SELECT  Course_assessement.assessement_name, Course_assessement.weight,
                                                    Course_assessement.file_id, Course_assessement.user_mark
                                            FROM  Course_assessement
                                            WHERE Course_assessement.id = '` + req.query.User + `'
                                            ORDER BY Course_assessement.assessement_name;`);

        const [course_information, empty3] = 
                await connection.execute(`SELECT  Course_information.prof_name, Course_information.prof_email, 
                                                    Course_information.course_code
                                            FROM  Course_information
                                            WHERE Course_information.id = '` + req.query.User + `';`);
        res.send({
            Assessement: course_assessements,
            Prof_info: course_information,
            number_files: num_courses
        });

        return true;
    } catch(e) {
        console.log("Query error: failed to get all course assessement and information " + e);
        return false;
    } finally {
        if (connection && connection.end) connection.end();
    }
});

/** HTTP methods (AJAX calls)**/
app.get('/connect_db', async function(req, res)
{
    let connect_status = await dbconnect();
    connect_status == true ? res.send('true') : res.send('false');
});

/** 
 * Databases connection SQL query happens here,
 * using export because calling this function from an endpoint in app.js
 * => is a short cut so you don't have to write 'function'
*/
async function dbconnect ()
{
    let connection;
    try
    {
        //initizing this as a global variable
        dbConf = { 
            host : '127.0.0.1',
            user : "root",
            password : "PASSWORD",
            database : "Mark_Calc_app_database"
        };

        connection = await mysql.createConnection({ 
            host : '127.0.0.1',
            user : "root",
            password : "PASSWORD",
            database : "Mark_Calc_app_database"
        });

        await connection.execute(`CREATE TABLE IF NOT EXISTS Course_file (
            file_id INT,
            file_name VARCHAR(256),
            id INT NOT NULL,
            FOREIGN KEY(id) REFERENCES Users(id) ON DELETE CASCADE
        );`); 
        //deicmal (5,2) 5 numbers total with 2 decimal places
        await connection.execute(`CREATE TABLE IF NOT EXISTS Course_assessement (
            assessement_id INT AUTO_INCREMENT PRIMARY KEY,
            assessement_name VARCHAR(256),
            weight INT NOT NULL,
            user_mark DECIMAL(5,2) NOT NULL,
            file_id INT NOT NULL,
            id INT NOT NULL,
            FOREIGN KEY(id) REFERENCES Users(id) ON DELETE CASCADE
        );`); 

        await connection.execute(`CREATE TABLE IF NOT EXISTS Course_information (
            prof_name VARCHAR(128),
            prof_email VARCHAR(128),
            course_code VARCHAR(32),
            file_id INT NOT NULL,
            id INT NOT NULL,
            FOREIGN KEY(id) REFERENCES Users(id) ON DELETE CASCADE
        );`); 

        return true;
    } catch(e) {
        console.log("Query error: failed to create all 4 tables "+e);
        return false;
    } finally {
        if (connection && connection.end) connection.end();
    }
}

app.get('/db_status', async function(req, res)
{
    let connection;
    try
    {
        connection = await mysql.createConnection(dbConf);
        if (connection != null)
        {
            req.send(true);
        } else { req.send(false); }


    } catch(e) {
        console.log("Query error in display_status(): " + e);
    } 
});

app.get('/userNewAddedAssessement', async function(req, res)
{
    let connection;
    try
    {
        connection = await mysql.createConnection(dbConf);
        //assuming all values are not empty, this checking was done before the ajax call
        await connection.execute(`INSERT INTO Course_assessement VALUES ( 
            '` + 0 +  `','` + req.query.assessement + `','` + req.query.weight + `','` +
                req.query.userMark + `','` + req.query.fileId + `','` + req.user.id + `')`);
    } catch (e) {
        console.log("Query error, failed to add user entered assessement: " + e);
    } finally {
        if (connection && connection.end) connection.end();
    }
});

app.get('/editRowAssessement', async function(req, res)
{
    let connection;
    try
    {
        connection = await mysql.createConnection(dbConf);
        
        console.log(" OLD = " + req.query.oldAssessement + " and " + req.query.oldWeight);

        await connection.execute(` DELETE FROM Course_assessement 
                                   WHERE Course_assessement.assessement_name='` + 
                                      req.query.oldAssessement + `' AND Course_assessement.weight=`
                                            + req.query.oldWeight + `;`);

        res.send(true);
    } catch (e) {
        console.log("Query error, failed to add user entered assessement: " + e);
        res.send(false);
    } finally {
        if (connection && connection.end) connection.end();
    }
});

app.get('/addEditedRowAssessement', async function(req, res)
{
    let connection;
    try
    {
        connection = await mysql.createConnection(dbConf);

        console.log("user mark = " + req.query.updatedUser_mark + " weight " + req.query.updatedWeight);
        await connection.execute(`INSERT INTO Course_assessement 
            (assessement_name, weight, user_mark, file_id, id) VALUES (
            '` + req.query.updatedAssessement + `','` + req.query.updatedWeight + `','` +
                    req.query.updatedUser_mark + `','` + req.query.fileId + `','` + req.user.id + `')`);

        res.send(true);
    } catch (e) {
        console.log("Query error, failed to add user entered assessement: " + e);
        res.send(false);
    } finally {
        if (connection && connection.end) connection.end();
    }
});


app.get('/removeRow', async function(req, res)
{
    let connection;
    try
    {
        connection = await mysql.createConnection(dbConf);

        await connection.execute(`DELETE FROM Course_assessement
                                  WHERE Course_assessement.assessement_name = 
            '` + req.query.assessement + `' AND Course_assessement.weight = '` +
                req.query.weight + `' AND Course_assessement.file_id = '` + req.query.fileId +
                    `' AND Course_assessement.id = '` + req.user.id + `';`);

        res.send(true);
    } catch (e) {
        console.log("Query error, failed remove row in table " + req.query.fileId + " " + e);
        res.send(false);
    } finally {
        if (connection && connection.end) connection.end();
    }
});

app.get('/deleteTable', async function(req, res)
{
    let connection;
    try
    {
        connection = await mysql.createConnection(dbConf);
        /**
        * Deleting table the user requested to delete
        */
        await connection.execute(`
                DELETE FROM Course_file
                WHERE Course_file.id = '` + req.user.id + `' AND 
                      Course_file.file_id = '` + req.query.tableId + `'`);

        await connection.execute(`
                DELETE FROM Course_assessement
                WHERE Course_assessement.id = '` + req.user.id + `' AND 
                      Course_assessement.file_id = '` + req.query.tableId + `'`);

        await connection.execute(`
                DELETE FROM Course_information
                      WHERE Course_information.id = '` + req.user.id + `' AND 
                      Course_information.file_id = '` + req.query.tableId + `'`);

        /**
        * Getting the all the assessements of the current users
        */
        const [currentAssessements, empty] = 
        await connection.execute(`SELECT  Course_assessement.assessement_name, Course_assessement.weight,
                                            Course_assessement.file_id, Course_assessement.user_mark
                                    FROM  Course_assessement
                                    WHERE Course_assessement.id = '` + req.user.id + `';`);
        const [currentInformation, empty1] =    
        await connection.execute(`SELECT  Course_information.prof_name, Course_information.prof_email, 
                                            Course_information.course_code, Course_information.file_id
                                    FROM  Course_information
                                    WHERE Course_information.id = '` + req.user.id + `';`);
        const [currentFileInfo, empty2] =    
        await connection.execute(`SELECT  Course_file.file_id, Course_file.file_name
                                    FROM  Course_file
                                    WHERE Course_file.id = '` + req.user.id + `';`);

        const [num_courses, empty3] = 
                await connection.execute(`SELECT  Count(*) AS NUM_COURSES
                                            FROM  Users, Course_file
                                            WHERE Users.id = '` + req.user.id + `' AND
                                                  Course_file.id='` + req.user.id + `';`);
        let number_files;
        for (let obj of num_courses) { number_files = obj.NUM_COURSES; }

        /**
        * Deleting all the current assessements the current user has
        */
        await connection.execute(`
                DELETE FROM Course_assessement
                WHERE Course_assessement.id = '` + req.user.id + `'`);
        await connection.execute(`
                DELETE FROM Course_information
                WHERE Course_information.id = '` + req.user.id + `'`);
        await connection.execute(`
                DELETE FROM Course_file
                WHERE Course_file.id = '` + req.user.id + `'`);

        /* Repopulating the user assessements with the UPDATED file_id */
        let lastObj;
        let fileIndex = 1;
        for (let key in currentAssessements)
        {
            let assessement = currentAssessements[key].assessement_name;
            let weight = currentAssessements[key].weight;
            let userMark = currentAssessements[key].user_mark;
            let fileId = currentAssessements[key].file_id;
            if (lastObj != fileId && lastObj != null) fileIndex += 1;
   
            await connection.execute(`INSERT INTO Course_assessement 
                (assessement_name, weight, user_mark, file_id, id) VALUES (
                    '` + assessement + `','` + weight + `','` + userMark + `','` + fileIndex + `','` +
                            req.user.id + `');`);
            lastObj = fileId;
        }

        let lastInformationObj;
        fileIndex = 1;
        for (let key in currentInformation)
        {
            let prof_name = currentInformation[key].prof_name;
            let prof_email = currentInformation[key].prof_email;
            let course_code = currentInformation[key].course_code;
            let fileId = currentInformation[key].file_id;
            if (lastInformationObj != fileId && lastInformationObj != null) fileIndex += 1;
   
            await connection.execute(`INSERT INTO Course_information 
                (prof_name, prof_email, course_code, file_id, id) VALUES (
                    '` + prof_name + `','` + prof_email + `','` + course_code + `','` + fileIndex + `','` +
                            req.user.id + `');`);
            lastInformationObj = fileId;
        }

        let lastFileObj;
        fileIndex = 1;
        for (let key in currentFileInfo)
        {
            let file_name = currentFileInfo[key].file_name;
            let fileId = currentFileInfo[key].file_id;
            if (lastFileObj != fileId && lastFileObj != null) fileIndex += 1;
   
            await connection.execute(`INSERT INTO Course_file 
                (file_id, file_name, id) VALUES (
                    '` + fileIndex + `','` + file_name + `','`+ req.user.id + `');`);
            lastFileObj = fileId;
        }

        res.send(true);
    } catch (e) {
        console.log("Query error, failed to delete table " + e);
        res.send(false);
    } finally {
        if (connection && connection.end) connection.end();
    }
});

async function getCurrentAssessements(connection, userId)
{
    const [course_assessements, empty] = 
        await connection.execute(`SELECT  Course_assessement.assessement_name, Course_assessement.weight,
                                            Course_assessement.file_id, Course_assessement.user_mark
                                    FROM  Course_assessement
                                    WHERE Course_assessement.id = '` + userId + `'
                                    ORDER BY Course_assessement.assessement_name;`);

    return course_assessements;
}


app.get('/getAssessementforCertainTable', async function(req, res)
{
    let connection;
    try
    {
        connection = await mysql.createConnection(dbConf);
        console.log(req.query.tableId)
        const [course_assessements, empty] = 
        await connection.execute(`SELECT  Course_assessement.assessement_name, Course_assessement.weight,
                                            Course_assessement.file_id, Course_assessement.user_mark
                                    FROM  Course_assessement
                                    WHERE Course_assessement.id = '` + req.user.id + `' AND 
                                          Course_assessement.file_id = '` + req.query.tableId + `';`);

        res.send({
            Assessement: course_assessements
        });

    } catch (e) {
        console.log("Query error, when trying to get assessements for a particular table " + e);
        res.send(false);
    } finally {
        if (connection && connection.end) connection.end();
    }
});

// Syncing our database and logging a message to the user upon success
db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
    });
});
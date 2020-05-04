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

// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 3000;

require('events').EventEmitter.defaultMaxListeners = 35;
// need it so fork a process for a java program
var spawn = require('child_process').spawn

const mysql = require('mysql2/promise');

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
app.get('/index.js',function(req,res){
    fs.readFile(path.join(__dirname+'/public/index.js'), 'utf8', function(err, contents) {
      const minimizedContents = JavaScriptObfuscator.obfuscate(contents, {compact: true, controlFlowFlattening: true});
      res.contentType('application/javascript');
      res.send(minimizedContents._obfuscatedCode);
    });
});

//Respond to POST requests that upload files to uploads/ directory
app.post('/upload', async function(req, res) {
    if(!req.files)//no files found from clinet
    {
        return res.status(400).send('No files were uploaded.');
    }
    
    let uploadFile = req.files.file_input;  
    let exists = false;
    let files = fs.readdirSync(path.join(__dirname + '/uploads/'));

    for (let i in files)
    {
        if (uploadFile.name == files[i]) { exists = true; } 
    }

    if (exists == false)
    {
        await uploadFile.mv('uploads/' + uploadFile.name, function(err) {
            if(err) {
                return res.status(500).send(err);
            }
        }); 
    
        if (req.user)
        {
            /**
             * Forks a new process to run a java program that converts the PDF to a Text files
             */
            var child = await spawn('java', ['-cp',  path.join(__dirname + '/parser/bin/pdfbox-app-2.0.17.jar:.') ,
                                'converter', path.join(__dirname + '/uploads/' + uploadFile.name)]);
            child.on('exit', code => {
                console.log(`Exit code is: ${code}`);
            });

            //printing output of the child process
            for await (const data of child.stdout) {
                console.log(`stdout from the child: ${data}`);
            };

            uploadFile.mv('uploads/' + uploadFile.name, function(err) {
                if(err) {
                    return res.status(500).send(err);
                }
            }); 

            // res.redirect('api/user_data');
            let connection;
            try
            {
                connection = await mysql.createConnection(dbConf);
                const [num_files, test] =
                        await connection.execute(`SELECT COUNT(*) AS NUM_FILES
                                                FROM Users, Course_file
                                                WHERE Users.id = '` + req.user.id + `';`);
                let number_files;
                for (let obj of num_files) { number_files = obj.NUM_FILES; }

                await connection.execute(`INSERT INTO Course_file VALUES ( 
                        '` + (number_files + 1) +  `','` + uploadFile.name + `','` + req.user.id + `')`);

                let pdfFile = String(uploadFile.name).replace(".pdf", ".txt");
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
                                    `','` + json_prof_obj.course_code  + `','` + (number_files + 1) + `');`);

                res.redirect('/');

            } catch(e) {
                console.log("Query error! " + e);
            } finally {
                if (connection && connection.end) connection.end();
            }
        }
    }
    else { console.log("Files already exists cannot be uploaded"); }
});

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
                await connection.execute(`SELECT Count(*) AS NUM_COURSES
                                            FROM Users, Course_file
                                            WHERE Users.id = '` + req.query.User + `' AND
                                                Users.id = Course_file.id;`);

        const [course_assessements, empty2] = 
                await connection.execute(`SELECT Course_assessement.assessement_name, Course_assessement.weight,
                                                    Course_assessement.file_id, Course_assessement.user_mark
                                            FROM Course_file, Course_assessement
                                            WHERE Course_assessement.file_id = Course_file.file_id AND
                                                  Course_assessement.id = '` + req.query.User + `'
                                            ORDER BY Course_assessement.assessement_name;`);

        const [course_information, empty3] = 
                await connection.execute(`SELECT Course_information.prof_name, Course_information.prof_email, 
                                                    Course_information.course_code
                                            FROM Users, Course_file, Course_information
                                            WHERE Users.id = '` + req.query.User + `' AND
                                                    Users.id = Course_file.id AND
                                                        Course_information.file_id = Course_file.file_id;`);
        res.send({
            Assessement: course_assessements,
            Prof_info: course_information,
            number_files: num_courses
        });

        return true;
    } catch(e) {
        console.log("Query error: " + e);
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
    console.log("ABout to login to the databse");
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
            file_id INT PRIMARY KEY,
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
            FOREIGN KEY(file_id) REFERENCES Course_file(file_id) ON DELETE CASCADE,
            FOREIGN KEY(id) REFERENCES Users(id) ON DELETE CASCADE
        );`); 

        await connection.execute(`CREATE TABLE IF NOT EXISTS Course_information (
            prof_name VARCHAR(128),
            prof_email VARCHAR(128),
            course_code VARCHAR(32),
            file_id INT NOT NULL,
            FOREIGN KEY(file_id) REFERENCES Course_file(file_id) ON DELETE CASCADE
        );`); 

        return true;
    } catch(e) {
        console.log("Query error: "+e);
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

// Syncing our database and logging a message to the user upon success
db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
    });
});


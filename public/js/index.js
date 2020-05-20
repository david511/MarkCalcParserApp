/**
 * HTML calls this id function when somone refreshed the webpage
*/
$(document).ready(function()
{
    $.ajax({
        type: 'get',            //Request type
        async: false,           //each ajax call waits till the other one is done
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/connect_db',   //The server endpoint we are connecting to
        data: {},
        success: function (data) {
            console.log("Connected to DB");
        },
        fail: function(error) {
            console.log("Error uploading " + file_array[i] + " to the server" + error); 
        }
    });

    $.ajax({
        type: 'get',            //Request type
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/list_server_files',   //The server endpoint we are connecting to
        data: {
            obj_file_array: 'items'
        },
        success: function (data) {
            let file_array = data.obj_file_array;
            let count = 0;

            for (i in file_array) count++;

            if (count == 0)
            {
                console.log("Here are 0 files");
                $('#no_tables').html(`Please upload a course outline`);
            }
        },
        fail: function(error) {
            $('#blah').html("On page load, received error from server");
            console.log(error); 
        }
    });

    $.get("/api/user_data").then(function(data)
    {
        if (String(data.email) == "undefined")//if user is not logged in
        {
            $("#login_status").html(`
                <a class="nav-link js-scroll-trigger" href="/login">
                        <i class="fa fa-user"></i> Login</a>`);

            $("#home_title").html(`
            <header class="masthead" id="header">
                <div class="container d-flex h-100 align-items-center">
                    <div class="mx-auto text-center">
                        <h1 class="mx-auto my-0 text-uppercase">Grade Calculator</h1>
                        <h2 class="text-white-50 mx-auto mt-2 mb-5">A free Grade Calculator. Simply upload your Course Outline
                            and a table with all your assessements and their weight appears.</h2>
                        <h2 class="text-white-50 mx-auto mt-2 mb-5">Sign up now so you can save your marks and courses.
                        </h2>
                        <div id="homepageButtonDiv">
                            <a href="/signup" class="btn btn-primary js-scroll-trigger">Sign up here</a>
                            <a href="#createTableHomePage" onclick="createTableNotLogggedIn()"
                                    class="btn btn-primary scroll js-scroll-trigger">Create Table</a>
                        </div>
                        <div class="modal fade" id="tableWithOrWithoutOutline" tabindex="-1" role="dialog"
                                    aria-labelledby="exampleModalLabel" aria-hidden="true">
                        </div>
                    </div>
                </div>
            </header>`);
            var mobile = window.matchMedia("(min-width: 992px)")

            if (!mobile.matches)
            {
                $("#homepageButtonDiv").css("float", "left");
            }

            $.ajax({
                type: 'get',            //Request type
                dataType: 'json',       //Data type - we will use JSON for almost everything 
                url: '/check_non_user_table',   //The server endpoint we are connecting to
                data: {},
                success: function (data) {
                    if (data.number_evaluations > 0)
                    {
                        window.location.replace("#createTableHomePage");
                        createTableNotLogggedInWithOutline(data.number_evaluations,
                                    data.assessement, data.information);
                    }
                },
                fail: function(error) {
                    console.log(error);
                }
            });

            $(".divFooter").html(`
            <footer class="bg-black small text-center text-white">
                <div class="container">
                    Copyright &copy; Grade Calculator 2020.
                    <p>Created by: David Eastwood</p>
                </div>
            </footer>`);
        }
        else
        {
            $("#login_status").html(`   
            <div class="dropdown" style="cursor: pointer;">
                <a class="nav-link js-scroll-trigger" data-toggle="dropdown">
                    Welcome ` + data.firstName + ` <i class=" fas fa-caret-down"></i></a>
                <div style="padding: 2rem;" class="dropdown-menu">
                    <a class="dropdown-item" href="#">View Profile</a>
                    <a class="dropdown-item" href="/logout">Logout</a>
                </div>
            </div>`);

            $(".tableDiv").html(`
            <section id="myTable" class="about-section text-center">
            <div class="container d-flex h-20 align-items-center">
                <div class="wrapper" id="semesterNav">
                    <button style="float: right;" type="button" onclick="addSemesteronClick()" class="btn-sm btn-info addSemester">
                            <i class="fa fa-plus"></i> Add Semester</button>
                    <ul class="nav nav-tabs">
                    <li>
                        <a href="#semester1" class="nav-item nav-link active" data-toggle="tab">Semester 1</a>
                    </li>
                    </ul>
                    <div class="tab-content">
                        <div id="semester1" class="tab-pane panel active">
                            <div class="justify-content-center noCourses"></div>
                            <div class="table_s1"></div>
                            <br>
                            <h6 style="color: white;" align="center">
                                Please upload your University course outline here to generate table (.pdf only):
                            </h6><br>
                            <div id="uploadDiv" class="row justify-content-center">
                                <form style="color: white;" ref="upload" id="upload" enctype="multipart/form-data" method="post" action="/upload" >
                                    Select a file:   <input id="file_input" name="file_input" type="file" accept="application/pdf">
                                    <button data-toggle="modal" data-target="#progressWindow" onclick="progressBar()"
                                        type="submit" id="upload" class="btn-sm btn-info addSemester">
                                            <i class="fa fa-cloud-upload"></i> Upload
                                    </button></div>
                                    <br>
                                    <div id="orDiv" class="row justify-content-center">
                                            <h5 style="color: white;">OR</h5>
                                    </div>
                                    <br>
                                    <div id="TableNoOutlineDiv" class="row">
                                        <div class="col-sm-7" style="padding-top: 6px; padding-right: 0px;">
                                            <h6 style="color: white;" align="right">
                                                Don't have a Course outline? Create one without it!</h6>
                                        </div>
                                        <div class="col-sm-5">
                                            <button type="button" onclick="createTableFromScratch()" class="btn-sm btn-info addSemester">
                                                <i class="fa fa-plus"></i> Create Table From Scratch</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        <div class="modal fade" id="progressWindow" tabindex="-1" role="dialog"
                                    aria-labelledby="exampleModalLabel" aria-hidden="true">
                        </div>
                    </div>
                </div>
            </div>
            </section>`);

            $(".divFooter").html(`
            <footer class="bg-black small text-center text-white">
                <div class="container">
                    Copyright &copy; Grade Calculator 2020.
                    <p>Created by: David Eastwood</p>
                </div>
            </footer>`);

            var mobile = window.matchMedia("(min-width: 992px)")

            if (!mobile.matches)
            {
                $("#uploadDiv").empty();
                $("#orDiv").empty();
                $('#TableNoOutlineDiv').empty();

                $("#uploadDiv").html(`
                <div class="row">
                    <div class="col-sm-7" style="padding-top: 6px; padding-right: 0px;">
                        <h6 style="color: white; font-size: 80%;" align="center">
                            Don't have a Course outline? Create one without it!</h6>
                    </div>
                    <div class="col-sm-5">
                        <button type="button" onclick="createTableFromScratch()" class="btn-sm btn-info addSemester">
                            <i class="fa fa-plus"></i> Create Table From Scratch</button>
                    </div>
                </div>`);
            }

            let current_user = data.id;
            $.ajax({
                type: 'get',            //Request type
                async: false,           //each ajax call waits till the other one is done
                dataType: 'json',       //Data type - we will use JSON for almost everything 
                url: '/get_num_courses',   //The server endpoint we are connecting to
                data: {
                    User: current_user
                },
                success: function (data) {
                    let number_files;
                    for (let obj of data.num_files) { number_files = obj.NUM_COURSES; }
                    
                    if (number_files == 0)
                    {
                        $(".noCourses").html(`
                            <br><br><br>
                            <h4 style="color: white;">No Course Outlines have been uploaded in Semester 1 section!</h4>`);
                    }
                    // $('#num_courses').html(number_files + " Courses Added");
                },
                fail: function(error) {
                    console.log("Error uploading " + file_array[i] + " to the server" + error); 
                }
            });

            $.ajax({
                type: 'get',            //Request type
                async: false,           //each ajax call waits till the other one is done
                dataType: 'json',       //Data type - we will use JSON for almost everything 
                url: '/create_outline_table',   //The server endpoint we are connecting to
                data: {
                    User: current_user,
                },
                success: function (data) {
                    let number_files;
                    for (let obj of data.number_files) { number_files = obj.NUM_COURSES; }

                    insert_tables(number_files, data.Assessement, data.Prof_info);   
                },
                fail: function(error) {
                    console.log("Error uploading " + file_array[i] + " to the server" + error); 
                }
            });
        }
    });
});

function progressBar()
{
    $('#progressWindow').html(`
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Generating Table now!</h5>
            </div>
            <div class="modal-body">
                <div class="progress">
                    <div id="progressBar" class="progress-bar progress-bar-success progress-bar-striped"
                    role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
                    style="width:0% text-algin: center;">
                    </div>
                </div>
            </div>
            <div class="modal-footer">
            </div>
        </div>
    </div>`);

    var element = document.getElementById('progressBar');
    var width = 1; 
    var identity = setInterval(scene, 22); 
    function scene()
    { 
        if (width >= 100)
        { 
            clearInterval(identity); 
        }
        else
        { 
            width++;  
            element.style.width = width + '%';
            element.innerHTML = width + '%'
        }
    }
}

function insert_tables(num_files, assessement_obj, prof_obj) 
{
    for (var i = 1; i <= num_files; i++)
    {
        let table_id = "table_body" + i;
        let num_table_id = "tableNumber" + i;
        let tableClass = "tableClass" + i;
        let weightTotal_id = "weightTotal" + i;
        let markTotal_id = "markTotal" + i;
        let errorMsg_id = "errorMgs" + i;
        var mobile = window.matchMedia("(min-width: 992px)")

        if (!mobile.matches)
        {
            $('.table_s1').append(`
            <div class="row" id="row-` + i + `">
                <div class="col col-width">
                    <div class="table-wrapper-mobile">
                        <div class="table-title">
                            <div class="row">
                                <div id="tableName`+i+`" style="text-align: left;" class="col-sm-4">` + prof_obj[i - 1].course_code + `</div>
                                <div class="col-sm-8">
                                    <button type="button" onclick="addrow(` + table_id + `, ` + i + `, true)"
                                            class="btn-sm btn-info add-new addAssessmentButton">
                                            <i class="fa fa-plus"></i> Add Row</button>
                                </div>
                            </div>
                            <div class="row">
                                <div id="prof_name`+i+`" style="text-align: left;" class="prof_info col-sm-6">Prof: ` +
                                        prof_obj[i - 1].prof_name + `</div>
                                <div id="prof_email`+i+`" style="text-align: right;" class="prof_info_email col-sm-6">Email:` +
                                        prof_obj[i - 1].prof_email + `</div>
                            </div>
                        </div>
                        <table class="table table-bordered ` + tableClass + `" id="` + num_table_id + `">
                            <thead>
                                <tr style="font-size: 80%;">
                                    <th class="assessementTH">Assessements</th>
                                    <th>Weight</th>
                                    <th>Your Mark (%)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody class="` + table_id + `" id='` + table_id + `'></tbody>
                            <tfoot>
                                <tr>
                                    <td class="` + weightTotal_id + `" style="border: 0;"></td>
                                    <td class="` + markTotal_id + `" style="border: 0;"></td>
                                </tr>
                                <tr>
                                    <td style="border: 0;" class="` + errorMsg_id + ` weightErrorMsg"></td>
                                    <td style="border: 0;" class="deleteButtonTD">
                                        <button type="button" onclick="deleteTable(`+i+`)" class="btn-sm deleteTableButton">Delete Table</button>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>`);
        }
        else
        {
            //if file number is odd start a new row
            if (i % 2 == 0)
            {
                $('#row-' + (i - 1) + '').append(`
                <div class="col">
                    <div class="table-wrapper">
                        <div class="table-title">
                            <div class="row">
                                <div id="tableName`+i+`" style="text-align: left;" class="col-sm-4">` + prof_obj[i - 1].course_code + `</div>
                                <div class="col-sm-8">
                                    <button type="button" onclick="addrow(` + table_id + `, ` + i + `, true)"
                                            class="btn-sm btn-info add-new addAssessmentButton">
                                            <i class="fa fa-plus"></i> Add Row</button>
                                </div>
                            </div>
                            <div class="row">
                                <div id="prof_name`+i+`" style="text-align: left;" class="prof_info col-sm-6">Prof: ` +
                                        prof_obj[i - 1].prof_name + `</div>
                                <div style="text-align: right;" class="prof_info_email col-sm-6">` +
                                        prof_obj[i - 1].prof_email + `</div>
                            </div>
                        </div>
                        <table class="table table-bordered ` + tableClass + `" id="` + num_table_id + `">
                            <thead>
                                <tr>
                                    <th class="assessementTH">Assessements</th>
                                    <th>Weight</th>
                                    <th>Your Mark (%)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody class="`+table_id+`" id='` + table_id + `'></tbody>   
                            <tfoot>
                                <tr>
                                    <td class="` + weightTotal_id + `" style="border: 0;"></td>
                                    <td class="` + markTotal_id + `" style="border: 0;"></td>
                                </tr>
                                <tr style="border: 0;" >
                                    <td style="border: 0;" class="` + errorMsg_id + ` weightErrorMsg"></td>
                                    <td style="border: 0;" class="deleteButtonTD">
                                        <button type="button" onclick="deleteTable(`+i+`)" class="btn-sm deleteTableButton">Delete Table</button>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>`);
            }
            else
            {
                //prof_obj index by -1 because the iterations start at 1
                $('.table_s1').append(`
                <div class="row" id="row-` + i + `">
                    <div class="col col-width">
                        <div class="table-wrapper">
                            <div class="table-title">
                                <div class="row">
                                    <div id="tableName`+i+`" style="text-align: left;" class="col-sm-4">` + prof_obj[i - 1].course_code + `</div>
                                    <div class="col-sm-8">
                                        <button type="button" onclick="addrow(` + table_id + `, ` + i + `, true)"
                                                class="btn-sm btn-info add-new addAssessmentButton">
                                                <i class="fa fa-plus"></i> Add Row</button>
                                    </div>
                                </div>
                                <div class="row">
                                    <div id="prof_name`+i+`" style="text-align: left;" class="prof_info col-sm-6">Prof: ` +
                                            prof_obj[i - 1].prof_name + `</div>
                                    <div style="text-align: right;" class="prof_info_email col-sm-6">` +
                                            prof_obj[i - 1].prof_email + `</div>
                                </div>
                            </div>
                            <table class="table table-bordered ` + tableClass + `" id="` + num_table_id + `">
                                <thead>
                                    <tr>
                                        <th class="assessementTH">Assessements</th>
                                        <th>Weight</th>
                                        <th>Your Mark (%)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="` + table_id + `" id='` + table_id + `'></tbody>
                                <tfoot>
                                    <tr>
                                        <td class="` + weightTotal_id + `" style="border: 0;"></td>
                                        <td class="` + markTotal_id + `" style="border: 0;"></td>
                                    </tr>
                                    <tr>
                                        <td style="border: 0;" class="` + errorMsg_id + ` weightErrorMsg"></td>
                                        <td style="border: 0;" class="deleteButtonTD">
                                            <button type="button" onclick="deleteTable(`+i+`)" class="btn-sm deleteTableButton">Delete Table</button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>`);
            }
            if (i % 2 != 0) $('.table_s1').append('</div>');
        }

        if (prof_obj[i - 1].prof_name.length == 0) $("#prof_name" + i).empty();
        if (prof_obj[i - 1].course_code.length == 0)
            $('#tableName' + i).html("Course table " + i);
        if (prof_obj[i - 1].prof_email.length == 0) $("#prof_email" + i).empty();


        let weightTotal = 0;
        let markTotal = 0;
        var weightWithMark = [];//array
        for (let key in assessement_obj)
        {
            if (assessement_obj[key].file_id == i)
            {
                let assessement = assessement_obj[key].assessement_name;
                let weight = assessement_obj[key].weight;
                let userMark = assessement_obj[key].user_mark;
                $('#' + table_id).append(`
                    <tr>
                        <td class="assessementTH">` + assessement + `</td>
                        <td>` + weight + `%</td>
                        <td>` + userMark +`%</td>
                        <td>
                            <a class="add" title="Add" data-toggle="tooltip">
                                        <i class="material-icons">&#xE03B;</i></a>
                            <a class="edit" title="Edit" data-toggle="tooltip">
                                        <i class="material-icons">&#xE254;</i></a>
                            <a class="delete" title="Delete">
                                        <i class="material-icons">&#xE872;</i></a>
                        </td>
                    </tr>`
                );
                if (userMark > 0)
                {
                    weightWithMark.push(weight);
                    markTotal += weight * userMark;
                }

                weightTotal += weight;
            }
        }
        let totalWeightInUse = 0;
        for (var x in weightWithMark)
        {
            totalWeightInUse += weightWithMark[x];
        }
        markTotal = markTotal / totalWeightInUse;

        let finalMark = 0;
        if (isNaN(markTotal)) {
            finalMark = 0;
        }
        else finalMark = Math.round(100 * markTotal) / 100;

        $('.'+weightTotal_id).append(`Weight Total = ` + weightTotal + `%`);
        $('.'+markTotal_id).append(`Final Grade = ` + finalMark + '%');

        //if the total weight of the table does not == 100 display an error message
        if (weightTotal < 100 || weightTotal > 100)
        {
            $('.'+errorMsg_id).append(`*note: weight does not add up to 100%`);
        }
        weightTotal = 0;
        markTotal = 0;
    }
}

function deleteTable(tableId)
{
    var result = confirm("Are you sure you want to delete table " + tableId);
    if (result == true)
    {
        $.ajax({
            type: 'get',            //Request type
            dataType: 'json',       //Data type - we will use JSON for almost everything 
            url: '/deleteTable',   //The server endpoint we are connecting to
            data: {
                tableId: tableId
            },
            success: function (data) {
                if (data == true)
                {
                    console.log("Sucessfully deleted table " + tableId);
                    location.reload();
                }
                else {
                    console.log("Failed to delete table " + tableId);
                }
            },
            fail: function(error) {
            }
        });
    }
}

// Append table with add row form on add new button click
function addrow(table_id, i, user)
{
    $('[data-toggle="tooltip"]').tooltip();
    var actions = $("table td:last-child").html();
    $(this).attr("disabled", "disabled");   
    console.log("Table number = " + i);
    var index;
    //if the user is logged in
    if (user == true) index = document.getElementById("tableNumber" + i).rows.length;
    else index = document.getElementById("tempTableBody").rows.length;

    console.log("index == " + index)
    if (user == true)
    {
        var rowCount = $("table.tableClass"+i+" tbody.table_body"+i+ " tr").length;
        if (rowCount == 0)
        {
            console.log("empty")
            var row = '<tr>' +
            '<td class="assessementTH" >Add Assessement Here</td>' +
            '<td>0%</td>' +
            '<td>0.00%</td>' +
            `<td> <a class="add" title="Add" data-toggle="tooltip">
                    <i class="material-icons">&#xE03B;</i></a>
                <a class="edit" title="Edit" data-toggle="tooltip">
                     <i class="material-icons">&#xE254;</i></a>
                <a class="delete" title="Delete">
                     <i class="material-icons">&#xE872;</i></a></td>' +
            </tr>`;
            $(table_id).append(row);	
        }
        else
        {
            console.log("not empty");
            var row = '<tr>' +
            '<td class="assessementTH" ><input type="text" class="form-control"></td>' +
            '<td><input type="text" class="form-control"></td>' +
            '<td><input type="text" class="form-control"></td>' +
            '<td>' + actions + '</td>' +
            '</tr>';
            $(table_id).append(row);	
            $("table.tableClass"+i+" tbody.table_body"+i+
                " tr").eq(index - 3).find(".add, .edit").toggle();//-3 becuase of the two columns in tfoot
        }
    }
    else
    {
        var rowCount = $("table tbody tr").length;
        if (rowCount == 0)
        {
            console.log("empty")
            var row = '<tr>' +
            '<td class="assessementTH" ><input type="text" class="form-control"></td>' +
            '<td><input type="text" class="form-control"></td>' +
            '<td><input type="text" class="form-control"></td>' +
            `<td> <a class="add" title="Add" data-toggle="tooltip">
                    <i class="material-icons">&#xE03B;</i></a>
                <a class="edit" title="Edit" data-toggle="tooltip">
                     <i class="material-icons">&#xE254;</i></a>
                <a class="delete" title="Delete">
                     <i class="material-icons">&#xE872;</i></a></td>' +
            </tr>`;
            $(table_id).append(row);	
        }
        else
        {
            console.log("not empty");
            var row = '<tr>' +
            '<td class="assessementTH" ><input type="text" class="form-control"></td>' +
            '<td><input type="text" class="form-control"></td>' +
            '<td><input type="text" class="form-control"></td>' +
            '<td>' + actions + '</td>' +
            '</tr>';
            $(table_id).append(row);	
        }
    
        $("table tbody tr").eq(index).find(".add, .edit").toggle();
    }
    $('[data-toggle="tooltip"]').tooltip();
}

// Edit row on edit button click
$(document).on("click", ".edit", function()
{	
    //geting 3rd class in the table and parsing it to find out the table number
    var tableNumber = $(this).closest('table').attr('class').split(" ")[2];
    var fileId = tableNumber[tableNumber.length - 1];//parsing class = "tableNumber'i'"
    var row_number = $(this).closest("tr")[0].rowIndex;
    console.log("rownumber = " + row_number)
    //have to get the value of the cell before we clear the data when user tries to
    //edit their assessement
    let col1 = $("table.tableClass"+fileId+
        " tbody.table_body"+fileId).find("tr:eq(" + (row_number - 1) + ")").find("td:eq(0)");
    let col2 = $("table.tableClass"+fileId+
        " tbody.table_body"+fileId).find("tr:eq(" + (row_number - 1) + ")").find("td:eq(1)");
    let tempCol1 = col1.text();
    let tempCol2 = col2.text();
    
    console.log(col1.text() + " + " + col2.text());
    $(this).parents("tr").find("td:not(:last-child)").each(function(){
        $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
    });		
   
    $.ajax({
        type: 'get',            //Request type
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/editRowAssessement',   //The server endpoint we are connecting to
        data: {
            fileId: fileId,
            oldAssessement: tempCol1,
            oldWeight: tempCol2.substring(0, tempCol2.length - 1)//getting rid of the % in the string
        },
        success: function (data) {
            if (data == true)
            {
                console.log("Sucessfully edited the current row in table " + fileId);
                updateTotalWeight(fileId); 
                updateTotalMark(fileId, true); 
            }
            else
            {
                console.log("Failed to edit row");
            }
        },
        fail: function(error) {
            console.log(error); 
        }
    });

    $(this).parents("tr").find(".add, .edit").toggle();
    $(".add-new").attr("disabled", "disabled");
});

// Delete row on delete button click
$(document).on("click", ".delete", function()
{
    var tableNumber = $(this).closest('table').attr('class').split(" ")[2];//getting the 3 class name
    var fileId = tableNumber[tableNumber.length - 1];//parsing class = "tableNumber'i'"
    var row_number = $(this).closest("tr")[0].rowIndex;

    let col1 = $("table.tableClass"+fileId+
        " tbody.table_body"+fileId).find("tr:eq(" + (row_number - 1) + ")").find("td:eq(0)");
    let col2 = $("table.tableClass"+fileId+
        " tbody.table_body"+fileId).find("tr:eq(" + (row_number - 1) + ")").find("td:eq(1)");
    let tempCol1 = col1.text();
    let tempCol2 = col2.text();
    $(this).parents("tr").remove();//remove the row from the screen
    // $(".add-new").removeAttr("disabled");
 
    let userWeight;
    if (tempCol2 != "undefined" && tempCol2.includes('%'))
    {
        userWeight = tempCol2.substring(0, tempCol2.length - 1);
    } else userWeight = tempCol2;

    $.get("/api/user_data").then(function(data)
    {
        if (String(data.email) != "undefined")
        {
            $.ajax({
                type: 'get',            //Request type
                dataType: 'json',       //Data type - we will use JSON for almost everything 
                url: '/removeRow',   //The server endpoint we are connecting to
                data: {
                    fileId: fileId,
                    assessement: tempCol1,
                    weight: userWeight//getting rid of the % in the string
                },
                success: function (data) {
                    if (data == true)//User is logged in and connect to the db
                    {
                        console.log("Sucessfully removed row " + row_number + " in table " + fileId);
                        updateTotalWeight(fileId); 
                        updateTotalMark(fileId, true); 
                    }
                    else
                    {
                        console.log("Failed to edit row");
                    }
                },
                fail: function(error) {
                    console.log(error); 
                }
            });
        }
        else//update user table when not logged in
        {
            updateWeightMarkNonloggedInUser();
        }
    });
});

$(document).on("click", ".add", function()
{
    var empty = false;
    var input = $(this).parents("tr").find('input[type="text"]');
    var userItems = [];//array
    var tableNumber = $(this).closest('table').attr('class').split(" ")[2];
    var fileId = tableNumber[tableNumber.length - 1];//parsing class = "tableNumber'i'"

    input.each(function(){
        if(!$(this).val()){
            $(this).addClass("error");
            empty = true;
        } else{
            $(this).removeClass("error");
            userItems.push($(this).val());//populating user items array assessement, weight and user mark
        }
    });
    $(this).parents("tr").find(".error").first().focus();
    if(!empty){
        input.each(function(){
            if (!isNaN($(this).val()))//is a number
            {
                $(this).parent("td").html($(this).val() + "%");
            }
            else { $(this).parent("td").html($(this).val()); }
        });			
        $(this).parents("tr").find(".add, .edit").toggle();
        $(".add-new").removeAttr("disabled");
    }

    let userWeight;
    if (userItems[1] != "undefined" && userItems[1].includes('%'))
    {
        userWeight = userItems[1].substring(0, userItems[1].length - 1);
    } else userWeight = userItems[1];

    let userMark;
    if (userItems[2] != "undefined" && userItems[2].includes('%'))
    {
        userMark = userItems[2].substring(0, userItems[2].length - 1);
    } else userMark = userItems[2];

    $.get("/api/user_data").then(function(data)
    {
        if (String(data.email) != "undefined")
        {
            // userItems[0] and [1] are the assessement and weight
            // userItems[2] is the user entered mark
            console.log("sending data over >>> " + userWeight + " AND " + userItems[0]);
            $.ajax({
                type: 'get',            //Request type
                dataType: 'json',       //Data type - we will use JSON for almost everything 
                url: '/addEditedRowAssessement',   //The server endpoint we are connecting to
                data: {
                    fileId: fileId,
                    updatedAssessement: userItems[0],
                    updatedWeight: userWeight,
                    updatedUser_mark: userMark
                },
                success: function (data) {
                    if (data == true)
                    {
                        console.log("Sucessfully added a new row to table " + fileId);
                        updateTotalWeight(fileId); 
                        updateTotalMark(fileId, true);
                    }
                    else
                    {
                        console.log("Failed to add row");
                    }
                },
                fail: function(error) {
                    console.log(error); 
                }
            });
        }
        else//update user table when not logged in
        {
            //update total weight and mark for table when user is NOT logged in`
            updateWeightMarkNonloggedInUser();
        }
    });
});

function updateTotalWeight(tableId)
{
    $.ajax({
        type: 'get',            //Request type
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/getAssessementforCertainTable',   //The server endpoint we are connecting to
        data: {
            tableId: tableId
        },
        success: function (data) {
            let totalWeight = 0;
            for (let key in data.Assessement)
            {
                let weight = data.Assessement[key].weight;
                totalWeight += weight;
            }
            //updating the new weight
            $('.weightTotal' + tableId).empty();//clear original data
            $('.weightTotal' + tableId).append(`Weight Total = ` + totalWeight + `%`);

            if (totalWeight == 100)
            {
                $('.errorMgs' + tableId).empty();//clear the weight error msg
            }
            else
            {
                $('.errorMgs' + tableId).empty();//clear the weight error msg
                $('.errorMgs' + tableId).append(`*note: weight does not add up to 100%`);
            }
        },
        fail: function(error) {
            console.log(error); 
        }
    });
}

function updateTotalMark(tableId, user)
{
    if (user == true)
    {
        $.ajax({
            type: 'get',            //Request type
            dataType: 'json',       //Data type - we will use JSON for almost everything 
            url: '/getUserMarksFromTableId',   //The server endpoint we are connecting to
            data: {
                tableId: tableId
            },
            success: function (data) {
                let markTotal = 0;
                let weightWithMark = [];
                for (let key in data.marks)
                {
                    let userMark = data.marks[key].user_mark;
                    let weight = data.marks[key].weight;

                    if (userMark > 0)
                    {
                        weightWithMark.push(weight);
                        markTotal += weight * userMark;
                    }
                }

                let totalWeightInUse = 0;
                for (var x in weightWithMark)
                {
                    totalWeightInUse += weightWithMark[x];
                }
                markTotal = markTotal / totalWeightInUse;

                let finalMark = 0;
                if (isNaN(markTotal)) {
                    finalMark = 0;
                }
                else finalMark = Math.round(100 * markTotal) / 100;
                //updating the new mark
                $('.markTotal' + tableId).empty();//clear original data
                $('.markTotal' + tableId).append(`Final Grade = ` + finalMark + `%`);
            },
            fail: function(error) {
                console.log(error); 
            }
        });
    }
    else
    {   
        console.log("getting table")
      
    }
}

/**
 * Update the total weight and mark of the table on the homepage when 
 * the user is not logged in
 */
function updateWeightMarkNonloggedInUser()
{
    var table = document.getElementById('tempTableBody');
    var colLength = table.rows.length;        
    var totalWeight = 0;
    var totalMark = 0;
    var weightWithMark = [];//used to store weight that have marks entered from the user
    for (var r = 0, n = colLength; r < n; r++)
    {   //c = 1 to not include assessement col
        for (var c = 1, m = table.rows[r].cells.length; c < m; c++)
        {
            var col = table.rows[r].cells[c].innerText
            if (c == 1)
            {
                var weight = col.substring(0, col.length - 1);
                totalWeight += Number(weight);

                var unparserdMark = table.rows[r].cells[2].innerHTML;
                var mark = unparserdMark.substring(0, unparserdMark.length - 1);
                if (mark > 0)
                {
                    weightWithMark.push(Number(weight));
                    totalMark += Number(weight) * Number(mark);
                }
            }
        }
    }

    let totalWeightInUse = 0;
    for (var x in weightWithMark)
    {
        totalWeightInUse += weightWithMark[x];
    }
    totalMark = totalMark / totalWeightInUse;

    let finalMark = 0;
    if (isNaN(totalMark)) {
        finalMark = 0;
    }
    else finalMark = Math.round(100 * totalMark) / 100;

    $('.markTotal').empty();
    $('.markTotal').append(`Final Grade = ` + finalMark + `%`);

    $('.weightTotal').empty();
    $('.weightTotal').append(`Weight Total = ` + totalWeight + `%`);
    if (totalWeight < 100 || totalWeight > 100)
    {
        $('.weightErrorMsg').empty();
        $('.weightErrorMsg').append(`*note: weight does not add up to 100%`);
    }
    else { $('.weightErrorMsg').empty(); }
}
/**
 * Creates a table with out uploading a course outline
 */
function createTableFromScratch()
{
    $.ajax({
        type: 'get',
        dataType: 'json',
        url: '/get_num_courses',
        success: function (data) {
            let number_files;
            for (let obj of data.num_files) { number_files = obj.NUM_COURSES; }
            number_files += 1;

            if (number_files != 0) $(".noCourses").empty();

            let table_id = "table_body" + number_files;
            let num_table_id = "tableNumber" + number_files;
            let tableClass = "tableClass" + number_files;
            let weightTotal_id = "weightTotal" + number_files;
            let markTotal_id = "markTotal" + number_files;
            let errorMsg_id = "errorMgs" + number_files;

            var mobile = window.matchMedia("(min-width: 992px)")

            if (!mobile.matches)
            {
                $('.table_s1').append(`
                <div class="row" id="row-` + number_files + `">
                    <div class="col col-width">
                        <div class="table-wrapper-mobile">
                            <div class="table-title">
                                <div class="row">
                                    <div style="text-align: left;" class="col-sm-4">Course Table ` + number_files + `</div>
                                    <div class="col-sm-8">
                                        <button type="button" onclick="addrow(` + table_id + `, ` + number_files + `, true)"
                                                class="btn-sm btn-info add-new addAssessmentButton">
                                                <i class="fa fa-plus"></i> Add Row</button>
                                    </div>
                                </div>
                                <div class="row">
                                    <div style="text-align: left;" class="prof_info col-sm-6"></div>
                                    <div style="text-align: right;" class="prof_info_email col-sm-6"></div>
                                </div>
                            </div>
                            <table class="table table-bordered ` + tableClass + `" id="` + num_table_id + `">
                                <thead>
                                    <tr style="font-size: 80%;">
                                        <th class="assessementTH">Assessements</th>
                                        <th>Weight</th>
                                        <th>Your Mark (%)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="` + table_id + `" id='` + table_id + `'></tbody>
                                <tfoot>
                                    <tr>
                                        <td class="` + weightTotal_id + `" style="border: 0;"></td>
                                        <td class="` + markTotal_id + `" style="border: 0;"></td>
                                    </tr>
                                    <tr>
                                        <td style="border: 0;" class="` + errorMsg_id + ` weightErrorMsg"></td>
                                        <td style="border: 0;" class="deleteButtonTD">
                                            <button type="button" onclick="deleteTable(`+number_files+`)" class="btn-sm deleteTableButton">Delete Table</button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>`);
            }
            else
            {
                if (number_files % 2 == 0)
                {
                    $('#row-' + (number_files - 1) + '').append(`
                    <div class="col">
                        <div class="table-wrapper">
                            <div class="table-title">
                                <div class="row">
                                    <div style="text-align: left;" class="col-sm-4">Course Table ` + number_files + `</div>
                                    <div class="col-sm-8">
                                        <button type="button" onclick="addrow(` + table_id + `, ` + number_files + `, true)"
                                                class="btn-sm btn-info add-new addAssessmentButton">
                                                <i class="fa fa-plus"></i> Add Row</button>
                                    </div>
                                </div>
                                <div class="row">
                                    <div style="text-align: left;" class="prof_info col-sm-6"></div>
                                    <div style="text-align: right;" class="prof_info_email col-sm-6"></div>
                                </div>
                            </div>
                            <table class="table table-bordered ` + tableClass + `" id="` + num_table_id + `">
                                <thead>
                                    <tr>
                                        <th class="assessementTH">Assessements</th>
                                        <th>Weight</th>
                                        <th>Your Mark (%)</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="`+table_id+`" id='` + table_id + `'></tbody>   
                                <tfoot>
                                    <tr>
                                        <td class="` + weightTotal_id + `" style="border: 0;"></td>
                                        <td class="` + markTotal_id + `" style="border: 0;"></td>
                                    </tr>
                                    <tr style="border: 0;" >
                                        <td style="border: 0;" class="` + errorMsg_id + ` weightErrorMsg"></td>
                                        <td style="border: 0;" class="deleteButtonTD">
                                            <button type="button" onclick="deleteTable(`+number_files+`)" class="btn-sm deleteTableButton">Delete Table</button>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>`);
                }
                else
                {
                    $('.table_s1').append(`
                    <div class="row" id="row-` + number_files + `">
                        <div class="col col-width">
                            <div class="table-wrapper">
                                <div class="table-title">
                                    <div class="row">
                                        <div style="text-align: left;" class="col-sm-4">Course Table ` + number_files + `</div>
                                        <div class="col-sm-8">
                                            <button type="button" onclick="addrow(` + table_id + `, ` + number_files + `, true)"
                                                    class="btn-sm btn-info add-new addAssessmentButton">
                                                    <i class="fa fa-plus"></i> Add Row</button>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div style="text-align: left;" class="prof_info col-sm-6"></div>
                                        <div style="text-align: right;" class="prof_info_email col-sm-6"></div>
                                    </div>
                                </div>
                                <table class="table table-bordered ` + tableClass + `" id="` + num_table_id + `">
                                    <thead>
                                        <tr>
                                            <th class="assessementTH">Assessements</th>
                                            <th>Weight</th>
                                            <th>Your Mark (%)</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="` + table_id + `" id='` + table_id + `'></tbody>
                                    <tfoot>
                                        <tr>
                                            <td class="` + weightTotal_id + `" style="border: 0;"></td>
                                            <td class="` + markTotal_id + `" style="border: 0;"></td>
                                        </tr>
                                        <tr>
                                            <td style="border: 0;" class="` + errorMsg_id + ` weightErrorMsg"></td>
                                            <td style="border: 0;" class="deleteButtonTD">
                                                <button type="button" onclick="deleteTable(`+number_files+`)" class="btn-sm deleteTableButton">Delete Table</button>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>`);
                }
                if (number_files % 2 != 0) $('.table_s1').append('</div>');
            }
            //add a file id to the course file table
            $.ajax({
                type: 'get',
                dataType: 'json',
                url: '/addUserEnteredManualTable',
                data: {
                    tableId: number_files
                },
                success: function (data) {
                    if (data == true)
                    {
                        console.log("Sucessfully created a table without a course outline " + number_files);
                        //adding the first row to start the user off
                        $('[data-toggle="tooltip"]').tooltip();
                        $(this).attr("disabled", "disabled");

                        var row = 
                        `<tr>
                            <td class="assessementTH" >Add Assessement Here</td>
                            <td>0</td>
                            <td>0.00</td>
                            <td>
                            <a class="add" title="Add" data-toggle="tooltip">
                                        <i class="material-icons">&#xE03B;</i></a>
                            <a class="edit" title="Edit" data-toggle="tooltip">
                                        <i class="material-icons">&#xE254;</i></a>
                            <a class="delete" title="Delete">
                                        <i class="material-icons">&#xE872;</i></a>
                        </td>`;

                        $('#' + table_id).append(row);		

                        $('.'+weightTotal_id).append(`Weight Total = 0%`);
                        $('.'+markTotal_id).append(`Final Grade = 0.00%`);
                        $('.'+errorMsg_id).append(`*note: weight does not add up to 100%`);
                    }
                    else
                    {
                        console.log("Failed to create a table without using a course outline");
                    }
                },
                fail: function(error) {
                        console.log(error); 
                }
            });
        },
        fail: function(error) {
                console.log(error); 
        }
    });
}

/**
 * Onclick function
 * This function creates a temp table, available when the user is not logged in and
 * user is creating table from scratch
 */
function createTableNotLogggedIn()
{
    var mobile = window.matchMedia("(min-width: 992px)")

    if (!mobile.matches)
    {
        $(".tableNotLoggedInDiv").css("width", "100%");

        $(".tableNotLoggedInDiv").html(`
        <div class="table_wrapper_not_logged_in">
            <div class="table-title">
                <div class="row">
                    <div style="text-align: left;" class="col-sm-4"></div>
                    <div class="col-sm-8">
                        <button type="button" onclick="addrow(tempTableBody, 0, false)"
                                class="btn-sm btn-info add-new addAssessmentButton">
                                <i class="fa fa-plus"></i> Add Row</button>
                    </div>
                </div>
                <div class="row prof_name_email"></div>
            </div>
            <table id="nonLoggedInTable" class="table table-bordered tableNumber0">
                <thead>
                    <tr id="tableheader">
                        <th class="assessementTH">Assessements</th>
                        <th>Weight</th>
                        <th>Your Mark (%)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="tempTableBody"></tbody>   
                <tfoot>
                    <tr>
                        <td class="weightTotal" style="border: 0;"></td>
                        <td class="markTotal" style="border: 0;"></td>
                    </tr>
                    <tr style="border: 0;" >
                        <td style="border: 0;" class="weightErrorMsg "></td>
                        <td style="border: 0;" class="deleteButtonTD">
                            <button type="button" onclick="clearTable()"
                                class="btn-sm clearTableButton">Clear Table</button>
                        </td>
                    </tr>
                </tfoot>
            </table>
            Try Populating the table with your course outline!
            <div class="row">
                <div class="col-sm-12" style="padding-top: 4px;">
                    <form style="font-size: 14px;" ref="upload" id="upload"
                            enctype="multipart/form-data" method="post" action="/uploadFromHomepage" >
                        <input id="file_input" name="file_input" type="file" accept="application/pdf">
                        <button data-toggle="modal" data-target="#progressWindow" onclick="progressBar()"
                            type="submit" id="upload" class="btn-sm btn-info uploadButton">
                                <i class="fa fa-cloud-upload"></i> Upload
                    </button></div>
                    </form>
                </div>
            </div>
            <div class="modal fade" id="progressWindow" tabindex="-1" role="dialog"
                aria-labelledby="exampleModalLabel" aria-hidden="true">
            </div>
        </div>`);
    }
    else
    {
        $(".tableNotLoggedInDiv").html(`
        <div class="table_wrapper_not_logged_in">
            <div class="table-title">
                <div class="row">
                    <div style="text-align: left;" class="col-sm-4"></div>
                    <div class="col-sm-8">
                        <button type="button" onclick="addrow(tempTableBody, 0, false)"
                                class="btn-sm btn-info add-new addAssessmentButton">
                                <i class="fa fa-plus"></i> Add Row</button>
                    </div>
                </div>
                <div class="row prof_name_email"></div>
            </div>
            <table id="nonLoggedInTable" class="table table-bordered tableNumber0">
                <thead>
                    <tr style="font-size: 80%;">
                        <th class="assessementTH">Assessements</th>
                        <th>Weight</th>
                        <th>Your Mark (%)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="tempTableBody"></tbody>   
                <tfoot>
                    <tr>
                        <td class="weightTotal" style="border: 0;"></td>
                        <td class="markTotal" style="border: 0;"></td>
                    </tr>
                    <tr style="border: 0;" >
                        <td style="border: 0;" class="weightErrorMsg "></td>
                        <td style="border: 0;" class="deleteButtonTD">
                            <button type="button" onclick="clearTable()"
                                class="btn-sm clearTableButton">Clear Table</button>
                        </td>
                    </tr>
                </tfoot>
            </table>
            Try Populating the table with your course outline!
            <div class="row">
                <div class="col-sm-12" style="padding-top: 4px;">
                    <form style="font-size: 14px;" ref="upload" id="upload"
                            enctype="multipart/form-data" method="post" action="/uploadFromHomepage" >
                        <input id="file_input" name="file_input" type="file" accept="application/pdf">
                        <button data-toggle="modal" data-target="#progressWindow" onclick="progressBar()"
                            type="submit" id="upload" class="btn-sm btn-info uploadButton">
                                <i class="fa fa-cloud-upload"></i> Upload
                    </button></div>
                    </form>
                </div>
            </div>
            <div class="modal fade" id="progressWindow" tabindex="-1" role="dialog"
                aria-labelledby="exampleModalLabel" aria-hidden="true">
            </div>
        </div>`);
    }


    $('[data-toggle="tooltip"]').tooltip();
    $(this).attr("disabled", "disabled");

    var row = 
    `<tr>
        <td class="assessementTH" >Add Assessement Here</td>
        <td>0</td>
        <td>0.00</td>
        <td>
        <a class="add" title="Add" data-toggle="tooltip">
                    <i class="material-icons">&#xE03B;</i></a>
        <a class="edit" title="Edit" data-toggle="tooltip">
                    <i class="material-icons">&#xE254;</i></a>
        <a class="delete" title="Delete">
                    <i class="material-icons">&#xE872;</i></a>
    </td>`;

    $('#tempTableBody').append(row);		

    $('.weightTotal').append(`Weight Total = 0%`);
    $('.markTotal').append(`Final Mark = 0.00%`);
    $('.weightErrorMsg').append(`*note: weight does not add up to 100%`);
}

function createTableNotLogggedInWithOutline(number_assessements, Assessement, course_information)
{
    var mobile = window.matchMedia("(min-width: 992px)")

    $(".tableNotLoggedInDiv").html(`
    <div class="table_wrapper_not_logged_in">
        <div class="table-title">
            <div class="row">
                <div id="course_code_div" style="text-align: left;" class="col-sm-4">` + course_information[0].course_code + `</div>
                <div class="col-sm-8">
                    <button type="button" onclick="addrow(tempTableBody, 0, false)"
                            class="btn-sm btn-info add-new addAssessmentButton">
                            <i class="fa fa-plus"></i> Add Row</button>
                </div>
            </div>
            <div class="row prof_name_email">
                <div style="text-align: left;" class="prof_info col-sm-6">Prof: ` +
                        course_information[0].prof_name + `</div>
                <div style="text-align: right;" class="prof_info_email col-sm-6">` +
                        course_information[0].prof_email + `</div>
            </div>
        </div>
        <table id="nonLoggedInTable" class="table table-bordered tableNumber0">
            <thead>
                <tr id="tableheader">
                    <th class="assessementTH">Assessements</th>
                    <th>Weight</th>
                    <th>Your Mark (%)</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="tempTableBody"></tbody>   
            <tfoot>
                <tr>
                    <td class="weightTotal" style="border: 0;"></td>
                    <td class="markTotal" style="border: 0;"></td>
                </tr>
                <tr style="border: 0;" >
                    <td style="border: 0;" class="weightErrorMsg "></td>
                    <td style="border: 0;" class="deleteButtonTD">
                        <button type="button" onclick="clearTable()"
                            class="btn-sm clearTableButton">Clear Table</button>
                    </td>
                </tr>
            </tfoot>
        </table>
        Try Populating the table with your course outline!
        <div class="row">
            <div class="col-sm-12" style="padding-top: 4px;">
                <form style="font-size: 14px;" ref="upload" id="upload"
                        enctype="multipart/form-data" method="post" action="/uploadFromHomepage" >
                    <input id="file_input" name="file_input" type="file" accept="application/pdf">
                    <button data-toggle="modal" data-target="#progressWindow" onclick="progressBar()"
                        type="submit" id="upload" class="btn-sm btn-info uploadButton">
                            <i class="fa fa-cloud-upload"></i> Upload
                </button></div>
                </form>
            </div>
        </div>
        <div class="modal fade" id="progressWindow" tabindex="-1" role="dialog"
            aria-labelledby="exampleModalLabel" aria-hidden="true">
        </div>
    </div>`);

    for (var i = 0; i < number_assessements; i++)
    {
        $('#tempTableBody').append(`
        <tr>
            <td class="assessementTH">` + Assessement[i].assessement_name + `</td>
            <td>` + Assessement[i].weight + `%</td>
            <td>0.00%</td>
            <td>
                <a class="add" title="Add" data-toggle="tooltip">
                            <i class="material-icons">&#xE03B;</i></a>
                <a class="edit" title="Edit" data-toggle="tooltip">
                            <i class="material-icons">&#xE254;</i></a>
                <a class="delete" title="Delete">
                            <i class="material-icons">&#xE872;</i></a>
            </td>
        </tr>`);
    }

    if (!mobile.matches)
    {
        $("#tableheader").css("font-size", "80%");
    }

    updateWeightMarkNonloggedInUser();
}

function clearTable()
{
    $('#tempTableBody').empty();
    var row = 
    `<tr>
        <td class="assessementTH" >Add Assessement Here</td>
        <td>0</td>
        <td>0.00</td>
        <td>
        <a class="add" title="Add" data-toggle="tooltip">
                    <i class="material-icons">&#xE03B;</i></a>
        <a class="edit" title="Edit" data-toggle="tooltip">
                    <i class="material-icons">&#xE254;</i></a>
        <a class="delete" title="Delete">
                    <i class="material-icons">&#xE872;</i></a>
    </td>`;
    $('#tempTableBody').append(row);

    $('#course_code_div').empty();
    $('.prof_name_email').empty();
    $('.weightTotal').empty();
    $('.markTotal').empty();
    $('.weightErrorMsg').empty();

    $('.weightTotal').append(`Weight Total = 0%`);
    $('.markTotal').append(`Final Grade = 0.00%`);
    $('.weightErrorMsg').append(`*note: weight does not add up to 100%`);
}

function addSemesteronClick()
{
    alert("This feature will be added soon!! :(");
}
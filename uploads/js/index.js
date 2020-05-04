// import { col } from "sequelize/types";
// 
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
            console.log("Number of files on server " + count);

            if (count == 0)
            {
                console.log("Here are 0 files");
                $('#no_tables').html(`Please upload a course outline`);
            }
            else
            {
            }
        },
        fail: function(error) {
            $('#blah').html("On page load, received error from server");
            console.log(error); 
        }
    });

    $.get("/api/user_data").then(function(data)
    {
        if (String(data.email) == "undefined")
        {
            $("#login_status").html(`
                <a class="nav-link js-scroll-trigger" href="/login">
                        <i class="fa fa-user"></i> Login</a>`);

            $("#home_title").html(`
            <header class="masthead" id="header">
                <div class="container d-flex h-100 align-items-center">
                    <div class="mx-auto text-center">
                        <h1 class="mx-auto my-0 text-uppercase">Mark Calculator</h1>
                        <h2 class="text-white-50 mx-auto mt-2 mb-5">A free Mark Calculator. Simply upload your Course Outline
                            and a table with all your assessements and their weight appears.</h2>
                        <h2 class="text-white-50 mx-auto mt-2 mb-5">Sign up now so you won't need to re-enter your marks.
                        </h2>
                        <a href="/signup" class="btn btn-primary js-scroll-trigger">Sign up here</a>
                    </div>
                </div>
            </header>`);
        }
        else
        {
            // $("home_title").html(``);//getting rid of the header from home page

            $("#login_status").html(`   
            <div class="dropdown" style="cursor: pointer;">
                <a class="nav-link js-scroll-trigger" data-toggle="dropdown">
                    Welcome ` + data.firstName + ` <i class=" fas fa-caret-down"></i></a>
                <div class="dropdown-menu">
                    <a class="dropdown-item" href="#">View Profile</a>
                    <a class="dropdown-item" href="/logout">Logout</a>
                </div>
            </div>`);

            $("#myTable").html(`
            <div class="container d-flex h-20 align-items-center">
                <div class="wrapper" id="semesterNav">
                    <button style="float: right;" type="button" class="btn-sm btn-info addSemester">
                            <i class="fa fa-plus"></i> Add Semester</button>
                    <ul class="nav nav-tabs">
                    <li>
                        <a href="#homeTab" class="nav-item nav-link active" data-toggle="tab">Semester 1</a>
                    </li>
                    <li>
                        <a href="#contactTab" class="nav-item nav-link" data-toggle="tab">Semester 2</a>
                    </li>
                    </ul>
                    <div class="tab-content">
                        <div id="homeTab" class="tab-pane panel active">
                            <div class="table_s1"></div>
                            <div class="row justify-content-center">
                                <p style="color: white;" align="center">Please upload your University of Guelph course outline here (.pdf only):</p>
                                <form style="color: white;" ref="upload" id="upload" enctype="multipart/form-data" method="post" action="/upload" >
                                Select a file: <input id="file_input" name="file_input" type="file" accept="application/pdf"><br>
                                <button data-toggle="modal" data-target="#progressWindow" onclick="progressBar()" type="submit" id="upload" class="btn-sm btn-info addSemester">upload</button>
                                </form>
                            </div>
                        <div class="modal fade" id="progressWindow" tabindex="-1" role="dialog"
                                    aria-labelledby="exampleModalLabel" aria-hidden="true">
                        </div>
                        <div id="contactTab" class="tab-pane panel fade">
                            <h3>Contact</h3>
                            <p>Contact page content</p>
                        </div>
                    </div>
                </div>
            </div>`);

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
                    console.log("in ajax call for outline tables")
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
    var fileSize = document.getElementById('file_input').files[0].size
    console.log("in progress bar " + fileSize);
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
    </div>
    </div>
    </div>`);

    var element = document.getElementById('progressBar');
    var width = 1; 
    var identity = setInterval(scene, 15); 
    function scene() { 
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
        let errorMsg_id = "errorMgs" + i;
        
        //if file number is odd start a new row
        if (i % 2 == 0)
        {
            $('#row-' + (i - 1) + '').append(`
            <div class="col">
                <div class="table-wrapper">
                    <div class="table-title">
                        <div class="row">
                            <div class="col-sm-4">` + prof_obj[i - 1].course_code + `</div>
                            <div class="col-sm-8">
                                <button type="button" onclick="addrow(` + table_id + `, ` + i + `)"
                                    class="btn-sm btn-info add-new addAssessment">
                                        <i class="fa fa-plus"></i> Add Assessement</button>
                            </div>
                        </div>
                        <div class="row">
                            <div style="text-align: left;" class="prof_info col-sm-6">Prof: ` +
                                    prof_obj[i - 1].prof_name + `</div>
                            <div style="text-align: right;" class="prof_info_email col-sm-6">` +
                                    prof_obj[i - 1].prof_email + `</div>
                        </div>
                    </div>
                    <table class="table table-bordered ` + tableClass + `" id="` + num_table_id + `">
                        <thead>
                            <tr>
                                <th class="assessementTH">Assessement</th>
                                <th>Weight</th>
                                <th>Your Mark (%)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                            <tbody class="`+table_id+`" id='` + table_id + `'></tbody>   
                    </table>
                    <div class="row ` + weightTotal_id + `"></div>
                    <div class="row ` + errorMsg_id + ` weightErrorMsg"></div>
                    </div>
                </div>
            </div>`);
            console.log("id " + weightTotal_id)
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
                                <div class="col-sm-4">` + prof_obj[i - 1].course_code + `</div>
                                <div class="col-sm-8">
                                    <button type="button" onclick="addrow(` + table_id + `, ` + i + `)"
                                            class="btn-sm btn-info add-new addAssessment">
                                            <i class="fa fa-plus"></i> Add Assessement</button>
                                </div>
                            </div>
                            <div class="row">
                                <div style="text-align: left;" class="prof_info col-sm-6">Prof: ` +
                                        prof_obj[i - 1].prof_name + `</div>
                                <div style="text-align: right;" class="prof_info_email col-sm-6">` +
                                        prof_obj[i - 1].prof_email + `</div>
                            </div>
                        </div>
                        <table class="table table-bordered ` + tableClass + `" id="` + num_table_id + `">
                            <thead>
                                <tr>
                                    <th class="assessementTH">Assessement</th>
                                    <th>Weight</th>
                                    <th>Your Mark (%)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                                <tbody class="` + table_id + `" id='` + table_id + `'></tbody>   
                        </table>
                        <div class="row ` + weightTotal_id + `"></div>
                        <div class="row ` + errorMsg_id + ` weightErrorMsg"></div>
                    </div>
                </div>
            </div>`);
        }
        if (i % 2 != 0) $('.table_s1').append('</div>');

        let weightTotal = 0;
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
                            <a class="delete" title="Delete" data-toggle="tooltip">
                                        <i class="material-icons">&#xE872;</i></a>
                        </td>
                    </tr>`
                );
                weightTotal += weight;
            }
        }
        $('.'+weightTotal_id).append(`
        <div class="col-sm-6"><h6>Weight Total = ` + weightTotal + `%</h6>
        </div>
        <div class="col-sm-6"><h6>Mark Total = 0%</h6>
        </div>`);
        if (weightTotal < 100 || weightTotal > 100)
        {
            $('.'+errorMsg_id).append(`
            <p style="color: red; text-align: center"> *note: weight does not add up to 100%</p>`);
        }
        else { $('.'+errorMsg_id).css("height", "0"); }
        weightTotal = 0;
    }
}

// Append table with add row form on add new button click
function addrow(table_id, i) {
    $('[data-toggle="tooltip"]').tooltip();
    var actions = $("table td:last-child").html();
    $(this).attr("disabled", "disabled");
    var index = document.getElementById("tableNumber" + i).rows.length;

    var row = '<tr>' +
        '<td class="assessementTH" ><input type="text" class="form-control"></td>' +
        '<td><input type="text" class="form-control"></td>' +
        '<td><input type="text" class="form-control"></td>' +
        '<td>' + actions + '</td>' +
    '</tr>';
    $(table_id).append(row);		

    $("table.tableClass"+i+" tbody.table_body"+i+
        " tr").eq(index - 1).find(".add, .edit").toggle();
    $('[data-toggle="tooltip"]').tooltip();
}

// Edit row on edit button click
$(document).on("click", ".edit", function()
{	
    var tableNumber = $(this).closest('table').attr('class').split(" ")[2];
    var fileId = tableNumber[tableNumber.length - 1];//parsing class = "tableNumber'i'"
    var row_number = $(this).closest("tr")[0].rowIndex;
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
                console.log("Sucessfully removed the row in table " + fileId);
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
$(document).on("click", ".delete", function(){
    $(this).parents("tr").remove();
    $(".add-new").removeAttr("disabled");
});

$(document).on("click", ".add", function()
{
    console.log("adding row function");
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
            userItems.push($(this).val());//populating user items array
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
});
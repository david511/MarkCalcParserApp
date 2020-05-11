$(document).ready(function() {
    // Getting references to our form and input
    var signUpForm = $("form.signup");
    var firstNameInput = $("input#first_name-input");
    var lastNameInput = $("input#last_name-input");
    var schoolInput = $("input#school-input");
    var emailInput = $("input#email-input");
    var passwordInput = $("input#password-input");
    var confirmPasswordInput = $("input#confirm_password-input");

    // When the signup button is clicked, we validate the email and password are not blank
    signUpForm.on("submit", function(event) {
        event.preventDefault();

        var userData = {
            firstName: firstNameInput.val().trim(),
            lastName: lastNameInput.val().trim(),
            school: schoolInput.val().trim(),
            email: emailInput.val().trim(),
            password: passwordInput.val().trim(),
            confirm_password: confirmPasswordInput.val().trim()
        };

        if (!userData.firstName) {
            $("#firstNameeErrorMsg").html(`* Please enter your first name!`);
        } else { $("#firstNameeErrorMsg").empty(); }
        
        if (!userData.lastName) {
			$("#lastNameErrorMsg").html(`* Please enter your last name!`);
        } else { $("#lastNameErrorMsg").empty(); }

        if (!userData.email) {
            $("#emailErrorMsg").html(`* Please enter your email!`);
        } else { $("#emailErrorMsg").empty(); }

        if (!userData.password) {
			$("#passwordErrorMsg").html(`* Please enter a password!`);
        } else { $("#passwordErrorMsg").empty(); }

        if (!userData.confirm_password) {
			$("#conformPasswordErrorMsg").html(`* Please confirm you password!`);
        } else { $("#conformPasswordErrorMsg").empty(); }
    
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password ||
                !userData.confirm_password) { return; }

        if (userData.password != confirmPasswordInput.val().trim())
        {
            console.log("Error: the user passwords do not match with eachother");
			$("#conformPasswordErrorMsg").html(`* Your passwords do not match`);
            return;
        }

        // If we have an email and password, run the signUpUser function
        signUpUser(userData.firstName, userData.lastName, userData.school,
                        userData.email, userData.password, userData.confirm_password);
        emailInput.val("");
        passwordInput.val("");
        confirmPasswordInput.val("");
    });

    // Does a post to the signup route. If succesful, we are redirected to the members page
    // Otherwise we log any errors
    function signUpUser(firstName, lastName, school, email, password, confirm_password)
    {
        $.ajax({
            type: 'get',            //Request type
            dataType: 'json',       //Data type - we will use JSON for almost everything 
            url: '/checkIfEmailExcists',   //The server endpoint we are connecting to
            data: {
                email: email,
            },
            success: function (data) {
                console.log("in success")
                let num_users;
                for (let obj of data.user) { num_users = obj.NUM_USERS; }
                
                console.log("Number user = " + num_users)
                if (num_users == 0)
                {
                    $.post("/api/signup", {
                        firstName: firstName,
                        lastName: lastName,
                        school: school,
                        email: email,
                        password: password,
                        conform_password: confirm_password
                    }).then(function(data) {
                        window.location.replace(data);
                        // If there's an error, handle it by throwing up a boostrap alert
                    }).catch(function(err) {
                        $("#emailErrorMsg").html(`* This Email has been taken! Please Enter a valid email!`);
                    });
                }
                else
                {
                    $("#emailErrorMsg").html(`* Email is already in use! Please enter a new email!`);
                }
            },
            fail: function(error) {
            }
        });

    }
});

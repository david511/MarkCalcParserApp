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

        if (userData.password != confirmPasswordInput.val().trim())
        {
            console.log("Error: the user passwords do not match with eachother");
            alert("The passwords you entered don't match, please try again!");
            window.location.reload();
            return;
        }

        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
            console.log("Error: all the fields are not filled");
            return;
        }
        // If we have an email and password, run the signUpUser function
        signUpUser(userData.firstName, userData.lastName, userData.school,
                        userData.email, userData.password, userData.confirm_password);
        emailInput.val("");
        passwordInput.val("");
    });

    // Does a post to the signup route. If succesful, we are redirected to the members page
    // Otherwise we log any errors
    function signUpUser(firstName, lastName, school, email, password, confirm_password)
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
        }).catch(handleLoginErr);
    }

    function handleLoginErr(err) {
        $("#alert .msg").text(err.responseJSON);
        $("#alert").fadeIn(500);
    }
});

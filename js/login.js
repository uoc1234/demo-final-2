
$(function () {
    var isRememberMe = storage.getRememberMe();
    document.getElementById("rememberMe").checked = isRememberMe;
});

function login() {
    // Get username & password
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // validate
    if (!username) {
        showNameErrorMessage("Please input username!");
        return;
    }

    if (!password) {
        showNameErrorMessage("Please input password!");
        return;
    }


    // validate username 6 -> 30 characters
    if (username.length < 6 || username.length > 30 || password.length < 6 || password.length > 30) {
        // show error message
        showNameErrorMessage("Login fail!");
        return;
    }

    // Call API
    $.ajax({
        // url: 'http://localhost:8080/api/v1/login',
        url: 'https://reqres.in/api/login',
        type: 'POST',
        contentType: "application/json",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'json', // datatype return
        // beforeSend: function (xhr) {
        //     xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        // },
        data: JSON.stringify({
            "email": username,
            "password": password
        }),
        success: function (data, textStatus, xhr) {
            // save data to storage
            // https://www.w3schools.com/html/html5_webstorage.asp
            // save remember me
            var isRememberMe = document.getElementById("rememberMe").checked;
            if(isRememberMe){ 
            storage.saveRememberMe(isRememberMe);
            }
            // save data to storage
            // https://www.w3schools.com/html/html5_webstorage.asp
            // localStorage.setItem("ID", data.id);
            // localStorage.setItem("FULL_NAME", data.fullName);
            // localStorage.setItem("USERNAME", username);
            // localStorage.setItem("PASSWORD", password);
            // localStorage.setItem("ROLE", data.role);
            localStorage.setItem("token", data.token);
            // redirect to home page
            // https://www.w3schools.com/howto/howto_js_redirect_webpage.asp
            // window.location.replace("http://127.0.0.1:5500/html/program.html");
            window.location.href = '../index.html'
            // confirm("ok")
        },
        error(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 401) {
                showNameErrorMessage("Login fail!");
            } else {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        }
    });
}

function showNameErrorMessage(message) {
    document.getElementById("nameErrorMessage").style.display = "block";
    document.getElementById("nameErrorMessage").innerHTML = message;
}

function hideNameErrorMessage() {
    document.getElementById("nameErrorMessage").style.display = "none";
}
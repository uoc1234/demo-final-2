function clickNavViewUser() {
  $(".main").load("html/user.html", function () {
    if (roleUser == "EMPLOYEE") {
      $("#canNotGetAccount").modal("hide");
      $("#canNotGetAccount").modal("hide");
    }
    document.getElementById("userNameForViewUser").innerHTML =
      storage.getItem("USERNAME");
    // document.getElementById("fullNameForViewUser").innerHTML =
    //   storage.getItem("FULL_NAME");
    document.getElementById("userId1").innerHTML = storage.getItem("ID");
    document.getElementById("userRole1").innerHTML = storage.getItem("ROLE");

    //fill info
    fillUserInfor();
  });
}

function fillUserInfor() {
  userId = storage.getItem("ID");
  $.ajax({
    url: "http://localhost:8080/api/v1/accounts/" + userId,
    type: "GET",
    contentType: "application/json",
    dataType: "json", // datatype return
    beforeSend: function (xhr) {
      xhr.setRequestHeader(
        "Authorization",
        "Basic " +
          btoa(
            localStorage.getItem("USERNAME") +
              ":" +
              localStorage.getItem("PASSWORD")
          )
      );
    },
    success: function (data, textStatus, xhr) {
      // success

      // fill data
    document.getElementById("fullNameForViewUser").innerHTML = data.firstName+" "+data.lastName;
      document.getElementById("userFirstName1").innerHTML = data.firstName;
      document.getElementById("userLastName1").innerHTML = data.lastName;
      document.getElementById("userDepartmentName1").innerHTML =
        data.departmentName;
      document.getElementById("userCreateDate1").innerHTML = data.createdDate;
    },
    error(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
  });
}
function openUserUpdateModal() {
  userId = storage.getItem("ID");
  // call API from server
  $.ajax({
    url: "http://localhost:8080/api/v1/accounts/" + userId,
    type: "GET",
    contentType: "application/json",
    dataType: "json", // datatype return
    beforeSend: function (xhr) {
      xhr.setRequestHeader(
        "Authorization",
        "Basic " +
          btoa(
            localStorage.getItem("USERNAME") +
              ":" +
              localStorage.getItem("PASSWORD")
          )
      );
    },
    success: function (data, textStatus, xhr) {
      // success
      openUserModal();
      hideNameErrorMessage();
      // fill data
      document.getElementById("userId").value = data.id;
      document.getElementById("userFirstName").value = data.firstName;
      document.getElementById("userLastName").value = data.lastName;
      document.getElementById("userUserName").value = data.username;
    },
    error(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
  });
}

function openUserModal() {
  $("#myModal").modal("show");
}

function hideUserModal() {
  $("#myModal").modal("hide");
  document.getElementById("userPass").value = "";


}

function showUserFirstNameErrorMessage(message) {
  document.getElementById("userFirstNameErrorMessage").style.display = "block";
  document.getElementById("userFirstNameErrorMessage").innerHTML = message;
}
function showUserLastNameErrorMessage(message) {
  document.getElementById("userLastNameErrorMessage").style.display = "block";
  document.getElementById("userLastNameErrorMessage").innerHTML = message;
}
function showUserPassErrorMessage(message) {
  document.getElementById("userPassErrorMessage").style.display = "block";
  document.getElementById("userPassErrorMessage").innerHTML = message;
}

function hideNameErrorMessage() {
  document.getElementById("userUserNameErrorMessage").style.display = "none";
  document.getElementById("userLastNameErrorMessage").style.display = "none";
  document.getElementById("userFirstNameErrorMessage").style.display = "none";
  document.getElementById("userPassErrorMessage").style.display = "none";
}

function saveUser() {
  // get data
  var lastName = document.getElementById("userLastName").value;
  var firstName = document.getElementById("userFirstName").value;
  var pass = document.getElementById("userPass").value;

  // validate name chỉ chứ chữ không chứa kí tự đặc biệt
  regex2 = /[A-Za-z ]+$/;
  if (!firstName || firstName.length < 2 || firstName.length > 50) {
    // show error message
    showUserFirstNameErrorMessage(
      "first name must be from 2 to 50 characters!"
    );
    return;
  } else if (!regex2.test(firstName)) {
    showUserFirstNameErrorMessage("can't contain special characters ");
    return;
  } else {
    document.getElementById("userFirstNameErrorMessage").style.display = "none";
  }
  // validate name chỉ chứ chữ không chứa kí tự đặc biệt

  if (!lastName || lastName.length < 2 || lastName.length > 50) {
    // show error message
    showUserLastNameErrorMessage("last name must be from 2 to 50 characters!");
    return;
  } else if (!regex2.test(lastName)) {
    showUserLastNameErrorMessage("can't contain special characters ");
    return;
  } else {
    document.getElementById("userLastNameErrorMessage").style.display = "none";
  }
  // validate pass

  if (!pass || pass.length < 6 || pass.length > 8) {
    // show error message
    showUserPassErrorMessage("password must be from 6 to 8 characters!");
    return;
  } else {
    document.getElementById("userPassErrorMessage").style.display = "none";
  }

  updateUser();
}

function updateUser() {
  var id = storage.getItem("ID");
  firstName = document.getElementById("userFirstName").value;
  lastName = document.getElementById("userLastName").value;
  pass = document.getElementById("userPass").value;

  if (pass !== storage.getItem("PASSWORD")) {
    conf = confirm(
      "hệ thống nhận thấy mật khẩu được nhập vào khác trước. Bạn muốn thay đổi mật khẩu?"
    );
    if (conf == true) {
      oldPass = prompt("hãy nhập mật khẩu cũ ");
      if (oldPass !== storage.getItem("PASSWORD")) {
        alert("mật khẩu sai!");
        return;
      } else {
        var user = {
          id: id,
          firstName: firstName,
          lastName: lastName,
          password: oldPass,
          newPass: pass
        };
        $.ajax({
          url: "http://localhost:8080/api/v1/accounts/user/" + id,
          type: "PUT",
          data: JSON.stringify(user), // body
          contentType: "application/json", // type of body (json, xml, text)
          beforeSend: function (xhr) {
            xhr.setRequestHeader(
              "Authorization",
              "Basic " +
                btoa(
                  localStorage.getItem("USERNAME") +
                    ":" +
                    localStorage.getItem("PASSWORD")
                )
            );
          },
          // dataType: 'json', // datatype return
          success: function (data, textStatus, xhr) {
            console.log(data);
            // success
            hideUserModal();
            showUserSuccessAlert();
            fillUserInfor();
            alert("Thay đổi mật khẩu thành công, bạn cần đăng nhập lại.")
            logout();

            // // upDate name
            // document.getElementById("userNameForViewUser").innerHTML = userName;
            // document.getElementById("fullNameForViewUser").innerHTML =
            //   firstName + " " + lastName;
          },
          error(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
          },
        });
      }
    } else {
      return;
    }
  } else {
    var user = {
      id: id,
      firstName: firstName,
      lastName: lastName,
      password: pass,
      newPass: pass
    };
    $.ajax({
      url: "http://localhost:8080/api/v1/accounts/user/" + id,
      type: "PUT",
      data: JSON.stringify(user), // body
      contentType: "application/json", // type of body (json, xml, text)
      beforeSend: function (xhr) {
        xhr.setRequestHeader(
          "Authorization",
          "Basic " +
            btoa(
              localStorage.getItem("USERNAME") +
                ":" +
                localStorage.getItem("PASSWORD")
            )
        );
      },
      // dataType: 'json', // datatype return
      success: function (data, textStatus, xhr) {
        console.log(data);
        // success
        hideUserModal();
        showUserSuccessAlert();
        fillUserInfor();
        // upDate name
        document.getElementById("fullNameForViewUser").innerHTML =
          firstName + " " + lastName;
        document.getElementById("fullname").innerHTML = firstName + " " + lastName;
      },
      error(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      },
    });
  }
}

function showUserSuccessAlert() {
  $("#success-alertUser")
    .fadeTo(2000, 500)
    .slideUp(500, function () {
      $("#success-alertUser").slideUp(500);
    });
}

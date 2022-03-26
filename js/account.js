//account
function clickNavViewListAccounts() {
  $(".main").load("html/viewlistAccounts.html", function () {
    if (roleUser == "EMPLOYEE") {
      $("#canNotGetAccount").modal("hide");
      $("#canNotGetAccount").modal("show");
    } else {
      initDepartmentList();
      initRolesList();
      buildAccountTable();
    }
  });
}
function closeModalAccount() {
  $("#canNotGetAccount").modal("hide");
}

var accounts = [];
var accSortField = "createdDate";
var accCurrentPage = 1;
var accSize = 10;
var isAccountAsc = false;

var roleFilter = "";
var departmentNameFilter = "";
//  lấy list role cho phần filter
function initRolesList() {
  $("#department-select").empty();
  $.ajax({
    url: "http://localhost:8080/api/v1/accounts/roles",
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
      roles = [];
      roles = data;
      for (i = 0; i < roles.length; i++) {
        roleId = "select" + roles[i];
        roleId2 = "modal" + roles[i];
        $("#role-select").append(
          '<option id = "' +
            roleId +
            '" name= "' +
            roles[i] +
            '" value="' +
            roles[i] +
            '">' +
            roles[i] +
            "</option>"
        );
        $("#role-Modal ").append(
          '<option id = "' +
            roleId2 +
            '" name= "' +
            roles[i] +
            '" value="' +
            roles[i] +
            '">' +
            roles[i] +
            "</option>"
        );
      }
    },
  });
}

//  lấy list department cho phần filter
function initDepartmentList() {
  $("#department-select").empty();
  $.ajax({
    url: "http://localhost:8080/api/v1/departments",
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
      departments = [];
      departments = data.content;
      $("#department-select").append(
        '<option id="departmentDefault" value="departmentDefault" selected = "selected"> Department </option>'
      );
      $("#department-Modal").append(
        '<option id="departmentDefaultModal" value="null" selected = "selected"> Null </option>'
      );
      departments.forEach(function (item) {
        dep1 = "select" + item.id;
        dep2 = "modal" + item.name;
        $("#department-select").append(
          '<option id = "' +
            dep1 +
            '" name= "' +
            item.name +
            '" value="' +
            item.id +
            '">' +
            item.name +
            "</option>"
        );
        $("#department-Modal").append(
          '<option id = "' +
            dep2 +
            '" name= "' +
            item.name +
            '" value="' +
            item.id +
            '">' +
            item.name +
            "</option>"
        );
      });
    },
  });
}

function getListAccounts() {
  var url = "http://localhost:8080/api/v1/accounts";

  url += "?page=" + accCurrentPage + "&size=" + accSize;

  url += "&sort=" + accSortField + "," + (isAccountAsc ? "asc" : "desc");

  var search = document.getElementById("input-search-account").value;
  depId = $("select#department-select").children("option:selected").val();
  roleId = $("select#role-select").children("option:selected").val();
  if (search) {
    url += "&search=" + search;
  }

  if (depId != "departmentDefault" && depId != null) {
    depName = document.getElementById("select" + depId).getAttribute("name");
    departmentNameFilter = depName;
    url += "&departmentName=" + departmentNameFilter;
  }
  if (roleId != "roleDefault") {
    role = document.getElementById("select" + roleId).getAttribute("name");
    roleFilter = role;
    url += "&role=" + roleFilter;
  }

  // call API from server
  $.ajax({
    url: url,
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
      // reset list employees
      accounts = [];
      accounts = data.content;
      fillAccountToTable();
      resetAccountDeleteCheckbox();
      pagingAccountTable(data.totalPages);
      renderAccountSortUI();
    },
    error(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
  });
}

//*
function pagingAccountTable(pageAmount) {
  var pagingStr = "";

  if (pageAmount > 1 && accCurrentPage > 1) {
    pagingStr +=
      '<li class="page-item">' +
      '<a class="page-link" onClick="prevAccountPaging()">Previous</a>' +
      "</li>";
  }

  for (i = 0; i < pageAmount; i++) {
    pagingStr +=
      '<li class="page-item ' +
      (accCurrentPage == i + 1 ? "active" : "") +
      '">' +
      '<a class="page-link" onClick="changeAccountPage(' +
      (i + 1) +
      ')">' +
      (i + 1) +
      "</a>" +
      "</li>";
  }

  if (pageAmount > 1 && accCurrentPage < pageAmount) {
    pagingStr +=
      '<li class="page-item">' +
      '<a class="page-link" onClick="nextAccountPaging()">Next</a>' +
      "</li>";
  }

  $("#pagination").empty();
  $("#pagination").append(pagingStr);
}
//*
function resetAccountPaging() {
  accCurrentPage = 1;
  accSize = 10;
}
//*
function prevAccountPaging() {
  changePage(accCurrentPage - 1);
}
//*
function nextAccountPaging() {
  changePage(accCurrentPage + 1);
}
//
function changeAccountPage(page) {
  if (page == accCurrentPage) {
    return;
  }
  accCurrentPage = page;
  buildAccountTable();
}

//sort Account
function renderAccountSortUI() {
  var sortTypeClazz = isAccountAsc ? "fa-sort-asc" : "fa-sort-desc";

  switch (accSortField) {
    case "username":
      changeIconSort1("heading-userName", sortTypeClazz);
      changeIconSort1("heading-department", "fa-sort");
      changeIconSort1("heading-fullName", "fa-sort");
      changeIconSort1("heading-role", "fa-sort");
      changeIconSort1("heading-createDate", "fa-sort");
      break;
    case "fullName":
      changeIconSort1("heading-fullName", sortTypeClazz);
      changeIconSort1("heading-department", "fa-sort");
      changeIconSort1("heading-userName", "fa-sort");
      changeIconSort1("heading-role", "fa-sort");
      changeIconSort1("heading-createDate", "fa-sort");
      break;
    case "role":
      changeIconSort1("heading-role", sortTypeClazz);
      changeIconSort1("heading-department", "fa-sort");
      changeIconSort1("heading-userName", "fa-sort");
      changeIconSort1("heading-fullName", "fa-sort");
      changeIconSort1("heading-createDate", "fa-sort");
      break;
    case "departmentName":
      changeIconSort1("heading-department", sortTypeClazz);
      changeIconSort1("heading-userName", "fa-sort");
      changeIconSort1("heading-fullName", "fa-sort");
      changeIconSort1("heading-role", "fa-sort");
      changeIconSort1("heading-createDate", "fa-sort");
      break;
    case "createdDate":
      changeIconSort1("heading-createDate", sortTypeClazz);
      changeIconSort1("heading-department", "fa-sort");
      changeIconSort1("heading-userName", "fa-sort");
      changeIconSort1("heading-fullName", "fa-sort");
      changeIconSort1("heading-role", "fa-sort");
      break;
    default:
      changeIconSort1("heading-department", "fa-sort");
      changeIconSort1("heading-userName", "fa-sort");
      changeIconSort1("heading-fullName", "fa-sort");
      changeIconSort1("heading-role", "fa-sort");
      changeIconSort1("heading-createDate", "fa-sort");
      break;
  }
}

function changeIconSort1(id, sortTypeClazz) {
  document
    .getElementById(id)
    .classList.remove("fa-sort", "fa-sort-asc", "fa-sort-desc");
  document.getElementById(id).classList.add(sortTypeClazz);
}

function changeAccountSort(field) {
  if (field == accSortField) {
    isAsc = !isAsc;
  } else {
    accSortField = field;
    isAsc = true;
  }
  buildAccountTable();
}
function resetAccountSort() {
  accSortField = "createdDate";
  isAccountAsc = false;
}
//*
function resetAccountDeleteCheckbox() {
  // reset delete all checkbox
  document.getElementById("checkbox-all").checked = false;

  // reset checkbox item
  var i = 0;
  while (true) {
    var checkboxItem = document.getElementById("checkbox-" + i);
    if (checkboxItem !== undefined && checkboxItem !== null) {
      checkboxItem.checked = false;
      i++;
    } else {
      break;
    }
  }
}

function resetAccountTable() {
  resetAccountPaging();
  resetAccountSort();
  resetAccountSearch();
  resetAccountFilter();
  resetAccountDeleteCheckbox();
}

function resetAccountSearch() {
  document.getElementById("input-search-account").value = "";
}

//*
// https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
function handAccountKeyUpEventForSearching(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    event.preventDefault();
    handleAccountSearch();
  }
}

function handleAccountSearch() {
  resetAccountPaging();
  resetAccountSort();
  resetAccountDeleteCheckbox();
  buildAccountTable();
}

function resetAccountFilter() {
  roleFilter = "";
  depId = "";
  roleId = "";
  departmentNameFilter = "";
  $("#role-select option:first").prop("selected", true);
  $("#department-select option:first").prop("selected", true);
}

function refreshAccountTable() {
  resetAccountTable();
  buildAccountTable();
}

function fillAccountToTable() {
  accounts.forEach(function (item, index) {
    $("tbody").append(
      "<tr>" +
        '<td><input id="checkbox-' +
        index +
        '" type="checkbox" onClick="onAccountChangeCheckboxItem()"></td>' +
        "<td>" +
        item.username +
        "</td>" +
        "<td>" +
        item.fullName +
        "</td>" +
        "<td>" +
        item.role +
        "</td>" +
        "<td>" +
        item.departmentName +
        "</td>" +
        "<td>" +
        item.createdDate +
        "</td>" +
        "<td>" +
        '<a class="edit" title="Edit" data-toggle="tooltip" onclick="openAccountUpdateModal(' +
        item.id +
        ')"><i class="material-icons">&#xE254;</i></a>' +
        '<a class="delete" title="Delete" data-toggle="tooltip" onClick="openAccountConfirmDelete(' +
        item.id +
        ')"><i class="material-icons">&#xE872;</i></a>' +
        "</td>" +
        "</tr>"
    );
  });
}

function buildAccountTable() {
  $("tbody").empty();
  getListAccounts();
}

function openAccountAddModal() {
  if (roleUser == "MANAGER") {
    alert("only accessible to ADMIN");
    return;
  } else {
    openAccountModal();
    resetAccountFormAdd();
  }
}

function resetAccountFormAdd() {
  document.getElementById("titleModal").innerHTML = "Add Account";
  document.getElementById("id").value = "";
  document.getElementById("userName").value = "";
  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  $("#role-Modal option:first").prop("selected", true);
  $("#department-Modal option:first").prop("selected", true);
  hideAccountNameErrorMessage();
}

function openAccountModal() {
  $("#myModal").modal("show");
  document.getElementById("userName").disabled = false;
  document.getElementById("firstName").disabled = false;
  document.getElementById("lastName").disabled = false;
}

function hideAccountModal() {
  $("#myModal").modal("hide");
}

function showUserNameErrorMessage(message) {
  document.getElementById("userNameErrorMessage").style.display = "block";
  document.getElementById("userNameErrorMessage").innerHTML = message;
}
function showFirstNameErrorMessage(message) {
  document.getElementById("firstNameErrorMessage").style.display = "block";
  document.getElementById("firstNameErrorMessage").innerHTML = message;
}
function showLastNameErrorMessage(message) {
  document.getElementById("lastNameErrorMessage").style.display = "block";
  document.getElementById("lastNameErrorMessage").innerHTML = message;
}
function showDepartmentErrorMessage(message) {
  document.getElementById("departmentErrorMessage").style.display = "block";
  document.getElementById("departmentErrorMessage").innerHTML = message;
}
function hideAccountNameErrorMessage() {
  document.getElementById("userNameErrorMessage").style.display = "none";
  document.getElementById("firstNameErrorMessage").style.display = "none";
  document.getElementById("lastNameErrorMessage").style.display = "none";
  document.getElementById("departmentErrorMessage").style.display = "none";
}

function addAccount() {
  // get data
  var userName = document.getElementById("userName").value;
  var lastName = document.getElementById("lastName").value;
  var firstName = document.getElementById("firstName").value;
  roleId = $("select#role-Modal").children("option:selected").val();
  role = document.getElementById("modal" + roleId).getAttribute("name");
  depId = $("select#department-Modal").children("option:selected").val();
  regex = /^[A-Za-z0-9]+$/;
  // validate userName lastName firstName

  if (!userName || userName.length < 5 || userName.length > 30) {
    // show error message
    showUserNameErrorMessage("user name must be from 6 to 30 characters!");
    return;
  } else if (regex.test(userName) === false) {
    showUserNameErrorMessage(
      "contains only unsigned characters and number,can't contain space and spical characters"
    );
    return;
  } else {
    document.getElementById("userNameErrorMessage").style.display = "none";
  }

  regex2 = /[A-Za-z ]+$/;
  if (!firstName || firstName.length < 2 || firstName.length > 50) {
    // show error message
    showFirstNameErrorMessage("first name must be from 2 to 50 characters!");
    return;
  } else if (!regex2.test(firstName)) {
    showFirstNameErrorMessage("can't contain special characters ");
    return;
  } else {
    document.getElementById("firstNameErrorMessage").style.display = "none";
  }

  if (!lastName || lastName.length < 2 || lastName.length > 50) {
    // show error message
    showLastNameErrorMessage("last name must be from 2 to 50 characters!");
    return;
  } else if (!regex2.test(lastName)) {
    showLastNameErrorMessage("can't contain special characters ");
    return;
  } else {
    document.getElementById("lastNameErrorMessage").style.display = "none";
  }

  if (depId == "null") {
    showDepartmentErrorMessage("department can't null ");
    return;
  } else {
    document.getElementById("departmentErrorMessage").style.display = "none";
  }

  // validate unique name
  $.ajax({
    url:
      "http://localhost:8080/api/v1/accounts/userName/" + userName + "/exists",
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
      if (data) {
        // show error message
        showUserNameErrorMessage("user name is exists!");
      } else {
        // call api create department
        var account = {
          username: userName,
          lastName: lastName,
          firstName: firstName,
          role: role,
          departmentId: depId,
        };

        $.ajax({
          url: "http://localhost:8080/api/v1/accounts/admin/post",
          type: "POST",
          data: JSON.stringify(account), // body
          contentType: "application/json", // type of body (json, xml, text)
          // dataType: 'json', // datatype return
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
            console.log(data);
            // success
            hideAccountModal();
            showAccountSuccessAlert();
            resetAccountTable();
            buildAccountTable();
          },
          error(jqXHR, textStatus, errorThrown) {
            alert("Error when loading data");
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
          },
        });
      }
    },
    error(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
  });
}

function resetAccountFormUpdate() {
  document.getElementById("titleModal").innerHTML = "Update Account";
  // can not change account user/first/last Name
  document.getElementById("userName").disabled = true;
  document.getElementById("firstName").disabled = true;
  document.getElementById("lastName").disabled = true;
  hideAccountNameErrorMessage();
}

var oldName;

function openAccountUpdateModal(id) {
  if (roleUser == "MANAGER") {
    alert("only accessible to ADMIN");
    return;
  } else {
    // call API from server
    $.ajax({
      url: "http://localhost:8080/api/v1/accounts/" + id,
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
        openAccountModal();
        resetAccountFormUpdate();

        // fill data
        // fill data
        document.getElementById("id").value = data.id;
        document.getElementById("userName").value = data.username;
        document.getElementById("lastName").value = data.lastName;
        document.getElementById("firstName").value = data.firstName;
        document.getElementById("modal" + data.role).selected = true;
        if (data.departmentName != null) {
          document.getElementById(
            "modal" + data.departmentName
          ).selected = true;
        } else {
          document.getElementById("departmentDefaultModal").selected = true;
        }
      },
      error(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      },
    });
  }
}

function saveAccount() {
  var id = document.getElementById("id").value;

  if (id == null || id == "") {
    addAccount();
  } else {
    updateAccount();
  }
}

function updateAccount() {
  var id = document.getElementById("id").value;
  userName = document.getElementById("userName").value;
  firstName = document.getElementById("firstName").value;
  lastName = document.getElementById("lastName").value;
  roleId = $("select#role-Modal").children("option:selected").val();
  role = document.getElementById("modal" + roleId).getAttribute("name");
  depId = $("select#department-Modal").children("option:selected").val();
  // role = document.getElementById("accRole").value;
  // depId = document.getElementById("depId").value;

  var account = {
    id: id,
    username: userName,
    firstName: firstName,
    lastName: lastName,
    role: role,
    departmentId: depId,
  };
  $.ajax({
    url: "http://localhost:8080/api/v1/accounts/admin/put/" + id,
    type: "PUT",
    data: JSON.stringify(account), // body
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
      hideAccountModal();
      showAccountSuccessAlert();
      resetAccountTable();
      buildAccountTable();
    },
    error(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
  });
}

function openAccountConfirmDelete(id) {
  if (roleUser == "MANAGER") {
    alert("only accessible to ADMIN");
    return;
  } else {
    // get index from employee's id
    var index = accounts.findIndex((x) => x.id == id);
    var name = accounts[index].username;

    var result = confirm("Want to delete " + name + "?");
    if (result) {
      deleteAccount(id);
    }
  }
}

function deleteAccount(id) {
  // TODO validate

  $.ajax({
    url: "http://localhost:8080/api/v1/accounts/admin/delete/" + id,
    type: "DELETE",
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
    success: function (result) {
      // error
      if (result == undefined || result == null) {
        alert("Error when loading data");
        return;
      }

      // success
      showAccountSuccessAlert();
      resetAccountTable();
      buildAccountTable();
    },
  });
}

function onAccountChangeCheckboxItem() {
  var i = 0;
  while (true) {
    var checkboxItem = document.getElementById("checkbox-" + i);
    if (checkboxItem !== undefined && checkboxItem !== null) {
      if (!checkboxItem.checked) {
        document.getElementById("checkbox-all").checked = false;
        return;
      }
      i++;
    } else {
      break;
    }
  }
  document.getElementById("checkbox-all").checked = true;
}

function onAccountChangeCheckboxAll() {
  var i = 0;
  while (true) {
    var checkboxItem = document.getElementById("checkbox-" + i);
    if (checkboxItem !== undefined && checkboxItem !== null) {
      checkboxItem.checked = document.getElementById("checkbox-all").checked;
      // if (document.getElementById("checkbox-all").checked) {
      //     checkboxItem.checked = true;
      // } else {
      //     checkboxItem.checked = false;
      // }
      i++;
    } else {
      break;
    }
  }
}

function deleteAllAccount() {
  if (roleUser == "MANAGER") {
    alert("only accessible to ADMIN");
    return;
  } else {
    // get checked
    var ids = [];
    var names = [];
    var i = 0;
    while (true) {
      var checkboxItem = document.getElementById("checkbox-" + i);
      if (checkboxItem !== undefined && checkboxItem !== null) {
        if (checkboxItem.checked) {
          ids.push(accounts[i].id);
          names.push(accounts[i].username);
        }
        i++;
      } else {
        break;
      }
    }

    // open confirm ==> bạn có muốn xóa bản ghi ...

    var result = confirm("Want to delete " + names + "?");
    if (result) {
      accountIds = {
        ids: ids,
      };
      // call API
      $.ajax({
        url: "http://localhost:8080/api/v1/accounts/admin/delete",
        type: "DELETE",
        data: JSON.stringify(accountIds),
        contentType: "application/json",
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
        success: function (result) {
          // error
          if (result == undefined || result == null) {
            alert("Error when loading data");
            return;
          }

          // success
          showAccountSuccessAlert();
          resetAccountTable();
          buildAccountTable();
        },
      });
    }
  }
}

function showAccountSuccessAlert() {
  $("#success-alert")
    .fadeTo(2000, 500)
    .slideUp(500, function () {
      $("#success-alert").slideUp(500);
    });
}

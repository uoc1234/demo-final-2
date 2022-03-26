$(function () {
  if (!isLogin()) {
    // window.location.replace("http://127.0.0.1:5500/html/login.html");
    window.location.href = 'login.html'
  }

  $(".header").load("html/header.html", function () {
    document.getElementById("fullname").innerHTML =
      storage.getItem("FULL_NAME");
  });
  $(".main").load("html/home.html");
  $(".footer").load("html/footer.html");
});

var roleUser = storage.getItem("ROLE");

function isLogin() {
  if (storage.getItem("token")) {
    return true;
  }
  return false;
}
function logout() {
  var result = confirm("do you want log out ? ");
  if (result == true) {
    storage.removeItem("ID");
    storage.removeItem("FULL_NAME");
    storage.removeItem("USERNAME");
    storage.removeItem("PASSWORD");
    storage.removeItem("ROLE");
    storage.removeItem("token");


    // redirect to login page
    // window.location.replace("http://127.0.0.1:5500/html/login.html");
    window.location.href = 'login.html'

  }
}

function clickNavHome() {
  $(".main").load("html/home.html");
  $("#canNotGetDepartment").modal("hide");
  $("#canNotGetAccount").modal("hide");
}

function clickNavViewListDepartments() {
  $(".main").load("html/viewlistdepartments.html", function () {
    if (roleUser == "EMPLOYEE") {
      $("#canNotGetDepartment").modal("show");
    } else {
      initTypesList();
      buildTable();
      buildAccountForAddDepartment();
    }
  });
}
function closeModalDepartment() {
  $("#canNotGetDepartment").modal("hide");
}

var departments = [];
var currentPage = 1;
var size = 10;
var sortField = "totalMember";
var isAsc = false;

var minCreateDate = "";
var maxCreateDate = "";
var typeFilter = "";

//  lấy list type cho phần filter
function initTypesList() {
  $("#type-select").empty();
  $.ajax({
    url: "http://localhost:8080/api/v1/departments/types",
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
      types = [];
      types = data;
      $("#type-select").append(
        '<option id="typeDefault" value="typeDefault" selected = "selected">Type </option>'
      );
      for (i = 0; i < types.length; i++) {
        typeId = "select" + types[i];
        typeId2 = "modal" + types[i];
        $("#type-select").append(
          '<option id = "' +
            typeId +
            '" name= "' +
            types[i] +
            '" value="' +
            types[i] +
            '">' +
            types[i] +
            "</option>"
        );
        $("#type-Modal").append(
          '<option id = "' +
            typeId2 +
            '" name= "' +
            types[i] +
            '" value="' +
            types[i] +
            '">' +
            types[i] +
            "</option>"
        );
      }
    },
  });
}

function getListDepartments() {
  var url = "http://localhost:8080/api/v1/departments";

  url += "?page=" + currentPage + "&size=" + size;

  url += "&sort=" + sortField + "," + (isAsc ? "asc" : "desc");

  var search = document.getElementById("input-search-department").value;
  minCreatedDate = document.getElementById("minCreateDate").value;
  maxCreatedDate = document.getElementById("maxCreateDate").value;
  typeId = $("select#type-select").children("option:selected").val();
  if (search) {
    url += "&search=" + search;
  }

  if (minCreatedDate) {
    url += "&minCreatedDate=" + minCreateDate;
  }

  if (maxCreatedDate) {
    url += "&maxCreatedDate=" + maxCreateDate;
  }
  if (typeId != "typeDefault" && typeId != null) {
    type = document.getElementById("select" + typeId).getAttribute("name");
    typeFilter = type;
    url += "&type=" + typeFilter;
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
      departments = [];
      departments = data.content;
      fillDepartmentToTable();
      resetDeleteCheckbox();
      pagingTable(data.totalPages);
      renderSortUI();
    },
    error(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
  });
}

function pagingTable(pageAmount) {
  var pagingStr = "";

  if (pageAmount > 1 && currentPage > 1) {
    pagingStr +=
      '<li class="page-item">' +
      '<a class="page-link" onClick="prevPaging()">Previous</a>' +
      "</li>";
  }

  for (i = 0; i < pageAmount; i++) {
    pagingStr +=
      '<li class="page-item ' +
      (currentPage == i + 1 ? "active" : "") +
      '">' +
      '<a class="page-link" onClick="changePage(' +
      (i + 1) +
      ')">' +
      (i + 1) +
      "</a>" +
      "</li>";
  }

  if (pageAmount > 1 && currentPage < pageAmount) {
    pagingStr +=
      '<li class="page-item">' +
      '<a class="page-link" onClick="nextPaging()">Next</a>' +
      "</li>";
  }

  $("#pagination").empty();
  $("#pagination").append(pagingStr);
}

function resetPaging() {
  currentPage = 1;
  size = 10;
}

function prevPaging() {
  changePage(currentPage - 1);
}

function nextPaging() {
  changePage(currentPage + 1);
}

function changePage(page) {
  if (page == currentPage) {
    return;
  }
  currentPage = page;
  buildTable();
}

//sort department
function renderSortUI() {
  var sortTypeClazz = isAsc ? "fa-sort-asc" : "fa-sort-desc";

  switch (sortField) {
    case "name":
      changeIconSort("heading-name", sortTypeClazz);
      changeIconSort("heading-totalMember", "fa-sort");
      changeIconSort("heading-createDate", "fa-sort");
      changeIconSort("heading-type", "fa-sort");
      break;
    case "totalMember":
      changeIconSort("heading-totalMember", sortTypeClazz);
      changeIconSort("heading-name", "fa-sort");
      changeIconSort("heading-createDate", "fa-sort");
      changeIconSort("heading-type", "fa-sort");
      break;
    case "type":
      changeIconSort("heading-type", sortTypeClazz);
      changeIconSort("heading-totalMember", "fa-sort");
      changeIconSort("heading-name", "fa-sort");
      changeIconSort("heading-createDate", "fa-sort");
      break;
    case "createdDate":
      changeIconSort("heading-createDate", sortTypeClazz);
      changeIconSort("heading-name", "fa-sort");
      changeIconSort("heading-totalMember", "fa-sort");
      changeIconSort("heading-type", "fa-sort");
      break;
    default:
      changeIconSort("heading-name", "fa-sort");
      changeIconSort("heading-totalMember", "fa-sort");
      changeIconSort("heading-createDate", "fa-sort");
      changeIconSort("heading-type", "fa-sort");
      break;
  }
}

function changeIconSort(id, sortTypeClazz) {
  document
    .getElementById(id)
    .classList.remove("fa-sort", "fa-sort-asc", "fa-sort-desc");
  document.getElementById(id).classList.add(sortTypeClazz);
}

function changeSort(field) {
  if (field == sortField) {
    isAsc = !isAsc;
  } else {
    sortField = field;
    isAsc = true;
  }
  buildTable();
}
function resetSort() {
  sortField = "totalMember";
  isAsc = false;
}

function resetDeleteCheckbox() {
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

function resetTable() {
  resetPaging();
  resetSort();
  resetSearch();
  resetFilter();
  resetDeleteCheckbox();
}

function resetSearch() {
  document.getElementById("input-search-department").value = "";
}

// https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
function handKeyUpEventForSearching(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    event.preventDefault();
    handleSearch();
  }
}

function handleSearch() {
  resetPaging();
  resetSort();
  resetDeleteCheckbox();
  buildTable();
}

function changeMinCreateDate(e) {
  minCreateDate = e.target.value;
  resetPaging();
  resetSort();
  resetDeleteCheckbox();
  buildTable();
}

function changeMaxCreateDate(e) {
  maxCreateDate = e.target.value;
  resetPaging();
  resetSort();
  resetDeleteCheckbox();
  buildTable();
}

function resetFilter() {
  minCreateDate = "";
  maxCreateDate = "";
  typeFilter = "";
  document.getElementById("minCreateDate").value = "";
  document.getElementById("maxCreateDate").value = "";
  $("#type-select option:first").prop("selected", true);
}

function refreshTable() {
  resetTable();
  buildTable();
}

function fillDepartmentToTable() {
  departments.forEach(function (item, index) {
    $("#mainDepartment").append(
      "<tr>" +
        '<td><input id="checkbox-' +
        index +
        '" type="checkbox" onClick="onChangeCheckboxItem()"></td>' +
        "<td>" +
        item.name +
        "</td>" +
        "<td>" +
        item.totalMember +
        "</td>" +
        "<td>" +
        item.type +
        "</td>" +
        "<td>" +
        item.createdDate +
        "</td>" +
        "<td>" +
        '<a class="edit" title="Edit" data-toggle="tooltip" onclick="openUpdateModal(' +
        item.id +
        ')"><i class="material-icons">&#xE254;</i></a>' +
        '<a class="delete" title="Delete" data-toggle="tooltip" onClick="openConfirmDelete(' +
        item.id +
        ')"><i class="material-icons">&#xE872;</i></a>' +
        "</td>" +
        "</tr>"
    );
  });
}

function buildTable() {
  $("#mainDepartment").empty();
  getListDepartments();
}

function openAddModal() {
  if (roleUser == "MANAGER") {
    alert("only accessible to ADMIN");
    return;
  } else {
    openModal();
    resetFormAdd();
  }
}

function resetFormAdd() {
  document.getElementById("titleModal").innerHTML = "Add Department";
  document.getElementById("name").value = "";
  $("#type-Modal option:first").prop("selected", true);
  document.getElementById("id").value = "";
  hideNameErrorMessage();
}

function openModal() {
  $("#myModal").modal("show");
  document.getElementById("name").disabled = false;
}

function hideModal() {
  $("#myModal").modal("hide");
  $("#modalInitAccount").modal("hide");
  document.getElementById("navbar").style.display = "block";
}

function showNameErrorMessage(message) {
  document.getElementById("nameErrorMessage").style.display = "block";
  document.getElementById("nameErrorMessage").innerHTML = message;
}

function hideNameErrorMessage() {
  document.getElementById("nameErrorMessage").style.display = "none";
}

function addDepartment() {
  // get checked
  var ids = [];
  var i = 0;
  while (true) {
    var checkboxItem = document.getElementById("accCheckbox-" + i);
    if (checkboxItem !== undefined && checkboxItem !== null) {
      if (checkboxItem.checked) {
        ids.push(accounts[i].id);
        //sau khi lấy giá trị thì reset checkbox
        document.getElementById("accCheckbox-" + i).checked = false;
      }
      i++;
    } else {
      break;
    }
  }
  // get data
  var name = document.getElementById("name").value;
  typeId = $("select#type-Modal").children("option:selected").val();
  type = document.getElementById("modal" + typeId).getAttribute("name");

  // validate unique name
  $.ajax({
    url: "http://localhost:8080/api/v1/departments/name/" + name + "/exists",
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
        $("#myModal").modal("show");
        $("#modalInitAccount").modal("hide");
        showNameErrorMessage("Department name is exists!");
      } else {
        // call api create department
        var department = {
          name: name,
          type: type,
          accountIds: ids,
        };

        $.ajax({
          url: "http://localhost:8080/api/v1/departments/admin/post",
          type: "POST",
          data: JSON.stringify(department), // body
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
            hideModal();
            // hideModalInitAccount();
            showSuccessAlert();
            resetTable();
            buildTable();
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

function resetFormUpdate() {
  document.getElementById("titleModal").innerHTML = "Update Department";
  hideNameErrorMessage();
}

var oldName;

function openUpdateModal(id) {
  if (roleUser == "MANAGER") {
    alert("only accessible to ADMIN");
    return;
  } else {
    // call API from server
    $.ajax({
      url: "http://localhost:8080/api/v1/departments/" + id,
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
        openModal();
        resetFormUpdate();

        // fill data
        // fill data
        document.getElementById("id").value = data.id;
        document.getElementById("name").value = data.name;
        document.getElementById("modal" + data.type).selected = true;
        //
        // can not change department Name
        document.getElementById("name").disabled = true;
      },
      error(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      },
    });
  }
}

function save() {
  // validate name không chứa kí tự đặc biệt 
  var name = document.getElementById("name").value;
  regex = /[A-Za-z0-9 ]+$/;
  // alert (regex.test(name));
  if (!name) {
    // show error message
    showNameErrorMessage("Department name must not null!");
    return;
  } else if (regex.test(name) === false) {
    showNameErrorMessage(
      "can't contain special characters"
    );
    return;
  }

  var id = document.getElementById("id").value;

  if (id == null || id == "") {
    $("#myModal").modal("hide");
    $("#modalInitAccount").modal("show");
    document.getElementById("navbar").style.display = "none";
    // addDepartment(
  } else {
    updateDepartment();
  }
}

function updateDepartment() {
  var id = document.getElementById("id").value;
  typeId = $("select#type-Modal").children("option:selected").val();
  type = document.getElementById("modal" + typeId).getAttribute("name");
  var department = {
    id: id,
    type: type,
  };
  $.ajax({
    url: "http://localhost:8080/api/v1/departments/admin/put/" + id,
    type: "PUT",
    data: JSON.stringify(department), // body
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
      hideModal();
      // hideModalInitAccount();
      showSuccessAlert();
      resetTable();
      buildTable();
    },
    error(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
  });
}

function openConfirmDelete(id) {
  if (roleUser == "MANAGER") {
    alert("only accessible to ADMIN");
    return;
  } else {
    // get index from employee's id
    var index = departments.findIndex((x) => x.id == id);
    var name = departments[index].name;

    var result = confirm("Want to delete " + name + "?");
    if (result) {
      deleteDepartment(id);
    }
  }
}

function deleteDepartment(id) {
  // TODO validate

  $.ajax({
    url: "http://localhost:8080/api/v1/departments/admin/delete/" + id,
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
      showSuccessAlert();
      resetTable();
      buildTable();
    },
  });
}

function onChangeCheckboxItem() {
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

function onChangeCheckboxAll() {
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

function deleteAllDepartment() {
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
          ids.push(departments[i].id);
          names.push(departments[i].name);
        }
        i++;
      } else {
        break;
      }
    }

    // open confirm ==> bạn có muốn xóa bản ghi ...

    var result = confirm("Want to delete " + names + "?");
    if (result) {
      departmentIds = {
        ids: ids,
      };
      // call API
      $.ajax({
        url: "http://localhost:8080/api/v1/departments/admin/delete",
        type: "DELETE",
        data: JSON.stringify(departmentIds),
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
          showSuccessAlert();
          resetTable();
          buildTable();
        },
      });
    }
  }
}

function showSuccessAlert() {
  $("#success-alert")
    .fadeTo(2000, 2000)
    .slideUp(2000, function () {
      $("#success-alert").slideUp(2000);
    });
}

function buildAccountForAddDepartment() {
  $("#accountModal").empty();
  getListAccountsForAddDepartment();
}

function fillAccountForAddDepartment() {
  accounts.forEach(function (item, index) {
    $("#accountModal").append(
      '<tr class ="rowCol" >' +
        '<td><input id="accCheckbox-' +
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
        "</tr>"
    );
  });
  rowCol();
}

function getListAccountsForAddDepartment() {
  // call API from server
  $.ajax({
    url: "http://localhost:8080/api/v1/accounts",
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
      fillAccountForAddDepartment();
    },
    error(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
  });
}
function rowCol() {
  let rowCol = document.getElementsByClassName("rowCol");
  for (i = 0; i < rowCol.length; i += 2) {
    rowCol[i].style.background = "rgb(240, 231, 231)";
  }
}

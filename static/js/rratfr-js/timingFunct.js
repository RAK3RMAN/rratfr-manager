/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
RRATFR Manager Front-End JS - Authored by: RAk3rman
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\*/
//Declare socket.io
let socket = io();

//Set SA Toast Settings
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
});

//Set Table Settings
let tableSettings = {
    "lengthMenu": [
        [10, 25, 50, -1],
        [10, 25, 50, "All"]
    ],
    "responsive": true,
};
let queueTable = $('#queueTable').DataTable(tableSettings);
let enrouteTable = $('#enrouteTable').DataTable(tableSettings);
let leaderTable = $('#leaderTable').DataTable(tableSettings);

//Socket.io Get Statistics
socket.on('entry_data', function (data) {
    queueTable.clear();
    enrouteTable.clear();
    leaderTable.clear();
    $.each(data, function (i, value) {
        if (value.timing_status === "waiting") {
            queueTable.row.add([value.bib_number, value.entry_name, value.category]);
        } else if (value.timing_status === "en_route") {
            enrouteTable.row.add([value.bib_number, value.entry_name, moment(value.start_time).format('MM/DD/YY, h:mm:ss a'), value.category]);
        } else {
            leaderTable.row.add([value.final_place, value.entry_name, value.final_time, value.category]);
        }
    });
    queueTable.draw();
    enrouteTable.draw();
    leaderTable.draw();
});


//Pass socket.io call to check bib #
let currentBib;
let buttonElement = $('#buttonElement');
let infoElement = $('#infoElement');
function check_Bib(value) {
    socket.emit('check_bib', value);
    currentBib = value;
}

//Socket.io React to bib check result
socket.on('check_bib_result', function (data) {
    let infoBase = "<div class=\"card-header p-0\"></div>\n" +
        "   <div class=\"card-footer mt-0\">\n" +
        "       <div class=\"col-3 pr-2 pl-2\">\n" +
        "       <button class=\"btn btn-outline-success pr-0 pl-0\" style=\"width: 100%\">\n" +
        "           <i class=\"fas fa-clipboard-list\"></i>\n" +
        "           <div class=\"ripple-container\"></div>\n" +
        "       </button>\n" +
        "   </div>\n" +
        "   <div class=\"col-9 pr-2 pl-2\">\n" +
        "       <p class=\"mb-0\"><strong>Entry Name:</strong> " + data.entry_name + "</p>\n" +
        "       <p class=\"mb-0\"><strong>Category:</strong> " + data.category + "</p>\n" +
        "   </div>\n" +
        "</div>";
    buttonElement.empty();
    infoElement.empty();
    infoElement.append(infoBase);
    if (data.result === "start_ready") {
        buttonElement.append(
            "<button class=\"btn btn-success\" onclick=\"startEntry(currentBib)\" style=\"width: 100%\">\n" +
            "   <i class=\"fas fa-stopwatch\"></i> Start\n" +
            "   <div class=\"ripple-container\"></div>\n" +
            "</button>"
        );
    } else if (data.result === "finish_ready") {
        buttonElement.append(
            "<button class=\"btn btn-success\" onclick=\"finishEntry(currentBib)\" style=\"width: 100%\">\n" +
            "   <i class=\"fas fa-flag-checkered\"></i> Finish\n" +
            "   <div class=\"ripple-container\"></div>\n" +
            "</button>"
        );
    } else if (data.result === "finished") {
        buttonElement.append(
            "<button class=\"btn btn-danger\" onclick=\"dqEntry(currentBib)\" style=\"width: 100%\">\n" +
            "   <i class=\"fas fa-skull-crossbones\"></i> DQ Entry\n" +
            "   <div class=\"ripple-container\"></div>\n" +
            "</button>"
        );
    } else if (data.result === "dq") {
        buttonElement.append(
            "<button class=\"btn btn-danger\" style=\"width: 100%\">\n" +
            "   <i class=\"fas fa-book-dead\"></i> Entry DQ\n" +
            "   <div class=\"ripple-container\"></div>\n" +
            "</button>"
        );
    } else {
        buttonElement.append(
            "<button class=\"btn btn-warning\" style=\"width: 100%\">\n" +
            "   <i class=\"fas fa-exclamation-triangle\"></i> Not Found\n" +
            "   <div class=\"ripple-container\"></div>\n" +
            "</button>"
        );
        infoElement.empty();
    }
    if (data.safety_status === "false") {
        Toast.fire({
            type: 'error',
            title: 'This entry is missing a valid safety check!'
        });
    }
});

//Socket.io Error
socket.on('error', function (data) {
    console.log(data);
    Toast.fire({
        type: 'error',
        title: 'Error with retrieving data...'
    });
});

//Start Entry Time
function startEntry(bib_number) {
    $.ajax({
        type: "POST",
        url: "/api/entry/timing/update",
        data: {
            status: 'start',
            bib_number: bib_number,
        },
        success: function (data) {
            buttonElement.empty();
            buttonElement.append(
                "<button class=\"btn btn-muted\" style=\"width: 100%\">\n" +
                "   <i class=\"fas fa-arrow-left\"></i> Enter Bib #\n" +
                "   <div class=\"ripple-container\"></div>\n" +
                "</button>"
            );
            Toast.fire({
                type: 'success',
                title: 'Entry ' + bib_number + ' has started!'
            });
            $('#bibElement').val('');
            infoElement.empty();
        },
        error: function (data) {
            console.log(data);
            Toast.fire({
                type: 'error',
                title: 'Error with sending data...'
            });
        }
    });
}

//Finish Entry Time
function finishEntry(bib_number) {
    $.ajax({
        type: "POST",
        url: "/api/entry/timing/update",
        data: {
            status: 'finish',
            bib_number: bib_number,
        },
        success: function (data) {
            buttonElement.empty();
            buttonElement.append(
                "<button class=\"btn btn-muted\" style=\"width: 100%\">\n" +
                "   <i class=\"fas fa-arrow-left\"></i> Enter Bib #\n" +
                "   <div class=\"ripple-container\"></div>\n" +
                "</button>"
            );
            Toast.fire({
                type: 'success',
                title: 'Entry ' + bib_number + ' has finished!'
            });
            $('#bibElement').val('');
            infoElement.empty();
        },
        error: function (data) {
            console.log(data);
            Toast.fire({
                type: 'error',
                title: 'Error with sending data...'
            });
        }
    });
}

//DQ Entry
function dqEntry(bib_number) {
    $.ajax({
        type: "POST",
        url: "/api/entry/timing/update",
        data: {
            status: 'dq',
            bib_number: bib_number,
        },
        success: function (data) {
            socket.emit('check_bib', bib_number);
            Toast.fire({
                type: 'success',
                title: 'Entry ' + bib_number + ' has been DQ!'
            });
        },
        error: function (data) {
            console.log(data);
            Toast.fire({
                type: 'error',
                title: 'Error with sending data...'
            });
        }
    });
}

//Select Dashboard Image
function setImage() {
    let random = (Math.floor(Math.random() * 8)) + 1;
    document.getElementById("coverImage").style = "background-image: url('/static/img/race-" + random + ".jpg'); background-size: cover; background-position: top center;";
}
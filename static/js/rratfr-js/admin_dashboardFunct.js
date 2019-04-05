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
let leaderTable = $('#leaderTable').DataTable(tableSettings);

//Socket.io Get Statistics
socket.on('race_data', function(data){
    document.getElementById("totalStat").innerHTML = data.total_entries;
    document.getElementById("safetyStat").innerHTML = data.missing_safety;
    document.getElementById("inwaterStat").innerHTML = data.entries_in_water;
    document.getElementById("finishStat").innerHTML = data.entries_finished;
});

//Socket.io Get Statistics
socket.on('entry_data', function (data) {
    leaderTable.clear();
    $.each(data, function (i, value) {
        leaderTable.row.add([value.final_place, value.entry_name, value.final_time, value.category]);
    });
    leaderTable.draw();
});

//Socket.io Error
socket.on('error', function(data){
    console.log(data);
    Toast.fire({
        type: 'error',
        title: 'Error with retrieving data...'
    });
});
btn = document.getElementById("addBtn")
btn.onclick = addProcess

process = document.getElementById("name")
at = document.getElementById("at")
bt = document.getElementById("bt")

var auto_mode = false;

p = new Set()
P = new Set()

var str_to_index = {};
var str_wait = "( ";
var str_tat = "( ";

var baseHtml = document.getElementById("processTable").innerHTML;
function showProess(){
    var proNumber = 1;
    var tab = baseHtml;
    p.forEach(element => {
        var temp = element.split(' ');
        tab += `
        <tr id=${proNumber}>
            <td style="width: 40%;" class="proTab" id = "${proNumber}0">${temp[0]}</td>
            <td style="width: 25%;" class="proTab" id = "${proNumber}1">${temp[1]}</td>
            <td style="width: 25%;" class="proTab" id = "${proNumber}2">${temp[2]}</td>
            <td style="width: 10%;"><button style="height:1.6rem; width:1.6rem; background-color: #E60965; border-radius:100%; color:#EEEEEE;" onclick="removeProcess(${proNumber})">X</button></td>
        </tr>
        `
        proNumber++;
    });
    document.getElementById("processTable").innerHTML = tab;
}

function removeProcess(index){
    var temp = ""
    temp += document.getElementById(index+"0").innerText + " "
    temp += document.getElementById(index+"1").innerText + " "
    temp += document.getElementById(index+"2").innerText
    p.delete(temp);
    showProess();
}

function addProcess(){
    pro_name = process.value;
    a = at.value;
    b = bt.value;
    var temp = pro_name + " " + b + " " + a;
    p.add(temp);
    showProess();
    process.value = ""
    at.value = ""
    bt.value = ""
}

function addProcess1(a,b,c){
    pro_name = a;
    a = b;
    b = c;
    var temp = pro_name + " " + a + " " + b;
    p.add(temp);
    showProess();
    process.value = ""
    at.value = ""
    bt.value = ""
}

addProcess1("P1" , 10 , 4)
addProcess1("P2" , 20 , 5)
addProcess1("P3" , 15 , 18)
addProcess1("P4" , 6 , 10)
addProcess1("P5" , 16 , 12)

function getName(str){
    var temp = str.split(' ')
    return temp[0];
}
function getA(str){
    var temp = str.split(' ')
    return parseInt(temp[2]);
}
function getB(str){
    var temp = str.split(' ')
    return parseInt(temp[1]);
}

var currentTime = 0;
var totalProcess = 0;
var doneProcess = 0;
var tat_sum = 0;
var wait_sum = 0;

var time_quantum = 0;
document.getElementById("drop-down").addEventListener("change" , function(){
    var e = document.getElementById("drop-down");
    var tq = document.getElementById("time_quantum");
    var rd = document.getElementById("ready_div");
    tq.style.display = "none";
    rd.style.display = "none";
    if(e.selectedIndex == 3) tq.style.display = "inline-block";
    if(e.selectedIndex == 3) rd.style.display = "block";
});

var start_button_pressed = false;
function processScheduling(){
    console.log(document.getElementsByClassName("avg_tat")[0].offsetTop);

    if(start_button_pressed == false){
        alert('Press Start button first to start');
        return;
    }
    if(doneProcess == totalProcess){
        alert('Completed :)')
        return -1;
    }
    var e = document.getElementById("drop-down");
    var index = e.selectedIndex;
    if(index == 0) FCFS();
    else if(index == 1) SJF();
    else if(index == 2) SRTF();
    else if(index == 3) RR();
    detect_completed_process();
    same_height();
    var check = document.getElementById("auto_mode");
    auto_mode = check.checked;
}

function SRTF(){
    if(P.size == 0) return ;
    var run_me ;
    var min_a = 100000 , a_time;
    P.forEach(pro => {
        a_time = getA(pro);
        if(min_a > a_time) min_a = a_time;
    });
    if(min_a > currentTime){
        addChart(min_a - currentTime , min_a , "-");
        currentTime = min_a;
        return;
    }
    var min_bTime = 100000;
    P.forEach(pro => {
        a_time = getA(pro);
        b_time = getB(pro);
        if(a_time <= currentTime){
            if(b_time < min_bTime){
                min_bTime = b_time;
                run_me = pro;
            }
            else if(b_time == min_bTime){
                if(getName(run_me) > getName(pro)){
                    run_me = pro;
                }
            }
        }
    });

    P.delete(run_me);
    var run_time = getB(run_me);
    var next_process_arrive = 100000;
    P.forEach(pro =>{
        if(getA(pro) < next_process_arrive && getA(pro) != getA(run_me) && getB(run_me) > getB(pro)){
            next_process_arrive = getA(pro);
        }
    });
    var ind = str_to_index[getName(run_me)];
    var make_id = "last" + ind;
    if(run_time + currentTime - 1 > next_process_arrive){
        run_time = next_process_arrive - currentTime;
        var new_b = getB(run_me) - run_time;
        var add_again = getName(run_me) + " " + new_b + " " + getA(run_me);
        P.add(add_again);
        document.getElementById(make_id + "7").innerText = new_b;
    }
    else{
        doneProcess++;
        var completion_time = document.getElementById(make_id + "4");
        var tat_time = document.getElementById(make_id + "5");
        var waiting_time = document.getElementById(make_id + "6");
        completion_time.innerText = currentTime + run_time; 
        var tat = currentTime + run_time - getA(run_me);
        var initial_bTime = document.getElementById(make_id + "3").innerText;
        var wait_time = tat - initial_bTime;
        str_tat += tat;
        str_wait += wait_time;
        tat_time.innerText = tat;
        waiting_time.innerText = wait_time;
        document.getElementById(make_id + "7").innerText = "0";
        if(doneProcess == totalProcess){
            showTAT_WT();
        }
    }
    currentTime += run_time;
    addChart(run_time , currentTime , getName(run_me));
}

function detect_completed_process(){
    p.forEach(pro => {
        var _index = str_to_index[getName(pro)];
        var _id = "last" + _index + "7";
        var _remaining_bTime = parseInt(document.getElementById(_id).innerText);
        if(_remaining_bTime == 0)
            change_color_of_completed_process(pro);
    });
}

function SJF(){
    if(P.size == 0) return;

    var min_arrvial = 100000;
    var run_me ;
    P.forEach(pro => {
        if(min_arrvial > getA(pro)) min_arrvial = getA(pro);
    });

    if(min_arrvial > currentTime){
        addChart(min_arrvial - currentTime , min_arrvial , "-");
        currentTime = min_arrvial;
        return;
    }

    var min_burst = 100000;
    P.forEach(pro => {
        if(getA(pro) <= currentTime && min_burst > getB(pro)){
            min_burst = getB(pro);
            run_me = pro;
        }
        else if(min_burst ==  getB(pro) && getName(pro) < run_me) run_me = getName(pro);
    });

    P.delete(run_me);
    currentTime += getB(run_me);
    addChart(getB(run_me) , currentTime , getName(run_me));
    var ind = str_to_index[getName(run_me)];
    var make_id = "last" + ind;
    doneProcess++;
    var completion_time = document.getElementById(make_id + "4");
    var tat_time = document.getElementById(make_id + "5");
    var waiting_time = document.getElementById(make_id + "6");
    completion_time.innerText = currentTime; 
    var tat = currentTime - getA(run_me);
    var initial_bTime = document.getElementById(make_id + "3").innerText;
    var wait_time = tat - initial_bTime;
    str_tat += tat;
    str_wait += wait_time;
    tat_time.innerText = tat;
    waiting_time.innerText = wait_time;
    document.getElementById(make_id + "7").innerText = "0";
    if(doneProcess == totalProcess){
        showTAT_WT();
    }
}

function FCFS(){
    if(P.size == 0) return;

    var min_arrvial = 100000;
    var run_me ;
    P.forEach(pro => {
        if(min_arrvial > getA(pro)){
            min_arrvial = getA(pro);
            run_me = pro;
        }
        else if(min_arrvial == getA(pro) && run_me > getName(pro)) run_me = pro;
    });

    if(min_arrvial > currentTime){
        addChart(min_arrvial - currentTime , min_arrvial , "-");
        currentTime = min_arrvial;
        return;
    }

    P.delete(run_me);
    currentTime += getB(run_me);
    addChart(getB(run_me) , currentTime , getName(run_me));
    var ind = str_to_index[getName(run_me)];
    var make_id = "last" + ind;
    doneProcess++;
    var completion_time = document.getElementById(make_id + "4");
    var tat_time = document.getElementById(make_id + "5");
    var waiting_time = document.getElementById(make_id + "6");
    completion_time.innerText = currentTime; 
    var tat = currentTime - getA(run_me);
    var initial_bTime = document.getElementById(make_id + "3").innerText;
    var wait_time = tat - initial_bTime;
    str_tat += tat;
    str_wait += wait_time;
    tat_time.innerText = tat;
    waiting_time.innerText = wait_time;
    document.getElementById(make_id + "7").innerText = "0";
    if(doneProcess == totalProcess){
        showTAT_WT();
    }
}

function showTAT_WT(){
    str_tat = "( ";
    str_wait = "( ";
    for(var index = 1; index <= totalProcess ; index++){
        var make_id = "last" + index;
        str_tat += document.getElementById(make_id + "5").innerText;
        str_wait += document.getElementById(make_id + "6").innerText;
        tat_sum += parseInt(document.getElementById(make_id + "5").innerText);
        wait_sum += parseInt(document.getElementById(make_id + "6").innerText);

        if(index == totalProcess){
            str_tat += " ) / " + totalProcess + " = ";
            str_wait += " ) / " + totalProcess + " = ";
        }
        else{
            str_tat += " + ";
            str_wait += " + ";
        }
    }

    var avg_tat_html = "Avarage Turn around Time : "
    avg_tat_html += `
        <span class="calc">${str_tat}</span>
        <span class="ans">${Number(tat_sum / totalProcess).toFixed(3)}</span>
    `;
    document.getElementsByClassName("avg_tat")[0].innerHTML = avg_tat_html;
    var avg_wait_html = "Avarage Waiting Time : "
    avg_wait_html += `
        <span class="calc">${str_wait}</span>
        <span class="ans">${Number(wait_sum / totalProcess).toFixed(3)}</span>
    `;
    document.getElementsByClassName("avg_wait")[0].innerHTML = avg_wait_html;
}

var base_of_table = ""
var done = 0;

function change_color_of_completed_process(process){
    var ind = str_to_index[getName(process)]; 
    var temp = "last" + ind;
    for(var i=1;i<=7;i++){
        var _id = temp + i;
        document.getElementById(_id).style.backgroundColor = "#C0EDA6";
    }
}

function auto_mode_function(){
    setTimeout(() => {
        var temp = processScheduling();
        if(temp != -1 && auto_mode == true) auto_mode_function();
    }, 1000);
}

function tempf(){
console.log(document.getElementsByClassName("avg_tat")[0].offsetTop);

    var e = document.getElementById("drop-down");
    if(e.selectedIndex == 3){
        var temp = parseInt(document.getElementById("tq").value); console.log(temp);
        if(isNaN(temp) || temp <= 0){
            alert("Enter the valid value of time quantum");
            return;
        }
    }
    start_button_pressed = true;
    chart_number = 1;
    while(ready_queue.length > 0) ready_queue.pop();
    document.getElementById("ready").innerHTML = "";
    document.getElementsByClassName("avg_wait")[0].innerHTML = "Avarage Waiting Time : ";
    document.getElementsByClassName("avg_tat")[0].innerHTML = "Avarage Turn around Time : ";
    totalProcess = 0;
    doneProcess = 0;
    tat_sum = 0;
    wait_sum = 0;
    if(done == 0){
        done = 1;
        base_of_table =  document.getElementById("last").innerHTML ;
    }
    str_to_index = {}
    document.getElementById("pro").innerHTML = "";
    document.getElementById("num").innerHTML = "";
    p.forEach(pro=>{
        P.add(pro);
    });
    currentTime = 0;
    var tab = document.getElementById("last");
    var temp = base_of_table;
    var cnt = 1;
    p.forEach(pro=>{
        totalProcess++;
        str_to_index[getName(pro)] = cnt;
        temp += `
        <tr>
        <td id = "last${cnt}1" class="c">${getName(pro)}</td>
        <td id = "last${cnt}2" class="c">${getA(pro)}</td>
        <td id = "last${cnt}3" class="c">${getB(pro)}</td>
        <td id = "last${cnt}4" class="c">Completion Time</td>
        <td id = "last${cnt}5" class="c">Turn around Time</td>
        <td id = "last${cnt}6" class="c">Waiting Time</td>
        <td id = "last${cnt}7" class="c">${getB(pro)}</td>
        </tr>
        `;
        cnt++;
    });
    tab.innerHTML = temp;
    same_height();

    var check = document.getElementById("auto_mode");
    if(check.checked == true){
        auto_mode = true;
        auto_mode_function();
    }
    else{
        auto_mode = false;
    }
}

function same_height(){
    var max_height = document.getElementsByClassName("avg_tat")[0].offsetTop;
    // var max_height = document.getElementsByClassName("add")[0].clientHeight;
    // var temp_height = document.getElementsByClassName("main")[0].clientHeight;
    // if(max_height < temp_height) max_height = temp_height;
    var str_height = max_height;
    str_height += "px";
    document.getElementsByClassName("main")[0].style.height = str_height;
    document.getElementsByClassName("add")[0].style.height = str_height;
}

document.getElementById("start").addEventListener("click" , tempf);
document.getElementById("temp").addEventListener("click" , function(){
    if(auto_mode == true) return;
    processScheduling();
});

var id_num = 1;
var chart_number = 1;
function addChart(width , time , name){
    var w_str = width*10;
    w_str += "px";
    var html1 = document.getElementById("pro").innerHTML;
    // var html2 = document.getElementById("num").innerHTML;
    html1 += `<div class="demo"><div class="box c" id="chart${chart_number}" style="width:${0}; background-color:#FFA1C9;">${name}</div><br><div class="box r" style="width:${w_str}">${time}</div></div>`;
    document.getElementById("pro").innerHTML = html1;
    // document.getElementById("num").innerHTML = html2;
    add_animation(width , chart_number , 1);
    chart_number++;
}
var animation_time = 200;
function add_animation(width , _id , _time){
    if(_time == 11){
        document.getElementById("chart" + _id).style.backgroundColor = "#E60965";
        return;
    }
    setTimeout(() => {
        document.getElementById("chart" + _id).style.width = _time * width + "px";
        add_animation(width , _id , _time + 1);
    }, animation_time / 10);
}


document.getElementById("tq").addEventListener("change" , function(){
    time_quantum = parseInt(document.getElementById("tq").value);
});


document.getElementById("tq").addEventListener("input" , function(){
    time_quantum = parseInt(document.getElementById("tq").value);
});

function remainingBurstTime(pro){
    var _index = str_to_index[getName(pro)];
    var _id = "last" + _index + "7";
    var _remaining_bTime = parseInt(document.getElementById(_id).innerText);
    return _remaining_bTime;
}

var ready_queue = []
function ready_queue_simulation(){
    var width = 5;
    var w_str = width*10;
    w_str += "px";
    var html = "";
    for(var i=0;i<ready_queue.length;i++){
        html += `<div class="box rr" style="width:${w_str}; background-color:#6BCB77;">${getName(ready_queue[i])}</div>`;
    }
    document.getElementById("ready").innerHTML = html;
}
function RR(){
    if(ready_queue.length == 0){
        if(P.size == 0) return ;
        var min_a = 100000 , a_time;
        P.forEach(pro => {
            a_time = getA(pro);
            if(min_a > a_time) min_a = a_time;
        });
        if(min_a > currentTime){
            addChart(min_a - currentTime , min_a , "-");
            currentTime = min_a;
            var temp_ready = [];
            P.forEach(pro => {
                if(getA(pro) == currentTime){
                    temp_ready.push(pro);
                }
            });
            temp_ready.forEach(ready => {
                ready_queue.push(ready);
                P.delete(ready);
            })
            ready_queue_simulation();
            return;
        }

        while(1){
            var min_arrival_time = 10000;
            var ready;
            P.forEach(pro => {
                if(getA(pro) <= currentTime){
                    if(getA(pro) < min_arrival_time){
                        min_arrival_time = getA(pro)
                        ready = pro;
                    }
                }
            });
            if(min_arrival_time == 10000) break;
            ready_queue.push(ready);
            P.delete(ready);
        }
    }

    var temp = ready_queue.shift();
    var _remaining_bTime = remainingBurstTime(temp);
    var run_time = Math.min(_remaining_bTime , time_quantum);

    _remaining_bTime -= run_time;
    currentTime += run_time;
    addChart(run_time , currentTime , getName(temp));

    var ind = str_to_index[getName(temp)];
    var make_id = "last" + ind;

    while(1){
        var min_arrival_time = 10000;
        var ready;
        P.forEach(pro => {
            if(getA(pro) <= currentTime){
                if(getA(pro) < min_arrival_time){
                    min_arrival_time = getA(pro)
                    ready = pro;
                }
            }
        });
        if(min_arrival_time == 10000) break;
        ready_queue.push(ready);
        P.delete(ready);
    }

    if(_remaining_bTime > 0){
        var new_b = _remaining_bTime;
        ready_queue.push(temp);
        document.getElementById(make_id + "7").innerText = new_b;
    }
    else{
        doneProcess++;
        var completion_time = document.getElementById(make_id + "4");
        var tat_time = document.getElementById(make_id + "5");
        var waiting_time = document.getElementById(make_id + "6");
        completion_time.innerText = currentTime; 
        var tat = currentTime - getA(temp);
        var initial_bTime = document.getElementById(make_id + "3").innerText;
        var wait_time = tat - initial_bTime;
        str_tat += tat;
        str_wait += wait_time;
        tat_time.innerText = tat;
        waiting_time.innerText = wait_time;
        document.getElementById(make_id + "7").innerText = "0";
        if(doneProcess == totalProcess){
            showTAT_WT();
        }
    }

    ready_queue_simulation();
}





// ------------ READ CSV FILE -------------
var obj_csv = {
    size:0,
    dataFile:[]
};
function readCsv(input){
    p.clear();
    console.log(input)
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.readAsBinaryString(input.files[0]);
        reader.onload = function (e) {
            console.log(e);
            obj_csv.size = e.total;
            obj_csv.dataFile = e.target.result
            console.log(obj_csv.dataFile)
            parseData(obj_csv.dataFile)           
        }
    }
}
function parseData(data){
    let csvData = [];
    let lbreak = data.split("\n");
    lbreak.forEach(res => {
        csvData.push(res.trim('\r').split(","));
    });
    console.log(csvData);
    csvData.forEach(pro => {
        if(isNaN(parseInt(pro[1])) == false){
            addProcess1(pro[0] , pro[2] , pro[1]);
        }
    });
}


console.log(document.getElementsByClassName("avg_tat")[0].offsetTop);
class Task{
    constructor(){
        this.taskDiv = document.createElement("div");
        this.taskDiv.className = "task";
        this.taskDiv.id = Task.makeId();
    }
    static idCounter = 0;
    static makeId(){
        Task.idCounter++;
        return ("taskId"+Task.idCounter);
    }
}

class CheckBox{
    constructor(taskHandler){
        this.element = document.createElement("input");
        this.element.type = "checkbox";
        this.element.id = CheckBox.makeId();
        this.taskHandler = taskHandler;

        this.element.addEventListener("click",
            (event)=>{
                let task = event.target.parentNode;
                let taskIndex = this.taskHandler.allTasks.findIndex(
                    (taskFromArray) => taskFromArray.taskDiv == event.target.parentNode
                );
                let taskObject = this.taskHandler.allTasks[taskIndex];
                let neighbor = event.target.nextSibling;
                if(event.target.checked){
                    neighbor.className +=" completed";
                    this.taskHandler.allTasks.push(taskObject);
                    task.parentNode.append(task);
                }   
                else{
                    neighbor.className = neighbor.className.slice(0, neighbor.className.indexOf(" completed"));
                    let uncompletedTaskIndex = this.taskHandler.allTasks.findIndex(
                        (task) => task.taskDiv.className === "task"
                    );
                    if (uncompletedTaskIndex != -1){
                        this.taskHandler.allTasks[uncompletedTaskIndex].taskDiv.before(task);
                    } else this.taskHandler.texter.parentNode.after(task);
                    this.taskHandler.allTasks.unshift(taskObject);
                    taskIndex++;
                }
                this.taskHandler.activeTaskIndex = -1;
                taskObject.taskDiv.className = "task";
                this.taskHandler.allTasks.splice(taskIndex, 1);
            }
        );
    }
    static idCounter = 0;
    static makeId(){
        CheckBox.idCounter++;
        return ("checkBox"+CheckBox.idCounter);
    }
}

class TextBox{
    constructor(someText){
        this.textBoxDiv = document.createElement("div");
        this.textBoxDiv.className = "taskText";
        this.textBoxDiv.innerText = someText; 
        this.textBoxDiv.id = TextBox.makeId();
    }
    static idCounter = 0;
    static makeId(){
        TextBox.idCounter++;
        return ("taskTextId"+TextBox.idCounter);
    }
}

class TrashButton{
    constructor(taskHandler){
        this.element = document.createElement("input");
        this.element.type = "button";
        this.element.className = "trash"; 
        this.element.id = TrashButton.makeId();
        this.taskHandler = taskHandler;

        this.element.addEventListener("click",
            (e)=>{
                let task = e.target.parentNode;
                let taskIndex = this.taskHandler.allTasks.findIndex(
                    (arrayTask) => arrayTask.taskDiv === task
                );
                this.taskHandler.activeTaskIndex = -1;
                this.taskHandler.allTasks.splice(taskIndex, 1);
                task.parentNode.removeChild(task);
            }
        );
    }
    static idCounter = 0;
    static makeId(){
        TrashButton.idCounter++;
        return ("taskTextId"+TrashButton.idCounter);
    }
}

function TaskHandler(texterId, adderId){
    return{
        texter: document.getElementById(texterId),

        adder: document.getElementById(adderId),
        
        allTasks: new Array(),

        activeTaskIndex: -1,

        handelNewTask(){
            if(this.texter.value){
                let task = new Task();
                this.allTasks.push(task);
                let checkbox = new CheckBox(this);
                let textBox = new TextBox(this.texter.value);
                let trashButton = new TrashButton(this);

                task.taskDiv.append(checkbox.element);
                task.taskDiv.append(textBox.textBoxDiv);
                task.taskDiv.append(trashButton.element);
                document.body.append(task.taskDiv);

                //
                //
                this.texter.value = null;
            }
        },
    }
}

const taskHandler = new TaskHandler("newTask", "addTask");
taskHandler.texter.addEventListener("keyup", 
    (e) => {
        if(e.keyCode === 13) taskHandler.handelNewTask();
        if (e.keyCode === 39){
            e.target.nextSibling.focus();
        }
    }
);

document.body.addEventListener("keyup",
    (e) => {
        let tasks = taskHandler.allTasks;   
        if (e.key === "Enter"){
            if (taskHandler.activeTaskIndex != -1){
                let event = new Event("click");
                let checkbox = tasks[taskHandler.activeTaskIndex].taskDiv.firstChild;
                if (checkbox.checked) checkbox.checked = false;
                else checkbox.checked = true;
                checkbox.dispatchEvent(event);
            }
        }
        if (e.key === " "){
            if(taskHandler.activeTaskIndex != -1) tasks[taskHandler.activeTaskIndex].taskDiv.className = "task";
            taskHandler.activeTaskIndex = -1;
            taskHandler.texter.focus();
        }
        if (e.key === "Backspace"){
            if (taskHandler.activeTaskIndex !=-1){
                let event = new Event("click");
                tasks[taskHandler.activeTaskIndex].taskDiv.lastChild.dispatchEvent(event);
            }
        }
        if(e.key === "ArrowDown" || e.key === "ArrowUp"){
            if (tasks.length !=0){
                e.target.blur();
                if(taskHandler.activeTaskIndex != -1) tasks[taskHandler.activeTaskIndex].taskDiv.className = "task";
                if(e.key === "ArrowDown"){
                    if (taskHandler.activeTaskIndex === -1) ++taskHandler.activeTaskIndex;
                    else{
                        if(taskHandler.activeTaskIndex+2 <= tasks.length ) ++taskHandler.activeTaskIndex;
                        else taskHandler.activeTaskIndex = 0;
                    }
                }
                if (e.key === "ArrowUp"){
                    if(taskHandler.activeTaskIndex === -1) taskHandler.activeTaskIndex = tasks.length-1;
                    else{
                        if(taskHandler.activeTaskIndex ===0) taskHandler.activeTaskIndex = tasks.length-1;
                        else --taskHandler.activeTaskIndex;
                    }
                }
                tasks[taskHandler.activeTaskIndex].taskDiv.className += " active";
            }
        }
    }
);

taskHandler.texter.addEventListener("focus", 
    (e)=>{
        if (taskHandler.activeTaskIndex != -1){
            if (e.target.parentNode != taskHandler.allTasks[taskHandler.activeTaskIndex]) {
                taskHandler.allTasks[taskHandler.activeTaskIndex].taskDiv.className = "task";
                taskHandler.activeTaskIndex = -1;
            }
        }
    }
);

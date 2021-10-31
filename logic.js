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
    constructor(){
        this.element = document.createElement("input");
        this.element.type = "checkbox";
        this.element.id = CheckBox.makeId();

        this.element.onclick = function(event){
            let task = event.target.parentNode;
            let neighbor = event.target.nextSibling;
            if(event.target.checked){
                neighbor.className +=" completed";
                task.parentNode.append(task);
            }   
            else{
                neighbor.className = neighbor.className.slice(0, neighbor.className.indexOf(" completed"));
                
                for(let child of task.parentNode.childNodes){
                    if (child.className=="task"){
                        child.before(task);
                        break;
                    }
                }
            }
        }
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
    constructor(){
        this.element = document.createElement("input");
        this.element.type = "button";
        this.element.className = "trash"; 
        this.element.id = TrashButton.makeId();

        this.element.onclick = function(event){
            let task = event.target.parentNode;
            task.parentNode.removeChild(task);
        }
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
                let checkbox = new CheckBox();
                let textBox = new TextBox(this.texter.value);
                let trashButton = new TrashButton();

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

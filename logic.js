class Task{
    constructor(){
        this.taskDiv = document.createElement("div");
        this.taskDiv.className = "task";
        this.taskDiv.tabIndex = "0";

        this.isCompleted = function(){
            let checkbox = this.taskDiv.firstChild;
            return checkbox.checked;
        };

        this.changeClassName = function(){
            if(this.isCompleted()) this.taskDiv.className ="task completed";
            else this.taskDiv.className = "task";
        }

        this.getTextValue = function(){
            let textbox = this.taskDiv.childNodes[1];
            return textbox.innerText;
        }
    }
}

class CheckBox{
    constructor(taskHandler, isCompleted){
        this.element = document.createElement("input");
        this.element.type = "checkbox";
        this.element.checked = isCompleted;
        this.taskHandler = taskHandler;

        this.element.addEventListener("click",
            (event)=>{
                let task = event.target.parentNode;
                let taskIndex = this.taskHandler.allTasks.findIndex(
                    (taskFromArray) => taskFromArray.taskDiv == event.target.parentNode
                );
                let taskObject = this.taskHandler.allTasks[taskIndex];
                if(event.target.checked){
                    this.taskHandler.allTasks.push(taskObject);
                    task.parentNode.append(task);
                }   
                else{
                    this.taskHandler.addToUncompletedTasks(taskObject);
                    taskIndex++;
                }
                taskObject.changeClassName();
                this.taskHandler.activeTaskIndex = -1;
                this.taskHandler.allTasks.splice(taskIndex, 1);
                setLocalStoradge(this.taskHandler.allTasks);
            }
        );
    }
}

class TextBox{
    constructor(someText){
        this.textBoxDiv = document.createElement("div");
        this.textBoxDiv.className = "taskText";
        this.textBoxDiv.innerText = someText; 
    }
}

class TrashButton{
    constructor(taskHandler){
        this.element = document.createElement("input");
        this.element.type = "button";
        this.element.className = "trash"; 
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

                setLocalStoradge(this.taskHandler.allTasks); //
            }
        );
    }
}

function TaskHandler(texterId, adderId){
    return{
        texter: document.getElementById(texterId),

        adder: document.getElementById(adderId),
        
        allTasks: new Array(),

        activeTaskIndex: -1,

        createNewTask(textValue, isCompleted=false){
            let task = new Task();
            let checkbox = new CheckBox(this, isCompleted);
            let textBox = new TextBox(textValue);
            let trashButton = new TrashButton(this);
            
            task.taskDiv.append(checkbox.element);
            task.taskDiv.append(textBox.textBoxDiv);
            task.taskDiv.append(trashButton.element);
            return task;
        },

        readLocalStoradge(textValue, isCompleted=false){
            let task = this.createNewTask(textValue, isCompleted);
            document.body.append(task.taskDiv);
            task.changeClassName();
            this.allTasks.push(task);
        },

        addNewTask(textValue, isCompleted=false){
            let task = this.createNewTask(textValue, isCompleted);
            this.addToUncompletedTasks(task);

            setLocalStoradge(this.allTasks); //
        },
        handleNewTask(){
            if(this.texter.value){
                this.addNewTask(this.texter.value);
                this.texter.value = null;
            }       
        },
        addToUncompletedTasks(newTaskObject){
            let uncompletedTasks = this.allTasks.filter(
                (task)=>{
                    return task.taskDiv.className === "task";
                }
            );
            let lastUncompletedTaskIndex;
            let lastUncopletedTask;
            if(uncompletedTasks.length){
                lastUncopletedTask = uncompletedTasks[uncompletedTasks.length-1];
                lastUncompletedTaskIndex = this.allTasks.lastIndexOf(lastUncopletedTask);
            } else lastUncopletedTask = -1;
            if (lastUncompletedTaskIndex>-1){
                lastUncopletedTask.taskDiv.after(newTaskObject.taskDiv);
                 this.allTasks.splice(lastUncompletedTaskIndex+1, 0, newTaskObject);
            }
            else if (this.allTasks.length) {
                this.allTasks[0].taskDiv.before(newTaskObject.taskDiv);
                this.allTasks.splice(lastUncompletedTaskIndex, 0, newTaskObject);
            }
            else {
                document.body.append(newTaskObject.taskDiv);
                this.allTasks.unshift(newTaskObject);
            }
            this.activeTaskIndex = -1;
        }
    }
}

const taskHandler = new TaskHandler("newTask", "addTask");
taskHandler.texter.addEventListener("keyup", 
    (e) => {
        if(e.keyCode === 13) taskHandler.handleNewTask();
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
            if(taskHandler.activeTaskIndex != -1) tasks[taskHandler.activeTaskIndex].taskDiv.blur();
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
                if(taskHandler.activeTaskIndex != -1) tasks[taskHandler.activeTaskIndex].taskDiv.blur();
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
                tasks[taskHandler.activeTaskIndex].taskDiv.focus();
            }
        }
    }
);

taskHandler.texter.addEventListener("focus", 
    (e)=>{
        if (taskHandler.activeTaskIndex != -1){
            if (e.target.parentNode != taskHandler.allTasks[taskHandler.activeTaskIndex]) {
                taskHandler.allTasks[taskHandler.activeTaskIndex].taskDiv.blur();
                taskHandler.activeTaskIndex = -1;
            }
        }
    }
);

function getLocalStoradge(taskHandler){
    if(localStorage.length){
        for(let i=0; i<=localStorage.length;i++){
            let localStorageTask = JSON.parse(localStorage.getItem(i));
            taskHandler.readLocalStoradge(localStorageTask.textValue, localStorageTask.completed);
        }
    }
    else{
        let localStorageTask = new Object();
        localStorageTask.completed = false;
        localStorageTask.textValue = "написать курсач по бренд-менджменту";
        localStorage.setItem(0, JSON.stringify(localStorageTask));
    }
}

function setLocalStoradge(tasks){
    localStorage.clear();
    let counter = -1
    for(let task of tasks){
        counter++;
        let localStorageTask = new Object();
        localStorageTask.completed = task.isCompleted();
        localStorageTask.textValue = task.getTextValue();
        localStorage.setItem(counter, JSON.stringify(localStorageTask));
    }
}

document.addEventListener("DOMContentLoaded", getLocalStoradge(taskHandler));

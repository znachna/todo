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
            if(event.target.checked){
                alert("Задача выполнена!");
                event.target.nextSibling.style.textDecoration = "line-through";
                event.target.nextSibling.style.color = "red";

                task.parentNode.append(task);
            }   
            else{
                event.target.nextSibling.style.textDecoration = "none";
                event.target.nextSibling.style.color = "black";

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

        handelNewTask(){
            if(this.texter.value){
                let task = new Task();
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
taskHandler.handelNewTask();
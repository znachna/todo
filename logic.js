const deleteTaskFromLocalStorage = (index) => {
    if (index + 1 !== localStorage.length) {
        for (let i = index + 1; i  < localStorage.length; i++) {
            const temporalTask = localStorage.getItem(i);
            localStorage.removeItem(i - 1);
            localStorage.setItem(i - 1, temporalTask);
        }

        index = localStorage.length - 1;
    }
    localStorage.removeItem(index);
}

const addTaskToLocalStorage = (task, index = localStorage.length) => {
    const localStorageTask = {
        completed: task.isCompleted(),
        textValue: task.getTextValue(),
    };

    if (index !== localStorage.length) {    
        for (let i = localStorage.length; i > index; i--) {
            const temporalTask = localStorage.getItem(i - 1);

            localStorage.removeItem(i - 1);
            localStorage.setItem(i, temporalTask);
        }
    }
    localStorage.setItem(index, JSON.stringify(localStorageTask));
}

const getLocalStorage = (taskHandler) => {
    const fromLocalStorage = true; 
    
    if (localStorage.length) {
        for (let i = 0; i < localStorage.length; i++) {
            const localStorageTask = JSON.parse ( localStorage.getItem(i) );

            taskHandler.handleNewTask(localStorageTask.textValue, localStorageTask.completed, fromLocalStorage);
        }
    }
}

class Task {
    constructor() {
        this.taskDiv = document.createElement('div');
        this.taskDiv.className = 'task';
        this.taskDiv.tabIndex = 0;
        this.isOnFocus = false;

        this.taskDiv.addEventListener("focus", 
            () => {
                this.isOnFocus = true;
            }
        );

        this.taskDiv.addEventListener("blur",
            () => {
                this.isOnFocus = false;
            }
        );

        this.isCompleted = () => this.taskDiv.firstChild.checked;

        this.changeClassName = () => this.isCompleted() ? this.taskDiv.className = 'task completed' : this.taskDiv.className = 'task';

        this.getTextValue = () => this.taskDiv.childNodes[1].innerText;
    }
}

class CheckBox {
    constructor (taskHandler, isCompleted = false) {
        this.element = document.createElement('input');
        this.element.type = 'checkbox';
        this.element.checked = isCompleted;
        this.taskHandler = taskHandler;

        this.element.addEventListener('click',
            (event) => {
                const task = event.target.parentNode;
                const taskIndex =  this.taskHandler.allTasks.findIndex(
                     (taskFromArray) => taskFromArray.taskDiv === task
                );
                const taskObject = this.taskHandler.allTasks[taskIndex];

                deleteTaskFromLocalStorage(taskIndex);
                this.taskHandler.allTasks.splice(taskIndex, 1);

                if (event.target.checked) {
                    this.taskHandler.addNewTask(taskObject);
                } else {
                    this.taskHandler.addToUncompletedTasks(taskObject);
                }

                taskObject.changeClassName();
            }
        );
    }
}

class TextBox {
    constructor (taskText) {
        this.textBoxDiv = document.createElement('div');
        this.textBoxDiv.className = 'taskText';
        this.textBoxDiv.innerText = taskText; 
    }
}

class TrashButton {
    constructor (taskHandler) {
        this.element = document.createElement('input');
        this.element.type = 'button';
        this.element.className = 'trash'; 
        this.taskHandler = taskHandler;

        this.element.addEventListener('click',
            (e) => {
                const task = e.target.parentNode;
                const taskIndex = this.taskHandler.allTasks.findIndex(
                    (arrayTask) => arrayTask.taskDiv === task
                );

                this.taskHandler.allTasks.splice(taskIndex, 1);
                task.parentNode.removeChild(task);

                deleteTaskFromLocalStorage(taskIndex);
            }
        );
    }
}

function TaskHandler(texterId, adderId) {
    return {
        texter: document.getElementById(texterId),

        adder: document.getElementById(adderId),
        
        allTasks: [],

        addNewTask(task, fromLocalStorage = false, node = document.body) {
            this.allTasks.push(task);
            node.append(task.taskDiv);

            if (!fromLocalStorage) {
                addTaskToLocalStorage(task);
            }
        },

        createNewTask(textValue, isCompleted) {
            const task = new Task();
            const checkbox = new CheckBox(this, isCompleted);
            const textBox = new TextBox(textValue);
            const trashButton = new TrashButton(this);
            
            task.taskDiv.append(checkbox.element);
            task.taskDiv.append(textBox.textBoxDiv);
            task.taskDiv.append(trashButton.element);
            task.changeClassName();

            return task;
        },

        handleNewTask(textValue = this.texter.value, isCompleted = false, fromLocalStorage = false) {
            if (textValue) {
                const task = this.createNewTask(textValue, isCompleted);
                this.addNewTask(task, fromLocalStorage);
                
                this.texter.value = null;
            }       
        },

        addToUncompletedTasks(newTaskObject) {
            const uncompletedTasks = this.allTasks.filter( task => task.taskDiv.className === 'task' );
            const lastUncompletedTaskIndex = uncompletedTasks.length ? uncompletedTasks.length - 1 : -1;
            const lastUncompletedTask = lastUncompletedTaskIndex !== -1 ? uncompletedTasks[lastUncompletedTaskIndex] : null;

            if (lastUncompletedTaskIndex !== -1) {
                lastUncompletedTask.taskDiv.after(newTaskObject.taskDiv);
                this.allTasks.splice(lastUncompletedTaskIndex + 1, 0, newTaskObject);
                addTaskToLocalStorage(newTaskObject, lastUncompletedTaskIndex + 1);
            } else {
                if (this.allTasks.length) {
                    this.allTasks[0].taskDiv.before(newTaskObject.taskDiv);
                } else {
                    document.body.append(newTaskObject.taskDiv);
                }

                this.allTasks.unshift(newTaskObject);
                addTaskToLocalStorage(newTaskObject, 0);
            }
        }
    }
}

const taskHandler = new TaskHandler('newTask', 'addTask');

document.addEventListener('DOMContentLoaded', getLocalStorage(taskHandler) );

document.body.addEventListener('keyup',
    (e) => {
        const tasks = taskHandler.allTasks; 
        const activeTaskIndex = tasks.findIndex( (task) => task.isOnFocus );
        const activeTask = tasks[activeTaskIndex];
        const hasActiveTask = activeTaskIndex !== -1;

        if (hasActiveTask) {
            const event = new Event('click');

            switch (e.key) {
                case 'Enter':
                    const checkbox = activeTask.taskDiv.firstChild;

                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(event);

                    break;
                case 'Backspace':
                    activeTask.taskDiv.lastChild.dispatchEvent(event);

                    break;
            }
        }

        if (e.key === ' ') {
            taskHandler.texter.focus();
        }

        if ( (e.key === 'ArrowDown' || e.key === 'ArrowUp') && tasks.length) {
            if (e.key === 'ArrowDown') {
                if (activeTaskIndex + 1 === tasks.length) {
                    taskHandler.texter.focus();
                } else {
                    tasks[activeTaskIndex + 1].taskDiv.focus();
                }
            }

            if (e.key === 'ArrowUp') {
                switch (activeTaskIndex) {
                    case -1:
                        tasks[tasks.length - 1].taskDiv.focus();
                        break;
                    case 0: 
                        taskHandler.texter.focus();
                        break;
                    default: 
                        tasks[activeTaskIndex - 1].taskDiv.focus();
                }
            }
        }
    }
);

taskHandler.texter.addEventListener('keyup', 
    (e) => {
        if (e.key === 'Enter') {
            taskHandler.handleNewTask();
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            taskHandler.adder.focus();
        }
    }
);  

taskHandler.adder.addEventListener('keyup',
    (e) => {
        if (e.key === 'Enter') {
            taskHandler.handleNewTask();
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            taskHandler.texter.focus();
        }
    }
);
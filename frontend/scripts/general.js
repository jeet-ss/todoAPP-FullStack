import { todoArray ,loadTodoItems, addTodoItem, deleteTodoItem, updateTodoItem } from "./data.js";


const inputElement = document.querySelector('.js-input');
const dateElement = document.querySelector('.js-date');
const displayElement = document.querySelector('.js-display');
const updateModalElement = document.querySelector('.js-update-modal');
const modalCloseButton = document.querySelector('.js-close-button');


// let todoArray = JSON.parse(localStorage.getItem('todos2')) || [];

loadTodoItems(printTodos);

function printTodos(){
    let todoListHTML = '';
    todoArray.forEach((todoObject, index)=>{
        const {id, text,"event-date": date } = todoObject;
        //console.log(id, text, date, todoObject )
        const todoHTML = `
            
                <span class="todo-item">${text}</span>
                <span class="todo-date">${date}</span>
                <button class="js-update-button update-button" style="align-self: center ; height: max-content;">
                    Update
                </button>
                <button 
                    class="js-delete-button delete-button" 
                    style="align-self: center; height: max-content;"
                    data-id=${id}
                >
                    Delete
                </button>
        
        `;
        todoListHTML += todoHTML;
    });
    displayElement.innerHTML = todoListHTML;

    document.querySelectorAll('.js-delete-button').forEach(
        (button, index) => {
            button.addEventListener('click', () => {
                // get item details from index
                const {id, text,"event-date": date } = todoArray[index];

                deleteTodoItem(id, printTodos)

                // for local Update
                // select 1 element from the mentioned index
                // todoArray.splice(index, 1);
            });
    });

    document.querySelectorAll('.js-update-button').forEach(
        (button, index) => {
            button.addEventListener('click', () => {
                // get values
                const {id, text,"event-date": date } = todoArray[index];
                // Populate the input fields with the present values
                document.querySelector('.js-input-modal').value = text;
                document.querySelector('.js-date-modal').value = date;
                // Turn on Modal Display
                updateModalElement.style.display = 'flex';
                // Handle Close Button
                document.querySelector('.js-close-button').addEventListener('click', ()=>{
                    updateModalElement.style.display = 'none';
                });
                // Handle Confirm Button - Triggers Updates
                document.querySelector('.js-confirm-button').addEventListener('click', ()=>{
                    // Store New Values
                    const newTodo = document.querySelector('.js-input-modal').value;
                    const newDate = document.querySelector('.js-date-modal').value;
                    console.log("update", newTodo, newDate)
                    // If new Values are not null
                    if (newTodo && newDate) {
                        // Close Modal view
                        updateModalElement.style.display = 'none';
                        
                        // Call To Backend
                        updateTodoItem(
                            {id:id, text: newTodo, "event-date": newDate },
                            index,
                            printTodos
                        );

                        // Update local array
                        // todoArray[index] = { text: newTodo, "event-date": newDate };
                        // // Display Todos
                        // printTodos();
                    } else {
                        // Do Somethin
                        // show some message
                        console.log("Fields cannot be empty!");
                    }
                });
            });
        }
    );
}

function saveTodosToLocalStorage(){
    localStorage.setItem('todos2', JSON.stringify(todoArray));
}

function handleAdd(){
    // Check both values are present
    if (inputElement.value != '' && dateElement.value != ''){
        // create a new item
        const newItem = {
            text: inputElement.value,
            "event-date": dateElement.value
        };
        // make call to backend and re render after BE call is successful
        addTodoItem(newItem, [inputElement, dateElement], printTodos);
    } else {
        throw new Error("Empty Item cannot be added");
    }
}

const addButtonElem = document.querySelector('.js-add-button');
addButtonElem.addEventListener('click', () => handleAdd());

document.body.addEventListener('keydown', (event) => {
    if (event.key === 'Enter'){
        handleAdd();
    }
})

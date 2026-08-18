const myItemsURL = 'https://todoapp-fullstack-erlp.onrender.com/items';
// 'https://todoapp-fullstack-erlp.onrender.com/items';
// 'http://127.0.0.1:8000/items';

export let todoArray;

export function loadTodoItems(displayRenderFunction){
    const promise = fetch(
        myItemsURL
    ).then((response) => {
        //console.log(response, response.json(), typeof(response))
        return response.json();
    }).then((responseData)=>{
        todoArray = responseData;
        // display the todos from memomry
        displayRenderFunction();
    });
}

// add
export function addTodoItem(todoItem, resetList, displayRenderFunction){
    
    const promise = fetch(myItemsURL, {
        method: 'POST',
        headers:{
            'Content-type': 'application/json'
        },
        body: JSON.stringify(todoItem)
    }).then((response) => {
        console.log("add", response);
        // if (!response.ok) {
        //     throw new Error('Network response was not ok');
        // }
        return response.json();
    }).then(data => {
        // Update Array locally compared to total fetch
        // Use Updated item from Backend
        todoArray.push(data);
        if (resetList){
            resetList.forEach(element => {
                element.value = '';
            });
        }
        if (displayRenderFunction){
            displayRenderFunction();
        }
        // Call your UI update functions here (e.g., loadTodoItems())
    })
    .catch(error => {
        console.error('Error during POST request:', error);
    });
}


export function deleteTodoItem(itemId, displayRenderFunction){
    const promise = fetch(`${myItemsURL}/${itemId}`, {
        method: "DELETE"
    }).then((response) => {
        // if (!response.ok) {
        //     throw new Error('Network response was not ok');
        // }
        if (displayRenderFunction){
            // Do a Complete fetch of all Items
            loadTodoItems(displayRenderFunction);
        }
    }).catch(error => {
        console.error('Error during DELETE request:', error);
    });
}

export function updateTodoItem(todoItem, arrayIndex ,displayRenderFunction){
     const promise = fetch(myItemsURL, {
        method: 'PUT',
        headers:{
            'Content-type': 'application/json'
        },
        body: JSON.stringify(todoItem)
    }).then((response) => {
        console.log("update", response);
        // if (!response.ok) {
        //     throw new Error('Network response was not ok');
        // }
        return response.json();
    }).then(data => {
        console.log('Success! Updated item:', data);
        // Update Array locally compared to total fetch
        // Use Updated item from Backend
       todoArray[arrayIndex] = data;
        // fetch from backend
        if (displayRenderFunction){
            displayRenderFunction();
            // loadTodoItems(displayRenderFunction);
        }
        // Call your UI update functions here (e.g., loadTodoItems())
    })
    .catch(error => {
        console.error('Error during PUT request:', error);
    });
}




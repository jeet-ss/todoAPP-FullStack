const myItemsURL = 'http://127.0.0.1:8000/items';

export let todoArray;

export function loadTodoItems(displayRenderFunction){
    const promise = fetch(
        'http://127.0.0.1:8000/items'
    ).then((response) => {
        //console.log(response, response.json(), typeof(response))
        return response.json();
    }).then((responseData)=>{
        console.log("responseData", responseData.length);
        todoArray = responseData;
        // display the todos from memomry
        displayRenderFunction();
    });
}

// add
export function addTodoItem(todoItem, resetList, displayRenderFunction){
    console.log("Add-start", todoItem);
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
        console.log('Success! Saved item:', data);
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
        console.log("delete", response);
        // if (!response.ok) {
        //     throw new Error('Network response was not ok');
        // }
        if (displayRenderFunction){
            console.log("Delete, Rerender");
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




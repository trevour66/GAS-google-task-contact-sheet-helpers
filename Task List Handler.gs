function doPost(e) {
  const body = JSON.parse(e.postData.contents)
  var { taskListName, newTask_nextActions } = body,
      isTasklistFound = false

  const output = {
      message: "",
      status: "",
      id: ''
  }
  try {
    // Returns all the authenticated user's task lists.
    const taskLists = Tasks.Tasklists.list();

    
    if (!taskLists.items) {
      output.message = "No task lists found."
      output.status = "failed"

      Logger.log(output);

      // Send out response
      return ContentService.createTextOutput(JSON.stringify(output))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Print the tasklist title and tasklist id.
    for (let i = 0; i < taskLists.items.length; i++) {
      const taskList = taskLists.items[i];
      if(taskList.title === taskListName){
        isTasklistFound = true
        output.message = "Task lists found."
        output.status = "success"
        output.id = taskList.id

        Logger.log('Task list with title "%s" and ID "%s" was found.', taskList.title, taskList.id);
        break
      }
    }

    // Check if task list is available -- return tasklist Id
    if(isTasklistFound){
      // sync completed task from Smart Sheet
      syncCompletedTask(output.id, newTask_nextActions);

      return ContentService.createTextOutput(JSON.stringify(output))
        .setMimeType(ContentService.MimeType.JSON);
    }else{
      // If not, create tasklist and return tasklist Id
      let newTaskListId = createTasklist(taskListName)

      output.message = "New Task Created"
      output.status = "success"
      output.id = newTaskListId

      syncCompletedTask(output.id, newTask_nextActions);
      return ContentService.createTextOutput(JSON.stringify(output))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    
  } catch (err) {
    output.message = err.message
    output.status = "error"


    Logger.log('Failed with an error %s ', err.message);
    // Send out response
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function createTasklist(taskListName){
  let newTaskList = Tasks.Tasklists.insert({
          "kind": "tasks#taskList",
          "title": taskListName,
        })

  return newTaskList.id
}

function test(){
  syncCompletedTask('UWxCS3dlUnBjMldTZzRpMA', 'Complete enrollment,Follow up later,Select date and time for 3 way call')
}

function syncCompletedTask(taskListID, newTask_nextActions_commaSeperated){
  let tasks = Tasks.Tasks.list(taskListID),
    newTask_nextActions = newTask_nextActions_commaSeperated.split(',');

  if(tasks.items.length === 0){
    // enlist new task
    newTask_nextActions.forEach((elem)=>{
      Tasks.Tasks.insert({
        kind: 'tasks#task',
        title: elem
      },
      taskListID)
    })

  }else{
    newTask_nextActions.forEach((elem)=>{
      for(x = 0; x < tasks.items.length; x++){
        if(tasks.items[x].title === elem){

          let taskIndex = tasks.items.indexOf(tasks.items[x])
          if(taskIndex > -1){
            tasks.items.splice(taskIndex, 1) 
          }
        }
      }
    })
    
    // Mark Completed tasks
    for(x = 0; x < tasks.items.length; x++){
      Tasks.Tasks.update(
        {
          kind: 'tasks#task',
          id: tasks.items[x].id,
          status: 'completed',
          title: tasks.items[x].title
        }, 
        taskListID, 
        tasks.items[x].id
      )
    }

    // enlist new task
    newTask_nextActions.forEach((elem)=>{
      var isTaskNew = true

      for(const taskElem of Tasks.Tasks.list(taskListID).items){
        if(taskElem.title === elem){
          Tasks.Tasks.update(
            {
              kind: 'tasks#task',
              id: taskElem.id,
              title: taskElem.title,
              completed: ''
            }, 
            taskListID, 
            taskElem.id
          )
          Logger.log(taskElem)

          isTaskNew = false
          break
        }
      }

      if(isTaskNew){
        Tasks.Tasks.insert({
          kind: 'tasks#task',
          title: elem
        },
        taskListID)
      }
    })
  }


}

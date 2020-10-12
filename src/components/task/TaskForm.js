import React, { useContext, useState, useEffect } from "react"
import { TaskContext } from "./TaskProvider"
import { useHistory, useParams } from "react-router-dom"

//renders a form to create a new task
export const TaskForm = () => {
    const { addTask, getTasksByUserId, updateTask, getTaskById } = useContext(TaskContext)

    const [task, setTask] = useState({})
    const [isLoading, setIsLoading] = useState(true);

    const {taskId} = useParams();
    const history = useHistory();

    const handleControlledInputChange = event => {
        //When changing a state object or array, 
        //always create a copy make changes, and then set state.
        const newTask = { ...task }
        //task is an object with properties. 
        //set the property to the new value
        newTask[event.target.name] = event.target.value
        //update state
        setTask(newTask)
    }

    //Fetches all user tasks and populates forms with existing task data if it already exists
    useEffect(() => {
        getTasksByUserId(parseInt(localStorage.getItem("nutty_customer"))).then(() => {
            if (taskId){
                getTaskById(taskId)
                .then(task => {
                    setTask(task)
                    setIsLoading(false)
                })
            } else {
                setIsLoading(false)
            }
       })
    }, [])

    //Either updates an existing task or creates a new task object and adds it to the database, then takes the user back to the tasks page
    const constructTaskObject = () => {
        setIsLoading(true)
        if (taskId){
            updateTask({
                task: task.task,
                date: task.date,
                userId: parseInt(localStorage.getItem("nutty_customer")),
                completed: false,
                id: task.id
            }).then(() => history.push("/tasks"))
        } else {
            addTask({
                task: task.task,
                date: task.date,
                userId: parseInt(localStorage.getItem("nutty_customer")),
                completed: false
            }).then(() => history.push("/tasks"))
        }
    }

    return (
        <section className="taskForm">
            <form onSubmit={event => {
                //prevents submission of form until all fields filled out, then creates a new task
                event.preventDefault()
                constructTaskObject()
            }}>
                <label htmlFor="task">Task: </label>
                <input defaultValue={task.task} type="text" name="task" onChange={handleControlledInputChange} required />
                <label htmlFor="date">Date to be Completed: </label>
                {/* prevents user from selecting a past date for completion goal */}
                <input defaultValue={task.date} type="date" name="date" onChange={handleControlledInputChange} min={new Date(Date.now() - 18000000).toISOString().split("T")[0]} required />
                <button type="submit" disabled={isLoading}>Save Task</button>
                <button type="button" onClick={() => {
                    //takes user back to tasks list
                    history.push("/tasks")
                }}>Cancel</button>
            </form>
        </section>
    )
}
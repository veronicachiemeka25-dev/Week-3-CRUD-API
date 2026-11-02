require("dotenv").config();

const express = require('express');

const app = express();

//body parsing middleware
app.use(express.json());

// In-memory data store for todos
let todos = [
    { id: 1, task: 'Learn Express routing', completed: true },
    { id : 2, task: 'Build CRUD API', completed: false },
    { id : 3, task: 'Push repository to GitHub', completed: false }
];

// 1. GET /todos - Retrieve all todos
app.get('/todos', (req, res) => {
    res.json(todos); 
});

// 2. BONUS: GET /todos/active - Filter incomplete/active todos (!completed)
app.get('/todos/active', (req, res) => {
    const activeTodos = todos.filter(t => !t.completed);
    res.json(activeTodos);
});

// 3. GET /todos/:id - Single read for a specific todo by ID
app.get('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id); 
    const todo = todos.find(t => t.id === todoId);
    if (!todo){
        return res.status(404).json({ error: 'Todo not found'});
    }
    res.json(todo);
});

app.post('/todos', (req, res) => {
    const { task, completed } = req.body;

    // Validation: Require 'task' field (returns 400 if missing)
    if (!task) {
        return res.status(400).json({ error: "Validation failed: 'task' field is required."});
    }
    const newTodo = { 
        id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1,
        task: task,
        completed: completed !== undefined ? completed : false
    };

    todos.push(newTodo);
    res.status(201).json(newTodo); 
});

// PATCH Update - Partial
    app.patch('/todos/:id', (req, res) => {
    const todo = todos.find((t) => t.id === parseInt(req.params.id)); // Array.find()
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    Object.assign(todo, req.body); // Merge: e.g., {completed: true}
    res.status(200).json(todo); 
});

 
// DELETE Remove
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id); 
    const initialLength = todos.length;
    todos = todos.filter((t) => t.id !== id) ; // Array.filter() non.destructive
    if (todos.length === initialLength) 
    return res.status (404).json({ error: 'Not found' });
    res.status(204).send(); // Silent success
});

    app.use((err, req, res, next) => {
        res.status(500).json ({ error: 'Server error!' });   
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`Todo API live on Port ${PORT}`);
});
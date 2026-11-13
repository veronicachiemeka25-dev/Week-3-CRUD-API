require("dotenv").config();
const express = require('express');
const cors = require('cors'); //cors
const logRequest = require('./middlewares/logger');
const validateTodo = require('./middlewares/validator');
const errorhandler = require('./middlewares/errorHandler');
const validateTodoPatch = require('./middlewares/validatorpatch');
const app = express();
app.use(express.json()); // Parse JSON bodies

const corsOptions = {
    Origin: 'http://localhost:5173',
    // some legacy browsers (IEII, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(logRequest);

// In-memory data store for todos
let todos = [
    { id: 1, task: 'Finish Week 4 slides', completed: true },
    { id : 2, task: 'Deploy API (today!)', completed: false },
    { id : 3, task: 'Push repository to GitHub', completed: false }
];

// 1. GET /todos - Retrieve all todos
app.get('/todos', (req, res) => {
    res.json(todos); 
});

// 2. BONUS: GET /todos/active - Filter incomplete/active todos (!completed)
app.get('/todos/active', (req, res, next) => {
    try {
        const activeTodos = todos.filter(t => !t.completed);
    res.json(activeTodos);
    } catch (error){
        next (error);
    }
});

// 3. GET /todos/:id - Single read for a specific todo by ID
app.get('/todos/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id); 
        if(isNaN(id)){
            throw new Error("invalid ID");
        }
    const todo = todos.find(t => t.id === id);
    if (!todo){
        return res.status(404).json({ message: 'Todo not found'});
    }
    res.status(200).json(todo);
    } catch (error) {
        next (error);
    }
});

app.post('/todos', validateTodo, (req, res, next) => {
    try{
        const { task } = req.body;

    
    if (!task || task.length <= 2 ) {
        return res.status(400).json({ message: 'Please provide the task' });
    }
    const newTodo = { 
        id: todos.length + 1, ...req.body }; // Auto-ID
        
    todos.push(newTodo);
    res.status(201).json(newTodo); // Echo back
    } catch (error){
        next (error);
    }
});

// PATCH Update - Partial
    app.patch('/todos/:id', validateTodoPatch, (req, res, next) => {
    try {
        const todo = todos.find((t) => t.id === parseInt(req.params.id)); // Array.find()
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    Object.assign(todo, req.body); // Merge: e.g., {completed: true}
    res.status(200).json(todo); 
    } catch (error){
        next (error);
    }
});

 
// DELETE Remove
app.delete('/todos/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id); 
    const initialLength = todos.length;
    todos = todos.filter((t) => t.id !== id) ; // Array.filter() non.destructive
    if (todos.length === initialLength) 
    return res.status (404).json({ error: 'Not found' });
    res.status(204).send(); // Silent success
    } catch (error){
        next (error);
    }
});

    app.use(errorhandler);
        
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`Todo API live on Port ${PORT}`);
});
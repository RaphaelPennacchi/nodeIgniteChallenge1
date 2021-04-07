const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const usernameExists = users.find((user) => user.username === username);

  if(!usernameExists) {
    return response.status(404).json({error: "Username not found"});
  }

  request.user = usernameExists;

  return next();
}


app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const id = uuidv4();

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "Nome de usuario em uso" });
  }

  const userInfo = {
    id: id,
    name: name,
    username: username,
    todos: []
  }

  users.push(userInfo)

  return response.status(201).json(userInfo);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;


  const id = uuidv4();

  const todoInfo = {
    id: id,
    title:  title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todoInfo)
  return response.status(201).json(todoInfo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "Todo nao existe"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "Todo nao existe"});
  }

  todo.done = true;

  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "Todo nao existe"});
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
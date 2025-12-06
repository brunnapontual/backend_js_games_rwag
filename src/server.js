require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(json());

const DB_PATH = join(__dirname, 'database.json');

async function loadDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { lists: [] };
  }
}
async function saveDB(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

app.get('/lists', async (req, res) => {
  const db = await loadDB();
  res.json(db.lists);
});

app.post('/lists', async (req, res) => {
  const db = await loadDB();
  const newList = {
    id: Date.now().toString(),
    title: req.body.title,
    games: []
  };
  db.lists.push(newList);
  await saveDB(db);
  res.status(201).json(newList);
});

app.delete('/lists/:id', async (req, res) => {
  const db = await loadDB();
  db.lists = db.lists.filter(l => l.id !== req.params.id);
  await saveDB(db);
  res.json({ message: 'Lista deletada' });
});

app.post('/lists/:listId/games', async (req, res) => {
  const db = await loadDB();
  const list = db.lists.find(l => l.id === req.params.listId);
  if (!list) return res.status(404).json({ error: 'Lista não encontrada' });

  list.games.push(req.body);
  await saveDB(db);
  res.json(list);
});

app.delete('/lists/:listId/games/:gameId', async (req, res) => {
  const db = await loadDB();
  const list = db.lists.find(l => l.id === req.params.listId);
  if (!list) return res.status(404).json({ error: 'Lista não encontrada' });

  list.games = list.games.filter(g => g.id != req.params.gameId);
  await saveDB(db);
  res.json(list);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Backend running on ' + PORT));

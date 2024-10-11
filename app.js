const http = require('http');
const fs = require('fs');
const port = 3000;
const dataFile = 'items.json';

const readData = () => {
  try {
    const jsonData = fs.readFileSync(dataFile);
    return JSON.parse(jsonData);
  } catch (err) {
    return []; 
  }
};

const writeData = (data) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // GET part
  if (url === '/brand' && method === 'GET') {
    try {
      const items = readData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(items));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error reading data' }));
    }
  }

  // GET /brand/id/
  if (url.startsWith('/brand/') && method === 'GET') {
    const id = url.split('/')[2];
    try {
      const items = readData();
      const item = items.find((item) => item.id === id);

      if (item) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(item));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Brand not found' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error reading data' }));
    }
  }

  // POST /brand to create a new brand
  if (url === '/brand' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const newItem = JSON.parse(body);
        const items = readData();
        items.push(newItem);
        writeData(items);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newItem));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error saving brand' }));
      }
    });
  }

  // PUT /brand/
  if (url.startsWith('/brand/') && method === 'PUT') {
    const id = url.split('/')[2];
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updatedItem = JSON.parse(body);
        const items = readData();
        const itemIndex = items.findIndex((item) => item.id === id);

        if (itemIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Brand not found' }));
        } else {
          items[itemIndex] = { ...items[itemIndex], ...updatedItem };
          writeData(items);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(items[itemIndex]));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Error updating brand' }));
      }
    });
  }

  // DELETE /brand/
  if (url.startsWith('/brand/') && method === 'DELETE') {
    const id = url.split('/')[2];
    try {
      const items = readData();
      const filteredItems = items.filter((item) => item.id !== id);

      if (filteredItems.length === items.length) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Brand not found' }));
      } else {
        writeData(filteredItems);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Brand deleted' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error deleting the brand' }));
    }
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

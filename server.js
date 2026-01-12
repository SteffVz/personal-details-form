const http = require('http');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const querystring = require('querystring');

// settings for MongoDB
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'testdb';
const client = new MongoClient(mongoUrl);

// Connect once when the server starts
async function connectDB() 
{
    try 
    {
        await client.connect();
        console.log('Connected to MongoDB');
    } 
    catch (err) 
    {
        console.error('MongoDB connection error:', err);
    }
}
connectDB();

function generateForm(data = {}, message = '') {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Personal Details Form</title>
    </head>
    <body>
        <h2>Personal Details:</h2>
        <p style="color:red">${message}</p>
        <form method="POST" action="/">
            <label>
                Name:
                <input type="text" name="name" value="${data.name || ''}" required />
            </label><br><br>

            <label>
                Surname:
                <input type="text" name="surname" value="${data.surname || ''}" required />
            </label><br><br>

            <label>
                ID Number:
                <input type="text" name="idNumber" value="${data.idNumber || ''}" required />
            </label><br><br>

            <label>
                Date of Birth:
                <input type="date" name="dateOfBirth" value="${data.dateOfBirth || ''}" required />
            </label><br><br>

            <button type="submit">POST</button>
            <button type="button" onclick="window.location.href='/'">CANCEL</button>
        </form>
    </body>
    </html>
    `;
}


// Create HTTP server
const server = http.createServer(async (req, res) => 
{

    // Serve HTML form
    //GET
    if (req.method === 'GET' && req.url === '/') {
        const html = fs.readFileSync('index.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
    }

    // Handle form submission
    //POST
    else if (req.method === 'POST' && req.url === '/') {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try 
        {
            const formData = querystring.parse(body);
            const { name, surname, idNumber, dateOfBirth } = formData;

            // Validate Name
            if (!/^[A-Za-z\s'-]+$/.test(name)) 
            {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(generateForm(formData, 'Name can only contain letters, spaces, hyphens, or apostrophes.'));
            return;
            }   

            // Validate Surname
            if (!/^[A-Za-z\s'-]+$/.test(surname)) 
            {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(generateForm(formData, 'Surname can only contain letters, spaces, hyphens, or apostrophes.'));
            return;
            }

            // Validate ID number
            if (!/^\d{13}$/.test(idNumber)) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(generateForm(formData, 'ID Number must be exactly 13 digits.'));
                return;
            }

            // Check required fields
            if (!name || !surname || !idNumber || !dateOfBirth) 
            {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Please fill in all fields.');
                return;
            }

            const db = client.db(dbName);
            const collection = db.collection('submissions');

            // Check duplicate ID
            const existing = await collection.findOne({ idNumber });
            if (existing) 
            {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(generateForm(formData, 'This ID Number already exists.'));
                return;
            }

            // Convert imput date from string to (Date Object)
            const dobDate = new Date(dateOfBirth);
            if (isNaN(dobDate)) 
            {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid date of birth.');
                return;
            }
            formData.dateOfBirth = dobDate;

            //Insert into MongoDB
            await collection.insertOne(formData);

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Form data saved to MongoDB');

        } 
        catch (err) 
        {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Database error');
        }
    });

    return;
}
    else
    {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
   
});

// Start the server
server.listen(3000, () => 
{
    console.log('Server running at http://localhost:3000');
});

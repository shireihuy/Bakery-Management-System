const fetch = require('node-fetch');

async function testAI() {
    try {
        const response = await fetch('http://localhost:3000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Hello, please just say testing' })
        });
        const data = await response.json();
        console.log(data);
    } catch (err) {
        console.error(err);
    }
}

testAI();

import http from 'http';

function request(path, method, data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api' + path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function run() {
    console.log("Testing Signup + Login...");
    const email = 'bugtest' + Date.now() + '@lacatholille.fr';
    const password = 'password123';

    try {
        // 1. Signup
        console.log(`1. Signup with ${email} / ${password}`);
        const signupRes = await request('/auth/signup', 'POST', {
            email,
            password,
            full_name: 'Bug Tester'
        });
        console.log(`Signup Status: ${signupRes.status}`);
        if (signupRes.status !== 200) {
            console.error("Signup failed:", signupRes.body);
            return;
        }

        // 2. Login
        console.log(`2. Login with same credentials`);
        const loginRes = await request('/auth/login', 'POST', {
            email,
            password
        });
        console.log(`Login Status: ${loginRes.status}`);

        if (loginRes.status === 200) {
            console.log("SUCCESS: Login worked!");
        } else {
            console.error("FAILURE: Login failed!", loginRes.body);
        }

    } catch (e) { console.error("Test failed", e); }
}

run();

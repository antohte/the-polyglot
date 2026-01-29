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
    console.log("Testing Login with Spaces...");
    const baseEmail = 'spacetest' + Date.now() + '@lacatholille.fr';
    const emailWithSpaces = '  ' + baseEmail.toUpperCase() + '  '; // "  SPACETEST...@...  "
    const password = 'password123';

    try {
        // 1. Signup with messy email
        console.log(`1. Signup with '${emailWithSpaces}'`);
        const signupRes = await request('/auth/signup', 'POST', {
            email: emailWithSpaces,
            password,
            full_name: 'Space Tester'
        });
        console.log(`Signup Status: ${signupRes.status}`);
        if (signupRes.status !== 200) {
            console.error("Signup failed:", signupRes.body);
            return;
        }

        // 2. Login with clean email
        console.log(`2. Login with clean '${baseEmail}'`);
        const loginClean = await request('/auth/login', 'POST', {
            email: baseEmail,
            password
        });
        console.log(`Login Clean Status: ${loginClean.status}`);

        // 3. Login with messy email again
        console.log(`3. Login with messy '${emailWithSpaces}'`);
        const loginMessy = await request('/auth/login', 'POST', {
            email: emailWithSpaces,
            password
        });
        console.log(`Login Messy Status: ${loginMessy.status}`);

        if (loginClean.status === 200 && loginMessy.status === 200) {
            console.log("SUCCESS: Normalization works!");
        } else {
            console.error("FAILURE: Login failed", { clean: loginClean.body, messy: loginMessy.body });
        }

    } catch (e) { console.error("Test failed", e); }
}

run();

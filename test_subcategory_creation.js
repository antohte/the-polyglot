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
    console.log("Testing Subcategory Creation...");
    try {
        // 1. Get Categories to find a parent
        const catsRes = await request('/categories', 'GET');
        const cats = JSON.parse(catsRes.body);
        const parent = cats.find(c => c.slug === 'journalisme');

        if (!parent) throw new Error("Parent category 'journalisme' not found (Seeding failed?)");
        console.log(`Parent found: ${parent.name} (ID: ${parent.id})`);

        // 2. Create Subcategory
        const subName = "Test Subcat " + Date.now();
        const subRes = await request('/categories', 'POST', {
            name: subName,
            slug: "test-sub-" + Date.now(),
            description: "Test Sub description",
            parent_id: parent.id
        });
        console.log(`Create Subcategory Status: ${subRes.status}`);

        // 3. Verify
        const verifyRes = await request('/categories', 'GET');
        const allCats = JSON.parse(verifyRes.body);
        const sub = allCats.find(c => c.name === subName);

        if (sub && sub.parent_id === parent.id) {
            console.log("SUCCESS: Subcategory created correctly!");
        } else {
            console.error("FAILURE: Subcategory not found or incorrect parent.");
        }

    } catch (e) { console.error("Test failed", e); }
}

run();

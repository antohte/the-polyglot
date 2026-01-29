import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const db = require('../db.js');

const firebaseConfig = {
    apiKey: "AIzaSyADW9cv20mbfTcXPpLfxcbuYmEMjmlGbwA",
    authDomain: "student-forum-d5f07.firebaseapp.com",
    projectId: "student-forum-d5f07",
    storageBucket: "student-forum-d5f07.firebasestorage.app",
    messagingSenderId: "356568027665",
    appId: "1:356568027665:web:d3ab7691b603e4e84517b0"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function sync() {
    try {
        console.log("Starting sync...");

        // 1. Users
        console.log("Syncing Users...");
        const usersSnap = await getDocs(collection(firestore, "users"));
        for (const doc of usersSnap.docs) {
            const d = doc.data();
            const id = doc.id;
            await db.query(`
                INSERT INTO users (id, email, display_name, full_name, photo_url, role, bio, social_links, license_year, department)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                email=VALUES(email), display_name=VALUES(display_name), full_name=VALUES(full_name),
                photo_url=VALUES(photo_url), role=VALUES(role), bio=VALUES(bio), social_links=VALUES(social_links),
                license_year=VALUES(license_year), department=VALUES(department)
            `, [
                id, d.email, d.displayName || d.display_name, d.fullName || d.full_name, d.photoUrl || d.photo_url,
                d.role || 'user', d.bio || '', JSON.stringify(d.socials || d.social_links || {}),
                d.licenseYear || d.license_year, d.department
            ]);
        }

        // 2. Categories
        console.log("Syncing Categories...");
        // Assuming categories were hardcoded in frontend or stored in DB.
        // If stored in 'categories' collection:
        const catSnap = await getDocs(collection(firestore, "categories"));
        for (const doc of catSnap.docs) {
            const d = doc.data();
            await db.query(`
                INSERT INTO categories (slug, name, description, parent_id)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name=VALUES(name)
            `, [doc.id, d.name, d.description, d.parentId || null]);
        }

        // 3. Posts
        console.log("Syncing Posts...");
        const postsSnap = await getDocs(collection(firestore, "posts"));
        for (const doc of postsSnap.docs) {
            const d = doc.data();
            const createdAt = d.createdAt ? new Date(d.createdAt.seconds * 1000) : new Date();

            // Files might be array or string
            let files = d.files || [];

            await db.query(`
                INSERT INTO posts (id, author_id, category_slug, subcategory, title, content, image_url, files, created_at, language, post_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE title=VALUES(title)
            `, [
                doc.id, d.authorId || d.author_id, d.category, d.subcategory, d.title, d.content,
                d.imageUrl || d.image_url, JSON.stringify(files), createdAt, d.language || 'fr',
                d.postType || 'general'
            ]);
        }

        // 4. Events
        console.log("Syncing Events...");
        const eventsSnap = await getDocs(collection(firestore, "events"));
        for (const doc of eventsSnap.docs) {
            const d = doc.data();
            const date = d.date ? new Date(d.date.seconds * 1000) : new Date();
            await db.query(`
                INSERT INTO events (id, title, description, date, location, created_by, image_url, link)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE title=VALUES(title)
            `, [
                doc.id, d.title, d.description, date, d.location, d.createdBy || d.created_by,
                d.imageUrl || d.image_url, d.link
            ]);
        }

        // 5. Polls
        console.log("Syncing Polls...");
        const pollsSnap = await getDocs(collection(firestore, "polls"));
        for (const doc of pollsSnap.docs) {
            const d = doc.data();
            const createdAt = d.createdAt ? new Date(d.createdAt.seconds * 1000) : new Date();
            const expiresAt = d.expiresAt ? new Date(d.expiresAt.seconds * 1000) : null;

            await db.query(`
                INSERT INTO polls (id, question, options, created_by, created_at, expires_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE question=VALUES(question)
            `, [
                doc.id, d.question, JSON.stringify(d.options || []), d.createdBy || d.created_by,
                createdAt, expiresAt
            ]);
        }

        console.log("Sync completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Sync failed:", err);
        process.exit(1);
    }
}

sync();

process.env.JWT_SECRET = "test_secret_key_for_smoke_test";
process.env.PORT = "5999";
process.env.NODE_ENV = "test";
process.env.USE_PG_MEM = "true";
process.env.PUBLIC_URL = "http://localhost:5999";

await import("../src/index.js");

const BASE = "http://localhost:5999";
let failures = 0;

const check = (name, cond) => {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${name}`);
  }
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// wait for server + db
await wait(1500);

// 1. Health
const health = await fetch(BASE + "/");
check("health endpoint", health.ok);

// 2. Seed admin
const Admin = (await import("../src/models/Admin.js")).default;
const bcrypt = (await import("bcryptjs")).default;
await Admin.create({
  name: "Test Admin",
  email: "admin@test.org",
  password: await bcrypt.hash("TestPass123", 10),
  role: "superadmin",
});

// 3. Login
const loginRes = await fetch(BASE + "/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@test.org", password: "TestPass123" }),
});
const login = await loginRes.json();
check("login returns token", loginRes.ok && !!login.token);

// 4. Wrong password rejected
const badRes = await fetch(BASE + "/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@test.org", password: "wrong" }),
});
check("wrong password rejected (401)", badRes.status === 401);

const token = login.token;
const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

// 5. Public endpoints without auth
for (const path of ["/api/public/ministries", "/api/public/events", "/api/public/news", "/api/public/resources"]) {
  const res = await fetch(BASE + path);
  const data = await res.json();
  check(`public GET ${path} works (${res.status})`, res.ok && Array.isArray(data.items));
}

// 6. Admin endpoints WITHOUT auth rejected
const noAuth = await fetch(BASE + "/api/admin/events");
check("admin events without token rejected (401)", noAuth.status === 401);

// 7. Admin create event
const evRes = await fetch(BASE + "/api/admin/events", {
  method: "POST",
  headers: auth,
  body: JSON.stringify({
    title: "Test Youth Conference",
    description: "Testing",
    location: "Test City",
    startDate: new Date("2026-08-28").toISOString(),
    ministry: "senior-youth",
    featured: true,
  }),
});
const ev = await evRes.json();
const eventId = ev.id ?? ev._id;
check("admin creates event (201)", evRes.status === 201 && !!eventId);

// 8. Slug auto-generated
check("event slug auto-generated", ev.slug === "test-youth-conference");

// 8b. YouTube URL stored on event
const liveRes = await fetch(BASE + "/api/admin/events", {
  method: "POST",
  headers: auth,
  body: JSON.stringify({
    title: "Live Ibada ya Leo",
    startDate: new Date("2026-08-14").toISOString(),
    youtubeUrl: "https://www.youtube.com/live/AbCdEfGhIjK",
    featured: true,
  }),
});
const liveEv = await liveRes.json();
check("event stores youtubeUrl", liveRes.ok && liveEv.youtubeUrl.includes("youtube.com"));

// 8c. File upload (image)
const { Buffer } = await import("buffer");
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);
const uploadForm = new FormData();
uploadForm.append(
  "file",
  new Blob([tinyPng], { type: "image/png" }),
  "test.png"
);
const upRes = await fetch(BASE + "/api/upload", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: uploadForm,
});
const up = await upRes.json();
check("image upload returns url (201)", upRes.status === 201 && !!up.url && up.url.includes("/uploads/"));

// 8d. Upload requires auth
const upNoAuth = await fetch(BASE + "/api/upload", {
  method: "POST",
  body: uploadForm,
});
check("upload without token rejected (401)", upNoAuth.status === 401);

// 8e. Uploaded file is served statically
const fileUrl = new URL(up.url, BASE).toString();
const fileRes = await fetch(fileUrl);
check("uploaded file served statically (200)", fileRes.ok && fileRes.headers.get("content-type").includes("image"));

// 8f. Reject non-image/pdf upload
const badForm = new FormData();
badForm.append("file", new Blob(["hello"], { type: "text/plain" }), "bad.txt");
const badRes2 = await fetch(BASE + "/api/upload", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: badForm,
});
check("non-image/pdf upload rejected", badRes2.status >= 400);

// 9. Public events returns published event
const pubEv = await fetch(BASE + "/api/public/events");
const pubEvData = await pubEv.json();
check("public events includes created event", pubEvData.items.some((e) => (e._id ?? e.id) === eventId));

// 10. Unpublished hidden from public
await fetch(BASE + "/api/admin/events/" + eventId, {
  method: "PUT",
  headers: auth,
  body: JSON.stringify({ published: false }),
});
const pubEv2 = await fetch(BASE + "/api/public/events");
const pubEvData2 = await pubEv2.json();
check("unpublished event hidden from public", !pubEvData2.items.some((e) => (e._id ?? e.id) === eventId));

// 11. Admin delete
const del = await fetch(BASE + "/api/admin/events/" + eventId, {
  method: "DELETE",
  headers: auth,
});
check("admin deletes event", del.ok);

// 12. Public submissions
const prayerRes = await fetch(BASE + "/api/public/prayers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Jane", prayer: "Please pray for my family", isPublic: true }),
});
check("public prayer submission", prayerRes.ok);

const contactRes = await fetch(BASE + "/api/public/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "John", email: "j@x.com", message: "Hello ministry" }),
});
check("public contact submission", contactRes.ok);

// 13. Admin can see submissions
const prayers = await fetch(BASE + "/api/admin/prayers", { headers: auth });
const prayersData = await prayers.json();
check("admin sees prayer requests", prayers.ok && prayersData.total >= 1);

// 14. Testimony approval flow
const tRes = await fetch(BASE + "/api/public/testimonials", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Sam", testimony: "God is good" }),
});
const t = await tRes.json();
const testimonyId = t.id ?? t._id;
const tPub = await fetch(BASE + "/api/public/testimonials");
const tPubData = await tPub.json();
check("unapproved testimony hidden from public", !tPubData.items.some((x) => (x._id ?? x.id) === testimonyId));

await fetch(BASE + "/api/admin/testimonials/" + testimonyId, {
  method: "PUT",
  headers: auth,
  body: JSON.stringify({ approved: true }),
});
const tPub2 = await fetch(BASE + "/api/public/testimonials");
const tPubData2 = await tPub2.json();
check("approved testimony appears publicly", tPubData2.items.some((x) => (x._id ?? x.id) === testimonyId));

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

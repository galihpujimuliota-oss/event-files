async function run() {
  try {
    let res = await fetch("http://127.0.0.1:3000/api/settings");
    console.log("GET1:", await res.json());

    res = await fetch("http://127.0.0.1:3000/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRegistrationOpen: false })
    });
    console.log("POST:", await res.json());
    
    res = await fetch("http://127.0.0.1:3000/api/settings");
    console.log("GET2:", await res.json());
  } catch (e) { console.error(e); }
}
run();



async function run() {
    try {
        const authRes = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email: `test${Date.now()}@test.com`, password: 'password123' })
        });
        const authData: any = await authRes.json();
        const token = authData.token;

        const res = await fetch('http://localhost:5001/api/ai/meal-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                inventory: [{ name: "Chicken breast", quantity: 500, unit: "g" }],
                caloriesRemaining: 2000,
                dietaryRestrictions: [],
                cuisinePreference: "any"
            })
        });
        
        console.log("Status:", res.status);
        console.log("Body:", await res.text());
    } catch (e) {
        console.error(e);
    }
}
run();

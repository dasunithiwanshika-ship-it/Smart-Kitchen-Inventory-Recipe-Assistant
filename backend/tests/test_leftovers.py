from datetime import date, timedelta

def get_auth_token(client):
    register_resp = client.post("/api/auth/register", json={
        "email": "test_leftovers_user@kitchen.ai",
        "password": "password123",
        "full_name": "Test Leftovers User"
    })
    if register_resp.status_code == 201:
        return register_resp.json()["access_token"]
    
    login_resp = client.post("/api/auth/login", json={
        "email": "test_leftovers_user@kitchen.ai",
        "password": "password123"
    })
    return login_resp.json()["access_token"]

def test_leftovers_flow(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch leftovers
    res = client.get("/api/leftovers", headers=headers)
    assert res.status_code == 200
    leftovers = res.json()
    assert isinstance(leftovers, list)

    # Add new leftover
    today = date.today()
    new_lo = {
        "name": "Roast Pumpkin Soup",
        "quantity": 400.0,
        "unit": "ml",
        "prepared_date": str(today),
        "use_before_date": str(today + timedelta(days=2)),
        "storage_location": "Refrigerator",
        "notes": "Creamy soup in glass jar"
    }
    create_res = client.post("/api/leftovers", json=new_lo, headers=headers)
    assert create_res.status_code == 201
    created = create_res.json()
    lo_id = created["id"]
    assert created["name"] == "Roast Pumpkin Soup"

    # Consume leftover
    consume_res = client.post(f"/api/leftovers/{lo_id}/consume", headers=headers)
    assert consume_res.status_code == 200
    assert consume_res.json()["is_consumed"] is True

    # Delete leftover
    del_res = client.delete(f"/api/leftovers/{lo_id}", headers=headers)
    assert del_res.status_code == 204

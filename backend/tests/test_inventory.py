from datetime import date, timedelta

def get_auth_token(client):
    register_resp = client.post("/api/auth/register", json={
        "email": "test_inventory_user@kitchen.ai",
        "password": "password123",
        "full_name": "Test Inventory User"
    })
    if register_resp.status_code == 201:
        return register_resp.json()["access_token"]
    
    login_resp = client.post("/api/auth/login", json={
        "email": "test_inventory_user@kitchen.ai",
        "password": "password123"
    })
    return login_resp.json()["access_token"]

def test_inventory_crud_flow(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch inventory - starts empty for new user
    res = client.get("/api/inventory", headers=headers)
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)

    # 2. Create new food item with expiry date
    today = date.today()
    new_item = {
        "food_name": "Organic Honey",
        "quantity": 1.0,
        "unit": "bottles",
        "storage_location": "Pantry",
        "purchase_date": str(today),
        "expiry_date": str(today + timedelta(days=90)),
        "notes": "Wildflower honey"
    }
    create_res = client.post("/api/inventory", json=new_item, headers=headers)
    assert create_res.status_code == 201
    created_data = create_res.json()
    item_id = created_data["id"]
    assert created_data["food_name"] == "Organic Honey"
    assert created_data["status"] == "Fresh"

    # 3. Create food item without expiry date (e.g. Potatoes)
    no_expiry_item = {
        "food_name": "Potatoes",
        "quantity": 2.0,
        "unit": "kg",
        "storage_location": "Pantry",
        "purchase_date": str(today),
        "expiry_date": None,
        "notes": "Fresh russet potatoes in pantry basket"
    }
    create_no_exp_res = client.post("/api/inventory", json=no_expiry_item, headers=headers)
    assert create_no_exp_res.status_code == 201
    assert create_no_exp_res.json()["expiry_date"] is None

    # 4. Get single item
    get_res = client.get(f"/api/inventory/{item_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == item_id

    # 5. Update item quantity
    update_res = client.put(f"/api/inventory/{item_id}", json={"quantity": 2.0}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["quantity"] == 2.0

    # 6. Partial consume
    consume_res = client.post(f"/api/inventory/{item_id}/consume", json={"quantity": 0.5, "action": "consumed"}, headers=headers)
    assert consume_res.status_code == 200
    assert consume_res.json()["quantity"] == 1.5

    # 7. Delete item
    del_res = client.delete(f"/api/inventory/{item_id}", headers=headers)
    assert del_res.status_code == 204

    # 8. Check stats
    stats_res = client.get("/api/inventory/stats", headers=headers)
    assert stats_res.status_code == 200
    assert "total_items" in stats_res.json()

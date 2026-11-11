def get_auth_token(client):
    register_resp = client.post("/api/auth/register", json={
        "email": "test_recipes_user@kitchen.ai",
        "password": "password123",
        "full_name": "Test Recipes User"
    })
    if register_resp.status_code == 201:
        return register_resp.json()["access_token"]
    
    login_resp = client.post("/api/auth/login", json={
        "email": "test_recipes_user@kitchen.ai",
        "password": "password123"
    })
    return login_resp.json()["access_token"]

def test_recipes_list_and_recommendation(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # List all recipes
    res = client.get("/api/recipes")
    assert res.status_code == 200
    recipes = res.json()
    assert len(recipes) >= 5

    # Get recipe recommendations
    rec_res = client.get("/api/recipes/recommendations", headers=headers)
    assert rec_res.status_code == 200
    recommendations = rec_res.json()
    assert isinstance(recommendations, list)

def test_single_recipe(client):
    res = client.get("/api/recipes/1")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] is not None
    assert len(data["instructions"]) > 0


def test_cook_recipe_deducts_inventory(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    recipe = client.get("/api/recipes/1").json()
    ing = recipe["ingredients"][0]
    needed_qty = ing["quantity"] if ing["quantity"] else 1.0
    unit = ing["unit"] or "pieces"

    # Add stock with 2 extra units remaining after cooking
    add_res = client.post(
        "/api/inventory",
        headers=headers,
        json={
            "food_name": ing["ingredient_name"],
            "quantity": needed_qty + 2,
            "unit": unit,
            "storage_location": "Refrigerator",
        },
    )
    assert add_res.status_code == 201
    created_item = add_res.json()

    cook_res = client.post(
        "/api/recipes/1/cook",
        headers=headers,
        json={"ingredient_ids": [ing["id"]]},
    )
    assert cook_res.status_code == 200
    cook_data = cook_res.json()
    assert len(cook_data["consumed_items"]) == 1
    deducted = cook_data["consumed_items"][0]
    assert deducted["inventory_item_id"] == created_item["id"]
    assert deducted["deducted_quantity"] == round(needed_qty, 2)
    assert deducted["remaining_quantity"] == 2.0
    assert deducted["fully_consumed"] is False

    inv_res = client.get("/api/inventory", headers=headers)
    assert inv_res.status_code == 200
    matching = [it for it in inv_res.json() if it["id"] == created_item["id"]]
    assert len(matching) == 1
    assert matching[0]["quantity"] == 2.0

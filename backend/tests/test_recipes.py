def get_auth_token(client):
    login_resp = client.post("/api/auth/login", json={
        "email": "chef@smartkitchen.ai",
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

    # Get recipe recommendations for demo user (should prioritize Chicken & Tomato Curry because chicken and tomatoes expire in 1-2 days)
    rec_res = client.get("/api/recipes/recommendations", headers=headers)
    assert rec_res.status_code == 200
    recommendations = rec_res.json()
    assert len(recommendations) > 0

    top_rec = recommendations[0]
    assert "recommendation_score" in top_rec
    assert "recommendation_reason" in top_rec
    assert top_rec["recommendation_score"] > 0
    # Recommendation should explain why
    assert len(top_rec["recommendation_reason"]) > 0

def test_single_recipe(client):
    res = client.get("/api/recipes/1")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] is not None
    assert len(data["instructions"]) > 0

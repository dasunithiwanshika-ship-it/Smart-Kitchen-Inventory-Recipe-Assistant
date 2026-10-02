def test_register_and_login_flow(client):
    # Register new user
    reg_payload = {
        "email": "testuser@example.com",
        "password": "strongpassword123",
        "full_name": "Test Chef"
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testuser@example.com"
    assert data["user"]["full_name"] == "Test Chef"

    # Duplicate registration should fail
    dup_resp = client.post("/api/auth/register", json=reg_payload)
    assert dup_resp.status_code == 400

    # Login with valid credentials
    login_resp = client.post("/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "strongpassword123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Access protected profile
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "testuser@example.com"

def test_login_invalid_password(client):
    response = client.post("/api/auth/login", json={
        "email": "testuser@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

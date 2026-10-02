from datetime import date, timedelta
from app.services.expiry_service import ExpiryService

def test_expiry_calculations():
    today = date.today()
    
    # Expired item
    past_date = today - timedelta(days=2)
    days = ExpiryService.calculate_days_until_expiry(past_date)
    assert days == -2
    assert ExpiryService.determine_status(days) == "Expired"

    # Critical item (tomorrow)
    tomorrow = today + timedelta(days=1)
    days_tom = ExpiryService.calculate_days_until_expiry(tomorrow)
    assert days_tom == 1
    assert ExpiryService.determine_status(days_tom) == "Critical"

    # Expiring soon (3 days)
    three_days = today + timedelta(days=3)
    days_three = ExpiryService.calculate_days_until_expiry(three_days)
    assert days_three == 3
    assert ExpiryService.determine_status(days_three) == "Expiring Soon"

    # Fresh (10 days)
    ten_days = today + timedelta(days=10)
    days_ten = ExpiryService.calculate_days_until_expiry(ten_days)
    assert days_ten == 10
    assert ExpiryService.determine_status(days_ten) == "Fresh"

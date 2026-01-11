# API Testing Guide for DHARMA Booking Backend

This directory contains automated tests for all API endpoints using pytest.

## Setup

### 1. Install Test Dependencies

```bash
pip install -r tests/requirements-test.txt
```

This will install:
- `pytest` - Testing framework
- `pytest-asyncio` - Async test support
- `httpx` - HTTP client for testing
- `faker` - Generate fake test data

### 2. Environment Setup

Make sure your `.env` file is configured with the test database connection:

```env
DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:14000/bookingdb
SECRET_KEY=your-secret-key
```

### 3. Database Setup

Ensure your database is running and tables are created:

```bash
python create_tablesdb.py
```

## Running Tests

### Run All Tests

```bash
pytest
```

### Run Specific Test File

```bash
pytest tests/test_user_auth.py
pytest tests/test_temples.py
pytest tests/test_slots.py
```

### Run Tests by Marker

```bash
# Run only authentication tests
pytest -m auth

# Run only user-related tests
pytest -m user

# Run only admin tests
pytest -m admin

# Run temple tests
pytest -m temple

# Run slot tests
pytest -m slot

# Run booking tests
pytest -m booking

# Run parking tests
pytest -m parking
```

### Run Specific Test Function

```bash
pytest tests/test_user_auth.py::TestUserAuthentication::test_user_registration_success
```

### Verbose Output

```bash
pytest -v
```

### Show Print Statements

```bash
pytest -s
```

### Stop on First Failure

```bash
pytest -x
```

### Run Last Failed Tests

```bash
pytest --lf
```

## Test Files Structure

```
tests/
├── conftest.py              # Shared fixtures (auth tokens, test data)
├── requirements-test.txt    # Test dependencies
├── test_user_auth.py        # User authentication tests
├── test_admin_auth.py       # Admin authentication tests
├── test_temples.py          # Temple CRUD tests
├── test_slots.py            # Booking slot CRUD tests
├── test_bookings.py         # Booking CRUD tests
├── test_parking.py          # Parking & parking slot tests
└── README.md                # This file
```

## Test Coverage

### User Authentication APIs
- ✅ User registration
- ✅ User login
- ✅ Get user profile
- ✅ Update user profile
- ✅ Delete user profile

### Admin Authentication APIs
- ✅ Admin registration
- ✅ Admin login
- ✅ Get admin profile
- ✅ Update admin profile
- ✅ Delete admin profile

### Temple APIs
- ✅ Create temple (admin only)
- ✅ Get all temples (public)
- ✅ Get temple by ID
- ✅ Update temple (admin only)
- ✅ Delete temple (admin only)

### Slot APIs (Booking/Darshan)
- ✅ Create slot (admin only)
- ✅ Get all slots
- ✅ Filter slots by temple
- ✅ Filter slots by date
- ✅ Get slot by ID
- ✅ Update slot (admin only)
- ✅ Delete slot (admin only)
- ✅ Validation: Time range validation
- ✅ Validation: Capacity checks

### Booking APIs
- ✅ Create booking
- ✅ Get all bookings
- ✅ Get booking by ID
- ✅ Get bookings by user
- ✅ Update booking
- ✅ Delete booking

### Parking APIs
- ✅ Create parking zone (admin only)
- ✅ Get all parking zones
- ✅ Get parking zone by ID
- ✅ Get parking zones by temple
- ✅ Update parking zone (admin only)
- ✅ Delete parking zone (admin only)

### Parking Slot APIs
- ✅ Create parking slot (admin only)
- ✅ Get all parking slots
- ✅ Get parking slot by ID
- ✅ Get slots by parking zone
- ✅ Update parking slot (admin only)
- ✅ Delete parking slot (admin only)

## Writing New Tests

### Using Fixtures

Common fixtures available in `conftest.py`:

```python
def test_example(test_client, registered_user, created_temple):
    # test_client - FastAPI test client
    # registered_user - Dict with user data, token, headers
    # created_temple - Created temple object
    
    response = test_client.get(
        "/some/endpoint",
        headers=registered_user["headers"]
    )
    assert response.status_code == 200
```

### Adding Test Markers

Mark your tests for easy filtering:

```python
@pytest.mark.auth
@pytest.mark.user
def test_something():
    # Your test code
    pass
```

## Troubleshooting

### Database Connection Errors
- Ensure PostgreSQL is running: `docker-compose up -d` (if using Docker)
- Check `.env` file has correct DATABASE_URL
- Run `python create_tablesdb.py` to create tables

### Import Errors
- Make sure you're in the project root directory
- Install dependencies: `pip install -r requirements.txt`
- Install test dependencies: `pip install -r tests/requirements-test.txt`

### Test Failures
- Check if the API server is running correctly
- Verify database has proper schema
- Check test data doesn't conflict with existing data
- Use `-v` flag for verbose output to see more details

## Continuous Integration

To run tests in CI/CD pipeline:

```bash
# Install dependencies
pip install -r requirements.txt
pip install -r tests/requirements-test.txt

# Set up database
python create_tablesdb.py

# Run tests with coverage
pytest --cov=api --cov-report=html
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Use Fixtures**: Leverage pytest fixtures for setup/teardown
3. **Clean Up**: Tests should clean up after themselves
4. **Descriptive Names**: Test names should clearly state what they test
5. **Assert Clearly**: Use specific assertions with helpful messages
6. **Mark Tests**: Use markers to categorize tests

## Support

For issues or questions about testing, please refer to:
- FastAPI Testing Docs: https://fastapi.tiangolo.com/tutorial/testing/
- Pytest Documentation: https://docs.pytest.org/

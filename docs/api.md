# API Specification & Endpoints

## Base URL
`/api`

## 1. Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register a new user and receive JWT token | No |
| `POST` | `/auth/login` | Log in with email & password | No |
| `GET`  | `/auth/me` | Retrieve profile of authenticated user | Yes |
| `PUT`  | `/auth/profile` | Update notification days and full name | Yes |

## 2. Inventory (`/inventory`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/inventory` | List items with filters (`storage_location`, `status`, `search`, `sort_by`) | Yes |
| `POST` | `/inventory` | Add new food item to kitchen inventory | Yes |
| `GET`  | `/inventory/{id}` | Get item details | Yes |
| `PUT`  | `/inventory/{id}` | Update quantity, storage location, or expiry | Yes |
| `DELETE` | `/inventory/{id}` | Delete item from inventory | Yes |
| `POST` | `/inventory/{id}/consume` | Mark item as consumed or wasted and log history | Yes |
| `GET`  | `/inventory/stats` | Retrieve live count of fridge, freezer, expiring items | Yes |

## 3. Barcode Scanner (`/barcode`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/barcode/scan` | Lookup barcode in local catalog or OpenFoodFacts | Yes |
| `GET`  | `/barcode/lookup/{barcode}` | Quick lookup by barcode string | Yes |

## 4. AI Recipes (`/recipes`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/recipes` | List all system and user recipes | No |
| `GET`  | `/recipes/recommendations` | Get zero-waste recipe rankings prioritizing expiring food | Yes |
| `GET`  | `/recipes/{id}` | Full recipe details and steps | No |

## 5. Leftovers (`/leftovers`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/leftovers` | List user cooked leftovers with countdown | Yes |
| `POST` | `/leftovers` | Log newly prepared leftover | Yes |
| `POST` | `/leftovers/{id}/consume` | Mark leftover as eaten | Yes |
| `DELETE` | `/leftovers/{id}` | Remove leftover record | Yes |

## 6. Analytics & ML (`/analytics`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/analytics/waste` | Consumption vs expired breakdown & money saved | Yes |
| `GET`  | `/analytics/predictions` | ML food waste risk scoring and prevention advice | Yes |

## 7. AI Assistant (`/assistant`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/assistant/chat` | Conversational query grounded in live inventory context | Yes |

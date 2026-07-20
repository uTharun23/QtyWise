# 07 - API Documentation

## Authentication
JWT-based authentication. Pass `Authorization: Bearer <token>` header.

## Endpoints

### Products
- `GET /api/v1/products` - List products.
- `GET /api/v1/products/:id` - Product details.
- `POST /api/v1/products` - Create product.

### Recommendations
- `GET /api/v1/recommendations` - Get replenishment suggestions.

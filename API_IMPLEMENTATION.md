# API Implementation Guide

## Overview
This document describes the comprehensive API routes and data models implemented for THE WORLD DOOR luxury fulfillment system.

## Database Schema (Prisma)

### Models Implemented
- **User**: Authentication and role management (seller, staff, admin)
- **Session**: JWT token session management
- **Product**: Core product information with status tracking
- **Location**: Warehouse location management
- **InventoryMovement**: Product movement tracking between locations
- **Order**: Order management with status tracking
- **OrderItem**: Individual items within orders
- **Activity**: Audit log for all system activities

### Enums Defined
- **ProductStatus**: inbound → inspection → storage → listing → ordered → shipping → delivery → sold → returned
- **ProductCategory**: camera_body, lens, watch, accessory
- **ProductCondition**: new, like_new, excellent, very_good, good, fair, poor
- **UserRole**: seller, staff, admin
- **OrderStatus**: pending, confirmed, processing, shipped, delivered, cancelled, returned

## API Routes Implemented

### Authentication (`/api/auth/`)
- **POST** `/login` - User authentication with session creation
- **POST** `/logout` - Session invalidation
- **GET** `/session` - Session validation
- **DELETE** `/session` - Expired session cleanup

### Product Management (`/api/inventory/`, `/api/products/`)
- **POST** `/inventory` - Create new product (staff/admin only)
- **PUT** `/inventory` - Update product information (staff/admin only)
- **DELETE** `/inventory` - Delete product (admin only, with order validation)
- **POST** `/products/inspection` - Record inspection data
- **PUT** `/products/inspection` - Update product status after inspection

### Inventory Management (`/api/locations/`, `/api/inventory/movement/`)
- **GET** `/locations` - List all active locations
- **POST** `/locations` - Create new location (staff/admin only)
- **PUT** `/locations` - Update location information
- **GET** `/inventory/movement` - Get movement history
- **POST** `/inventory/movement` - Record product movement
- **DELETE** `/inventory/movement` - Revert latest movement (admin only)

### Order Management (`/api/orders/`)
- **GET** `/orders` - List orders with filtering (staff/admin only)
- **POST** `/orders` - Create new order
- **PUT** `/orders` - Update order information
- **POST** `/orders/shipping` - Process shipping
- **PUT** `/orders/shipping` - Mark as delivered
- **POST** `/orders/returns` - Process returns
- **PUT** `/orders/returns` - Handle returned products

## Security Features

### Authentication
- JWT-based session management
- HTTP-only cookies for enhanced security
- Role-based access control (RBAC)
- Session expiration and cleanup

### Authorization Levels
- **Public**: No authentication required
- **Authenticated**: Valid session required
- **Staff**: Staff or admin role required
- **Admin**: Admin role only

### Data Validation
- Input validation on all endpoints
- SKU uniqueness enforcement
- Business logic validation (e.g., cannot delete products in active orders)
- Status transition validation

## Data Flow Examples

### Product Lifecycle
1. **Entry**: POST `/inventory` → status: 'inbound'
2. **Inspection**: POST `/products/inspection` → status: 'inspection'
3. **Storage**: PUT `/products/inspection` → status: 'storage'
4. **Listing**: PUT `/inventory` → status: 'listing'
5. **Order**: POST `/orders` → status: 'ordered'
6. **Shipping**: POST `/orders/shipping` → status: 'shipping'
7. **Delivery**: PUT `/orders/shipping` → status: 'sold'

### Inventory Movement
1. Check current product location
2. Validate target location exists
3. Create movement record
4. Update product location
5. Log activity

## Error Handling

### Standard Error Responses
```json
{
  "error": "エラーメッセージ",
  "status": 400
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **500**: Internal Server Error

## Database Setup Instructions

### 1. Install Dependencies
```bash
npm install prisma @prisma/client bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure:
```
DATABASE_URL="postgresql://username:password@localhost:5432/world_door_db"
JWT_SECRET="your-jwt-secret-key"
```

### 3. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Create Initial Data
The system will automatically create:
- Default admin user (`admin@worlddoor.com` / `admin123`)
- Default warehouse locations (A区画, V区画, H区画)

## Usage Examples

### Creating a Product
```javascript
const response = await fetch('/api/inventory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Canon EOS R5',
    sku: 'CAM-001',
    category: 'カメラ本体',
    price: 450000,
    condition: '極美品',
    description: '美品のミラーレス一眼'
  })
});
```

### Processing an Order
```javascript
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    customerId: 'customer_id',
    items: [
      { productId: 'product_id', quantity: 1 }
    ],
    shippingAddress: '東京都渋谷区...',
    paymentMethod: 'クレジットカード'
  })
});
```

## Type Safety

All API endpoints are fully typed using TypeScript interfaces defined in `/types/api.ts`. This includes:
- Request/Response types
- Database model types
- Enum definitions
- Error handling types

## Activity Logging

All significant actions are logged in the Activity table:
- User actions with timestamps
- Product status changes
- Inventory movements
- Order state changes
- System events

## Future Enhancements

### Planned Features
- Real-time notifications using WebSocket
- Bulk operations for inventory management
- Advanced reporting APIs
- Integration with external shipping services
- Image upload and management

### Performance Optimizations
- Database connection pooling
- Redis caching for frequent queries
- Pagination for large datasets
- Background job processing

## Notes

- **Demo Mode**: Current GET endpoints return static data for frontend compatibility
- **Server Components**: Data fetching should be handled by Next.js Server Components
- **Japanese UI**: All user-facing messages are in Japanese
- **Business Logic**: Preserves existing fulfillment workflow processes
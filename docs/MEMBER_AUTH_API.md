# Member Portal Authentication API

API endpoints untuk autentikasi member di Portal Anggota IAI Muda Jakarta.

## Base URL
```
http://localhost:3000 (development)
https://imud.iaijakarta.or.id (production)
```

## Authentication

Member authentication menggunakan JWT (JSON Web Token) yang dapat dikirim via:
1. **Authorization Header**: `Authorization: Bearer <token>`
2. **HTTP-only Cookie**: `auth_token` (otomatis di-set saat login)

Token type: `member` (berbeda dari admin yang menggunakan type `admin`)

---

## Endpoints

### 1. Member Login

Authenticate member dan generate JWT token.

**Endpoint:** `POST /api/member/auth/login`

**Request Body:**
```json
{
  "email": "member@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "member": {
    "id": 1,
    "name": "Justin Anandya Wibisana",
    "email": "justin@imud.com",
    "imageUrl": "https://...",
    "isAlumni": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**400 Bad Request** - Missing credentials:
```json
{
  "success": false,
  "message": "Email dan password harus diisi"
}
```

**401 Unauthorized** - Wrong credentials:
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

**403 Forbidden** - Account not activated:
```json
{
  "success": false,
  "message": "Akun portal belum diaktifkan. Hubungi admin."
}
```

**403 Forbidden** - Account inactive:
```json
{
  "success": false,
  "message": "Akun tidak aktif. Hubungi admin."
}
```

**Notes:**
- Login akan otomatis set HTTP-only cookie `auth_token` dengan expiry 8 jam
- Password di-verify menggunakan bcrypt
- Last login timestamp akan di-update otomatis

---

### 2. Get Member Profile

Get authenticated member's profile data.

**Endpoint:** `GET /api/member/auth/me`

**Authentication:** Required (Bearer token or cookie)

**Success Response (200):**
```json
{
  "success": true,
  "member": {
    "id": 1,
    "name": "Justin Anandya Wibisana",
    "email": "justin@imud.com",
    "phone": "+62812345678",
    "whatsapp": "+62812345678",
    "imageUrl": "https://...",
    "linkedinUrl": "https://linkedin.com/in/...",
    "bio": "Member bio...",
    "division": "Technology",
    "university": "Universitas Indonesia",
    "isAlumni": false,
    "showPublic": true,
    "generation": {
      "id": 1,
      "name": "Generation 2024",
      "years": "2024-2025"
    },
    "position": {
      "id": 1,
      "name": "Head of Technology",
      "category": "bph"
    },
    "lastLoginAt": "2026-07-22T04:17:46.287Z"
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token or invalid token:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden** - Account inactive:
```json
{
  "success": false,
  "message": "Akun tidak aktif"
}
```

**404 Not Found** - Member not found:
```json
{
  "success": false,
  "message": "Member tidak ditemukan"
}
```

---

### 3. Member Logout

Clear authentication token.

**Endpoint:** `POST /api/member/auth/logout`

**Authentication:** Optional (but recommended to send token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

**Notes:**
- Logout akan clear HTTP-only cookie `auth_token`
- Token di client-side harus di-hapus manual
- Endpoint ini selalu success karena hanya clear cookie

---

## JWT Token Structure

Member JWT payload:
```typescript
{
  memberId: number;      // Member ID dari database
  email: string;         // Member email
  type: "member";        // Token type (fixed)
  iat: number;           // Issued at timestamp
  exp: number;           // Expiry timestamp (8 hours from iat)
}
```

Admin JWT payload (untuk comparison):
```typescript
{
  userId: number;        // User ID dari database
  username: string;      // Admin username
  role: string;          // "superadmin" | "admin" | "editor"
  type: "admin";         // Token type (fixed)
  iat: number;
  exp: number;
}
```

---

## Security Features

1. **Password Hashing**: Passwords di-hash dengan bcrypt (salt rounds: 10)
2. **HTTP-only Cookie**: Token disimpan di HTTP-only cookie untuk security
3. **Token Expiry**: Token expire setelah 8 jam
4. **Account Status Check**: Login dan me endpoint check `isActive` status
5. **Type Discrimination**: Admin dan member token dibedakan dengan `type` field
6. **CSRF Protection**: SameSite=Strict cookie policy

---

## Testing

### Using REST Client (VSCode)

1. Install "REST Client" extension
2. Open file: `test_member_auth.http`
3. Click "Send Request" pada request yang ingin di-test

### Using curl

**Login:**
```bash
curl -X POST http://localhost:3000/api/member/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"justin@imud.com","password":"password123"}' \
  -c cookies.txt
```

**Get Profile (using cookie):**
```bash
curl -X GET http://localhost:3000/api/member/auth/me \
  -b cookies.txt
```

**Get Profile (using token):**
```bash
TOKEN="<your-token-here>"
curl -X GET http://localhost:3000/api/member/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/member/auth/logout \
  -b cookies.txt
```

---

## Creating Test Accounts

Run script untuk create test member account:

```bash
npx tsx db/create_test_member_account.ts
```

Script akan:
1. Ambil member pertama dari database
2. Create member_account dengan password: `password123`
3. Set account sebagai active
4. Tampilkan credentials untuk testing

**Default Test Credentials:**
- Email: `justin@imud.com`
- Password: `password123`

---

## Database Schema

### members table (existing + new columns)
```sql
- id (integer, primary key)
- name (varchar)
- email (varchar) -- NEW
- phone (varchar) -- NEW
- whatsapp (varchar) -- NEW
- imageUrl (text)
- linkedinUrl (text)
- bio (text)
- division (varchar)
- university (varchar)
- generationId (integer, FK)
- positionId (integer, FK, nullable)
- is_alumni (boolean, default false) -- NEW
- show_public (boolean, default true) -- NEW
- createdAt (timestamp)
- updatedAt (timestamp)
```

### member_accounts table (NEW)
```sql
- id (integer, primary key)
- member_id (integer, FK -> members.id, unique)
- password_hash (varchar, not null)
- is_active (boolean, default true)
- last_login_at (timestamp, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (missing/invalid input)
- `401` - Unauthorized (auth required)
- `403` - Forbidden (account inactive/not activated)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

---

## Integration dengan Frontend

### Login Flow
```typescript
// 1. Login
const response = await fetch('/api/member/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include', // Important for cookies
});

const { success, token, member } = await response.json();

if (success) {
  // Store token in localStorage (optional, cookie already set)
  localStorage.setItem('member_token', token);
  localStorage.setItem('member', JSON.stringify(member));
}
```

### Check Auth Status
```typescript
// 2. Check if logged in
const response = await fetch('/api/member/auth/me', {
  credentials: 'include', // Use cookie
  // OR use token:
  // headers: { 'Authorization': `Bearer ${token}` }
});

if (response.ok) {
  const { member } = await response.json();
  // Member is logged in
} else {
  // Redirect to login
}
```

### Logout Flow
```typescript
// 3. Logout
await fetch('/api/member/auth/logout', {
  method: 'POST',
  credentials: 'include',
});

// Clear client-side storage
localStorage.removeItem('member_token');
localStorage.removeItem('member');
```

---

## Next Steps

- [ ] Implement password reset/forgot password
- [ ] Implement change password endpoint
- [ ] Add rate limiting for login attempts
- [ ] Add email verification for new accounts
- [ ] Add 2FA (optional)
- [ ] Add refresh token mechanism

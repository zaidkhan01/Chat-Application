# Chat Application

A full-stack real-time chat application built with React, Node.js, Express, and MongoDB.

## Project Structure

```
Chat Application/
├── backend/          # Express.js backend server
├── frontend/         # React.js frontend application
└── README.md        # This file
```

## Signup Flow Sequence Diagram

### Detailed Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant SignUpPage as SignUpPage.jsx
    participant AuthStore as UseAuthStore<br/>(Zustand)
    participant Axios as axiosInstance
    participant BackendServer as Express Server
    participant CORSMiddleware as CORS Middleware
    participant AuthRoute as /api/auth Route
    participant AuthController as signup Controller
    participant Database as MongoDB
    participant EmailService as Email Service

    User->>SignUpPage: Fills form (fullName, email, password)
    User->>SignUpPage: Clicks "Create Account" button
    
    SignUpPage->>SignUpPage: handleSubmit(e.preventDefault())
    SignUpPage->>SignUpPage: Validates formData fields
    
    alt Form validation fails
        SignUpPage->>User: Shows error (no request sent)
    else Form validation passes
        SignUpPage->>AuthStore: signup(formData)
        
        AuthStore->>AuthStore: Validates data
        AuthStore->>AuthStore: set({ isSigningUp: true })
        AuthStore->>Axios: POST("/auth/signup", data)
        
        Note over Axios: baseURL: "http://localhost:3000/api"<br/>withCredentials: true
        
        Axios->>BackendServer: HTTP POST<br/>http://localhost:3000/api/auth/signup<br/>Body: {fullName, email, password}<br/>Headers: Cookie (if exists)
        
        BackendServer->>CORSMiddleware: Check origin & credentials
        
        alt CORS check fails
            CORSMiddleware->>Axios: CORS Error (blocked)
            Axios->>AuthStore: Error response
            AuthStore->>User: Shows CORS error toast
        else CORS check passes
            CORSMiddleware->>BackendServer: Request allowed
            BackendServer->>BackendServer: cookieParser() - Parse cookies
            BackendServer->>BackendServer: express.json() - Parse body
            
            BackendServer->>AuthRoute: Route to /api/auth
            
            AuthRoute->>AuthController: POST /signup → signup(req, res)
            
            AuthController->>AuthController: Validate: fullName, email, password
            
            alt Validation fails
                AuthController->>BackendServer: 400 Bad Request
                BackendServer->>Axios: 400 Response
                Axios->>AuthStore: Error response
                AuthStore->>User: Shows validation error toast
            else Validation passes
                AuthController->>AuthController: Validate password length (>= 8)
                AuthController->>AuthController: Validate email format (regex)
                
                AuthController->>Database: User.findOne({ email })
                
                alt User already exists
                    Database->>AuthController: User found
                    AuthController->>BackendServer: 400 "User already exists"
                    BackendServer->>Axios: 400 Response
                    Axios->>AuthStore: Error response
                    AuthStore->>User: Shows "User already exists" toast
                else User doesn't exist
                    Database->>AuthController: null (user not found)
                    
                    AuthController->>AuthController: bcrypt.genSalt(10)
                    AuthController->>AuthController: bcrypt.hash(password, salt)
                    
                    AuthController->>Database: new User({ fullName, email, hashedPassword })
                    AuthController->>Database: user.save()
                    
                    Database->>AuthController: Saved user object
                    
                    AuthController->>AuthController: generateToken(userId, res)
                    Note over AuthController: Sets JWT cookie:<br/>httpOnly: true<br/>secure: false (dev)<br/>sameSite: "lax"
                    
                    AuthController->>BackendServer: 201 Created<br/>Response: {_id, fullName, email, profilePic}<br/>Set-Cookie: jwt=token
                    
                    BackendServer->>Axios: 201 Response + Cookie
                    
                    AuthController->>EmailService: sendWelcomeEmail(email, fullName)
                    EmailService-->>AuthController: Email sent (async, non-blocking)
                    
                    Axios->>AuthStore: Success response + cookie stored
                    
                    AuthStore->>AuthStore: set({ authUser: res.data })
                    AuthStore->>AuthStore: set({ isSigningUp: false })
                    AuthStore->>User: toast.success("Account created successfully!")
                    
                    Note over User,AuthStore: User is now authenticated<br/>Cookie stored in browser<br/>authUser state updated
                end
            end
        end
    end
```

### Simplified High-Level Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend<br/>(React)
    participant A as Axios
    participant B as Backend<br/>(Express)
    participant D as Database

    U->>F: Submit signup form
    F->>F: Validate form data
    F->>A: POST /auth/signup + data
    A->>B: HTTP Request<br/>(with credentials)
    B->>B: CORS check ✓
    B->>B: Parse body & cookies
    B->>B: Route to signup handler
    B->>B: Validate input
    B->>D: Check if user exists
    alt User exists
        D->>B: User found
        B->>A: 400 Error
        A->>F: Error response
        F->>U: Show error
    else User new
        D->>B: User not found
        B->>B: Hash password
        B->>D: Create new user
        D->>B: User saved
        B->>B: Generate JWT token
        B->>A: 201 Success + Cookie
        A->>F: User data + cookie
        F->>F: Update auth state
        F->>U: Show success
    end
```

## Flow Description

### 1. User Interaction
- User fills out the signup form with `fullName`, `email`, and `password`
- Clicks the "Create Account" button

### 2. Frontend Processing
- **SignUpPage.jsx**: Form submission handler validates data and calls the signup function
- **UseAuthStore.js**: Zustand store manages authentication state and makes API calls
- **axios.js**: Configured axios instance with baseURL and credentials

### 3. HTTP Request
- POST request to `http://localhost:3000/api/auth/signup`
- Request body contains user data
- Credentials (cookies) are included via `withCredentials: true`

### 4. Backend Processing
- **CORS Middleware**: Validates origin and allows cross-origin requests
- **Cookie Parser**: Extracts cookies from request
- **Body Parser**: Parses JSON request body
- **Route Handler**: Routes to `/api/auth/signup` endpoint
- **Controller**: Validates input, checks for existing user, creates new user

### 5. Database Operations
- Check if user with email already exists
- Hash password using bcrypt
- Save new user to MongoDB
- Generate JWT token and set as HTTP-only cookie

### 6. Response & State Update
- Backend returns user data (without password)
- Frontend updates authentication state
- User is now authenticated and can access protected routes

## Key Components

### Frontend
- **SignUpPage.jsx**: Signup form component
- **UseAuthStore.js**: Zustand store for state management
- **axios.js**: HTTP client configuration

### Backend
- **server.js**: Express server setup with CORS and middleware
- **auth.route.js**: Authentication routes
- **auth.controller.js**: Signup business logic
- **auth.middleware.js**: JWT token verification

## Error Handling

The flow includes error handling for:
- **CORS failures**: Request blocked by browser
- **Validation errors**: Invalid input data
- **Duplicate users**: Email already registered
- **Network errors**: Backend unavailable
- **Server errors**: Internal server issues

## Authentication

- JWT tokens are stored as HTTP-only cookies
- Tokens are automatically sent with subsequent requests
- Protected routes verify tokens via middleware

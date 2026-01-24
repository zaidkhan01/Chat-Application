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

## Message Sending and Receiving Flow

### Detailed Sequence Diagram

```mermaid
sequenceDiagram
    participant Sender as Sender User
    participant MessageInput as MessageInput.jsx
    participant ChatStore as useChatStore<br/>(Zustand)
    participant Axios as axiosInstance
    participant BackendServer as Express Server
    participant AuthMiddleware as Auth Middleware
    participant MessageController as sendMessage Controller
    participant Cloudinary as Cloudinary API
    participant Database as MongoDB
    participant SocketIO as Socket.IO Server
    participant ReceiverSocket as Receiver Socket
    participant ReceiverStore as Receiver useChatStore
    participant ReceiverUI as Receiver ChatContainer

    Note over Sender,ReceiverUI: === SENDER SIDE FLOW ===
    
    Sender->>MessageInput: Types message / selects image
    Sender->>MessageInput: Clicks send button
    MessageInput->>MessageInput: handleSendMessage()<br/>Validates input
    MessageInput->>ChatStore: sendMessage({text, image})
    
    Note over ChatStore: Optimistic Update
    ChatStore->>ChatStore: Create optimistic message<br/>(temp ID, immediate UI update)
    ChatStore->>ReceiverUI: UI updates instantly<br/>(sender sees message)
    
    ChatStore->>Axios: POST("/messages/send/:receiverId", messageData)
    
    Note over Axios: baseURL: "http://localhost:3000/api"<br/>withCredentials: true<br/>Includes JWT cookie
    
    Axios->>BackendServer: HTTP POST<br/>/api/messages/send/:receiverId<br/>Body: {text, image}<br/>Headers: Cookie (JWT)
    
    BackendServer->>AuthMiddleware: Verify JWT token
    AuthMiddleware->>BackendServer: Authentication successful<br/>req.user = authenticated user
    
    BackendServer->>MessageController: sendMessage(req, res)
    
    MessageController->>MessageController: Validate: text or image required
    MessageController->>MessageController: Validate: senderId ≠ receiverId
    MessageController->>Database: User.exists({_id: receiverId})
    
    alt Receiver not found
        Database->>MessageController: User not found
        MessageController->>BackendServer: 400 "Receiver not found"
        BackendServer->>Axios: 400 Error Response
        Axios->>ChatStore: Error response
        ChatStore->>ChatStore: Remove optimistic message
        ChatStore->>Sender: Show error toast
    else Receiver exists
        Database->>MessageController: Receiver exists
        
        alt Image provided
            MessageController->>Cloudinary: upload(image)
            Cloudinary->>MessageController: secure_url
            MessageController->>MessageController: imageUrl = secure_url
        end
        
        MessageController->>Database: new Message({<br/>senderId, receiverId,<br/>text, image: imageUrl<br/>})
        MessageController->>Database: message.save()
        Database->>MessageController: Saved message object
        
        MessageController->>SocketIO: getReceiverSocketId(receiverId)
        SocketIO->>MessageController: receiverSocketId (if online)
        
        alt Receiver is online
            MessageController->>SocketIO: io.to(receiverSocketId)<br/>.emit("newMessage", message)
            SocketIO->>ReceiverSocket: Socket event: "newMessage"
        else Receiver is offline
            Note over SocketIO: Message saved to DB<br/>Receiver will see it when online
        end
        
        MessageController->>BackendServer: 201 Created<br/>Response: message object
        BackendServer->>Axios: 201 Response
        Axios->>ChatStore: Success response with message
        
        ChatStore->>ChatStore: Replace optimistic message<br/>with real message from server
        ChatStore->>Sender: UI updates with final message
    end

    Note over Sender,ReceiverUI: === RECEIVER SIDE FLOW ===
    
    Note over ReceiverSocket: Socket connection established<br/>on login/chat open
    
    ReceiverSocket->>ReceiverStore: subscribeToMessages()<br/>Sets up "newMessage" listener
    
    alt Message received via socket
        SocketIO->>ReceiverSocket: emit("newMessage", message)
        ReceiverSocket->>ReceiverStore: socket.on("newMessage")<br/>Event triggered
        
        ReceiverStore->>ReceiverStore: Check if message is for<br/>current conversation
        ReceiverStore->>ReceiverStore: Check for duplicates
        
        alt Message is for current chat & not duplicate
            ReceiverStore->>ReceiverStore: Add message to messages array
            ReceiverStore->>ReceiverUI: State update triggers re-render
            ReceiverUI->>ReceiverUI: Display new message
            
            alt Sound enabled
                ReceiverStore->>ReceiverStore: Play notification sound
            end
        else Message not for current chat
            Note over ReceiverStore: Message ignored<br/>(different conversation)
        end
    end

    Note over Sender,ReceiverUI: === PERSISTENCE ===
    
    Note over Database: All messages saved to MongoDB<br/>Available on page reload
    ReceiverUI->>ChatStore: getMessagesByUserId(userId)
    ChatStore->>Axios: GET("/messages/:userId")
    Axios->>BackendServer: HTTP GET /api/messages/:userId
    BackendServer->>MessageController: getMessagesByUserId(req, res)
    MessageController->>Database: Message.find({<br/>$or: [<br/>  {senderId, receiverId},<br/>  {receiverId, senderId}<br/>]<br/>})
    Database->>MessageController: All messages between users
    MessageController->>BackendServer: 200 OK with messages array
    BackendServer->>Axios: 200 Response
    Axios->>ChatStore: Messages array
    ChatStore->>ReceiverUI: Display all messages
```

### Simplified High-Level Flow

```mermaid
sequenceDiagram
    participant S as Sender
    participant SF as Sender Frontend
    participant B as Backend
    participant D as Database
    participant SO as Socket.IO
    participant RF as Receiver Frontend
    participant R as Receiver

    Note over S,R: Sending Message
    
    S->>SF: Type & send message
    SF->>SF: Optimistic update<br/>(instant UI)
    SF->>B: POST /messages/send/:id
    B->>B: Validate & save
    B->>D: Save message
    D->>B: Message saved
    B->>SO: Emit to receiver
    B->>SF: 201 Response
    SF->>SF: Replace with real message
    
    Note over S,R: Receiving Message
    
    SO->>RF: Socket event "newMessage"
    RF->>RF: Add to messages
    RF->>R: Display message
    R->>R: See new message
```

### Flow Description

#### 1. Sender Side - Message Composition
- **MessageInput.jsx**: User types message or selects image
- Form validation ensures text or image is provided
- On submit, calls `sendMessage()` from `useChatStore`

#### 2. Optimistic Update
- **useChatStore**: Immediately creates a temporary message with a temp ID
- UI updates instantly, showing the message to the sender
- Provides instant feedback while waiting for server response

#### 3. HTTP Request to Backend
- POST request to `/api/messages/send/:receiverId`
- Includes JWT cookie for authentication
- Request body contains `{text, image}`

#### 4. Backend Processing
- **Auth Middleware**: Verifies JWT token
- **Message Controller**: Validates input (text or image required)
- Checks receiver exists and is not the same as sender
- If image provided, uploads to Cloudinary
- Creates and saves message to MongoDB

#### 5. Real-Time Delivery via Socket.IO
- Backend looks up receiver's socket ID from `userSocketMap`
- If receiver is online, emits `"newMessage"` event via Socket.IO
- If receiver is offline, message is saved and will be retrieved when they come online

#### 6. Receiver Side - Real-Time Update
- **Socket Connection**: Established when user logs in or opens chat
- **subscribeToMessages()**: Sets up listener for `"newMessage"` events
- When message arrives, validates it's for the current conversation
- Checks for duplicates to prevent duplicate messages
- Updates messages array, triggering UI re-render
- Plays notification sound if enabled

#### 7. Message Persistence
- All messages are saved to MongoDB
- When user opens a conversation, `getMessagesByUserId()` fetches all historical messages
- Messages are displayed in chronological order

### Key Components

#### Frontend
- **MessageInput.jsx**: Message composition component
- **useChatStore.js**: Zustand store managing messages and real-time subscriptions
- **ChatContainer.jsx**: Displays messages and handles socket subscriptions
- **UseAuthStore.js**: Manages socket connection

#### Backend
- **message.controller.js**: Handles message sending, validation, and database operations
- **message.route.js**: Routes for message endpoints
- **socket.js**: Socket.IO server setup and user socket mapping
- **cloudinary.js**: Image upload service

### Real-Time Features

1. **Optimistic Updates**: Instant UI feedback for sender
2. **Socket.IO Integration**: Real-time message delivery to online users
3. **Offline Support**: Messages saved to database for offline users
4. **Duplicate Prevention**: Checks prevent duplicate messages in UI
5. **Sound Notifications**: Optional audio notifications for new messages

### Error Handling

The flow includes error handling for:
- **Validation errors**: Missing text/image, sending to self
- **Receiver not found**: Invalid receiver ID
- **Network errors**: Backend unavailable, socket disconnection
- **Image upload failures**: Cloudinary upload errors
- **Optimistic update rollback**: Removes temporary message on failure

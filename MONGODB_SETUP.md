# MongoDB Setup Guide

## Current Status
✅ Backend is running in **development mode** (offline, no MongoDB)
- Server: http://localhost:3000
- Database: Skipped (MONGODB_URI=skip in .env)

## To Enable MongoDB (Optional)

Your MongoDB Atlas cluster is configured but the connection is blocked by the firewall.

### Option 1: Add Your IP to MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login to your account
3. Select your cluster (Cluster1)
4. Go to **Network Access** → **IP Whitelist**
5. Click **Add IP Address**
6. Select **Add Current IP Address** (or enter your IP)
7. Click **Confirm**
8. Wait 1-2 minutes for changes to apply

### Option 2: Allow All IPs (Development Only)
1. In MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. Enter `0.0.0.0/0` (allows all IPs)
4. Click **Confirm**

⚠️ **Security Warning**: Only use 0.0.0.0/0 for development, not production!

### Option 3: Use Local MongoDB

```bash
# Install MongoDB Community (Windows)
# Download from: https://www.mongodb.com/try/download/community

# Update MONGODB_URI in .env:
MONGODB_URI=mongodb://localhost:27017/sik-go
```

## After Fixing MongoDB

1. Update `.env`:
```env
MONGODB_URI=mongodb+srv://nabiel13:RPLGrup11@cluster1.ombs7d8.mongodb.net/sik-go?retryWrites=true&w=majority
```

2. Restart backend:
```bash
cd BE
npm start
```

3. You should see: `✓ MongoDB Connected: cluster1.ombs7d8.mongodb.net`

## Database Name
**Database Name**: `sik-go`

## Collections (Auto-created)
- users
- rooms
- proposals
- bookings
- documents

## Connection String
```
mongodb+srv://nabiel13:RPLGrup11@cluster1.ombs7d8.mongodb.net/sik-go?retryWrites=true&w=majority
```

Username: `nabiel13`
(Password stored in .env file)

## Testing APIs Without MongoDB

Frontend can be tested with mock data in offline mode. Real data persistence requires MongoDB.

```bash
# Start backend (already running on port 3000)
cd BE
npm start

# In another terminal, start frontend
cd FE
npm run dev

# Access at http://localhost:5173
```

## Troubleshooting

### If still getting connection error after adding IP:
1. Wait 2-3 minutes for IP whitelist changes to propagate
2. Check your actual IP: https://www.whatismyip.com/
3. Verify MongoDB URI spelling (copy-paste from Atlas)
4. Check `.env` file permissions (should be readable)

### To stay in offline mode:
Keep `MONGODB_URI=skip` in `.env` - no changes needed!

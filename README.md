# Scalable Chat Backend

## Description 
🌐 **Scalable and Real-time Chat Application**

A robust and scalable chat infrastructure using cutting-edge technologies. This project leverages Node.js, TypeScript, Kafka, Redis, Socket.IO, PostgreSQL, and Prisma to create a high-performance solution for real-time chat applications, along with a cross-platform mobile client built with React Native and Expo.

### Backend Features
- 🚀 **Scalable Architecture:** Utilizes Redis Pub/Sub for WebSocket scaling and Kafka for efficient database throughput management
- 🔄 **Real-time Communication:** Leverages Socket.IO to ensure seamless and real-time communication between clients
- 🛢️ **Persistent Storage:** Integrates with PostgreSQL and Prisma for reliable and efficient data storage
- 📤 **Media Storage:** Utilizes S3 buckets for secure and scalable storage of multimedia files
- 📨 **Email Service:** AWS SES integration for reliable email delivery
- 🔄 **TypeScript:** Enhances code maintainability and scalability with static typing

### Mobile Client Features
- 📱 **Cross-Platform:** Built using React Native and Expo TypeScript
- 🎨 **Modern UI:** Beautiful and intuitive user interface
- 🔄 **Real-time Updates:** Instant messaging and notifications
- 📸 **Media Sharing:** Support for images and files
- 🌙 **Dark Mode:** Comfortable viewing experience

## Tech Stack

### Backend
- Node.js
- TypeScript
- Redis (Pub/Sub)
- Kafka
- Socket.IO
- PostgreSQL
- Prisma
- Express.js
- AWS S3 & SES

### Client
- React Native
- Expo
- TypeScript
- Socket.IO Client
- React Navigation

## Getting Started

### Backend Setup
1. Clone the repository
```bash
git clone https://github.com/yourusername/scalable-chat.git
cd scalable-chat
```

2. Install dependencies
```bash
cd backend
npm install
```

3. Configure environment
```bash
cp .env.sample .env
```

4. Start the server
```bash
npm start
```

### Client Setup
1. Navigate to client directory
```bash
cd client
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
```bash
cp .env.sample .env
```

4. Start the development server
```bash
npm start
```

5. Open the app in Expo Go by scanning the QR code

---

**🌟 Star this repository if you find it helpful!**
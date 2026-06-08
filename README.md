# 💸 FinFlow — Personal Finance Tracker

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens" />
</p>

<p align="center">A full-stack personal finance tracker with a modern dark UI, built to learn Spring Boot through real-world implementation.</p>

---

## ✨ Features

| Feature | Status |
|---|---|
| User Registration & Login (JWT) | 🔲 Implement |
| Dashboard with analytics | ✅ Frontend Ready |
| Income & Expense Tracking | 🔲 Implement |
| Category Management | 🔲 Implement |
| Budget Management | 🔲 Implement |
| Monthly Reports & Charts | ✅ Frontend Ready |
| Profile Management | 🔲 Implement |
| Paginated Transaction History | 🔲 Implement |

---

## 🏗️ Project Structure

```
finance-tracker/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── assets/css/        # Global design system CSS
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context (Auth)
│   │   ├── pages/             # Page components
│   │   └── utils/             # Helpers & dummy data
│   └── package.json
│
└── backend/                   # Spring Boot REST API
    └── src/main/java/com/financetracker/
        ├── config/            # Security, CORS, App config
        ├── controller/        # REST controllers (skeleton)
        ├── dto/               # Request & Response DTOs
        ├── entity/            # JPA entities (skeleton)
        ├── enums/             # TransactionType, Role
        ├── exception/         # Custom exceptions & global handler
        ├── mapper/            # MapStruct mappers
        ├── repository/        # Spring Data JPA repositories
        ├── security/jwt/      # JWT filter & service
        ├── service/           # Service interfaces
        │   └── impl/          # Service implementations (your work!)
        └── util/              # Security utils
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Backend Setup

1. Create the database:
```sql
CREATE DATABASE finance_tracker;
```

2. Update `application.properties`:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Run the application:
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI library
- **React Router v6** — Client-side routing
- **Recharts** — Data visualization
- **Lucide React** — Icon library
- **Vite** — Build tool

### Backend
- **Spring Boot 3.2** — Application framework
- **Spring Security** — Authentication & Authorization
- **Spring Data JPA** — Database ORM
- **JWT (JJWT)** — Stateless authentication
- **MapStruct** — DTO ↔ Entity mapping
- **Lombok** — Reduce boilerplate
- **MySQL** — Production database
- **Bean Validation** — Request validation

---

## 📚 Learning Path (Milestones)

See [MILESTONES.md](./MILESTONES.md) for the complete step-by-step implementation guide.

---

## 📡 API Documentation

See [API_DOCS.md](./API_DOCS.md) for complete endpoint reference.

---

## 🗄️ Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for table definitions and relationships.

---

## 🤝 Contributing

This is a learning project. Feel free to fork, implement, and extend!

---

## 📄 License

MIT License — free to use for learning and portfolio purposes.

---

<p align="center">Built with ❤️ as a Spring Boot learning project</p>

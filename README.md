# Product Searching + Paginated Webapp

A full-stack web application for **product browsing, searching, sorting, pagination, and CRUD operations**.  
The backend is built with **Spring Boot + PostgreSQL**, and the frontend with **React (Vite) + TailwindCSS**.

The app is designed to handle **millions of products** efficiently using proper indexing and pagination.

---

## 🚀 Features
- Paginated product listing (with navigation: first, previous, next, last, jump-to-page).
- Search products by **name** and **SKU** (case-insensitive, supports partial matches).
- Sort by price, creation date, update date, name, or SKU.
- CRUD operations:
  - ➕ Create new products
  - ✏️ Edit existing products (via popup modal)
  - ❌ Delete products (with confirmation)
- Optimized PostgreSQL database with indexes for **fast queries** on 10M+ rows.

---

## 📦 Prerequisites

### Frontend
- Node.js >= 18
- npm or yarn

### Backend
- Java 17+
- Maven 3.8+
- Docker & Docker Compose (for PostgreSQL)

---

## 🐘 Database Setup (Postgres with Docker)

1. Start PostgreSQL using Docker:

```bash
docker run --name products-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=<your_password> \
  -e POSTGRES_DB=postgres \
  -p <your_port>:5432 \
  -d postgres:17
```

Verify the container is running:

```bash
docker ps
```


Connect with psql:

```bash
psql -h localhost -p <your_port> -U postgres -d postgres
```

⚙️ Backend (Spring Boot)

1. Configure application.properties (example):
```bash
spring.datasource.url=jdbc:postgresql://localhost:<your_port>/postgres
spring.datasource.username=postgres
spring.datasource.password=<your_password>

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```
2. Run the backend:
```bash
mvn spring-boot:run
```

The API will be available at http://localhost:8080/api/products.

💻 Frontend (React + Vite + TailwindCSS)

1. Install dependencies:
```bash
cd Frontend
npm install
```

2. Start the dev server:
```bash
npm run dev
```

The app will be available at http://localhost:5173.

🗄️ Populate the Database

The app is designed for large-scale testing with millions of products.

1. Make the seeding script executable:

```bash
chmod +x db/seed_data.sh
```

2. Run the script (this inserts 10 million rows in 100k batches):
```bash
 ./db/seed_data.sh
```
3. After seeding, create indexes for fast searching and sorting:
 ```bash
 psql -h localhost -p <your_port> -U postgres -d postgres -f db/indexes.sql
 ```

📊 Indexes Used

The following indexes are required for performance:

- Composite sort indexes:

  - (created_at DESC, id DESC)

  - (updated_at DESC, id DESC)

  - (price ASC, id ASC)

- Trigram indexes for fast text search:

  - GIN (upper(name) gin_trgm_ops)

  - GIN (upper(sku) gin_trgm_ops)

- Primary key: (id)

- Unique constraint: (sku)

✅ How to Test

1. Start backend (mvn spring-boot:run).

2. Start frontend (npm run dev).

3. Open the app in the browser.

4. Test:

    - Searching by name/SKU

    - Sorting by price/date

    - Pagination controls

    - Creating, editing, deleting products

📝 Notes

- Initial insert of 10M products can take some time depending on your hardware.

- Postgres indexes add storage overhead but make queries hundreds of times faster.

- If you only need a small dataset, change the TARGET variable in db/seed.sh.

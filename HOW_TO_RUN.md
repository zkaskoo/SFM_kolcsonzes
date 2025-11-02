# Hogyan Indítsuk és Futtassuk az Alkalmazást

## Előfeltételek
- MySQL telepítve (Homebrew-val)
- Node.js és npm telepítve
- Java 17 vagy újabb telepítve

## Lépésről Lépésre Útmutató

### 1. MySQL Adatbázis Indítása

```bash
# MySQL szerver indítása
mysql.server start

# Ellenőrzés, hogy a MySQL fut-e
mysql.server status

# Ellenőrzés, hogy létezik-e a kolcsonzes adatbázis
mysql -u root -e "SHOW DATABASES;"
```

Ha a `kolcsonzes` adatbázis nem létezik, hozd létre:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS kolcsonzes;"
```

### 2. Backend Indítása (Spring Boot)

Nyiss egy terminált és futtasd:

```bash
cd Konyv_kolcsonzes
./mvnw spring-boot:run
```

**A backend ezen fut:** `http://localhost:8080`

**Várd meg, amíg ezt látod:**
```
Tomcat started on port 8080 (http) with context path '/'
```

### 3. Frontend Indítása (React + Vite)

Nyiss egy **ÚJ terminált** és futtasd:

```bash
cd login-app
npm run dev
```

**A frontend ezen fut:** `http://localhost:5173`

**Ezt kell látnod:**
```
VITE v7.1.11  ready in 117 ms
➜  Local:   http://localhost:5173/
```

### 4. Az Alkalmazás Elérése

Nyisd meg a böngészőt és menj ide: **http://localhost:5173**

Lehetőségeid:
- Új fiók létrehozása (Név, Email, Jelszó)
- Bejelentkezés a megadott adatokkal
- Minden adat a MySQL adatbázisban tárolódik

### 5. Adatbázis Megtekintése DataGrip-ben

**Kapcsolat Beállításai:**
- Host: `localhost`
- Port: `3306`
- Database: *(hagyd üresen kezdetben)*
- User: `root`
- Password: *(hagyd üresen)*

Kapcsolódás után:
1. Bontsd ki a kapcsolatot
2. Látni fogod a `kolcsonzes` adatbázist a többi között
3. Navigálj: `kolcsonzes` → `tables` → `users`
4. Jobb klikk a `users`-re → "View Data"

### 6. Adatok Megtekintése Parancssorból

```bash
# Összes felhasználó megtekintése
mysql -u root -e "SELECT * FROM kolcsonzes.users;"

# Csak bizonyos oszlopok
mysql -u root -e "SELECT id, name, email FROM kolcsonzes.users;"
```

## Hibaelhárítás

### A MySQL Nem Indul
```bash
# Öld meg az összes futó MySQL folyamatot
pkill -9 mysqld

# Indítsd újra
mysql.server start
```

### A Backend Nem Kapcsolódik az Adatbázishoz
Ellenőrizd a konfigurációt itt:
```
Konyv_kolcsonzes/src/main/resources/application.properties
```

Tartalmaznia kell:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/kolcsonzes?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
```

### A Port Már Használatban Van
```bash
# Ellenőrizd mi használja a 8080-as portot (backend)
lsof -i:8080

# Ellenőrizd mi használja az 5173-as portot (frontend)
lsof -i:5173

# Szükség esetén öld meg a folyamatot
kill -9 <PID>
```

## Minden Leállítása

```bash
# Frontend leállítása: Ctrl+C az npm-et futtató terminálban

# Backend leállítása: Ctrl+C az mvnw-t futtató terminálban

# MySQL leállítása
mysql.server stop
```

## API Végpontok

- **Regisztráció**: `POST http://localhost:8080/api/auth/register`
  ```json
  {
    "name": "Kovács János",
    "email": "janos@example.com",
    "password": "jelszo123"
  }
  ```

- **Bejelentkezés**: `POST http://localhost:8080/api/auth/login`
  ```json
  {
    "email": "janos@example.com",
    "password": "jelszo123"
  }
  ```

## Adatbázis Struktúra

**Tábla: `users`**
- `id` (BIGINT, AUTO_INCREMENT, PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR, BCrypt titkosítással)

## Gyors Indítás (Minden Egyben)

```bash
# 1. Terminál: MySQL indítása
mysql.server start

# 2. Terminál: Backend indítása
cd Konyv_kolcsonzes && ./mvnw spring-boot:run

# 3. Terminál: Frontend indítása
cd login-app && npm run dev

# Böngésző: Nyisd meg http://localhost:5173
```

## Jelenlegi Állapot

- **MySQL adatbázis**: `kolcsonzes`
- **Backend port**: `8080`
- **Frontend port**: `5173`
- **Jelszó titkosítás**: BCrypt
- **CORS engedélyezve**: Frontend és Backend között

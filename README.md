# Java GUI Login System with Database Connectivity

A Java Swing application that provides a user login page with full database connectivity using SQLite (embedded – no separate server required).

---

## Features

- **Swing GUI** – clean login form with username and password fields
- **SQLite database** – credentials stored in a local `login_system.db` file
- **Credential validation** – parameterised queries prevent SQL injection
- **Success / failure dialogs** – `JOptionPane` messages and an inline status label
- **Default accounts** seeded on first launch

---

## Default Credentials

| Username | Password  |
|----------|-----------|
| admin    | admin123  |
| user1    | pass123   |

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java JDK | 11 or higher |
| Apache Maven | 3.6 or higher |

---

## Build

```bash
mvn clean package
```

This produces two JARs in `target/`:

| File | Description |
|------|-------------|
| `java-gui-login-1.0.0.jar` | Application classes only |
| `java-gui-login-1.0.0-jar-with-dependencies.jar` | Fat JAR – includes SQLite JDBC driver |

---

## Run

```bash
java -jar target/java-gui-login-1.0.0-jar-with-dependencies.jar
```

A `login_system.db` SQLite file is created in the working directory on first run.

---

## Project Structure

```
├── pom.xml
└── src/main/java/com/login/
    ├── Main.java            # Entry point – initialises DB and launches GUI
    ├── DatabaseHelper.java  # SQLite connection, schema creation, validation
    └── LoginFrame.java      # Swing login window
```

---

## Assignment

**Title:** Design and Implementation of a Java-Based GUI Login System with Database Connectivity

**Aim:** Create a Java-based GUI application that allows users to enter their username and password, validate the credentials against a connected database, and display appropriate success or failure messages.
package com.login;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.Base64;

/**
 * Handles all database operations: connection management, schema creation,
 * seeding of default users, and credential validation.
 *
 * Uses SQLite as an embedded database so no external server is needed.
 * The database file (login_system.db) is created in the working directory
 * on first run.
 *
 * <p>Passwords are <em>never</em> stored in plain text.  They are hashed
 * with PBKDF2-HMAC-SHA256 (65 536 iterations, 256-bit output) and stored
 * as {@code <base64-salt>:<base64-hash>} strings.
 */
public class DatabaseHelper {

    private static final String DB_URL        = "jdbc:sqlite:login_system.db";
    private static final String HASH_ALGO     = "PBKDF2WithHmacSHA256";
    private static final int    ITERATIONS    = 65_536;
    private static final int    KEY_LENGTH    = 256; // bits
    private static final int    SALT_LENGTH   = 16;  // bytes

    // ── connection ─────────────────────────────────────────────────────────────

    /**
     * Opens and returns a connection to the SQLite database.
     * The database file is created automatically if it does not exist.
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL);
    }

    // ── schema / seeding ───────────────────────────────────────────────────────

    /**
     * Creates the {@code users} table if it does not already exist and
     * inserts default accounts so the application is usable on first launch.
     *
     * <p>Default credentials:
     * <ul>
     *   <li>Username: {@code admin}  – Password: {@code admin123}</li>
     *   <li>Username: {@code user1}  – Password: {@code pass123}</li>
     * </ul>
     *
     * <p>Passwords are stored as PBKDF2-hashed values, not plain text.
     */
    public static void initializeDatabase() {
        String createTable = "CREATE TABLE IF NOT EXISTS users ("
                + "id       INTEGER PRIMARY KEY AUTOINCREMENT,"
                + "username TEXT    NOT NULL UNIQUE,"
                + "password TEXT    NOT NULL"
                + ");";

        // INSERT OR IGNORE prevents duplicate-key errors on repeated launches.
        String insertUser = "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?);";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             PreparedStatement pstmt = conn.prepareStatement(insertUser)) {

            stmt.execute(createTable);

            insertSeedUser(pstmt, "admin", "admin123".toCharArray());
            insertSeedUser(pstmt, "user1", "pass123".toCharArray());

        } catch (SQLException e) {
            System.err.println("Database initialisation error: " + e.getMessage());
        }
    }

    private static void insertSeedUser(PreparedStatement pstmt, String username, char[] password)
            throws SQLException {
        try {
            pstmt.setString(1, username);
            pstmt.setString(2, hashPassword(password));
            pstmt.executeUpdate();
        } finally {
            Arrays.fill(password, '\0');
        }
    }

    // ── validation ─────────────────────────────────────────────────────────────

    /**
     * Validates the supplied credentials against the {@code users} table.
     *
     * <p>The supplied {@code password} char array is zeroed out before this
     * method returns, regardless of outcome.
     *
     * @param username the entered username (case-sensitive)
     * @param password the entered password as a char array (will be zeroed)
     * @return {@code true} if the credentials match, {@code false} otherwise
     */
    public static boolean validateCredentials(String username, char[] password) {
        String query = "SELECT password FROM users WHERE username = ? LIMIT 1;";

        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {

            pstmt.setString(1, username);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (!rs.next()) {
                    return false;
                }
                String storedHash = rs.getString("password");
                return verifyPassword(password, storedHash);
            }

        } catch (SQLException e) {
            System.err.println("Credential validation error: " + e.getMessage());
            return false;
        } finally {
            Arrays.fill(password, '\0');
        }
    }

    // ── hashing helpers ────────────────────────────────────────────────────────

    /**
     * Hashes a password with a freshly generated random salt using
     * PBKDF2-HMAC-SHA256.
     *
     * @param password plain-text password as a char array
     * @return {@code "<base64-salt>:<base64-hash>"} string ready for storage
     */
    static String hashPassword(char[] password) {
        try {
            byte[] salt = new byte[SALT_LENGTH];
            new SecureRandom().nextBytes(salt);
            byte[] hash = pbkdf2(password, salt);
            return Base64.getEncoder().encodeToString(salt)
                    + ":" + Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("Password hashing failed", e);
        }
    }

    /**
     * Verifies a plain-text password against a stored
     * {@code "<base64-salt>:<base64-hash>"} value using a constant-time
     * comparison to resist timing attacks.
     *
     * @param password   plain-text password as a char array (not modified)
     * @param storedHash value previously produced by {@link #hashPassword}
     * @return {@code true} if the password matches the stored hash
     */
    static boolean verifyPassword(char[] password, String storedHash) {
        try {
            String[] parts = storedHash.split(":", 2);
            if (parts.length != 2) {
                return false;
            }
            byte[] salt         = Base64.getDecoder().decode(parts[0]);
            byte[] expectedHash = Base64.getDecoder().decode(parts[1]);
            byte[] actualHash   = pbkdf2(password, salt);
            return slowEquals(expectedHash, actualHash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException | IllegalArgumentException e) {
            System.err.println("Password verification error: " + e.getMessage());
            return false;
        }
    }

    private static byte[] pbkdf2(char[] password, byte[] salt)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_LENGTH);
        try {
            return SecretKeyFactory.getInstance(HASH_ALGO).generateSecret(spec).getEncoded();
        } finally {
            spec.clearPassword();
        }
    }

    /** Constant-time byte-array comparison to prevent timing-based attacks. */
    private static boolean slowEquals(byte[] a, byte[] b) {
        return MessageDigest.isEqual(a, b);
    }
}

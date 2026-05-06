package com.login;

import javax.swing.SwingUtilities;
import javax.swing.UIManager;

/**
 * Application entry point.
 *
 * <ol>
 *   <li>Initialises the SQLite database (creates the schema and seeds default
 *       users if not already present).</li>
 *   <li>Applies the system look-and-feel for a native appearance.</li>
 *   <li>Creates and shows the {@link LoginFrame} on the Swing event-dispatch
 *       thread.</li>
 * </ol>
 *
 * <p><strong>Default credentials (seeded on first run):</strong>
 * <ul>
 *   <li>Username: {@code admin}  &ndash; Password: {@code admin123}</li>
 *   <li>Username: {@code user1}  &ndash; Password: {@code pass123}</li>
 * </ul>
 */
public class Main {

    public static void main(String[] args) {
        // Initialise the database before opening the UI
        DatabaseHelper.initializeDatabase();

        // Set the native system look-and-feel
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            System.err.println("Could not apply system look-and-feel: " + e.getMessage());
        }

        // Launch the login window on the Event Dispatch Thread
        SwingUtilities.invokeLater(() -> {
            LoginFrame frame = new LoginFrame();
            frame.setVisible(true);
        });
    }
}

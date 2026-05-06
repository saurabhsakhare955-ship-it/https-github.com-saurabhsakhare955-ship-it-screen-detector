package com.login;

import javax.swing.BorderFactory;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import java.awt.Color;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;
import java.util.Arrays;

/**
 * Main login window built with Java Swing.
 *
 * <p>Layout overview:
 * <pre>
 *  ┌──────────────────────────────────┐
 *  │         🔐 Login System          │  (title label)
 *  │                                  │
 *  │  Username: [__________________]  │
 *  │  Password: [__________________]  │
 *  │                                  │
 *  │         [ Login ]  [ Clear ]     │
 *  │                                  │
 *  │  statusLabel (success / error)   │
 *  └──────────────────────────────────┘
 * </pre>
 */
public class LoginFrame extends JFrame {

    // ── colours ──────────────────────────────────────────────────────────────
    private static final Color BG_COLOR      = new Color(245, 247, 250);
    private static final Color PANEL_COLOR   = Color.WHITE;
    private static final Color ACCENT_COLOR  = new Color(52, 120, 246);
    private static final Color SUCCESS_COLOR = new Color(40, 167, 69);
    private static final Color ERROR_COLOR   = new Color(220, 53, 69);
    private static final Color LABEL_COLOR   = new Color(55, 65, 81);

    // ── fonts ─────────────────────────────────────────────────────────────────
    private static final Font TITLE_FONT  = new Font("Segoe UI", Font.BOLD, 22);
    private static final Font LABEL_FONT  = new Font("Segoe UI", Font.PLAIN, 14);
    private static final Font INPUT_FONT  = new Font("Segoe UI", Font.PLAIN, 13);
    private static final Font BUTTON_FONT = new Font("Segoe UI", Font.BOLD, 13);
    private static final Font STATUS_FONT = new Font("Segoe UI", Font.ITALIC, 12);

    // ── widgets ───────────────────────────────────────────────────────────────
    private final JTextField     usernameField;
    private final JPasswordField passwordField;
    private final JLabel         statusLabel;

    // ── constructor ───────────────────────────────────────────────────────────

    public LoginFrame() {
        setTitle("Login System");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setResizable(false);

        // ── outer panel (light grey background) ──────────────────────────────
        JPanel outer = new JPanel(new GridBagLayout());
        outer.setBackground(BG_COLOR);
        outer.setBorder(BorderFactory.createEmptyBorder(30, 40, 30, 40));
        setContentPane(outer);

        // ── card panel (white, rounded shadow effect via border) ─────────────
        JPanel card = new JPanel(new GridBagLayout());
        card.setBackground(PANEL_COLOR);
        card.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(210, 215, 225), 1, true),
                BorderFactory.createEmptyBorder(30, 40, 30, 40)));
        card.setPreferredSize(new Dimension(380, 320));

        GridBagConstraints c = new GridBagConstraints();
        c.insets = new Insets(6, 6, 6, 6);
        c.fill   = GridBagConstraints.HORIZONTAL;

        // ── title ─────────────────────────────────────────────────────────────
        JLabel title = new JLabel("🔐  Login System", SwingConstants.CENTER);
        title.setFont(TITLE_FONT);
        title.setForeground(ACCENT_COLOR);
        c.gridx = 0; c.gridy = 0; c.gridwidth = 2; c.weightx = 1.0;
        c.insets = new Insets(0, 6, 20, 6);
        card.add(title, c);

        // ── username row ──────────────────────────────────────────────────────
        c.gridwidth = 1; c.weightx = 0; c.insets = new Insets(6, 6, 6, 6);
        c.gridx = 0; c.gridy = 1;
        card.add(makeLabel("Username:"), c);

        usernameField = new JTextField(18);
        styleInput(usernameField);
        c.gridx = 1; c.weightx = 1.0;
        card.add(usernameField, c);

        // ── password row ──────────────────────────────────────────────────────
        c.weightx = 0;
        c.gridx = 0; c.gridy = 2;
        card.add(makeLabel("Password:"), c);

        passwordField = new JPasswordField(18);
        styleInput(passwordField);
        c.gridx = 1; c.weightx = 1.0;
        card.add(passwordField, c);

        // ── button row ────────────────────────────────────────────────────────
        JPanel buttonRow = new JPanel(new FlowLayout(FlowLayout.CENTER, 12, 0));
        buttonRow.setOpaque(false);

        JButton loginBtn = makeButton("Login", ACCENT_COLOR, Color.WHITE);
        JButton clearBtn = makeButton("Clear", new Color(108, 117, 125), Color.WHITE);

        loginBtn.addActionListener(this::onLogin);
        clearBtn.addActionListener(e -> clearFields());

        // Allow pressing Enter in the password field to trigger login
        passwordField.addActionListener(this::onLogin);

        buttonRow.add(loginBtn);
        buttonRow.add(clearBtn);

        c.gridx = 0; c.gridy = 3; c.gridwidth = 2; c.weightx = 1.0;
        c.insets = new Insets(18, 6, 6, 6);
        card.add(buttonRow, c);

        // ── status label ─────────────────────────────────────────────────────
        statusLabel = new JLabel(" ", SwingConstants.CENTER);
        statusLabel.setFont(STATUS_FONT);
        c.gridy = 4; c.insets = new Insets(8, 6, 0, 6);
        card.add(statusLabel, c);

        // ── add card to outer ─────────────────────────────────────────────────
        outer.add(card);

        pack();
        setLocationRelativeTo(null); // centre on screen
    }

    // ── event handlers ────────────────────────────────────────────────────────

    /**
     * Called when the Login button is pressed or Enter is pressed in the
     * password field.  Validates basic non-empty input, then delegates to
     * {@link DatabaseHelper#validateCredentials}.
     */
    private void onLogin(ActionEvent e) {
        String username = usernameField.getText().trim();
        // Use char[] to avoid creating an immutable String in memory.
        // validateCredentials zeroes the array before returning.
        char[] password = passwordField.getPassword();

        if (username.isEmpty() || password.length == 0) {
            Arrays.fill(password, '\0');
            showStatus("⚠  Please enter both username and password.", ERROR_COLOR);
            return;
        }

        boolean valid = DatabaseHelper.validateCredentials(username, password);

        if (valid) {
            showStatus("✔  Login successful! Welcome, " + username + ".", SUCCESS_COLOR);
            JOptionPane.showMessageDialog(
                    this,
                    "Welcome, " + username + "!\nYou have logged in successfully.",
                    "Login Successful",
                    JOptionPane.INFORMATION_MESSAGE);
            clearFields();
        } else {
            showStatus("✖  Invalid username or password.", ERROR_COLOR);
            JOptionPane.showMessageDialog(
                    this,
                    "Invalid username or password.\nPlease try again.",
                    "Login Failed",
                    JOptionPane.ERROR_MESSAGE);
            passwordField.setText("");
            passwordField.requestFocus();
        }
    }

    /** Clears both input fields and resets the status label. */
    private void clearFields() {
        usernameField.setText("");
        passwordField.setText("");
        statusLabel.setText(" ");
        usernameField.requestFocus();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void showStatus(String message, Color color) {
        statusLabel.setText(message);
        statusLabel.setForeground(color);
    }

    private static JLabel makeLabel(String text) {
        JLabel lbl = new JLabel(text);
        lbl.setFont(LABEL_FONT);
        lbl.setForeground(LABEL_COLOR);
        return lbl;
    }

    private static void styleInput(JTextField field) {
        field.setFont(INPUT_FONT);
        field.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(200, 205, 215), 1, true),
                BorderFactory.createEmptyBorder(5, 8, 5, 8)));
    }

    private static JButton makeButton(String text, Color bg, Color fg) {
        JButton btn = new JButton(text);
        btn.setFont(BUTTON_FONT);
        btn.setBackground(bg);
        btn.setForeground(fg);
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setOpaque(true);
        btn.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        btn.setPreferredSize(new Dimension(90, 34));
        return btn;
    }
}

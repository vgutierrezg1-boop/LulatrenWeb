package conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexion {
    // Se agregó allowPublicKeyRetrieval=true para evitar bloqueos por seguridad en MySQL 8+
    private static final String URL = "jdbc:mysql://localhost:3306/lulatren_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String USER = "root";
   private static final String PASS =
        System.getenv("LULATREN_DB_PASSWORD");
    public static Connection getConexion() {
        Connection con = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            con = DriverManager.getConnection(URL, USER, PASS);
            System.out.println("Conexión exitosa a lulatren_db");
        } catch (ClassNotFoundException | SQLException e) {
            System.err.println("Error al conectar con MySQL: " + e.getMessage());
        }
        return con;
    }
}
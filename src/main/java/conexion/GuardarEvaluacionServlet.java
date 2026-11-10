
package conexion;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/GuardarEvaluacionServlet")
public class GuardarEvaluacionServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        try (PrintWriter out = response.getWriter()) {

            try {
                // Obtener datos enviados desde JavaScript
                int idReserva = Integer.parseInt(
                        request.getParameter("id_reserva"));

                String usabilidad = request.getParameter("usabilidad_p1");
                String motivo = request.getParameter("motivo_p2");
                String aspectos = request.getParameter("aspectos_p3");

                int nps = Integer.parseInt(
                        request.getParameter("nps_p4"));

                int frecuencia = Integer.parseInt(
                        request.getParameter("frecuencia_p5"));

                String comentarios = request.getParameter("comentarios_p6");

                // Consulta para guardar la evaluación
                String sql = "INSERT INTO evaluaciones "
                        + "(id_reserva, usabilidad_p1, motivo_p2, "
                        + "aspectos_p3, nps_p4, frecuencia_p5, "
                        + "comentarios_p6) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?)";

                // Conectar a MySQL
                try (Connection con = Conexion.getConexion()) {

                    if (con == null) {
                        throw new SQLException(
                                "No se pudo conectar a MySQL.");
                    }

                    try (PreparedStatement ps =
                            con.prepareStatement(sql)) {

                        ps.setInt(1, idReserva);
                        ps.setString(2, usabilidad);
                        ps.setString(3, motivo);
                        ps.setString(4, aspectos);
                        ps.setInt(5, nps);
                        ps.setInt(6, frecuencia);
                        ps.setString(7, comentarios);

                        ps.executeUpdate();
                    }
                }

                // Respuesta exitosa
                out.print("{\"status\":\"success\","
                        + "\"message\":\"Evaluacion guardada correctamente\"}");

            } catch (Exception e) {

                e.printStackTrace();

                String mensaje = e.getMessage() != null
                        ? e.getMessage()
                        : "Error desconocido";

                mensaje = mensaje.replace("\\", "\\\\")
                        .replace("\"", "'")
                        .replace("\n", " ")
                        .replace("\r", " ");

                out.print("{\"status\":\"error\","
                        + "\"message\":\"" + mensaje + "\"}");
            }
        }
    }
}

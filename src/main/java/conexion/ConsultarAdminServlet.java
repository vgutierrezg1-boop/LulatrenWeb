
package conexion;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/ConsultarAdminServlet")
public class ConsultarAdminServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request,
            HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json;charset=UTF-8");

        try (PrintWriter out = response.getWriter()) {

            StringBuilder json = new StringBuilder();
            json.append("{\"reservas\":[");

            try (Connection con = Conexion.getConexion()) {

                if (con == null) {
                    throw new SQLException("No se pudo conectar a MySQL");
                }

                String sql = "SELECT r.id_reserva, "
                        + "r.codigo_ticket, r.nombre_titular, "
                        + "r.dpi_pasaporte, r.ruta, r.tipo_servicio, "
                        + "r.monto_total, r.fecha_viaje, "
                        + "e.usabilidad_p1, e.motivo_p2, "
                        + "e.aspectos_p3, e.nps_p4, "
                        + "e.frecuencia_p5, e.comentarios_p6, "
                        + "(SELECT COUNT(*) FROM pasajeros p "
                        + "WHERE p.id_reserva = r.id_reserva) AS num_ninos "
                        + "FROM reservas r "
                        + "LEFT JOIN evaluaciones e "
                        + "ON r.id_reserva = e.id_reserva "
                        + "ORDER BY r.id_reserva DESC";

                try (PreparedStatement ps = con.prepareStatement(sql);
                        ResultSet rs = ps.executeQuery()) {

                    boolean primero = true;

                    while (rs.next()) {

                        if (!primero) {
                            json.append(",");
                        }
                        primero = false;

                        int numNinos = rs.getInt("num_ninos");

                        json.append("{");
                        json.append("\"codigoTicket\":")
                                .append(texto(rs.getString("codigo_ticket"))).append(",");
                        json.append("\"nombre\":")
                                .append(texto(rs.getString("nombre_titular"))).append(",");
                        json.append("\"dpi\":")
                                .append(texto(rs.getString("dpi_pasaporte"))).append(",");
                        json.append("\"ruta\":")
                                .append(texto(rs.getString("ruta"))).append(",");
                        json.append("\"tipoServicio\":")
                                .append(texto(rs.getString("tipo_servicio"))).append(",");
                        json.append("\"montoTotal\":")
                                .append(rs.getDouble("monto_total")).append(",");
                        json.append("\"fechaEmision\":")
                                .append(texto(rs.getString("fecha_viaje"))).append(",");
                        json.append("\"numNinos\":")
                                .append(numNinos).append(",");
                        json.append("\"encuesta\":{");
                        json.append("\"usabilidad\":")
                                .append(texto(rs.getString("usabilidad_p1"))).append(",");
                        json.append("\"motivo\":")
                                .append(texto(rs.getString("motivo_p2"))).append(",");
                        json.append("\"aspectos\":")
                                .append(texto(rs.getString("aspectos_p3"))).append(",");
                        json.append("\"nps\":")
                                .append(rs.getInt("nps_p4")).append(",");
                        json.append("\"frecuencia\":")
                                .append(rs.getInt("frecuencia_p5")).append(",");
                        json.append("\"comentarios\":")
                                .append(texto(rs.getString("comentarios_p6")));
                        json.append("}");
                        json.append("}");
                    }
                }

                json.append("]}");
                out.print(json.toString());

            } catch (Exception e) {
                e.printStackTrace();
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\"status\":\"error\",\"message\":\"Error al consultar los datos\"}");
            }
        }
    }

    private String texto(String valor) {

        if (valor == null) {
            return "\"\"";
        }

        return "\"" + valor
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t") + "\"";
    }
}


package conexion;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/GuardarReservaServlet")
public class GuardarReservaServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        PrintWriter out = response.getWriter();
        Connection con = null;

        try {
            // Conectar a MySQL
            con = Conexion.getConexion();

            if (con == null) {
                out.print("{\"status\":\"error\",\"message\":\"No se pudo conectar a MySQL.\"}");
                return;
            }

            con.setAutoCommit(false);

            // Obtener datos de la reserva
            String codigoTicket = obtenerParam(request, "codigo_ticket", "TCK-" + System.currentTimeMillis());
            String nombreTitular = obtenerParam(request, "nombre_titular", "Pasajero Anonimo");
            String dpiPasaporte = obtenerParam(request, "dpi_pasaporte", "CF");
            String email = obtenerParam(request, "email", "correo@lulatren.com");
            String telefono = obtenerParam(request, "telefono", "00000000");
            String ruta = obtenerParam(request, "ruta", "Ruta General");
            String tipoServicio = obtenerParam(request, "tipo_servicio", "Estándar");
            String fechaViaje = obtenerParam(request, "fecha_viaje", "2026-11-08");

            // Obtener monto total
            String montoStr = request.getParameter("monto_total");
            double montoTotal = 0.0;

            if (montoStr != null && !montoStr.trim().isEmpty()) {
                montoStr = montoStr.replaceAll("[^0-9.]", "").trim();

                if (!montoStr.isEmpty()) {
                    montoTotal = Double.parseDouble(montoStr);
                }
            }

            // Guardar reserva principal
            String sqlReserva =
                    "INSERT INTO reservas "
                    + "(codigo_ticket, nombre_titular, dpi_pasaporte, "
                    + "email, telefono, ruta, tipo_servicio, "
                    + "monto_total, fecha_viaje) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            int idReserva;

            try (PreparedStatement psReserva = con.prepareStatement(
                    sqlReserva, Statement.RETURN_GENERATED_KEYS)) {

                psReserva.setString(1, codigoTicket);
                psReserva.setString(2, nombreTitular);
                psReserva.setString(3, dpiPasaporte);
                psReserva.setString(4, email);
                psReserva.setString(5, telefono);
                psReserva.setString(6, ruta);
                psReserva.setString(7, tipoServicio);
                psReserva.setDouble(8, montoTotal);
                psReserva.setString(9, fechaViaje);

                psReserva.executeUpdate();

                try (ResultSet rsKeys = psReserva.getGeneratedKeys()) {
                    if (!rsKeys.next()) {
                        throw new SQLException("No se pudo obtener el ID de la reserva.");
                    }

                    idReserva = rsKeys.getInt(1);
                }
            }

            // Guardar niños o pasajeros adicionales
            String numPasajerosStr = request.getParameter("total_pasajeros");

            if (numPasajerosStr != null && !numPasajerosStr.trim().isEmpty()) {

                int totalPasajeros = Integer.parseInt(numPasajerosStr);

                if (totalPasajeros < 0 || totalPasajeros > 20) {
                    throw new IllegalArgumentException("Cantidad de pasajeros no válida.");
                }

                String sqlPasajero =
                        "INSERT INTO pasajeros "
                        + "(id_reserva, tipo, nombre_completo, "
                        + "cui_dpi, fecha_nacimiento) "
                        + "VALUES (?, ?, ?, ?, ?)";

                try (PreparedStatement psPasajero =
                        con.prepareStatement(sqlPasajero)) {

                    for (int i = 0; i < totalPasajeros; i++) {

                        String tipo = request.getParameter(
                                "pasajero_" + i + "_tipo");

                        String nombre = request.getParameter(
                                "pasajero_" + i + "_nombre");

                        String cui = request.getParameter(
                                "pasajero_" + i + "_cui");

                        String nacimiento = request.getParameter(
                                "pasajero_" + i + "_nacimiento");

                        if (nombre == null || nombre.trim().isEmpty()) {
                            throw new IllegalArgumentException(
                                    "Falta el nombre del pasajero " + (i + 1));
                        }

                        psPasajero.setInt(1, idReserva);

                        psPasajero.setString(2,
                                "Niño".equalsIgnoreCase(tipo)
                                ? "Niño" : "Adulto");

                        psPasajero.setString(3, nombre.trim());

                        psPasajero.setString(4,
                                cui != null ? cui.trim() : "");

                        if (nacimiento != null
                                && !nacimiento.trim().isEmpty()) {

                            psPasajero.setDate(5,
                                    java.sql.Date.valueOf(nacimiento));

                        } else {
                            psPasajero.setNull(5, java.sql.Types.DATE);
                        }

                        psPasajero.executeUpdate();
                    }
                }
            }

            // Confirmar todos los datos
            con.commit();

            out.print("{\"status\":\"success\","
                    + "\"message\":\"Reserva guardada correctamente\","
                    + "\"id_reserva\":" + idReserva + "}");

        } catch (Exception e) {

            // Deshacer cambios si ocurre un error
            if (con != null) {
                try {
                    con.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }

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

        } finally {

            if (con != null) {
                try {
                    con.close();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
        }
    }

    private String obtenerParam(
            HttpServletRequest req,
            String param,
            String defecto) {

        String valor = req.getParameter(param);

        return (valor != null && !valor.trim().isEmpty())
                ? valor.trim()
                : defecto;
    }
}

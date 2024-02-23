"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservacionesController = void 0;
const database_1 = __importDefault(require("../database")); //acceso a la base de datos
class ReservacionesController {
    rellenar_datos_tabla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.params;
            console.log(req.body);
            var consulta = `SELECT Cuenta.NombreCompleto, Reservaciones.HoraLlegada, Cuenta.NumeroTelefono, Reservaciones.EstadoReserva 
                            FROM Cuenta JOIN Reservaciones ON Cuenta.IDCuenta = Reservaciones.IDCuenta 
                                WHERE Reservaciones.FechaEntrada = '${fechas.FechaUno}'`;
            const respuesta = yield database_1.default.query(consulta);
            res.json(respuesta);
        });
    }
    mostrar_habitaciones_disponibles_rango_fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.body;
            var consulta = `SELECT DISTINCT h.IDHabitacion, h.TipoHabitacion, h.MaxHuespedes, h.TotalTipoHabitacion, h.Costo
                        FROM habitaciones h
                            JOIN disponibilidadporfecha d ON h.IDHabitacion = d.IDTipoHabitacion
                            WHERE d.Fecha BETWEEN '${fechas.FechaUno}' AND '${fechas.FechaDos}'
                                AND d.TotalHabitacionesDisponibles > 0
                                AND h.IDHabitacion NOT IN (
                                    SELECT r.IDHabitacion
                                        FROM reservaciones re
                                        JOIN detallesreservacion r ON re.IDReserva = r.IDReservacion
                                        WHERE (re.FechaEntrada <= '${fechas.FechaDos}' AND re.FechaSalida >= '${fechas.FechaUno}')
                                            OR (re.FechaEntrada < '${fechas.FechaUno}' AND re.FechaSalida >= '${fechas.FechaUno}')
        )`;
            const respuesta = yield database_1.default.query(consulta);
            res.json(respuesta);
        });
    }
    mostrar_habitaciones_disponibles_una_fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.body;
            var consulta = `SELECT h.IDHabitacion, h.TipoHabitacion, h.MaxHuespedes, h.TotalTipoHabitacion, h.Costo
                        FROM habitaciones h
                        JOIN disponibilidadporfecha d ON h.IDHabitacion = d.IDTipoHabitacion
                        WHERE d.Fecha BETWEEN '${fechas.FechaUno}' AND '${fechas.FechaDos}'
                            AND d.TotalHabitacionesDisponibles > 0
                            AND h.IDHabitacion NOT IN (
                                SELECT r.IDHabitacion
                                FROM reservaciones re
                                JOIN detallesreservacion r ON re.IDReserva = r.IDReservacion
                                    WHERE (re.FechaEntrada < '${fechas.FechaUno}' AND re.FechaSalida > '${fechas.FechaDos}'))`;
            const respuesta = yield database_1.default.query(consulta);
            res.json(respuesta);
        });
    }
    mostrar_habitaciones_num_disponibilidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.body;
            console.log(fechas);
            var consulta = `WITH HabitacionesDisponibles AS (
            SELECT 
                h.IDHabitacion, 
                h.TipoHabitacion, 
                h.MaxHuespedes, 
                h.TotalTipoHabitacion, 
                h.Costo,
                d.Fecha,
                d.TotalHabitacionesDisponibles
            FROM 
                habitaciones h
            JOIN 
                disponibilidadporfecha d ON h.IDHabitacion = d.IDTipoHabitacion
            WHERE 
                d.Fecha BETWEEN '${fechas.FechaUno}' AND '${fechas.FechaDos}'
                AND d.TotalHabitacionesDisponibles > 0
        ),
        HabitacionesConDisponibilidadCero AS (
            SELECT 
                h.IDHabitacion
            FROM 
                HabitacionesDisponibles h
            WHERE 
                NOT EXISTS (
                    SELECT 
                        1
                    FROM 
                        disponibilidadporfecha d
                    WHERE 
                        d.IDTipoHabitacion = h.IDHabitacion
                        AND d.Fecha BETWEEN '${fechas.FechaUno}' AND '${fechas.FechaDos}'
                        AND d.TotalHabitacionesDisponibles > 0
                )
        )
        SELECT 
            IDHabitacion,
            TipoHabitacion,
            MaxHuespedes,
            TotalTipoHabitacion,
            Costo,
            MinDisponibles
        FROM 
            (
                SELECT 
                    h.IDHabitacion, 
                    h.TipoHabitacion, 
                    h.MaxHuespedes, 
                    h.TotalTipoHabitacion, 
                    h.Costo,
                    0 AS MinDisponibles
                FROM 
                    HabitacionesDisponibles h
                WHERE 
                    h.IDHabitacion NOT IN (SELECT IDHabitacion FROM HabitacionesConDisponibilidadCero)
                UNION
                SELECT 
                    h.IDHabitacion, 
                    h.TipoHabitacion, 
                    h.MaxHuespedes, 
                    h.TotalTipoHabitacion, 
                    h.Costo,
                    MIN(d.TotalHabitacionesDisponibles) AS MinDisponibles
                FROM 
                    HabitacionesDisponibles h
                JOIN 
                    disponibilidadporfecha d ON h.IDHabitacion = d.IDTipoHabitacion
                WHERE 
                    d.Fecha BETWEEN  '${fechas.FechaUno}' AND '${fechas.FechaDos}'
                GROUP BY 
                    h.IDHabitacion, 
                    h.TipoHabitacion, 
                    h.MaxHuespedes, 
                    h.TotalTipoHabitacion, 
                    h.Costo
                HAVING 
                    MIN(d.TotalHabitacionesDisponibles) > 0
            ) AS Resultado
        WHERE 
            MinDisponibles > 0
        ORDER BY 
            IDHabitacion;`;
            const respuesta = yield database_1.default.query(consulta);
            res.json(respuesta);
        });
    }
    mostrar_reservaciones_por_fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fecha } = req.params;
            const respuesta = yield database_1.default.query('SELECT * FROM reservaciones WHERE FechaEntrada = ?', [fecha]);
            res.json(respuesta);
        });
    }
    mostrar_reservaciones_por_rango_fecha(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechas = req.body;
            var consulta = `SELECT * FROM reservaciones WHERE FechaEntrada >= '${fechas.FechaUno}' AND FechaEntrada <= '${fechas.FechaDos}'`;
            const resp = yield database_1.default.query(consulta);
            res.json(resp);
        });
    }
    hacer_reservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const datos_reserva = req.body;
                // Insertar reserva
                const insert_reserva = `INSERT INTO reservaciones (IDCuenta, FechaEntrada, FechaSalida, HoraLlegada) VALUES 
                ('${datos_reserva.IDCuenta}', '${datos_reserva.FechaEntrada}', 
                    '${datos_reserva.FechaSalida}', '${datos_reserva.HoraLlegada}')`;
                const consulta = yield database_1.default.query(insert_reserva);
                const idReservacion = consulta.insertId;
                const insert_detallesReser = `INSERT INTO DetallesReservacion(IDReservacion, IDHabitacion, CantidadHabitaciones) 
                VALUES `;
                const consulta2 = yield database_1.default.query(insert_detallesReser);
                const update = `UPDATE disponibilidadporfecha SET TotalHabitacionesDisponibles - '${datos_reserva.TotalHabitaciones}' `;
                const consulta3 = yield database_1.default.query(update);
                res.json({
                    reserva: consulta,
                    detallesReserva: consulta2,
                    disponibilidadActualizada: consulta3
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ mensaje: 'Error interno del servidor' });
            }
        });
    }
    modificar_reservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            console.log(id);
            const resp = yield database_1.default.query("UPDATE reservaciones set ? WHERE IDReserva = ?", [req.body, id]);
            res.json(resp);
        });
    }
    cancelar_reservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const resp = yield database_1.default.query(`DELETE FROM reservaciones WHERE IDReserva = ${id}`);
            const resp2 = yield database_1.default.query(`DELETE FROM detallesreservacion WHERE IDReservacion = ${id}`);
            res.json(resp);
        });
    }
    modificar_estado_reserva(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const resp = yield database_1.default.query('UPDATE reservaciones SET ? WHERE IDReserva = ?', [req.body, id]);
            console.log(req.body);
            res.json(resp);
        });
    }
    modificar_estado_pago(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const resp = yield database_1.default.query('UPDATE reservaciones SET ? WHERE IDReserva = ?', [req.body, id]);
            console.log(req.body);
            res.json(resp);
        });
    }
    actualizar_despues_de_cancelacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const datos_reserva = req.body;
            console.log('LLEGADA A ULTIMA FUNCION CON:', datos_reserva);
            const update_disponibilidad = `UPDATE disponibilidadporfecha 
        SET TotalHabitacionesDisponibles = TotalHabitacionesDisponibles + ? 
        WHERE Fecha >= ? AND Fecha < ? AND IDTipoHabitacion = ?`;
            const updateValues = [datos_reserva.CantidadHabitaciones, datos_reserva.fechaInicio, datos_reserva.fechaFin, datos_reserva.IDHabitacion];
            yield database_1.default.query(update_disponibilidad, updateValues);
        });
    }
    hacer_reservacion_2(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const datos_reserva = req.body;
                console.log(datos_reserva);
                console.log(datos_reserva.detallesReserva);
                // Insertar reserva
                const insert_reserva = `INSERT INTO reservaciones (IDCuenta, FechaEntrada, FechaSalida, HoraLlegada, CostoTotal) VALUES (?, ?, ?, ?, ?)`;
                const reservaValues = [datos_reserva.IDCuenta, datos_reserva.FechaEntrada, datos_reserva.FechaSalida, datos_reserva.HoraLlegada, datos_reserva.CostoTotal];
                const consulta = yield database_1.default.query(insert_reserva, reservaValues);
                const idReservacion = consulta.insertId;
                // Insertar detalle reserva
                for (const detalle of datos_reserva.detallesReserva) {
                    const insert_detallesReserva = `INSERT INTO DetallesReservacion(IDReservacion, IDHabitacion, CantidadHabitaciones) 
                    VALUES ('${idReservacion}','${detalle.IDHabitacion}','${detalle.CantidadHabitaciones}')`;
                    yield database_1.default.query(insert_detallesReserva);
                }
                // Actualizar disponibilidad por fecha
                const fechaInicio = datos_reserva.FechaEntrada;
                const fechaFin = datos_reserva.FechaSalida;
                const totalHabitaciones = datos_reserva.detallesReserva.reduce((total, detalle) => total + detalle.CantidadHabitaciones, 0);
                const update_disponibilidad = `UPDATE disponibilidadporfecha SET TotalHabitacionesDisponibles = TotalHabitacionesDisponibles - ? WHERE Fecha >= ? AND Fecha < ? AND IDTipoHabitacion = ?`;
                for (const detalle of datos_reserva.detallesReserva) {
                    const updateValues = [detalle.CantidadHabitaciones, fechaInicio, fechaFin, detalle.IDHabitacion];
                    yield database_1.default.query(update_disponibilidad, updateValues);
                }
                res.json({
                    reserva: consulta,
                    mensaje: 'Reserva realizada correctamente'
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ mensaje: 'Error interno del servidor' });
            }
        });
    }
    tabla_reservas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fecha } = req.params;
            const respuesta = yield database_1.default.query('SELECT r.IDCuenta, r.IDReserva, c.NombreCompleto, r.HoraLlegada, DATE_FORMAT(r.FechaEntrada, \'%d-%m-%Y\') AS FechaEntrada, DATE_FORMAT(r.FechaSalida, \'%d-%m-%Y\') AS FechaSalida, c.NumeroTelefono, r.EstadoReserva, r.EstadoPago FROM  reservaciones r JOIN cuenta c ON r.IDCuenta = c.IDCuenta WHERE ? BETWEEN r.FechaEntrada AND r.FechaSalida AND ? < r.FechaSalida', [fecha, fecha]);
            res.json(respuesta);
        });
    }
    reservas_idUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const respuesta = yield database_1.default.query('SELECT r.IDReserva, r.FechaEntrada, r.FechaSalida, r.HoraLlegada, r.EstadoReserva, r.EstadoPago FROM reservaciones r JOIN cuenta c ON r.IDCuenta = c.IDCuenta WHERE c.IDCuenta = ?;', [id]);
            res.json(respuesta);
        });
    }
    mostrar_reservaciones_por_IDCuenta(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const respuesta = yield database_1.default.query('SELECT r.IDReserva, DATE_FORMAT(r.FechaEntrada, \'%Y-%m-%d\') AS FechaEntrada, DATE_FORMAT(r.FechaSalida, \'%Y-%m-%d\') AS FechaSalida, r.EstadoReserva, r.EstadoPago FROM reservaciones r WHERE IDCuenta = ?', [id]);
            res.json(respuesta);
            console.log(respuesta);
        });
    }
    mostrar_detalles_reservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const respuesta = yield database_1.default.query('SELECT h.TipoHabitacion, dr.CantidadHabitaciones FROM detallesreservacion dr JOIN habitaciones h ON dr.IDHabitacion = h.IDHabitacion WHERE dr.IDReservacion = ? GROUP BY h.TipoHabitacion', [id]);
            res.json(respuesta);
            console.log(respuesta);
        });
    }
    mostrar_detallesReservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const respuesta = yield database_1.default.query('SELECT * FROM detallesreservacion WHERE IDReservacion = ?;', [id]);
            res.json(respuesta);
        });
    }
    porcentaje_ocupacion_mensual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Datosjson = req.body;
            const porcentajes = [];
            for (let i = 1; i <= 12; i++) {
                const respuesta = yield database_1.default.query(`SELECT ROUND(SUM(d.TotalHabitacionesDisponibles) / (DAY(LAST_DAY(r.FechaSalida)) * 20) * 100, 2) AS porcentaje FROM reservaciones r JOIN detallesreservacion dr ON r.IDReserva = dr.IDReservacion JOIN disponibilidadporfecha d ON dr.IDHabitacion = d.IDTipoHabitacion AND r.FechaSalida = d.Fecha WHERE r.EstadoReserva IN ('Check-In', 'Check-Out') AND r.EstadoPago IN ('Pendiente', 'Pagado') AND MONTH(r.FechaSalida) = '${i}' AND YEAR(r.FechaSalida) = '${Datosjson.ano}' GROUP BY MONTH(r.FechaSalida), YEAR(r.FechaSalida)`);
                if (respuesta[0]) {
                    porcentajes.push(respuesta[0].porcentaje);
                }
                else {
                    porcentajes.push(0);
                }
            }
            res.json(porcentajes);
            console.log(porcentajes);
        });
    }
    reporte_ventas_mensual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const Datosjson = req.body;
            const ventas = [];
            for (let i = 1; i <= 12; i++) {
                const respuesta = yield database_1.default.query(`SELECT SUM(h.Costo * dr.CantidadHabitaciones) AS venta FROM reservaciones r JOIN detallesreservacion dr ON r.IDReserva = dr.IDReservacion JOIN habitaciones h ON dr.IDHabitacion = h.IDHabitacion WHERE r.EstadoPago = 'Pagado' AND MONTH(r.FechaSalida) = '${i}' AND YEAR(r.FechaSalida) = '${Datosjson.ano}' GROUP BY MONTH(r.FechaSalida), YEAR(r.FechaSalida);`);
                if (respuesta[0]) {
                    ventas.push(respuesta[0].venta);
                }
                else {
                    ventas.push(0);
                }
            }
            res.json(ventas);
            console.log(ventas);
        });
    }
    setearCostoTotal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const detallesReservacion = req.body;
            let costoTotal = 0;
            console.log(detallesReservacion);
            for (const detalle of detallesReservacion) {
                const query = `SELECT Costo * ${detalle.CantidadHabitaciones} AS CostoTotal 
                       FROM habitaciones 
                       WHERE IDHabitacion = ${detalle.IDHabitacion};`;
                try {
                    const result = yield database_1.default.query(query);
                    costoTotal += result[0].CostoTotal;
                }
                catch (error) {
                    console.error('Error al ejecutar la consulta SQL:', error);
                    res.status(500).json({ error: 'Error interno del servidor' });
                }
            }
            res.json({ costoTotal });
        });
    }
}
exports.reservacionesController = new ReservacionesController();

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
exports.carritoController = exports.CarritoController = void 0;
const database_1 = __importDefault(require("../database"));
class CarritoController {
    agregar_carrito(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const datos_carrito = req.body;
                console.log('datos_carrito', datos_carrito);
                const insert_carrito = `INSERT INTO carritoreservaciones (IDCuenta, FechaEntrada, FechaSalida, CostoTotal) VALUES (?, ?, ?, ?)`;
                const reservaValues = [datos_carrito.IDCuenta, datos_carrito.FechaEntrada, datos_carrito.FechaSalida, datos_carrito.CostoTotal];
                const consulta = yield database_1.default.query(insert_carrito, reservaValues);
                const IDCarrito = consulta.insertId;
                for (const detalle of datos_carrito.DetalleCarrito) {
                    const insert_detallesCarrito = `INSERT INTO detallecarrito(IDCarrito, IDHabitacion, CantidadHabitaciones) 
                    VALUES ('${IDCarrito}','${detalle.IDHabitacion}','${detalle.CantidadHabitaciones}')`;
                    yield database_1.default.query(insert_detallesCarrito);
                }
                res.json({
                    IDCarrito,
                    // reserva: consulta,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ mensaje: 'Error interno del servidor' });
            }
        });
    }
    mostrar_carrito(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const respuesta = yield database_1.default.query(`SELECT DATE_FORMAT(FechaEntrada, \'%Y-%m-%d\') AS FechaEntrada, DATE_FORMAT(FechaSalida, \'%Y-%m-%d\') AS FechaSalida, IDCarrito, IDCuenta, CostoTotal FROM carritoreservaciones WHERE IDCuenta = '${id}'`);
            res.json(respuesta);
        });
    }
    mostrar_detalle_carrito(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const respuesta = yield database_1.default.query(`SELECT IDHabitacion, CantidadHabitaciones FROM detallecarrito WHERE IDCarrito = '${id}'`);
            res.json(respuesta);
        });
    }
    actualizar_carrito(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            console.log(id);
            const resp = yield database_1.default.query("UPDATE carritoceservaciones set ? WHERE IDCarrito = ?", [req.body, id]);
            res.json(resp);
            console.log(resp);
        });
    }
    eliminar_carrito(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const resp = yield database_1.default.query(`DELETE FROM carritoreservaciones WHERE IDCarrito = ?;`, [id]);
            const resp2 = yield database_1.default.query(`DELETE FROM detallecarrito WHERE IDCarrito = ?;`, [id]);
            res.json(resp);
        });
    }
}
exports.CarritoController = CarritoController;
exports.carritoController = new CarritoController();

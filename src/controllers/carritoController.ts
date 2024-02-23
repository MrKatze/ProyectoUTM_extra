import { Request, Response } from 'express';
import pool from '../database';

export class CarritoController {

    public async agregar_carrito(req: Request, res: Response): Promise<void> {
        try {
            const datos_carrito = req.body;
            console.log('datos_carrito', datos_carrito);
            
            const insert_carrito = `INSERT INTO carritoreservaciones (IDCuenta, FechaEntrada, FechaSalida, CostoTotal) VALUES (?, ?, ?, ?)`;
            const reservaValues = [datos_carrito.IDCuenta, datos_carrito.FechaEntrada, datos_carrito.FechaSalida, datos_carrito.CostoTotal];
            const consulta = await pool.query(insert_carrito, reservaValues);
            const IDCarrito = consulta.insertId;

            for (const detalle of datos_carrito.DetalleCarrito) {
                const insert_detallesCarrito = `INSERT INTO detallecarrito(IDCarrito, IDHabitacion, CantidadHabitaciones) 
                    VALUES ('${IDCarrito}','${detalle.IDHabitacion}','${detalle.CantidadHabitaciones}')`;
                await pool.query(insert_detallesCarrito)
            }

            res.json({
                IDCarrito,
                // reserva: consulta,
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error interno del servidor' });
        }
    }

    public async mostrar_carrito(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const respuesta = await pool.query(`SELECT DATE_FORMAT(FechaEntrada, \'%Y-%m-%d\') AS FechaEntrada, DATE_FORMAT(FechaSalida, \'%Y-%m-%d\') AS FechaSalida, IDCarrito, IDCuenta, CostoTotal FROM carritoreservaciones WHERE IDCuenta = '${id}'`);
        res.json(respuesta);
    }

    public async mostrar_detalle_carrito(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const respuesta = await pool.query(`SELECT IDHabitacion, CantidadHabitaciones FROM detallecarrito WHERE IDCarrito = '${id}'`);
        res.json(respuesta);
    }

    public async actualizar_carrito(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        console.log(id);
        const resp = await pool.query("UPDATE carritoceservaciones set ? WHERE IDCarrito = ?", [req.body, id]);
        res.json(resp);
        console.log(resp);
    }

    public async eliminar_carrito(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const resp = await pool.query(`DELETE FROM carritoreservaciones WHERE IDCarrito = ?;`,[id]);
        const resp2 = await pool.query(`DELETE FROM detallecarrito WHERE IDCarrito = ?;`,[id]);
        res.json(resp);
    }
}

export const carritoController = new CarritoController();
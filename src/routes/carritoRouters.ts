import { Router } from 'express';
import { carritoController } from '../controllers/carritoController';
import { validarToken } from '../middleware/auth';

class CarritoRoutes{
    public router: Router = Router();
    constructor(){
        this.config();
    }

    config() : void{
        this.router.put('/actualizar_carrito/:id', carritoController.actualizar_carrito);
        this.router.post('/agregar_carrito/', carritoController.agregar_carrito);
        this.router.delete('/eliminar_carrito/:id', carritoController.eliminar_carrito);
        this.router.get('/mostrar_carrito/:id', carritoController.mostrar_carrito);
        this.router.get('/mostrar_detalle_carrito/:id', carritoController.mostrar_detalle_carrito);
    }
}

const carritoRoutes = new CarritoRoutes();
export default carritoRoutes.router;
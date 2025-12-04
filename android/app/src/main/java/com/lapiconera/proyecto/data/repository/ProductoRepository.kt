package com.lapiconera.proyecto.data.repository

import com.lapiconera.proyecto.data.api.ApiService
import com.lapiconera.proyecto.data.api.RetrofitClient
import com.lapiconera.proyecto.data.api.ProductoUpdateRequest
import com.lapiconera.proyecto.data.api.StockUpdateRequest
import com.lapiconera.proyecto.data.api.DeleteProductoRequest
import com.lapiconera.proyecto.data.model.Producto
import com.lapiconera.proyecto.data.model.ProductoRequest

class ProductoRepository(
    private val api: ApiService = RetrofitClient.api
) {

    /**
     * Obtiene la lista de productos con filtros opcionales
     */
    suspend fun getProductos(
        categoria: String? = null,
        alergenos: List<String>? = null,
        tags: List<String>? = null,
        search: String? = null,
        minPrice: Double? = null,
        maxPrice: Double? = null,
        todos: Boolean? = null
    ): Result<List<Producto>> {
        return try {
            val alergenosString = alergenos?.joinToString(",")
            val tagsString = tags?.joinToString(",")

            val response = api.getProductos(
                categoria = categoria,
                alergenos = alergenosString,
                tags = tagsString,
                search = search,
                minPrice = minPrice,
                maxPrice = maxPrice,
                todos = todos
            )

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error al obtener productos: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Busca un producto por código de barras
     */
    suspend fun buscarPorCodigoBarras(barcode: String): Result<Producto?> {
        return try {
            val response = api.getProductos(todos = true)

            if (response.isSuccessful && response.body() != null) {
                val productos = response.body()!!
                val producto = productos.find { it.barcode == barcode }
                Result.success(producto)
            } else {
                Result.failure(Exception("Error al buscar producto: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Verifica si existe un producto con el mismo nombre
     */
    suspend fun verificarNombreDuplicado(nombre: String, idActual: String? = null): Result<Boolean> {
        return try {
            val response = api.getProductos(search = nombre, todos = true)

            if (response.isSuccessful && response.body() != null) {
                val productos = response.body()!!
                val existe = productos.any {
                    it.name.equals(nombre, ignoreCase = true) && it.id != idActual
                }
                Result.success(existe)
            } else {
                Result.failure(Exception("Error al verificar nombre: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Crea un nuevo producto
     */
    suspend fun crearProducto(producto: ProductoRequest): Result<Producto> {
        return try {
            val verificacion = verificarNombreDuplicado(producto.name)
            if (verificacion.isSuccess && verificacion.getOrNull() == true) {
                return Result.failure(Exception("Ya existe un producto con ese nombre"))
            }

            val response = api.crearProducto(producto)

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error al crear producto: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Actualiza un producto existente
     */
    suspend fun actualizarProducto(id: String, producto: ProductoRequest): Result<Producto> {
        return try {
            android.util.Log.d("ProductoRepository", "Actualizando producto ID=$id con datos: $producto")

            val request = ProductoUpdateRequest(
                id = id,
                name = producto.name,
                description = producto.description,
                price = producto.price,
                image = producto.image,
                category = producto.category,
                allergens = producto.allergens,
                tags = producto.tags,
                stock_quantity = producto.stockQuantity,
                min_stock = producto.minStock,
                is_available = true,
                barcode = producto.barcode
            )

            android.util.Log.d("ProductoRepository", "Request enviado: $request")
            val response = api.actualizarProducto(request)

            if (response.isSuccessful && response.body() != null) {
                android.util.Log.d("ProductoRepository", "Producto actualizado exitosamente: ${response.body()}")
                Result.success(response.body()!!)
            } else {
                val errorBody = response.errorBody()?.string()
                android.util.Log.e("ProductoRepository", "Error al actualizar: ${response.code()} - $errorBody")
                Result.failure(Exception("Error al actualizar producto: ${response.code()} - $errorBody"))
            }
        } catch (e: Exception) {
            android.util.Log.e("ProductoRepository", "Excepción al actualizar producto", e)
            Result.failure(e)
        }
    }

    /**
     * Actualiza el stock de un producto
     */
    suspend fun actualizarStock(id: String, stockChange: Int): Result<Producto> {
        return try {
            val request = StockUpdateRequest(
                id = id,
                stockChange = stockChange
            )

            val response = api.actualizarStock(request)

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error al actualizar stock: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Elimina un producto
     */
    suspend fun eliminarProducto(id: String): Result<Boolean> {
        return try {
            val request = DeleteProductoRequest(id = id)
            val response = api.eliminarProducto(request)

            if (response.isSuccessful) {
                Result.success(true)
            } else {
                Result.failure(Exception("Error al eliminar producto: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}


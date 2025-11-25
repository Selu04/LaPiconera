package com.lapiconera.proyecto.data.api

import com.lapiconera.proyecto.data.model.LoginRequest
import com.lapiconera.proyecto.data.model.LoginResponse
import com.lapiconera.proyecto.data.model.Producto
import com.lapiconera.proyecto.data.model.ProductoRequest
import com.lapiconera.proyecto.data.model.Categoria
import com.lapiconera.proyecto.data.model.Tag
import com.lapiconera.proyecto.data.model.Alergeno
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Query

interface ApiService {

    @POST("AuthAndroid")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    // GET categorías
    @GET("categorias")
    suspend fun getCategorias(): Response<List<Categoria>>

    // GET tags
    @GET("tags")
    suspend fun getTags(): Response<List<Tag>>

    // GET alérgenos
    @GET("alergenos")
    suspend fun getAlergenos(): Response<List<Alergeno>>

    // GET productos con filtros opcionales
    @GET("productos")
    suspend fun getProductos(
        @Query("categoria") categoria: String? = null,
        @Query("alergenos") alergenos: String? = null,
        @Query("tags") tags: String? = null,
        @Query("search") search: String? = null,
        @Query("minPrice") minPrice: Double? = null,
        @Query("maxPrice") maxPrice: Double? = null,
        @Query("todos") todos: Boolean? = null
    ): Response<List<Producto>>

    // POST crear producto
    @POST("productos")
    suspend fun crearProducto(@Body producto: ProductoRequest): Response<Producto>

    // PUT actualizar producto
    @PUT("productos")
    suspend fun actualizarProducto(@Body request: ProductoUpdateRequest): Response<Producto>

    // PUT actualizar stock
    @PUT("productos")
    suspend fun actualizarStock(@Body request: StockUpdateRequest): Response<Producto>

    // DELETE eliminar producto
    @retrofit2.http.HTTP(method = "DELETE", path = "productos", hasBody = true)
    suspend fun eliminarProducto(@Body request: DeleteProductoRequest): Response<Unit>

    // GET pedidos de reabastecimiento
    @GET("reabastecimiento")
    suspend fun getPedidosReabastecimiento(): Response<List<com.lapiconera.proyecto.data.model.PedidoReabastecimiento>>

    // POST crear pedido de reabastecimiento
    @POST("reabastecimiento")
    suspend fun crearPedidoReabastecimiento(@Body request: Map<String, Any>): Response<com.lapiconera.proyecto.data.model.PedidoReabastecimiento>

    // PUT marcar como reabastecido
    @PUT("reabastecimiento")
    suspend fun marcarComoReabastecido(@Body request: Map<String, Any>): Response<com.lapiconera.proyecto.data.model.PedidoReabastecimiento>
}

// Requests específicos
data class ProductoUpdateRequest(
    val id: String,
    val name: String,
    val description: String?,
    val price: Double,
    val image: String?,
    val category: String?,
    val allergens: List<String>?,
    val tags: List<String>?,
    val stock_quantity: Int?,
    val min_stock: Int?,
    val is_available: Boolean?,
    val barcode: String?
)

data class StockUpdateRequest(
    val id: String,
    val stockChange: Int
)

data class DeleteProductoRequest(
    val id: String
)

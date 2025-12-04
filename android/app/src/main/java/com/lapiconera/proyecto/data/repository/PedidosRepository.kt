package com.lapiconera.proyecto.data.repository

import com.lapiconera.proyecto.data.api.ApiService
import com.lapiconera.proyecto.data.api.RetrofitClient
import com.lapiconera.proyecto.data.model.PedidoReabastecimiento

class PedidosRepository(
    private val api: ApiService = RetrofitClient.api
) {

    suspend fun getPedidosReabastecimiento(): Result<List<PedidoReabastecimiento>> {
        return try {
            val response = api.getPedidosReabastecimiento()

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error al obtener pedidos: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun actualizarCantidadesPedido(id: String, items: List<com.lapiconera.proyecto.data.model.ItemReabastecimiento>): Result<Any> {
        return try {
            // Convertir items a PedidoItemRequest
            val itemsRequest = items.map { item ->
                com.lapiconera.proyecto.data.api.PedidoItemRequest(
                    id = item.id,
                    nombre = item.name,
                    imagen = item.image,
                    cantidad = item.cantidad
                )
            }

            val request = com.lapiconera.proyecto.data.api.ActualizarCantidadesPedidoRequest(
                id = id,
                items = itemsRequest
            )

            val response = api.actualizarCantidadesPedido(request)

            if (response.isSuccessful) {
                // Si items está vacío, la API eliminará el pedido y devolverá un objeto diferente
                if (items.isEmpty()) {
                    Result.success("deleted" to true)
                } else if (response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("Respuesta vacía del servidor"))
                }
            } else {
                val errorBody = response.errorBody()?.string()
                Result.failure(Exception("Error al actualizar cantidades: ${response.code()} - $errorBody"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun marcarComoReabastecido(id: String, items: List<com.lapiconera.proyecto.data.model.ItemReabastecimiento>): Result<PedidoReabastecimiento> {
        return try {
            // Convertir items a PedidoItemRequest
            val itemsRequest = items.map { item ->
                com.lapiconera.proyecto.data.api.PedidoItemRequest(
                    id = item.id,
                    nombre = item.name,
                    imagen = item.image,
                    cantidad = item.cantidad
                )
            }

            val request = com.lapiconera.proyecto.data.api.MarcarReabastecidoRequest(
                id = id,
                items = itemsRequest,
                status = "completed"
            )

            val response = api.marcarComoReabastecido(request)

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error al marcar como reabastecido: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

